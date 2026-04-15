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
exports.UnmutePersonAtMidnight = void 0;
const node_schedule_1 = require("node-schedule");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
const HDFR_1 = require("../../../utils/HDFR");
class UnmutePersonAtMidnight extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "UnmutePersonAtMidnight";
        this.description = "Automatically unmute/undeafen users at midnight";
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, node_schedule_1.scheduleJob)('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    yield MemberManager_1.MemberManager.unMuteAndDeafAllMember(HDFR_1.HDFRChannelID.guildID);
                }
                catch (e) {
                    const msg = `Erreur lors du unmute des utilisateurs : ${e}`;
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(msg));
                }
            }));
        });
    }
}
exports.UnmutePersonAtMidnight = UnmutePersonAtMidnight;
