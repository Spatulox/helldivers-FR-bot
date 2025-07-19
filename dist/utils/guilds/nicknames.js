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
const promises_1 = require("timers/promises");
const embeds_1 = require("../messages/embeds");
//import { isUsernamePingable } from './members';
//import { createErrorEmbed, sendEmbedToInfoChannel } from '../messages/embeds';
let personCantBeRenamed = {};
const MAX_NICKNAME_LENGTH = 32;
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
 * Renomme un utilisateur avec un pseudo donné, en respectant la limite de Discord.
 * Tronque si nécessaire.
 *
 * @param member - Le membre à renommer.
 * @param newNickname - Le nouveau pseudo à appliquer.
 * @returns true si le renommage réussi, false sinon.
 */
function renameUser(member, newNickname) {
    return __awaiter(this, void 0, void 0, function* () {
        // Si le nickname dépasse la limite, on tronque la fin
        if (newNickname.length > MAX_NICKNAME_LENGTH) {
            newNickname = newNickname.slice(0, MAX_NICKNAME_LENGTH);
        }
        const maxAttempts = 3;
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            try {
                const oldName = member.displayName;
                yield member.setNickname(newNickname.trim());
                console.log(`Renaming user: ${oldName} → ${newNickname.trim()}`);
                yield (0, promises_1.setTimeout)(1500);
                return true;
            }
            catch (error) {
                console.error(`Tentative ${attempts + 1} échouée pour renommer ${member.displayName} en ${newNickname.trim()}:`, error);
                // Petite pause avant de réessayer
                yield (0, promises_1.setTimeout)(1000);
            }
        }
        console.error(`❌ Impossible de renommer ${member.displayName} en ${newNickname.trim()} après ${maxAttempts} tentatives.`);
        if (!personCantBeRenamed[member.displayName]) {
            personCantBeRenamed[member.displayName] = true;
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`Failed to rename ${member.displayName} to ${newNickname.trim()} after ${maxAttempts} attempts.`));
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
