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
exports.isPriorityEmoji = isPriorityEmoji;
exports.findPriorityRole = findPriorityRole;
exports.updateMemberRoles = updateMemberRoles;
exports.removeRole = removeRole;
exports.addRole = addRole;
exports.addMissingRole = addMissingRole;
const client_1 = require("../client");
const constantes_1 = require("../constantes");
const messages_1 = require("../messages/messages");
const promises_1 = require("timers/promises");
const questionMarkRegex = /(\?{2})+/;
function isPriorityEmoji(content) {
    return content.includes(constantes_1.STAR_EMOJI) || constantes_1.PRIORITY_EMOJI.some(emoji => content.includes(emoji));
}
function findPriorityRole(roles) {
    let roleToKeep = undefined;
    let highestNumber = -1;
    let questionMarkRole = undefined;
    roles.forEach(role => {
        const match = role.name.match(constantes_1.regexRole);
        if (match) {
            const content = match[1];
            if (isPriorityEmoji(content)) {
                roleToKeep = role;
                return;
            }
            else if (questionMarkRegex.test(content)) {
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
    });
    return roleToKeep || questionMarkRole;
}
/**
 * Supprime les rôles excédentaires d'un membre tout en conservant le rôle prioritaire
 * @param member - Le membre à mettre à jour
 * @param matchingRoles - Collection des rôles correspondants (ID → Role)
 * @param priorityRole - Le rôle à conserver
 */
function updateMemberRoles(member, matchingRoles, priorityRole) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [id, role] of matchingRoles) {
            if (role.id !== priorityRole.id) {
                yield member.roles.remove(role);
                (0, messages_1.sendMessage)(`Rôle ${role.name} retiré de ${member.user.tag}`);
            }
        }
    });
}
/**
 * Supprime un rôle spécifique d'un membre par son nom
 * @param member - Le membre concerné
 * @param roleName - Nom du rôle à supprimer
 */
function removeRole(member, roleName) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, messages_1.sendMessage)(`Suppression du rôle : ${roleName} pour : ${member.displayName}`);
        try {
            const roleToRemove = member.roles.cache.find(role => role.name === roleName);
            if (roleToRemove) {
                yield member.roles.remove(roleToRemove);
            }
        }
        catch (removeError) {
            const errorMessage = removeError instanceof Error ? removeError.message : 'Erreur inconnue';
            console.error(`Erreur lors de la suppression du rôle: ${errorMessage}`);
        }
    });
}
function addRole(membreId, roleId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const guild = client_1.client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
            if (!guild) {
                (0, messages_1.sendMessage)("Serveur introuvable");
                return false;
            }
            const [membre, role] = yield Promise.all([
                guild.members.fetch(membreId).catch(() => null),
                guild.roles.fetch(roleId).catch(() => null)
            ]);
            if (!membre || !role) {
                (0, messages_1.sendMessage)(`Membre ou rôle non trouvé lors de l'assignation du rôle (Membre: <@${membreId}>, Rôle: <&@${roleId}>)`);
                return false;
            }
            yield membre.roles.add(role);
            return true;
        }
        catch (error) {
            let errorMessage = "Erreur inconnue";
            if (error instanceof Error) {
                console.error("Erreur lors de l'ajout du rôle:", error);
                errorMessage = error.message;
            }
            (0, messages_1.sendMessage)(`Erreur lors de l'ajout du rôle: ${errorMessage}`);
            return false;
        }
    });
}
/**
 * Add the missing roles
 * @param {*} member Discord Collection
 */
function addMissingRole(member) {
    return __awaiter(this, void 0, void 0, function* () {
        const discordMee6Level = /Échelon \d+(\+)?ㅤ*/;
        const changes = [];
        // Vérification des rôles de niveau
        const addRoleWithLog = (roleId, reason) => __awaiter(this, void 0, void 0, function* () {
            yield member.roles.add(roleId);
            changes.push(reason);
            (0, promises_1.setTimeout)(1500);
        });
        // Vérification rôle [00+]
        const hasCustomLevelRole = member.roles.cache.some(role => /Échelon \d+(\+)?ㅤ*/.test(role.name));
        if (!hasCustomLevelRole) {
            yield addRoleWithLog('1300573612155342869', 'Added [00+] role');
        }
        // Vérification rôle MEE6
        const hasMee6Role = member.roles.cache.some(role => discordMee6Level.test(role.name));
        if (!hasMee6Role) {
            yield addRoleWithLog('1132682168443883550', 'Added "Échelon 0" role');
        }
        // Rôles obligatoires
        const requiredRoleIds = [
            '1116203938924990474', '1304529517355859990', '1114918701427343413',
            '1300624629705998346', '1111327268032221184', '1121480715524120596'
        ];
        for (const roleId of requiredRoleIds) {
            if (!member.roles.cache.has(roleId)) {
                yield addRoleWithLog(roleId, `Added required role ${roleId}`);
            }
        }
        // Vérification des rôles optionnels (CORRIGÉ)
        const optionalRoleIds = ['1309244438114992179', '1111161812650573894'];
        const hasOptionalRole = optionalRoleIds.some(roleId => member.roles.cache.has(roleId));
        if (!hasOptionalRole && optionalRoleIds[1]) {
            yield addRoleWithLog(optionalRoleIds[1], 'Added primary optional role');
        }
        // Notification des changements
        if (changes.length > 0) {
            const username = member.nickname || member.user.username || member.user.globalName || 'Utilisateur inconnu';
            (0, messages_1.sendMessage)(`Mise à jour des rôles pour ${username} :\n- ${changes.join('\n- ')}`);
        }
    });
}
