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
exports.MultiModule = exports.Module = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class Module {
    constructor(name, description = "") {
        this._enabled = false;
        this.name = name;
        this.description = description;
    }
    get enabled() { return this._enabled || false; }
    enable() {
        this._enabled = true;
        simplediscordbot_1.Log.info(`Module ${this.name} enabled.`);
        return true;
    }
    disable() {
        this._enabled = false;
        simplediscordbot_1.Log.info(`Module ${this.name} disabled.`);
        return true;
    }
    log(message) {
        simplediscordbot_1.Log.info(`[${this.name}] ${message}`);
    }
    /**
     * Get the x-th message sent by the bot in a specific channel
     * @param channelId the channel id (lol)
     * @param x begin at 1 (1 = first message, 2 = second message, etc.)
     * @returns the channel || null
     */
    getXthBotMessage(channelId, x) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield simplediscordbot_1.GuildManager.channel.any.find(channelId);
            if (!channel) {
                console.error(`Impossible de trouver ou d'accéder au channel texte avec l'id ${channelId}`);
                return null;
            }
            // Récupérer au maximum 100 derniers messages dans le channel
            const messages = yield channel.messages.fetch({ limit: 100 });
            // Filtrer les messages envoyés par le bot
            const botMessages = messages.filter(m => { var _a; return m.author.id === ((_a = simplediscordbot_1.Bot.client.user) === null || _a === void 0 ? void 0 : _a.id); });
            // Trier par date de création croissante (du plus ancien au plus récent)
            const sortedBotMessages = botMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            // Récupérer le x-ième message (ex: x=2 pour le deuxième message)
            // L'index est x-1 car tableau indexé à partir de 0
            if (x < 1 || x > sortedBotMessages.size) {
                console.warn(`Le channel ne contient pas ${x} messages envoyés par le bot.`);
                return null;
            }
            return sortedBotMessages.at(x - 1) || null;
        });
    }
    replyDesactivated(interaction) {
        if (this.enabled) {
            return false;
        }
        if (interaction.isAutocomplete()) {
            return true;
        }
        simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error(`${this.name} est désactivé`), true);
        return true;
    }
}
exports.Module = Module;
class MultiModule extends Module {
    constructor(name, description = null) {
        super(name, description !== null && description !== void 0 ? description : "");
    }
    get subModuleList() {
        return this._subModuleList;
    }
    get enabled() {
        return this._subModuleList.some(instance => instance.enabled);
    }
    createComponents() {
        const container = new discord_js_1.ContainerBuilder();
        container.addSectionComponents(section => section
            .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`# All ${this.name}`))
            .setButtonAccessory(new discord_js_1.ButtonBuilder()
            .setCustomId(`toggle_${this.name}<_>all`)
            .setLabel(this.enabled ? "Désactiver" : "Activer")
            .setStyle(this.enabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success)));
        container.addSeparatorComponents(separator => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small).setDivider(true));
        for (const sub of this._subModuleList) {
            const enabled = sub.enabled;
            const dot = enabled ? "🟢" : "🔴";
            // Ajout d'une section = ligne avec texte + bouton en accessoire
            container.addSectionComponents(section => section
                .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`### ${dot} __${sub.name}__`))
                .addTextDisplayComponents(...(sub.description && sub.description.trim().length > 0
                ? [new discord_js_1.TextDisplayBuilder().setContent(sub.description)]
                : []))
                .setButtonAccessory(new discord_js_1.ButtonBuilder()
                .setCustomId(`toggle_${this.name}<_>${sub.name}`)
                .setLabel(enabled ? "Désactiver" : "Activer")
                .setStyle(enabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success)));
        }
        return [container];
    }
    editMessage(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.update({
                components: this.createComponents(),
                flags: [discord_js_1.MessageFlags.IsComponentsV2]
            });
        });
    }
    enable(interaction) {
        if (!interaction) {
            this.subModuleList.forEach(mod => {
                mod.enable();
            });
            return true;
        }
        ;
        interaction.reply({
            components: this.createComponents(),
            flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral],
            withResponse: true
        });
        return true;
    }
    disable(interaction) {
        if (!interaction) {
            this.subModuleList.forEach(mod => {
                mod.disable();
            });
            return true;
        }
        ;
        interaction.reply({
            components: this.createComponents(),
            flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral],
            withResponse: true
        });
        return true;
    }
}
exports.MultiModule = MultiModule;
discord_js_1.Events.ApplicationCommandPermissionsUpdate;
discord_js_1.Events.AutoModerationActionExecution;
discord_js_1.Events.AutoModerationRuleCreate;
discord_js_1.Events.AutoModerationRuleDelete;
discord_js_1.Events.AutoModerationRuleUpdate;
discord_js_1.Events.ChannelCreate;
discord_js_1.Events.ChannelDelete;
discord_js_1.Events.ChannelPinsUpdate;
discord_js_1.Events.ChannelUpdate;
discord_js_1.Events.ClientReady;
discord_js_1.Events.EntitlementCreate;
discord_js_1.Events.EntitlementDelete;
discord_js_1.Events.EntitlementUpdate;
discord_js_1.Events.GuildAuditLogEntryCreate;
discord_js_1.Events.GuildBanAdd;
discord_js_1.Events.GuildBanRemove;
discord_js_1.Events.GuildCreate;
discord_js_1.Events.GuildDelete;
discord_js_1.Events.GuildEmojiCreate;
discord_js_1.Events.GuildEmojiUpdate;
discord_js_1.Events.GuildEmojiDelete;
discord_js_1.Events.GuildIntegrationsUpdate;
discord_js_1.Events.GuildMemberAdd;
discord_js_1.Events.GuildMemberRemove;
discord_js_1.Events.GuildMembersChunk;
discord_js_1.Events.GuildMemberUpdate;
discord_js_1.Events.GuildRoleCreate;
discord_js_1.Events.GuildRoleDelete;
discord_js_1.Events.GuildRoleUpdate;
discord_js_1.Events.GuildScheduledEventCreate;
discord_js_1.Events.GuildScheduledEventDelete;
discord_js_1.Events.GuildScheduledEventUpdate;
discord_js_1.Events.GuildScheduledEventUserAdd;
discord_js_1.Events.GuildScheduledEventUserRemove;
discord_js_1.Events.GuildStickerCreate;
discord_js_1.Events.GuildStickerUpdate;
discord_js_1.Events.GuildStickerDelete;
discord_js_1.Events.GuildUpdate;
discord_js_1.Events.GuildIntegrationsUpdate;
discord_js_1.Events.InteractionCreate;
discord_js_1.Events.InviteCreate;
discord_js_1.Events.InviteDelete;
discord_js_1.Events.MessageCreate;
discord_js_1.Events.MessageDelete;
discord_js_1.Events.MessageBulkDelete;
discord_js_1.Events.MessagePollVoteAdd;
discord_js_1.Events.MessagePollVoteRemove;
discord_js_1.Events.MessageReactionAdd;
discord_js_1.Events.MessageReactionRemove;
discord_js_1.Events.MessageReactionRemoveAll;
discord_js_1.Events.MessageReactionRemoveEmoji;
discord_js_1.Events.MessageUpdate;
discord_js_1.Events.PresenceUpdate;
discord_js_1.Events.Raw;
discord_js_1.Events.StageInstanceCreate;
discord_js_1.Events.StageInstanceDelete;
discord_js_1.Events.StageInstanceUpdate;
discord_js_1.Events.SubscriptionCreate;
discord_js_1.Events.SubscriptionDelete;
discord_js_1.Events.SubscriptionUpdate;
discord_js_1.Events.ThreadCreate;
discord_js_1.Events.ThreadDelete;
discord_js_1.Events.ThreadListSync;
discord_js_1.Events.ThreadMembersUpdate;
discord_js_1.Events.ThreadMemberUpdate;
discord_js_1.Events.ThreadUpdate;
discord_js_1.Events.TypingStart;
discord_js_1.Events.UserUpdate;
discord_js_1.Events.VoiceChannelEffectSend;
discord_js_1.Events.VoiceServerUpdate;
discord_js_1.Events.VoiceStateUpdate;
discord_js_1.Events.WebhooksUpdate;
