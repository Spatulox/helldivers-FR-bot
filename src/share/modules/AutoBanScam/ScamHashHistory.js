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
exports.ScamHashHistory = void 0;
const discord_js_1 = require("discord.js");
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const FileExtension_1 = require("../../utils/FileExtension");
const UserList_1 = require("../../utils/UserList");
const ImageHashDetection_1 = require("./ImageHashDetection");
/**
 * Historique des empreintes ajoutées par l'OCR, dans #historique-hash-ocr (serveur GWW Wiki, voir
 * config.hashHistoryChannel).
 *
 * Chaque empreinte entrée en banque y est publiée UNE fois : l'image (ré-uploadée, en spoiler, pour
 * survivre au message d'origine), la règle qui l'a fait entrer, les messages qui l'ont déclenchée,
 * son statut et deux boutons :
 * - « Valider » passe l'entrée en CONFIRMÉE sans attendre d'autres détections ;
 * - « Supprimer » la passe en REJETÉE : elle reste en banque comme liste blanche, pour que la même
 *   image légitime ne soit ni sanctionnée ni réajoutée par l'OCR.
 * Le message est ensuite réécrit à chaque nouvelle détection et à chaque décision.
 *
 * Les liens vers les messages d'origine ne vivent QUE dans ce message : la banque ne les garde pas
 * (le bot supprime ces messages de toute façon). À chaque réécriture, les lignes « Détections »
 * déjà affichées sont relues dans le message lui-même, et la nouvelle détection y est ajoutée.
 * La banque ne garde pas non plus l'ID du message : la fiche est retrouvée dans le salon par
 * l'identifiant de l'entrée, qu'elle affiche, parmi les messages du bot (findMessage).
 *
 * La publication mentionne Spatulox pour qu'il relise l'image. Un message Components V2 n'a pas de
 * `content` : la mention est une ligne de texte du conteneur, présente au premier envoi seulement.
 * Une réécriture ne notifie jamais, et la ligne disparaît dès la première mise à jour.
 *
 * Seuls les techniciens du serveur protégé (config.guildId, config.isTechnician) peuvent décider :
 * le membre est cherché dans ce serveur, pas dans GWW Wiki.
 *
 * Classe utilitaire de ScamImageAnalysis, pas un Module : elle enregistre elle-même ses boutons,
 * comme ImageOcrDetection enregistre sa modale. Un envoi ou une réécriture en échec ne remonte
 * jamais : le verdict de l'analyse passe avant l'historique.
 */
