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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadScheduledJobs = loadScheduledJobs;
const node_schedule_1 = require("node-schedule");
const config_json_1 = __importDefault(require("../config.json"));
const invites_1 = require("../utils/guilds/invites");
const messages_1 = require("../utils/messages/messages");
const client_1 = require("../utils/client");
const members_1 = require("../utils/guilds/members");
function loadScheduledJobs() {
    console.log(`Chargement des tâches quotidiennes terminé.`);
    (0, node_schedule_1.scheduleJob)('00 23 * * *', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield client_1.client.channels.fetch(config_json_1.default.helldiverLogChannel);
            if (!channel || !('guild' in channel)) {
                console.error("Le salon spécifié n'est pas un salon de serveur.");
                return;
            }
            yield (0, invites_1.scheduledDeleteOldInvites)(channel);
        }
        catch (err) {
            const msg = `Error when deleting invites : ${err}`;
            (0, messages_1.sendMessage)(msg);
            (0, messages_1.sendMessageToInfoChannel)(msg);
        }
    }));
    (0, node_schedule_1.scheduleJob)('0 */2 * * *', () => __awaiter(this, void 0, void 0, function* () {
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
}
;
