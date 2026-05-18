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
exports.DeleteEmptyVoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const CLEANUP_INTERVAL_MS = simplediscordbot_1.Time.minute.MIN_10.toMilliseconds();
class DeleteEmptyVoiceChannel extends discord_module_1.Module {
    constructor() {
        super();
        this.name = "Delete Empty Voice Channel";
        this.description = "Delete old bugged empty voice channel created by Mee6";
        this.cleanupInterval = null;
        this.startCleanup();
    }
    get events() {
        return {};
    }
    startCleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stopCleanup();
            const guild = yield simplediscordbot_1.GuildManager.find(this.guildId);
            if (!guild) {
                simplediscordbot_1.Bot.log.info("Impossible to get the guild in order to cleanup the old buggued channels");
                return;
            }
            this.handleDeleteEmptyChannels(guild);
            this.cleanupInterval = setInterval(() => this.handleDeleteEmptyChannels(guild), CLEANUP_INTERVAL_MS);
        });
    }
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    handleDeleteEmptyChannels(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const persistentChannels = this.allTriggerChannel;
            for (const categoryId of this.categories) {
                const category = guild.channels.cache.get(categoryId);
                if (!category)
                    continue;
                const emptyTmpVoiceChannels = category.children.cache.filter(ch => ch.type === discord_js_1.ChannelType.GuildVoice &&
                    !persistentChannels.includes(ch.id) &&
                    ch.members.size === 0);
                for (const channel of emptyTmpVoiceChannels.values()) {
                    yield simplediscordbot_1.Bot.log.info(`The bot want to delete <#${channel.id}> in <#${(_a = channel.parent) === null || _a === void 0 ? void 0 : _a.id}>`);
                    //await channel.delete().catch(console.error);
                }
            }
        });
    }
}
exports.DeleteEmptyVoiceChannel = DeleteEmptyVoiceChannel;
