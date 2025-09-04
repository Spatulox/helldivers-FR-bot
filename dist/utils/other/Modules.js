"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const discord_js_1 = require("discord.js");
const log_1 = require("./log");
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
    }
    disable() {
        this._enabled = false;
        (0, log_1.log)(`Module ${this.name} disabled.`);
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
