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
exports.OldInvites = void 0;
const Modules_1 = require("../../../../utils/other/Modules");
const node_schedule_1 = require("node-schedule");
const client_1 = require("../../../../utils/client");
const config_json_1 = __importDefault(require("../../../../config.json"));
const invites_1 = require("../../../../utils/guilds/invites");
const messages_1 = require("../../../../utils/messages/messages");
class OldInvites extends Modules_1.Module {
    constructor() {
        if (OldInvites._instance) {
            return OldInvites._instance;
        }
        super("OldInvites", "Automatically delete old invites at midnight");
        OldInvites._instance = this;
    }
    static get instance() { return OldInvites._instance; }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, node_schedule_1.scheduleJob)('00 23 * * *', () => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
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
        });
    }
}
exports.OldInvites = OldInvites;
OldInvites._instance = null;
