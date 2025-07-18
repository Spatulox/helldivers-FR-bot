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
exports.nicknameContainsPriorityChar = nicknameContainsPriorityChar;
exports.renameUser = renameUser;
const constantes_1 = require("../constantes");
const role_1 = require("./role");
const messages_1 = require("../messages/messages");
const embeds_1 = require("../messages/embeds");
let personCantBeRenamed = {};
/**
 * Vérifie si le pseudo d'un membre contient un caractère prioritaire.
 * @param member - Le membre à vérifier.
 * @returns `true` si le pseudo contient un caractère prioritaire, sinon `false`.
 */
function nicknameContainsPriorityChar(member) {
    const currentNickname = member.nickname || member.user.globalName || member.user.username || '';
    const currentNicknameMatch = currentNickname.match(constantes_1.regexRole);
    // Si le pseudo contient un caractère prioritaire
    if (currentNicknameMatch && (0, role_1.isPriorityEmoji)(currentNicknameMatch[1])) {
        return true;
    }
    return false;
}
/**
 * Renomme un utilisateur en ajoutant un préfixe basé sur son rôle.
 * @param member - Le membre à renommer.
 * @param roleName - Le nom du rôle à utiliser comme préfixe.
 */
function renameUser(member, roleName) {
    return __awaiter(this, void 0, void 0, function* () {
        const MAX_NICKNAME_LENGTH = 32;
        // Vérifie si le pseudo contient déjà un caractère prioritaire
        if (nicknameContainsPriorityChar(member)) {
            return false; // Si le pseudo contient déjà un caractère prioritaire, ne rien faire
        }
        // Fonction utilitaire pour nettoyer le pseudo
        const cleanNickname = (nickname) => nickname.replace(/^\s*\[[^\]]+\]\s*/, '').trim(); // Supprime les préfixes entre crochets ([...])
        // Nettoyer le pseudo actuel
        const currentNickname = cleanNickname(member.nickname || member.user.globalName || member.user.username || '');
        // Construire le nouveau pseudo
        let newNickname = `${roleName} ${currentNickname}`;
        // Vérifier la limite de longueur imposée par Discord
        if (newNickname.length > MAX_NICKNAME_LENGTH) {
            const truncateNickname = (nickname, roleName) => nickname.slice(0, MAX_NICKNAME_LENGTH - roleName.length - 1); // Tronque pour respecter la limite
            newNickname = `${roleName} ${truncateNickname(currentNickname, roleName)}`;
        }
        const maxAttempts = 3;
        let err = "";
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            try {
                const oldMemberDisplayName = member.displayName;
                yield member.setNickname(newNickname.trim());
                (0, messages_1.sendMessage)(`Renaming user : ${oldMemberDisplayName} to : ${newNickname.trim()}`);
                return true;
            }
            catch (error) {
                console.error(`Tentative ${attempts + 1} échouée pour renommer ${member.displayName} à ${newNickname.trim()}: ${error}`);
                err = error;
                // Attente d'une seconde avant une nouvelle tentative
                yield new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        console.error(`Failed to rename ${member.displayName} to ${newNickname.trim()} after ${maxAttempts} attempts.`);
        if (!personCantBeRenamed[member.displayName]) {
            personCantBeRenamed[member.displayName] = true;
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`Failed to rename ${member.displayName} to ${newNickname.trim()} after ${maxAttempts} attempts. ${err}`));
        }
        return false;
    });
}
/**
 * Tronque un pseudo pour qu'il respecte la longueur maximale autorisée.
 * @param nickname - Le pseudo actuel.
 * @param rolePrefix - Le préfixe du rôle à ajouter.
 * @returns Le pseudo tronqué si nécessaire.
 */
/*function truncateNickname(nickname: string, rolePrefix: string): string {
    const maxLength = MAX_NICKNAME_LENGTH - rolePrefix.length - 1;
    return nickname.length > maxLength ? nickname.substring(0, maxLength) : nickname;
}*/
