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
exports.checkAndUpdateMembers = checkAndUpdateMembers;
exports.checkAndUpdateMember = checkAndUpdateMember;
exports.checkMemberWithDelay = checkMemberWithDelay;
exports.fetchMembers = fetchMembers;
exports.handleMemberUpdate = handleMemberUpdate;
exports.handleNewMember = handleNewMember;
exports.isUserRateLimited = isUserRateLimited;
exports.checkIfApplyInteraction = checkIfApplyInteraction;
exports.checkIfApplyMember = checkIfApplyMember;
const discord_js_1 = require("discord.js");
const client_1 = require("../client");
const messages_1 = require("../messages/messages");
//import config from '../../config.json';
const constantes_1 = require("../constantes");
const guilds_1 = require("./guilds");
const role_1 = require("./role");
const nicknames_1 = require("./nicknames");
const promises_1 = require("timers/promises");
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes en millisecondes
/**
 * Vérifie et met à jour les membres d'un serveur Discord.
 * @returns Une liste des IDs des membres mis à jour.
 */
function checkAndUpdateMembers() {
    return __awaiter(this, void 0, void 0, function* () {
        let members;
        const updatedMembers = [];
        try {
            const guild = yield client_1.client.guilds.fetch(constantes_1.TARGET_GUILD_ID); // Récupère le serveur cible
            members = yield fetchMembers(guild); // Récupère tous les membres du serveur
        }
        catch (finalError) {
            console.error(`Échec final: ${finalError}`);
            (0, messages_1.sendMessage)(`Échec final après ${MAX_ATTEMPTS} tentatives: ${finalError}`);
            (0, messages_1.sendMessageToInfoChannel)(`Échec final après ${MAX_ATTEMPTS} tentatives: ${finalError}`);
            return updatedMembers; // Retourne une liste vide en cas d'échec
        }
        if (!members) {
            console.error('Aucun membre récupéré.');
            return updatedMembers;
        }
        const membersArray = Array.from(members.values());
        const totalMembers = members.size;
        let processedMembers = 0;
        let lastPercentage = 0;
        console.log(`${membersArray.length} membres sur le Discord HD2 FR`);
        for (let i = 0; i < membersArray.length; i++) {
            const member = membersArray[i];
            const memberId = member.user.id;
            try {
                // Ignore les bots et certains utilisateurs spécifiques
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(memberId) || member.user.bot) {
                    console.log(`Skipping user: ${member.user.username} (ID: ${memberId})`);
                    continue;
                }
                //console.log(` ${i}/${membersArray.length} | Checking : ${member.nickname || member.user.username || member.user.globalName}`);
                // Vérifie et met à jour le membre
                yield checkAndUpdateMember(null, member);
                updatedMembers.push(memberId);
            }
            catch (error) {
                const msg = `Error updating member ${memberId}: ${error}`;
                console.error(msg);
                (0, messages_1.sendMessage)(msg);
            }
            processedMembers++;
            const currentPercentage = Math.floor((processedMembers / totalMembers) * 100);
            if (currentPercentage >= lastPercentage + 5) {
                console.log(`Progress: ${currentPercentage}%`);
                lastPercentage = currentPercentage;
            }
        }
        return updatedMembers;
    });
}
/**
 * Vérifie et met à jour les rôles et le pseudo d'un membre.
 * @param oldMember - Ancien état du membre (peut être `null` si non utilisé).
 * @param newMember - Nouveau membre à vérifier et mettre à jour.
 */
