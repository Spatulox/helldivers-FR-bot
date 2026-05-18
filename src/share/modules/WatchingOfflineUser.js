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
exports.WatchingOfflineUser = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const MessageManager_1 = require("../managers/MessageManager");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MemberManager_1 = require("../managers/MemberManager");
const STATUS_CHECK_INTERVAL_MS = simplediscordbot_1.Time.second.SEC_30.toMilliseconds();
class WatchingOfflineUser extends discord_module_1.Module {
    get events() {
        return {};
    }
    //private readonly userToDetect = BotEnv.dev ? HDFRUserList.SPATULOX : HDFRUserList.MEE6
    constructor(guildId, memberId, botType) {
        super();
        this.name = "WatchingOfflineUser";
        this.description = "Check a bot status periodically";
        this.statusInterval = null;
        this.guildId = guildId;
        this.memberId = memberId;
        this.botType = botType;
        this.startWatching(this.memberId, this.guildId);
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
                yield this.sendAlert(`⚠️ **MEE6** (<@${this.memberId}>) semble **hors ligne**.`);
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
exports.WatchingOfflineUser = WatchingOfflineUser;
