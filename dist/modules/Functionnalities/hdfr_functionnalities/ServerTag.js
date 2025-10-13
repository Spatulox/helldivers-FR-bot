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
const Modules_1 = require("../../../utils/other/Modules");
const constantes_1 = require("../../../utils/constantes");
const embeds_1 = require("../../../utils/messages/embeds");
const SimpleMutex_1 = require("../../../utils/other/SimpleMutex");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const UnitTime_1 = require("../../../utils/times/UnitTime");
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
    handleAny(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.enabled) {
                return;
            }
            yield ServerTag.mutex.lock();
            try {
                if (data.guild_id != constantes_1.TARGET_GUILD_ID)
                    return;
                const unAllowedClanTag = ["DÆSH", "GAZA", "SEX", "PH", "OF", "DW"];
                const userClan = (_a = data.user) === null || _a === void 0 ? void 0 : _a.primary_guild;
                if (!userClan)
                    return;
                if (unAllowedClanTag.includes(userClan.tag) && !ServerTag.limiter.take(data.user.id)) {
                    const embed = (0, embeds_1.createSimpleEmbed)(`<@${data.user.id}> (${data.nick || data.user.global_name || data.user.username}) a un tag de clan interdit : ${userClan.tag}`);
                    (0, embeds_1.sendEmbedToAdminChannel)(embed);
                    (0, embeds_1.sendEmbedToInfoChannel)(embed);
                }
            }
            catch (error) {
                console.error(error);
            }
            ServerTag.mutex.unlock();
        });
    }
}
exports.ServerTag = ServerTag;
ServerTag.mutex = new SimpleMutex_1.SimpleMutex();
ServerTag.limiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.hour.HOUR_01.toMilliseconds());
ServerTag._instance = null;
