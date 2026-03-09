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
exports.scheduledDeleteOldInvites = exports.deleteInvites = exports.deleteInvite = exports.isInviteOld = exports.delay = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const config_json_1 = __importDefault(require("../config.json"));
/**
 * Ajoute un délai (pause) asynchrone.
 * @param ms - Durée du délai en millisecondes.
 * @returns Une promesse résolue après le délai spécifié.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.delay = delay;
/**
 * Vérifie si une invitation est ancienne (plus d'une heure).
 * @param invite - L'invitation à vérifier.
 * @returns `true` si l'invitation est ancienne, `false` sinon.
 */
const isInviteOld = (invite) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 heure en millisecondes
    if (!invite.createdAt) {
        return false;
    }
    return (invite.maxAge !== 0 &&
        !config_json_1.default.excludedInvites.includes(invite.code) &&
        invite.createdAt < oneHourAgo);
};
exports.isInviteOld = isInviteOld;
/**
 * Supprime une invitation Discord.
 * @param invite - L'invitation à supprimer.
 * @returns `1` si la suppression a réussi, `0` en cas d'échec.
 */
const deleteInvite = (invite) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield invite.delete();
        if (!invite.createdAt) {
            return 0;
        }
        console.log(`L'invitation \`${invite.code}\` créée le ${invite.createdAt.toDateString()} a été supprimée.`);
        return 1;
    }
    catch (error) {
        console.error(error.message);
        return 0;
    }
});
exports.deleteInvite = deleteInvite;
const deleteInvites = (getInvitesFunc) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let deletedCount = 0;
        const invites = yield getInvitesFunc();
        console.log(`## ${invites.size} invitation(s) trouvée(s).`);
        yield (0, exports.delay)(1000);
        for (const invite of invites.values()) {
            if (!(0, exports.isInviteOld)(invite))
                continue;
            deletedCount += yield (0, exports.deleteInvite)(invite);
            console.log(`## L'invitation \`${invite.code}\` créée le ${(_a = invite.createdAt) === null || _a === void 0 ? void 0 : _a.toDateString()} a été supprimée.`);
        }
        const response = deletedCount > 0
            ? `## ${deletedCount} invitation(s) expirée(s) supprimée(s).`
            : `## Aucune invitation expirée n'a été trouvée.`;
        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.success(response));
    }
    catch (error) {
        console.error(error);
        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Il y a eu une erreur en tentant de supprimer les invitations : ${error}`));
    }
});
exports.deleteInvites = deleteInvites;
// Logique pour supprimer les invitations expirées via le planificateur
const scheduledDeleteOldInvites = (channel) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.deleteInvites)(() => channel.guild.invites.fetch());
});
exports.scheduledDeleteOldInvites = scheduledDeleteOldInvites;
