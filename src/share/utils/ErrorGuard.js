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
exports.ErrorGuard = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
/**
 * Filet de sécurité global du bot.
 *
 * Étage 1 : InteractionsManager throw quand aucun handler ne correspond à l'interaction reçue.
 * Son listener InteractionCreate étant async, le throw devient une promise rejetée, que discord.js
 * ré-émet en événement 'error' sur le Client (BaseClient est construit avec captureRejections).
 * Sans listener 'error', l'EventEmitter re-throw et le process meurt. C'est ce listener qui corrige ça.
 *
 * Étage 2 : l'événement 'error' ne transporte que l'Error, pas l'interaction. Pour prévenir
 * l'utilisateur et dire aux devs d'où vient le problème, on surveille nous-mêmes les interactions
 * restées sans réponse.
 */
class ErrorGuard {
    static install(client, config = {}) {
        if (this.installed)
            return;
        this.installed = true;
        this.config = config;
        client.on(discord_js_1.Events.Error, (error) => this.onClientError(error));
        process.on("unhandledRejection", (reason) => {
            this.safeLog(`[ErrorGuard] Unhandled rejection : ${this.stringify(reason)}`);
        });
        process.on("uncaughtException", (error) => {
            this.safeLog(`[ErrorGuard] Uncaught exception : ${this.stringify(error)}`);
        });
        if (config.watchInteractions) {
            client.on(discord_js_1.Events.InteractionCreate, (interaction) => this.watch(interaction));
        }
    }
    static onClientError(error) {
        var _a;
        const identifier = (_a = this.NO_HANDLER_REGEX.exec(error.message)) === null || _a === void 0 ? void 0 : _a[1];
        if (identifier) {
            this.rememberReason(identifier, error.message);
        }
        this.safeLog(`[ErrorGuard] Erreur client : ${this.stringify(error)}`);
    }
    /**
     * Le throw est immédiat alors que le watchdog ne tire qu'à UNANSWERED_DELAY_MS :
     * la cause est donc toujours disponible quand le rapport est construit.
     */
    static rememberReason(identifier, reason) {
        this.pendingReasons.set(identifier, reason);
        setTimeout(() => this.pendingReasons.delete(identifier), this.PENDING_REASON_TTL_MS);
    }
    static watch(interaction) {
        if (interaction.isAutocomplete())
            return; // pas de réponse "message" possible
        setTimeout(() => { void this.handleUnanswered(interaction); }, this.UNANSWERED_DELAY_MS);
    }
    static handleUnanswered(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isRepliable())
                return;
            if (interaction.replied || interaction.deferred)
                return;
            const identifier = this.identifierOf(interaction);
            const reason = identifier ? this.pendingReasons.get(identifier) : undefined;
            if (identifier)
                this.pendingReasons.delete(identifier);
            yield this.answerUser(interaction);
            yield this.report(interaction, identifier, reason);
        });
    }
    static answerUser(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Cette interaction n'a pas abouti. Les techniciens ont été prévenus."), true);
            }
            catch (error) {
                this.safeLog(`[ErrorGuard] Impossible de répondre à l'interaction ${interaction.id} : ${this.stringify(error)}`);
            }
        });
    }
    static report(interaction, identifier, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error);
            embed.setTitle("Interaction sans réponse");
            simplediscordbot_1.EmbedManager.fields(embed, [
                { name: "Type", value: this.describe(interaction), inline: true },
                { name: "Identifiant", value: identifier ? `\`${identifier}\`` : "inconnu", inline: true },
                { name: "Auteur", value: `<@${interaction.user.id}>\n\`${interaction.user.tag}\` (${interaction.user.id})` },
                { name: "Salon", value: interaction.channelId ? `<#${interaction.channelId}> (${interaction.channelId})` : "message privé" },
                { name: "Serveur", value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : "aucun" },
                { name: "ID d'interaction", value: interaction.id },
                { name: "Raison", value: this.truncate(reason !== null && reason !== void 0 ? reason : `Aucun handler n'a répondu en ${this.UNANSWERED_DELAY_MS}ms`) }
            ]);
            const messageUrl = this.messageUrlOf(interaction);
            if (messageUrl) {
                simplediscordbot_1.EmbedManager.field(embed, { name: "Message d'origine", value: messageUrl });
            }
            const channelId = this.config.reportChannelId;
            if (!channelId) {
                this.safeLog(`[ErrorGuard] Interaction sans réponse "${identifier !== null && identifier !== void 0 ? identifier : "inconnue"}" (aucun salon de rapport configuré)`);
                return;
            }
            try {
                const channel = yield simplediscordbot_1.GuildManager.channel.text.find(channelId);
                if (!channel) {
                    this.safeLog(`[ErrorGuard] Salon de rapport ${channelId} introuvable`);
                    return;
                }
                yield channel.send({
                    content: this.config.pingRoleId ? `<@&${this.config.pingRoleId}>` : undefined,
                    embeds: [embed]
                });
            }
            catch (error) {
                this.safeLog(`[ErrorGuard] Impossible d'envoyer le rapport : ${this.stringify(error)}`);
            }
        });
    }
    static describe(interaction) {
        if (interaction.isChatInputCommand())
            return "Commande slash";
        if (interaction.isMessageContextMenuCommand())
            return "Menu contextuel (message)";
        if (interaction.isUserContextMenuCommand())
            return "Menu contextuel (utilisateur)";
        if (interaction.isButton())
            return "Bouton";
        if (interaction.isAnySelectMenu())
            return "Select menu";
        if (interaction.isModalSubmit())
            return "Modal";
        return "Inconnu";
    }
    static identifierOf(interaction) {
        if (interaction.isCommand())
            return interaction.commandName;
        if (interaction.isMessageComponent() || interaction.isModalSubmit())
            return interaction.customId;
        return undefined;
    }
    static messageUrlOf(interaction) {
        if (interaction.isMessageComponent())
            return interaction.message.url;
        if (interaction.isModalSubmit() && interaction.message)
            return interaction.message.url;
        return undefined;
    }
    static truncate(value) {
        return value.length > this.MAX_FIELD_LENGTH ? `${value.slice(0, this.MAX_FIELD_LENGTH)}…` : value;
    }
    static stringify(error) {
        var _a;
        return error instanceof Error ? ((_a = error.stack) !== null && _a !== void 0 ? _a : error.message) : String(error);
    }
    /** Le garde ne doit jamais être la cause d'un crash : aucun log ne doit pouvoir throw. */
    static safeLog(message) {
        try {
            const sent = simplediscordbot_1.Bot.log.error(message);
            if (sent && typeof sent.catch === "function")
                sent.catch(() => { });
        }
        catch (_a) {
            console.error(message);
        }
    }
}
exports.ErrorGuard = ErrorGuard;
/** Discord invalide le token d'interaction à 3s : il faut répondre avant. */
ErrorGuard.UNANSWERED_DELAY_MS = 2000;
/** Durée de vie d'une cause en attente d'être rattachée à son interaction. */
ErrorGuard.PENDING_REASON_TTL_MS = 10000;
ErrorGuard.MAX_FIELD_LENGTH = 1000;
ErrorGuard.NO_HANDLER_REGEX = /No handler registered for "(.+)"/;
ErrorGuard.pendingReasons = new Map();
ErrorGuard.installed = false;
ErrorGuard.config = {};
