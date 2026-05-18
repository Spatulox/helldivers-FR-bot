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
exports.OldInvites = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const Invites_1 = require("../utils/Invites");
const ExecuteTaskWithCron_1 = require("./ExecuteTaskWithCron");
class OldInvites extends ExecuteTaskWithCron_1.ExecuteTaskWithCron {
    get events() {
        return {};
    }
    constructor(guildId) {
        super('00 23 * * *', () => __awaiter(this, void 0, void 0, function* () {
            const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(this.guildId);
            if (!guild) {
                console.error("Le serveur spécifié n'a pas été trouvé");
                return;
            }
            yield (0, Invites_1.scheduledDeleteOldInvites)(guild);
        }));
        this.name = "OldInvites";
        this.description = "Automatically delete old invites at midnight for a specific server";
        this.guildId = guildId;
    }
}
exports.OldInvites = OldInvites;
