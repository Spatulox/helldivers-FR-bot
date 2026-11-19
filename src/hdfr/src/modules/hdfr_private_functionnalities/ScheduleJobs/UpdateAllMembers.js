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
const ExecuteTaskWithCron_1 = require("../../../../../share/modules/ExecuteTaskWithCron");
const HDFRMember_1 = require("../HDFRMember");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class UpdateAllMembers extends ExecuteTaskWithCron_1.ExecuteTaskWithCron {
    constructor() {
        //super('0 */2 * * *', async () => await HDFRMember.checkAndUpdateMembers());
        super('0 */2 * * *', () => __awaiter(this, void 0, void 0, function* () {
            yield this.members.checkAndUpdateMembers();
        }));
        this.name = UpdateAllMembers.NAME;
        this.description = "Automatically update all members every 2 hours";
        this.members = new HDFRMember_1.NewHDFRMember();
    }
    /**
     * Lance le balayage tout de suite, hors cron (bouton du Debug Panel, ex-commande texte
     * « check all -force »).
     */
    runNow(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.debug(`Update All members force started by <@${userId}>`));
            yield this.members.checkAndUpdateMembers();
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.debug(`Update All members finished`));
        });
    }
}
exports.UpdateAllMembers = UpdateAllMembers;
UpdateAllMembers.NAME = "UpdateAllMembers";
