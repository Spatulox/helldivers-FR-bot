"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLink = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFRChannelID_1 = require("../../utils/hdfr_list/HDFRChannelID");
const HandlersPath_1 = require("../../../../share/HandlersPath");
const BotType_1 = require("../../../../share/BotType");
/**
 * `/lien` : un utilisateur demande à poster un lien, la modération valide ou refuse.
 *
 * La demande vit entièrement dans le message de modération, ce qui permet de la traiter même après
 * un redémarrage du bot :
 * - auteur et salon cible sont encodés dans le customId des boutons
 *   (`requestLink:confirm:<userId>:<channelId>`, bien en dessous des 100 caractères autorisés) ;
 * - pseudo, lien et raison, trop longs pour un customId, sont chacun dans un TextDisplay portant un
 *   id de composant fixe, relu au clic.
 *
 * Seul le quota (MAX_REQUESTS par WINDOW_MS) est persisté en cache : une fenêtre de 24 h doit
 * survivre à un redémarrage, sinon relancer le bot remettrait tous les compteurs à zéro.
 */
class RequestLink extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        return { history: {} };
    }
    constructor() {
        super();
        this.name = RequestLink.static_name;
        this.description = "Demande à la modération de valider un lien avant de le poster";
        this.cacheKey = "request_link";
        void this.loadCache();
    }
    static get instance() {
        return discord_module_1.ModuleRegistry.getModule(RequestLink.static_name);
    }
    static isEnabled() {
        var _a, _b;
        return (_b = (_a = this.instance) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
    }
    static send_confirmation(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = this.instance;
            if (!(module === null || module === void 0 ? void 0 : module.enabled)) {
                yield interaction.reply(this.ephemeral(simplediscordbot_1.ComponentManager.error("Cette commande est désactivée")));
                return;
            }
            const request = {
                userId: interaction.user.id,
                username: interaction.user.username,
                channelId: interaction.channelId,
                link: interaction.options.getString("lien", true),
                reason: interaction.options.getString("raison", true),
            };
            if (!this.isValidLink(request.link)) {
                yield interaction.reply(this.ephemeral(simplediscordbot_1.ComponentManager.error("Le lien fourni n'est pas un lien valide. Il doit commencer par `http://` ou `https://`, sans espace.")));
                return;
            }
            const quota = yield module.consume(request.userId);
            if (!quota.allowed) {
                yield interaction.reply(this.ephemeral(simplediscordbot_1.ComponentManager.error(`Vous avez atteint la limite de ${this.MAX_REQUESTS} demandes de lien par 24 h.\n` +
                    `Prochaine demande possible ${this.relativeTime(quota.nextAvailableAt)}.`)));
                return;
            }
            // Mentions coupées : la raison est saisie librement et pourrait contenir `@everyone`.
            const sent = yield simplediscordbot_1.Bot.message.send(HDFRChannelID_1.HDFRChannelID.alert, Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toMessage(this.createModoMessage(request))), { allowedMentions: { parse: [] } }));
            if (!sent) {
                // La demande n'est jamais arrivée : elle ne doit pas coûter de quota.
                yield module.refund(request.userId);
                yield interaction.reply(this.ephemeral(simplediscordbot_1.ComponentManager.error("Impossible de transmettre la demande à la modération")));
                return;
            }
            yield interaction.reply(this.ephemeral(this.createUserMessage(quota)));
        });
    }
    static send_answer(interaction, confirmation) {
        return __awaiter(this, void 0, void 0, function* () {
            // Acquittement immédiat : la recherche du membre et l'envoi du webhook peuvent dépasser les
            // 2 s surveillées par ErrorGuard.
            yield interaction.deferUpdate();
            const request = this.parseRequest(interaction);
            if (!request) {
                yield interaction.followUp(this.ephemeral(simplediscordbot_1.ComponentManager.error("Demande illisible : impossible de retrouver le lien ou son auteur")));
                simplediscordbot_1.Bot.log.error(`REQUEST LINK : demande illisible (customId : ${interaction.customId}, message : ${interaction.message.id})`);
                return;
            }
            if (confirmation) {
                if (!(yield this.postLink(request, interaction.guildId))) {
                    yield interaction.followUp(this.ephemeral(simplediscordbot_1.ComponentManager.error("Échec de l'envoi du lien dans le salon")));
                    return;
                }
            }
            else {
                const dm = yield simplediscordbot_1.Bot.message.sendDM(request.userId, `La modération a refusé votre demande d'envoi du lien : <${request.link}>`)
                    .catch(() => null);
                if (!dm) {
                    simplediscordbot_1.Bot.log.warn(`REQUEST LINK : impossible de prévenir <@${request.userId}> du refus (MP fermés ?)`);
                }
            }
            // Retire les boutons pour empêcher un second traitement de la même demande.
            yield interaction.editReply({ components: [this.createModoMessage(request, { confirmed: confirmation, modId: interaction.user.id })] });
        });
    }
    /**
     * Décompte une demande du quota de l'utilisateur, en fenêtre glissante. Les horodatages sortis de
     * la fenêtre sont purgés au passage, ce qui garde le cache borné.
     */
    consume(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const timestamps = this.activeTimestamps(userId, now);
            if (timestamps.length >= RequestLink.MAX_REQUESTS) {
                return { allowed: false, remaining: 0, nextAvailableAt: this.nextAvailableAt(timestamps) };
            }
            timestamps.push(now);
            yield this.saveTimestamps(userId, timestamps);
            return {
                allowed: true,
                remaining: RequestLink.MAX_REQUESTS - timestamps.length,
                nextAvailableAt: this.nextAvailableAt(timestamps),
            };
        });
    }
    /** Annule la dernière demande décomptée. */
    refund(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamps = this.activeTimestamps(userId, Date.now());
            timestamps.pop();
            yield this.saveTimestamps(userId, timestamps);
        });
    }
    activeTimestamps(userId, now) {
        var _a;
        return ((_a = this.cache.history[userId]) !== null && _a !== void 0 ? _a : []).filter(t => now - t < RequestLink.WINDOW_MS);
    }
    nextAvailableAt(timestamps) {
        const oldest = timestamps[0];
        return oldest === undefined ? null : oldest + RequestLink.WINDOW_MS;
    }
    saveTimestamps(userId, timestamps) {
        return __awaiter(this, void 0, void 0, function* () {
            if (timestamps.length === 0) {
                delete this.cache.history[userId];
            }
            else {
                this.cache.history[userId] = timestamps;
            }
            yield this.writeCache();
        });
    }
    static relativeTime(timestamp) {
        return timestamp === null ? "dès maintenant" : `<t:${Math.ceil(timestamp / 1000)}:R>`;
    }
    /**
     * Un lien seul, en http(s) : `new URL` accepte aussi `javascript:`, `mailto:`… d'où le filtre sur
     * le protocole, et les espaces sont refusés pour ne pas laisser passer du texte après le lien.
     */
    static isValidLink(link) {
        if (/\s/.test(link))
            return false;
        try {
            const url = new URL(link);
            return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Réponse éphémère en Components V2.
     *
     * `Bot.interaction.send/followUp(…, container, true)` remplace les flags par le seul `Ephemeral` et
     * perd `IsComponentsV2` : Discord rejette alors le Container et l'utilisateur ne reçoit rien.
     */
    static ephemeral(container) {
        return {
            components: [container],
            flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral],
        };
    }
    /**
     * Poste le lien dans le salon d'origine, sous le nom et l'avatar de l'auteur.
     */
    static postLink(request, guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const member = guildId ? yield simplediscordbot_1.GuildManager.searchMember(request.userId, guildId) : null;
            const user = (_a = member === null || member === void 0 ? void 0 : member.user) !== null && _a !== void 0 ? _a : yield simplediscordbot_1.UserManager.find(request.userId);
            const username = (_c = (_b = member === null || member === void 0 ? void 0 : member.displayName) !== null && _b !== void 0 ? _b : user === null || user === void 0 ? void 0 : user.displayName) !== null && _c !== void 0 ? _c : request.username;
            const avatarURL = (_d = member === null || member === void 0 ? void 0 : member.displayAvatarURL()) !== null && _d !== void 0 ? _d : user === null || user === void 0 ? void 0 : user.displayAvatarURL();
            const commandName = (yield HandlersPath_1.Handlers.load(BotType_1.BotType.HDFR, "commands", "link")).name;
            // L'avatar du constructeur n'est appliqué qu'à la création du webhook (WebhookManager réutilise
            // ensuite celui qui porte le même nom) : ce sont `username` / `avatarURL` qui font foi.
            const webhook = new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, this.WEBHOOK_NAME, avatarURL);
            try {
                const message = yield webhook.send(request.channelId, {
                    content: `${request.link}\n-# Lien validé par la modération. Vous aussi, proposez un lien avec la commande /${commandName}`,
                    username,
                    avatarURL,
                    allowedMentions: { parse: [] },
                });
                return message !== null;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`REQUEST LINK : envoi du lien dans <#${request.channelId}> impossible : ${error}`);
                return false;
            }
        });
    }
    static parseRequest(interaction) {
        var _a, _b, _c, _d, _e;
        const [userId, channelId] = interaction.customId
            .replace(this.CONFIRM_PREFIX, "")
            .replace(this.CANCEL_PREFIX, "")
            .split(":");
        const components = interaction.message.components;
        // `⚠️ ||<lien>||` : le lien est entre les deux marqueurs de spoiler.
        const link = (_b = (_a = this.findTextDisplay(components, this.LINK_COMPONENT_ID)) === null || _a === void 0 ? void 0 : _a.match(/\|\|(.+)\|\|$/)) === null || _b === void 0 ? void 0 : _b[1];
        const reason = (_c = this.findTextDisplay(components, this.REASON_COMPONENT_ID)) === null || _c === void 0 ? void 0 : _c.slice(this.REASON_PREFIX.length);
        // `🅰️ <@id> / <pseudo>` : le pseudo est après le dernier séparateur.
        const username = (_e = (_d = this.findTextDisplay(components, this.AUTHOR_COMPONENT_ID)) === null || _d === void 0 ? void 0 : _d.match(/ \/ (.*)$/)) === null || _e === void 0 ? void 0 : _e[1];
        if (!userId || !channelId || !link) {
            return null;
        }
        return { userId, channelId, link, username: username !== null && username !== void 0 ? username : userId, reason: reason !== null && reason !== void 0 ? reason : "" };
    }
    /**
     * Cherche récursivement (Container, Section) le TextDisplay portant l'id de composant donné.
     */
    static findTextDisplay(components, id) {
        for (const component of components) {
            if (component instanceof discord_js_1.TextDisplayComponent && component.id === id) {
                return component.content;
            }
            if (component instanceof discord_js_1.ContainerComponent || component instanceof discord_js_1.SectionComponent) {
                const found = this.findTextDisplay(component.components, id);
                if (found !== null)
                    return found;
            }
        }
        return null;
    }
    static createUserMessage(quota) {
        return simplediscordbot_1.ComponentManager.simple("Demande envoyée, en attente de validation par la modération.\n" +
            "-# La modération étant bénévole, le délai de réponse peut varier.\n\n" +
            "⚠️ **Tout lien volontairement provocant, choquant ou envoyé dans le seul but de nuire au staff sera sanctionné.**\n\n" +
            `Demandes restantes : **${quota.remaining}/${this.MAX_REQUESTS}** sur 24 h` +
            (quota.remaining === 0 ? ` — prochaine demande possible ${this.relativeTime(quota.nextAvailableAt)}` : ""), simplediscordbot_1.SimpleColor.minecraft);
    }
    /**
     * Message de modération. Sans `decision`, affiche les boutons ; avec, affiche qui a tranché.
     */
    static createModoMessage(request, decision) {
        const container = simplediscordbot_1.ComponentManager.create({
            color: decision ? (decision.confirmed ? simplediscordbot_1.SimpleColor.green : simplediscordbot_1.SimpleColor.gray) : simplediscordbot_1.SimpleColor.red
        });
        const displayedLink = (0, discord_js_1.escapeMarkdown)(request.link.replace(/^https?:\/\//, ""));
        container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent("# Demande autorisation lien 🔗"), new discord_js_1.TextDisplayBuilder().setContent(`🆔 ${request.userId}`), new discord_js_1.TextDisplayBuilder().setId(this.AUTHOR_COMPONENT_ID).setContent(`${this.AUTHOR_PREFIX}<@${request.userId}> / ${request.username}`), new discord_js_1.TextDisplayBuilder().setContent(`🅱️ ${displayedLink}`), new discord_js_1.TextDisplayBuilder().setId(this.LINK_COMPONENT_ID).setContent(`${this.LINK_PREFIX}||${request.link}||`), new discord_js_1.TextDisplayBuilder().setId(this.REASON_COMPONENT_ID).setContent(`${this.REASON_PREFIX}${request.reason || "-"}`));
        container.addSeparatorComponents(new discord_js_1.SeparatorBuilder());
        if (decision) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(decision.confirmed ? `✅ Validé par <@${decision.modId}>` : `❌ Refusé par <@${decision.modId}>`));
            return container;
        }
        simplediscordbot_1.ComponentManager.fields(container, [
            { button: [
                    simplediscordbot_1.ButtonManager.confirm(`${this.CONFIRM_PREFIX}${request.userId}:${request.channelId}`),
                    simplediscordbot_1.ButtonManager.cancel(`${this.CANCEL_PREFIX}${request.userId}:${request.channelId}`),
                ] }
        ]);
        return container;
    }
}
exports.RequestLink = RequestLink;
RequestLink.static_name = "Request Link";
RequestLink.BUTTON_PREFIX = "requestLink:";
RequestLink.CONFIRM_PREFIX = `${RequestLink.BUTTON_PREFIX}confirm:`;
RequestLink.CANCEL_PREFIX = `${RequestLink.BUTTON_PREFIX}cancel:`;
RequestLink.MAX_REQUESTS = 3;
RequestLink.WINDOW_MS = simplediscordbot_1.Time.hour.HOUR_24.toMilliseconds();
// Ids de composants Components V2 : arbitraires, mais doivent rester stables pour relire les
// demandes déjà postées.
RequestLink.LINK_COMPONENT_ID = 1001;
RequestLink.REASON_COMPONENT_ID = 1002;
RequestLink.AUTHOR_COMPONENT_ID = 1003;
// Préfixes des lignes relues au clic : les modifier rend illisibles les demandes en attente.
RequestLink.AUTHOR_PREFIX = "🅰️ ";
RequestLink.LINK_PREFIX = "⚠️ ";
RequestLink.REASON_PREFIX = "❓ ";
// Un seul webhook par salon : nom et avatar de l'auteur sont surchargés à chaque message.
RequestLink.WEBHOOK_NAME = "Lien validé";
