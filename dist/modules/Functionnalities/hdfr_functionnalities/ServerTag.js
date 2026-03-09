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
exports.ServerTag = void 0;
const Modules_1 = require("../../Modules");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MessageManager_1 = require("../../../utils/Manager/MessageManager");
const HDFR_1 = require("../../../utils/HDFR");
class ServerTag extends Modules_1.Module {
    constructor() {
        if (ServerTag._instance) {
            return ServerTag._instance;
        }
        super("ServerTag", "Check the server tag of a user and send an alert if it's a forbidden tag");
        ServerTag._instance = this;
    }
    static get instance() {
        return ServerTag._instance;
    }
    static getUserTag(member) {
        var _a;
        return (_a = member.user.primaryGuild) === null || _a === void 0 ? void 0 : _a.tag;
    }
    static getUserPrimaryGuild(member) {
        return member.user.primaryGuild;
    }
    static userIsInUnauthorizedClan(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ServerTag.mutex.lock();
            try {
                if (member.guild.id != HDFR_1.HDFRChannelID.guildID)
                    return false;
                const userClan = member.user.primaryGuild;
                if (!userClan || !userClan.tag)
                    return false;
                if (ServerTag.UNAUTHORIZED_TAG.includes(userClan.tag)) {
                    return true;
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                ServerTag.mutex.unlock();
            }
            return false;
        });
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if ((yield ServerTag.userIsInUnauthorizedClan(member)) && !ServerTag.limiter.take(member.user.id)) {
                const embed = simplediscordbot_1.EmbedManager.simple(`<@${member.user.id}> (${member.nickname || member.user.globalName || member.user.username}) a un tag de clan interdit : ${ServerTag.getUserTag(member)}`);
                MessageManager_1.MessageManager.sendToAdminChannel(embed);
            }
        });
    }
    handleGuildMemberUpdate(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleGuildMemberAdd(member);
        });
    }
}
exports.ServerTag = ServerTag;
ServerTag.mutex = new simplediscordbot_1.SimpleMutex();
ServerTag.limiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.day.DAY_01.toMilliseconds());
ServerTag._instance = null;
ServerTag.UNAUTHORIZED_TAG = ["DÆSH", "GAZA", "SEX", "PH", "OF", "DW"];
