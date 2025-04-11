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
exports.isMemberStillInGuild = isMemberStillInGuild;
const client_1 = require("../client");
/**
 * Vérifie si un membre est toujours dans un serveur Discord.
 * @param memberId - ID du membre à vérifier.
 * @param guildId - ID du serveur Discord.
 * @returns `true` si le membre est toujours dans le serveur, `false` sinon.
 */
function isMemberStillInGuild(memberId, guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const guild = yield client_1.client.guilds.fetch(guildId);
            yield guild.members.fetch({ user: memberId, force: true });
            return true;
        }
        catch (error) {
            //"Unknown Member"
            return error.code !== 10007;
        }
    });
}
