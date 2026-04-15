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
exports.UpdateAllMembers = void 0;
const node_schedule_1 = require("node-schedule");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
class UpdateAllMembers extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "UpdateAllMembers";
        this.description = "Automatically update all members every 2 hours";
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, node_schedule_1.scheduleJob)('0 */2 * * *', () => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    //Bot.log.info(EmbedManager.description("Starting all user check"));
                    console.log("Starting all user check");
                    yield MemberManager_1.MemberManager.checkAndUpdateMembers();
                    //Bot.log.info(EmbedManager.description("All users checked"));
                    console.log("All users checked");
                }
                catch (err) {
                    const msg = `Erreur lors de la vérification des utilisateurs : ${err}`;
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(msg));
                }
            }));
        });
    }
}
exports.UpdateAllMembers = UpdateAllMembers;
