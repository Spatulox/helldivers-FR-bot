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
const Modules_1 = require("../../../../utils/other/Modules");
const node_schedule_1 = require("node-schedule");
const messages_1 = require("../../../../utils/messages/messages");
const members_1 = require("../../../../utils/guilds/members");
class UpdateAllMembers extends Modules_1.Module {
    constructor() {
        if (UpdateAllMembers._instance) {
            return UpdateAllMembers._instance;
        }
        super("UpdateAllMembers", "Automatically update all members every 2 hours");
        UpdateAllMembers._instance = this;
    }
    static get instance() { return UpdateAllMembers._instance; }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, node_schedule_1.scheduleJob)('0 */2 * * *', () => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    (0, messages_1.sendMessage)("Starting all user check");
                    yield (0, members_1.checkAndUpdateMembers)();
                    (0, messages_1.sendMessage)("All user checked");
                }
                catch (err) {
                    const msg = `Erreur lors de la vérification des utilisateurs : ${err}`;
                    (0, messages_1.sendMessage)(msg);
                    (0, messages_1.sendMessageToInfoChannel)(msg);
                }
            }));
        });
    }
}
exports.UpdateAllMembers = UpdateAllMembers;
UpdateAllMembers._instance = null;
