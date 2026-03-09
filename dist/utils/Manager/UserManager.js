"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const constantes_1 = require("../../constantes");
const RoleManager_1 = require("./RoleManager");
class UserManager {
    /**
     * Nettoie UNIQUEMENT les emotes (custom Discord + unicode)
     * Garde les crochets, chiffres, caractères spéciaux
     * @param nickname - Le pseudo à nettoyer
     * @returns Le pseudo sans emotes
     */
    static cleanEmojisFromNickname(nickname) {
        return nickname
            .replace(UserManager.discordEmojiRegex, "") // Emotes custom <:x:id>
            .replace(UserManager.emojiRegexInstance, "") // Emotes unicode 🐵 ✭ etc
            .replace(/\s{2,}/g, " ") // Espaces doubles
            .trim();
    }
    /**
     * Vérifie si le pseudo d'un membre contient un caractère prioritaire.
     * @param member - Le membre à vérifier.
     * @returns `true` si le pseudo contient un caractère prioritaire, sinon `false`.
     */
    static nicknameContainsPriorityChar(member) {
        const currentNickname = member.nickname || member.user.globalName || member.user.username || '';
        const currentNicknameMatch = currentNickname.match(constantes_1.regexRole);
        // Si le pseudo contient un caractère prioritaire
        if (currentNicknameMatch && RoleManager_1.RoleManager.isPriorityEmoji(currentNicknameMatch[1])) {
            return true;
        }
        return false;
    }
}
exports.UserManager = UserManager;
UserManager.emojiRegexInstance = (0, emoji_regex_1.default)();
UserManager.discordEmojiRegex = /<a?:.+?:\d{17,20}>/g;
