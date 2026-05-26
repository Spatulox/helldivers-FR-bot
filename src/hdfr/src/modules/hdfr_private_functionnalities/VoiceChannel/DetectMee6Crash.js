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
exports.DetectMee6Crash = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const MessageManager_1 = require("../../../../../share/managers/MessageManager");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const VoiceChannel_1 = require("./VoiceChannel");
const WatchingOfflineUser_1 = require("../../../../../share/modules/WatchingOfflineUser");
const TmpVoiceChannel_1 = require("./TmpVoiceChannel");
const VOICE_STUCK_THRESHOLD_MS = simplediscordbot_1.Time.second.SEC_05.toMilliseconds();
class DetectMee6Crash extends discord_module_1.Module {
    constructor(guildId, memberId, botType) {
        super();
        this.name = "DetectMee6Crash";
        this.description = "Check MEE6 status periodically and detect stuck members in voice channels";
        // channelId → timestamp d'entrée
        this.stuckWatchMap = new Map();
        this.guildId = guildId;
        this.memberId = memberId;
        this.botType = botType;
        new WatchingOfflineUser_1.WatchingOfflineUser(this.guildId, this.memberId, this.botType, (isWatchedUserOnline, _status) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const mod = (_a = discord_module_1.ModuleManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getModule(new TmpVoiceChannel_1.HDFRTmpVoiceChannel().name);
                if (!mod)
                    return;
                if (!isWatchedUserOnline && !mod.enabled) {
                    yield simplediscordbot_1.Bot.log.info("Activating automatic TmpVoiceChannel");
                    mod.enable();
                }
                else if (mod.enabled) {
                    yield simplediscordbot_1.Bot.log.info("Deactivating automatic TmpVoiceChannel");
                    mod.disable();
                }
            }
            catch (e) {
                console.log(e);
            }
        }));
    }
    // ------------------------------------------------------------------ //
    //  Events
    // ------------------------------------------------------------------ //
    get events() {
        return {
            [discord_js_1.Events.VoiceStateUpdate]: (oldState, newState) => {
                this.handleVoiceUpdate(oldState, newState);
            },
        };
    }
    handleVoiceUpdate(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const userId = (_b = (_a = newState.member) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = oldState.member) === null || _c === void 0 ? void 0 : _c.id;
            if (!userId)
                return;
            const leftChannelId = oldState.channelId;
            const joinedChannelId = newState.channelId;
            // --- L'utilisateur quitte un trigger channel → annule le timer stuck ---
            if (leftChannelId && this.stuckWatchMap.has(userId)) {
                const entry = this.stuckWatchMap.get(userId);
                if (entry.channelId === leftChannelId) {
                    this.stuckWatchMap.delete(userId);
                }
            }
            // --- L'utilisateur rejoint un trigger channel → démarre le timer stuck ---
            if (joinedChannelId && VoiceChannel_1.VoiceChannel.allTriggerChannels.includes(joinedChannelId)) {
                this.stuckWatchMap.set(userId, { channelId: joinedChannelId, since: Date.now() });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f;
                    const entry = this.stuckWatchMap.get(userId);
                    if (!entry || entry.channelId !== joinedChannelId)
                        return; // déjà parti
                    const member = (_a = newState.member) !== null && _a !== void 0 ? _a : oldState.member;
                    const channelName = (_c = (_b = newState.channel) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : joinedChannelId;
                    const channelId = (_e = (_d = newState.channel) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : joinedChannelId;
                    yield this.sendAlert(`🔴 **${(_f = member === null || member === void 0 ? void 0 : member.user.tag) !== null && _f !== void 0 ? _f : userId}** est bloqué dans **<#${channelId !== null && channelId !== void 0 ? channelId : channelName}>** depuis plus de ${VOICE_STUCK_THRESHOLD_MS / 1000}s.`);
                }), VOICE_STUCK_THRESHOLD_MS);
            }
        });
    }
    // ------------------------------------------------------------------ //
    //  Helpers
    // ------------------------------------------------------------------ //
    sendAlert(msgDebug) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = `[AutomaticMee6CrashDetection] : ${msgDebug}`;
            MessageManager_1.MessageManager.sendToAdminChannel(msg, this.botType);
            simplediscordbot_1.Bot.log.info(msg);
        });
    }
}
exports.DetectMee6Crash = DetectMee6Crash;
