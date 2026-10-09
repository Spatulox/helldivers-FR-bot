"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRRoleManager = void 0;
const constantes_1 = require("../../constantes");
class HDFRRoleManager {
    static isPriorityEmoji(content) {
        return content.includes(constantes_1.STAR_EMOJI) || constantes_1.PRIORITY_EMOJI.some(emoji => content.includes(emoji));
    }
    static isUnbanTag(content) {
        return content.toLowerCase() === constantes_1.UNBAN_TAG;
    }
    static findPriorityRole(roles) {
        // [unban] passe avant tout le reste, y compris les emojis prioritaires
        const unbanRole = roles.find(role => {
            const match = role.name.match(constantes_1.regexRole);
            return !!match && HDFRRoleManager.isUnbanTag(match[1]);
        });
        if (unbanRole)
            return unbanRole;
        let roleToKeep = undefined;
        let highestNumber = -1;
        let questionMarkRole = undefined;
        for (const role of roles.values()) {
            const match = role.name.match(constantes_1.regexRole);
            if (match) {
                const content = match[1];
                if (HDFRRoleManager.isPriorityEmoji(content)) {
                    // Un emoji prioritaire l'emporte sur tout rôle chiffré, même rencontré après
                    return role;
                }
                else if (HDFRRoleManager.questionMarkRegex.test(content)) {
                    questionMarkRole = role;
                }
                else {
                    const number = parseInt(content);
                    if (!isNaN(number) && number > highestNumber) {
                        highestNumber = number;
                        roleToKeep = role;
                    }
                }
            }
        }
        return roleToKeep || questionMarkRole;
    }
}
exports.HDFRRoleManager = HDFRRoleManager;
HDFRRoleManager.questionMarkRegex = /(\?{2})+/;