function checkAndUpdateMember(oldMember, newMember) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ajouter les rôles manquants
        //await addMissingRole(newMember);
        // Récupérer les rôles correspondant à regexRole
        const matchingRoles = newMember.roles.cache.filter((role) => constantes_1.regexRole.test(role.name));
        // Vérifier si le membre possède le rôle SEIC
        const seicRole = newMember.roles.cache.find((role) => constantes_1.regexSEIC.test(role.name));
        // Gestion des rôles de niveau (supprime les rôles inutiles et met à jour le pseudo si pas SEIC)
        if (matchingRoles.size > 0) {
            const priorityRole = (0, role_1.findPriorityRole)(matchingRoles);
            if (priorityRole) {
                // Supprime les rôles inutiles
                yield (0, role_1.updateMemberRoles)(newMember, matchingRoles, priorityRole);
                // Met à jour le pseudo uniquement si le membre n'a pas le rôle SEIC
                if (!seicRole && (!newMember.nickname || !newMember.nickname.includes(priorityRole.name))) {
                    yield (0, nicknames_1.renameUser)(newMember, priorityRole.name);
                }
            }
        }
        // Gestion du rôle SEIC (met à jour le pseudo pour inclure [SEIC])
        if (seicRole) {
            if (!newMember.nickname || !newMember.nickname.includes(seicRole.name)) {
                try {
                    yield (0, nicknames_1.renameUser)(newMember, seicRole.name);
                }
                catch (err) {
                    console.error(`Erreur lors de la mise à jour du pseudo pour ${newMember.user.tag} : ${err}`);
                }
            }
        }
    });
}
/**
 * Vérifie un membre avec un délai avant l'exécution.
 * @param member - Le membre à vérifier.
 * @param delayInMinutes - Délai en minutes avant la vérification.
 */
function checkMemberWithDelay(member, delayInMinutes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, promises_1.setTimeout)(delayInMinutes * 60 * 1000);
            if (yield (0, guilds_1.isMemberStillInGuild)(member.user.id, member.guild.id)) {
                yield member.fetch(true);
                yield checkAndUpdateMember(null, member);
            }
        }
        catch (err) {
            (0, messages_1.sendMessage)(`checkMemberWithDelay : ${err}`);
        }
    });
}
/**
 * Récupère tous les membres d'un serveur Discord avec des tentatives en cas d'échec.
 * @param guild - Le serveur Discord cible.
 * @returns Une collection des membres du serveur.
 */
function fetchMembers(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching Members for ${guild.name} guild`);
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                const members = yield guild.members.fetch();
                console.log(`Membres récupérés avec succès à la tentative ${attempt}`);
                return members;
            }
            catch (err) {
                console.error(`Erreur à la tentative ${attempt}: ${err}`);
                (0, messages_1.sendMessage)(`Erreur à la tentative ${attempt}: ${err}`);
                if (attempt < MAX_ATTEMPTS) {
                    console.log(`Nouvelle tentative dans 5 minutes...`);
                    try {
                        yield (0, promises_1.setTimeout)(RETRY_DELAY);
                    }
                    catch (delayErr) {
                        (0, messages_1.sendMessage)(`${delayErr}`);
                    }
                }
                else {
                    console.error(`Échec après ${MAX_ATTEMPTS} tentatives.`);
                    throw err;
                }
            }
        }
        throw new Error('Impossible de récupérer les membres après plusieurs tentatives.');
    });
}
function handleMemberUpdate(oldMember, newMember) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield checkAndUpdateMember(oldMember, newMember);
        }
        catch (err) {
            (0, messages_1.sendMessage)(`${err}`);
        }
    });
}
function handleNewMember(member) {
    return __awaiter(this, void 0, void 0, function* () {
        //sendMessage(`# New Member : ${member.user.username || member.user.globalName}`);
        yield checkMemberWithDelay(member, 1);
        yield checkMemberWithDelay(member, 5);
    });
}
function isUserRateLimited(interaction, rateLimiter, second) {
    return __awaiter(this, void 0, void 0, function* () {
        const limited = rateLimiter.take(interaction.user.id);
        if (limited) {
            yield interaction.reply({
                content: `Commande utilisée trop fréquemment, attendez ${second} secondes :)`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return true;
        }
        return false;
    });
}
function checkIfApplyInteraction(interaction) {
    const member = interaction.member;
    if (member && member.roles.cache.has('1359184231464698118')) {
        return false;
    }
    if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(interaction.user.id)) {
        return false;
    }
    return true;
}
function checkIfApplyMember(member) {
    if (member.user.bot) {
        return false;
    }
    if (member && member.roles.cache.has('1359184231464698118')) {
        return false;
    }
    if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(member.id)) {
        return false;
    }
    return true;
}
