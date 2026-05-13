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
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const MessageManager_1 = require("../../../utils/Manager/MessageManager");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
const HDFRUserList_1 = require("../../../utils/hdfr_list/HDFRUserList");
const VoiceChannel_1 = require("./VoiceChannel");
const STATUS_CHECK_INTERVAL_MS = simplediscordbot_1.Time.second.SEC_30.toMilliseconds();
const VOICE_STUCK_THRESHOLD_MS = simplediscordbot_1.Time.second.SEC_05.toMilliseconds();
class DetectMee6Crash extends discord_module_1.Module {
    constructor() {
        super();
        this.name = "DetectMee6Crash";
        this.description = "Check MEE6 status periodically and detect stuck members in voice channels";
        this.statusInterval = null;
        // channelId → timestamp d'entrée
        this.stuckWatchMap = new Map();
        this.userToDetect = simplediscordbot_1.BotEnv.dev ? HDFRUserList_1.HDFRUserList.SPATULOX : HDFRUserList_1.HDFRUserList.MEE6;
        this.startWatching(this.userToDetect, HDFR_1.HDFR.guildID);
    }
    // ------------------------------------------------------------------ //
    //  API publique : démarrer / arrêter le suivi d'un membre
    // ------------------------------------------------------------------ //
    /**
     * Lance le check périodique du statut pour le membre donné.
     * Appelle stopWatching() avant de changer de cible.
     */
    startWatching(memberId, guildId) {
        this.stopWatching();
        this.statusInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const guild = yield simplediscordbot_1.GuildManager.find(guildId);
            if (!guild)
                return;
            const member = yield guild.members.fetch(memberId).catch(() => null);
            if (!member)
                return;
            const status = MemberManager_1.MemberManager.getMemberStatus(member);
            if (status === "offline") {
                yield this.sendAlert(`⚠️ **MEE6** (<@${this.userToDetect}>) semble **hors ligne**.`);
            }
        }), STATUS_CHECK_INTERVAL_MS);
    }
    stopWatching() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
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
            MessageManager_1.MessageManager.sendToAdminChannel(msg);
            simplediscordbot_1.Bot.log.info(msg);
        });
    }
}
exports.DetectMee6Crash = DetectMee6Crash;