// Même plafond que les rapports d'analyse : au-delà on ne ré-uploade pas l'image
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
// Détections listées dans le message : les plus récentes seulement
const SOURCES_SHOWN = 8;
// Une ligne de détection telle que detectionLine l'écrit, pour la relire dans le message
const DETECTION_LINE = /^<t:\d+:f> · /;
// Messages parcourus au plus pour retrouver une fiche, des plus récents aux plus anciens
const SEARCH_LIMIT = 1000;
class ScamHashHistory {
    constructor(config, bank) {
        this.config = config;
        this.bank = bank;
        this.missingChannelWarned = false;
        // Le constructeur tourne depuis RegisterModules, déclenché sur ClientReady : Bot.client existe
        const manager = discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        manager.registerButton(ScamHashHistory.CONFIRM_PREFIX, (interaction) => {
            void this.review(interaction, ScamHashHistory.CONFIRM_PREFIX, "confirmed");
        }, discord_module_1.InteractionMatchType.START_WITH);
        manager.registerButton(ScamHashHistory.REJECT_PREFIX, (interaction) => {
            void this.review(interaction, ScamHashHistory.REJECT_PREFIX, "rejected");
        }, discord_module_1.InteractionMatchType.START_WITH);
    }
    /** Publie une empreinte qui vient d'entrer en banque, et retient la fiche pour la réécrire */
    publish(entry, scope, buffer, fileName, context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const channel = yield this.findChannel();
                if (channel == null) {
                    return;
                }
                const image = this.buildAttachment(buffer, fileName);
                const sent = yield simplediscordbot_1.Bot.message.send(channel, simplediscordbot_1.ComponentManager.toMessage(this.buildContainer(entry, scope, (_a = image === null || image === void 0 ? void 0 : image.url) !== null && _a !== void 0 ? _a : null, true, ScamHashHistory.withDetection([], context)), image != null ? [image.attachment] : null));
                if (sent != null) {
                    ScamHashHistory.messageIds.set(entry.id, sent.id);
                }
            }
            catch (error) {
                // L'historique ne doit jamais faire échouer l'analyse
            }
        });
    }
    /**
     * Réécrit le message d'une entrée (nouvelle détection, décision). Discord conserve la pièce
     * jointe tant que la charge utile ne contient pas de champ `attachments` : l'image n'est pas
     * ré-uploadée, la galerie pointe toujours sur le même `attachment://`.
     * @param context message de la nouvelle détection, à ajouter aux lignes déjà affichées ; null
     * pour une réécriture sans nouvelle détection (décision, promotion)
     */
    refresh(entry_1, scope_1) {
        return __awaiter(this, arguments, void 0, function* (entry, scope, context = null) {
            var _a, _b;
            try {
                const channel = yield this.findChannel();
                if (channel == null) {
                    return;
                }
                const message = yield ScamHashHistory.findMessage(channel, entry.id);
                if (message == null) {
                    return;
                }
                const imageName = (_b = (_a = message.attachments.first()) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null;
                const imageUrl = imageName != null ? `attachment://${imageName}` : null;
                const detections = ScamHashHistory.withDetection(ScamHashHistory.readDetections(message), context);
                yield message.edit(simplediscordbot_1.ComponentManager.toMessage(this.buildContainer(entry, scope, imageUrl, false, detections)));
            }
            catch (error) {
                // Message supprimé à la main, salon inaccessible : rien de plus à faire
            }
        });
    }
    /**
     * Fiche d'une entrée : depuis la mémoire, sinon en parcourant le salon (SEARCH_LIMIT messages au
     * plus). Seuls les messages de CE bot comptent : il ne peut pas réécrire ceux de l'autre bot
     * (dev ou prod) qui partage le salon.
     * @returns null si la fiche n'a pas été publiée par ce bot, ou a été supprimée
     */
    static findMessage(channel, entryId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const known = ScamHashHistory.messageIds.get(entryId);
            if (known === null) {
                return null;
            }
            if (known !== undefined) {
                const message = yield channel.messages.fetch(known).catch(() => null);
                if (message != null) {
                    return message;
                }
            }
            let before = undefined;
            for (let scanned = 0; scanned < SEARCH_LIMIT; scanned += 100) {
                const page = yield channel.messages.fetch({ limit: 100, before });
                const found = page.find(message => {
                    var _a;
                    return message.author.id == ((_a = simplediscordbot_1.Bot.client.user) === null || _a === void 0 ? void 0 : _a.id)
                        && JSON.stringify(message.components).includes(entryId);
                });
                if (found != null) {
                    ScamHashHistory.messageIds.set(entryId, found.id);
                    return found;
                }
                if (page.size < 100) {
                    break;
                }
                before = (_a = page.last()) === null || _a === void 0 ? void 0 : _a.id;
            }
            ScamHashHistory.messageIds.set(entryId, null);
            return null;
        });
    }
    /** null si le salon n'est pas configuré (signalé une fois) ou introuvable */
    findChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = this.config.hashHistoryChannel;
            if (!channelId) {
                if (!this.missingChannelWarned) {
                    this.missingChannelWarned = true;
                    simplediscordbot_1.Bot.log.warn("Historique des empreintes anti-scam désactivé : aucun salon configuré (GWWWiki.channel.historique_hash_ocr)");
                }
                return null;
            }
            return yield simplediscordbot_1.GuildManager.channel.text.find(channelId);
        });
    }
    /**
     * Prépare l'image à joindre. Le nom est normalisé : un nom d'origine avec espaces ou accents
     * casse la résolution de `attachment://`.
     * @returns null si le fichier n'est pas une image ou s'il est trop lourd pour être ré-uploadé
     */
    buildAttachment(buffer, fileName) {
        if (!(0, FileExtension_1.isImageFile)(fileName) || buffer.length > MAX_ATTACHMENT_BYTES) {
            return null;
        }
        const name = `empreinte${(0, FileExtension_1.getFileExtension)(fileName) || FileExtension_1.ImageExtension.png}`;
        return { attachment: new discord_js_1.AttachmentBuilder(buffer, { name }), url: `attachment://${name}` };
    }
    /** Ligne « Détections » d'un message d'origine, lien compris */
    static detectionLine(context) {
        const at = Math.floor(Date.now() / 1000);
        return `<t:${at}:f> · <@${context.authorId}> (${context.authorId}) · ${context.messageUrl}`;
    }
    /** Lignes affichées, complétées de la nouvelle détection et ramenées aux plus récentes */
    static withDetection(lines, context) {
        const all = context != null ? [...lines, ScamHashHistory.detectionLine(context)] : lines;
        return all.slice(-SOURCES_SHOWN);
    }
    /** Lignes de détection déjà affichées dans un message d'historique */
    static readDetections(message) {
        const lines = [];
        const walk = (components) => {
            for (const component of components) {
                if (component.type == discord_js_1.ComponentType.TextDisplay && component.content != null) {
                    lines.push(...component.content.split("\n").filter(line => DETECTION_LINE.test(line)));
                }
                if (Array.isArray(component.components)) {
                    walk(component.components);
                }
            }
        };
        walk(message.components.map(component => component.toJSON()));
        return lines;
    }
    /**
     * @param ping mention de Spatulox, à la publication seulement
     * @param detections lignes « Détections » à afficher, les plus récentes
     */
    buildContainer(entry, scope, imageUrl, ping, detections) {
        const container = simplediscordbot_1.ComponentManager.create({
            title: `## ${ScamHashHistory.statusTitle(entry.status)}`,
            color: ScamHashHistory.statusColor(entry.status),
            separator: false
        });
        if (ping) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder()
                .setContent(`<@${UserList_1.UserList.shared.SPATULOX}> nouvelle empreinte à relire`));
        }
        // En spoiler : la pub de scam n'a pas à rester affichée en permanence dans le salon
        if (imageUrl != null) {
            simplediscordbot_1.ComponentManager.mediaGallery(container, [{ url: imageUrl, spoiler: true }]);
        }
        const bank = scope == "global" ? "banque globale (trois bots)" : "banque du serveur";
        simplediscordbot_1.ComponentManager.fields(container, [
            { name: "Statut", value: this.describeStatus(entry, scope) },
            { name: "Règle", value: `\`${entry.reason}\` — ${bank}` },
            { name: "Détections", value: ScamHashHistory.describeSources(detections) },
            { name: "Empreintes", value: `pHash \`${entry.phash}\` · dHash \`${entry.dhash}\`\n-# ${entry.id}` },
        ]);
        const buttons = [];
        if (entry.status == "quarantine") {
            buttons.push(simplediscordbot_1.ButtonManager.success({ customId: `${ScamHashHistory.CONFIRM_PREFIX}${entry.id}`, label: "Valider", emoji: "🔒" }));
        }
        if (entry.status != "rejected") {
            buttons.push(simplediscordbot_1.ButtonManager.danger({ customId: `${ScamHashHistory.REJECT_PREFIX}${entry.id}`, label: "Supprimer", emoji: "🚫" }));
        }
        if (buttons.length > 0) {
            container.addActionRowComponents(simplediscordbot_1.ButtonManager.row(buttons));
        }
        return container;
    }
    static statusTitle(status) {
        switch (status) {
            case "quarantine": return "⏳ Empreinte en quarantaine";
            case "confirmed": return "🔒 Empreinte confirmée";
            case "rejected": return "🚫 Empreinte rejetée";
        }
    }
    static statusColor(status) {
        switch (status) {
            case "quarantine": return simplediscordbot_1.SimpleColor.yellow;
            case "confirmed": return simplediscordbot_1.SimpleColor.red;
            case "rejected": return simplediscordbot_1.SimpleColor.gray;
        }
    }
    describeStatus(entry, scope) {
        const count = ImageHashDetection_1.ImageHashDetection.distinctAuthors(entry);
        const authors = `${count}/${ImageHashDetection_1.ImageHashDetection.CONFIRMATION_AUTHORS} auteurs distincts`;
        const reviewer = entry.reviewedBy != null ? ` par <@${entry.reviewedBy}>` : "";
        switch (entry.status) {
            case "quarantine":
                return scope == "global"
                    ? "En quarantaine : banque globale, seule la validation d'un technicien la confirme. L'OCR est relancé à chaque correspondance."
                    : `En quarantaine (${authors}) : l'OCR est relancé à chaque correspondance, aucune sanction sur la seule empreinte.`;
            case "confirmed":
                return `Confirmée${reviewer || ` automatiquement (${authors})`} : une correspondance nette suffit, ban en prod.`;
            case "rejected":
                return `Rejetée${reviewer} : liste blanche, l'image n'est plus ni sanctionnée ni réajoutée.`;
        }
    }
    static describeSources(detections) {
        return detections.length > 0 ? detections.join("\n") : "*(message d'origine inconnu)*";
    }
    /** Boutons Valider / Supprimer : techniciens du serveur protégé uniquement */
    review(interaction, prefix, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Accusé de réception immédiat : le watchdog d'ErrorGuard se déclenche à 2 s, et la
                // recherche du membre dans l'autre serveur peut prendre ce temps-là
                yield interaction.deferUpdate();
                const member = yield simplediscordbot_1.GuildManager.user.findInGuild(this.config.guildId, interaction.user.id);
                if (member == null || !this.config.isTechnician(member)) {
                    yield this.replyError(interaction, "Seuls les techniciens peuvent valider ou supprimer une empreinte.");
                    return;
                }
                const found = yield this.bank.setStatus(interaction.customId.slice(prefix.length), status, interaction.user.id);
                if (found == null) {
                    yield this.replyError(interaction, "Empreinte introuvable dans les banques de ce bot.");
                    return;
                }
                // Le bouton cliqué est sur la fiche elle-même : inutile de la chercher
                ScamHashHistory.messageIds.set(found.entry.id, interaction.message.id);
                yield this.refresh(found.entry, found.scope);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`Historique des empreintes anti-scam : ${error}`);
            }
        });
    }
    replyError(interaction, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.followUp({ embeds: [simplediscordbot_1.EmbedManager.error(message)], flags: discord_js_1.MessageFlags.Ephemeral });
        });
    }
}
exports.ScamHashHistory = ScamHashHistory;
ScamHashHistory.CONFIRM_PREFIX = "scamHash:confirm:";
ScamHashHistory.REJECT_PREFIX = "scamHash:reject:";
/**
 * Fiche de chaque entrée (identifiant → ID du message, null si introuvable), en mémoire : évite
 * de reparcourir le salon à chaque réécriture. Statique, le salon étant le même pour tous.
 */
ScamHashHistory.messageIds = new Map();
