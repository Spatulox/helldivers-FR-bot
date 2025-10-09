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
exports.Module = void 0;
const discord_js_1 = require("discord.js");
const log_1 = require("./log");
const client_1 = require("../client");
class Module {
    constructor(name, description = "") {
        this._enabled = false;
        this.name = name;
        this.description = description;
        //log(`Module ${this.name} initialized.`);
    }
    get enabled() { return this._enabled || false; }
    enable() {
        this._enabled = true;
        (0, log_1.log)(`Module ${this.name} enabled.`);
        return true;
    }
    disable() {
        this._enabled = false;
        (0, log_1.log)(`Module ${this.name} disabled.`);
        return true;
    }
    log(message) {
        (0, log_1.log)(`[${this.name}] ${message}`);
    }
    /**
     * Get the x-th message sent by the bot in a specific channel
     * @param channelId the channel id (lol)
     * @param x begin at 1 (1 = first message, 2 = second message, etc.)
     * @returns the channel || null
     */
    getXthBotMessage(channelId, x) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield client_1.client.channels.cache.get(channelId)) || (yield client_1.client.channels.fetch(channelId));
            if (!channel) {
                console.error(`Impossible de trouver ou d'accéder au channel texte avec l'id ${channelId}`);
                return null;
            }
            // Récupérer au maximum 100 derniers messages dans le channel
            const messages = yield channel.messages.fetch({ limit: 100 });
            // Filtrer les messages envoyés par le bot
            const botMessages = messages.filter(m => { var _a; return m.author.id === ((_a = client_1.client.user) === null || _a === void 0 ? void 0 : _a.id); });
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
}
exports.Module = Module;
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
