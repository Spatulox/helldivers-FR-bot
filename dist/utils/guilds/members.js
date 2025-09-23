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
exports.checkAndUpdateMembers = checkAndUpdateMembers;
exports.checkAndUpdateMember = checkAndUpdateMember;
exports.checkMemberWithDelay = checkMemberWithDelay;
exports.fetchMembers = fetchMembers;
exports.handleMemberUpdate = handleMemberUpdate;
exports.handleNewMember = handleNewMember;
exports.isStaffInteraction = isStaffInteraction;
exports.isStaff = isStaff;
exports.isModerator = isModerator;
exports.isAdmin = isAdmin;
exports.isGounie = isGounie;
exports.isTechnician = isTechnician;
exports.isDiplomate = isDiplomate;
exports.isBot = isBot;
exports.isUsernamePingable = isUsernamePingable;
const client_1 = require("../client");
const messages_1 = require("../messages/messages");
//import config from '../../config.json';
const constantes_1 = require("../constantes");
const guilds_1 = require("./guilds");
const role_1 = require("./role");
const nicknames_1 = require("./nicknames");
const promises_1 = require("timers/promises");
const UnitTime_1 = require("../times/UnitTime");
//import { normalizeFancyText } from '../other/text';
const unidecode_plus_1 = __importDefault(require("unidecode-plus"));
const embeds_1 = require("../messages/embeds");
//import { createSimpleEmbed, sendEmbedToAdminChannel, sendEmbedToInfoChannel } from '../messages/embeds';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = UnitTime_1.Time.minute.MIN_05.toMilliseconds();
let numberOfUnpingable = 0;
const azertyChars = `
àâäéèêëïîôöùûüç
ÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ
_.-!?&()[]{}:;,/'"°²$£
@#=+*
 \\|<>%
`.replace(/\s/g, '');
const azertyCharCodes = Array.from(new Set(azertyChars))
    .map(c => {
    const code = c.codePointAt(0);
    return code ? [code, code] : null;
})
    .filter((v) => v !== null);
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
                // Vérifie et met à jour le membre
                yield checkAndUpdateMember(member);
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
        console.log("Number of person unpingable : " + numberOfUnpingable);
        return updatedMembers;
    });
}
/**
 * Vérifie et met à jour les rôles et le pseudo d'un membre.
 * @param newMember - Le membre à vérifier et mettre à jour.
 */
function checkAndUpdateMember(newMember) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Récupérer les rôles correspondant aux regex
        const matchingRoles = newMember.roles.cache.filter((role) => constantes_1.regexRole.test(role.name));
        /*const seicRole: Role | undefined = newMember.roles.cache.find((role) =>
            regexSEIC.test(role.name)
        );*/
        const seicRole = false;
        let forcedNickname = null;
        let thePriorityRoleName = "";
        if (!isUsernamePingable(newMember)) {
            forcedNickname = newMember.user.username;
        }
        let renamed = false;
        // 2. Gestion des rôles et pseudo de niveau (hors SEIC)
        if (matchingRoles.size > 0) { // Si au moins un role
            const priorityRole = (0, role_1.findPriorityRole)(matchingRoles);
            if (priorityRole) {
                try {
                    // Nettoyage des rôles non prioritaires
                    yield (0, role_1.updateMemberRoles)(newMember, matchingRoles, priorityRole);
                    thePriorityRoleName = priorityRole.name;
                    // Si le membre n'a pas SEIC et que le pseudo ne contient pas déjà le rôle
                    if (!seicRole && (!newMember.nickname || !newMember.nickname.includes(priorityRole.name))) {
                        const formattedNick = cleanNickname(newMember, priorityRole.name, forcedNickname);
                        yield (0, nicknames_1.renameUser)(newMember, formattedNick);
                        renamed = true;
                    }
                }
                catch (err) {
                    console.error(`Erreur lors du renommage pour ${newMember.user.tag} :`, err);
                }
            }
        }
        /*
        // 3. Gestion du rôle SEIC
        if (seicRole) {
            if (!newMember.nickname || !newMember.nickname.includes(seicRole.name)) {
                const formattedNick = cleanNickname(newMember, seicRole.name, forcedNickname);
                try {
                    await renameUser(newMember, formattedNick);
                    renamed = true
                } catch (err) {
                    console.error(`Erreur lors du renommage pour ${newMember.user.tag} :`, err);
                }
            }
        }
        */
        if (forcedNickname) {
            const role = /*seicRole?.name ||*/ thePriorityRoleName;
            const formattedNick = cleanNickname(newMember, role, forcedNickname);
            const uid = `<@${newMember.id}>`;
            const display = newMember.displayName;
            const msg = `## Renaming user: ${uid}\n> - From : ${display}\n> - To : ${formattedNick}`;
            if (!renamed) {
                try {
                    yield (0, nicknames_1.renameUser)(newMember, formattedNick);
                }
                catch (err) {
                    console.error(`Erreur lors du renommage pour ${newMember.user.tag} :`, err);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`Erreur lors du renommage pour ${newMember.user.tag} : ${err}`));
                    return;
                }
            }
            (0, messages_1.sendMessageToInfoChannel)(msg);
            (0, messages_1.sendMessageToAdminChannel)(msg);
        }
    });
}
/**
 * Nettoie le pseudo actuel d'un membre en supprimant les anciens préfixes
 * et en ajoutant un nouveau préfixe.
 *
 * @param member - Le membre concerné.
 * @param prefix - Le préfixe à appliquer (nom du rôle).
 * @param forceNickname - Bypass the fallbakname by forcing the nickname to be the selected string.
 * @returns Le nouveau pseudo formaté.
 */
function cleanNickname(member, prefix, forceNickname) {
    const fallbackName = forceNickname || member.nickname || member.user.globalName || member.user.username || '';
    const cleanName = fallbackName.replace(/^\s*\[[^\]]+\]\s*/, '').trim(); // Enlève les anciens préfixes type [MOD]
    return `${prefix} ${cleanName}`;
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
                yield checkAndUpdateMember(member);
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
function handleMemberUpdate(newMember) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield checkAndUpdateMember(newMember);
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
function isStaffInteraction(interaction) {
    const member = interaction.member;
    if (member && member.roles.cache.has('1194776721229090826')) { // Citoyen STAFF
        return true;
    }
    return isGounie(member);
}
/**
 *
 * @param member The member
 * @returns false when it don't apply to the member (With certain role or a person)
 */
function isStaff(member) {
    if (member.user.bot) {
        return true;
    }
    if (member && member.roles.cache.has('1194776721229090826')) { // Citoyen STAFF
        return true;
    }
    return isGounie(member);
}
/**
 *
 * @param member The member
 * @returns false when it don't apply to the member (With certain role or a person)
 */
function isModerator(member) {
    if (member.user.bot) {
        return true;
    }
    if (member && member.roles.cache.has('1111163258401984552') || member.roles.cache.has('1206072446340300871')) { // Superviseur / Police Militaire
        return true;
    }
    return isGounie(member);
}
/**
 *
 * @param member The member
 * @returns false when it don't apply to the member (With certain role or a person)
 */
function isAdmin(member) {
    if (member.user.bot) {
        return true;
    }
    if (member && member.roles.cache.has('1111163258401984552')) { // Superviseur / Police Militaire
        return true;
    }
    return isGounie(member);
}
/**
 * @returns false when it don't apply to Gounie
 */
function isGounie(member) {
    if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(member.id)) {
        return true;
    }
    return false;
}
/**
 *
 * @param member The member
 * @returns true when the member is a technician
 */
function isTechnician(member) {
    if (member.user.bot) {
        return true;
    }
    if (member && (member.roles.cache.has('1303398589812183060') || member.roles.cache.has("1414949968502067350"))) { // Technicien APP/BOT/SITE | Technicien debug
        return true;
    }
    return false;
}
/**
 *
 * @param member The member
 * @returns false when it don't apply to the member (With certain role or a person)
 */
function isDiplomate(member) {
    if (member.user.bot) {
        return true;
    }
    if (member && member.roles.cache.has('1337407242730737754')) { // Diplomate
        return true;
    }
    return false;
}
function isBot(member) {
    if (member.user.bot) {
        return true;
    }
    return false;
}
function isUsernamePingable(member) {
    const pingableChar = [
        [0x0030, 0x0039], // 0–9
        [0x0041, 0x005A], // A–Z IPA AZERTY LETTERS
        [0x0061, 0x007A], // a–z ipa azerty letters
        [0xFF01, 0xFF5E], // Fullwidth ASCII range
        [0x1D400, 0x1D7FF], // Large “Mathematical Alphanumeric Symbols” block
        ...azertyCharCodes
    ];
    /*const forbiddenRanges: [number, number][] = [
        [0x0250, 0x02AF],   // IPA Extensions
        [0x2070, 0x209F],   // Superscript and Subscript
        [0x2150, 0x218F],   // Number Forms (ⅈ, ⅱ, …)
        [0x1D00, 0x1D7F],   // Phonetic extensions
        [0x1D80, 0x1DBF],   // Phonetic extensions supplement
        [0xA700, 0xA71F],   // Modifier Tone Letters
        [0xFE50, 0xFE6F],    // Small Form Variants

        [0x0370, 0x03FF],   // Grec (Σ, etc.)
        [0x0400, 0x04FF],   // Cyrillique (Марик)
        [0x3040, 0x309F],   // Hiragana
        [0x30A0, 0x30FF],   // Katakana
        [0x4E00, 0x9FFF],   // Kanji (CJK Unified Ideographs)
        [0x0E00, 0x0E7F],   // Thaï
        [0x0600, 0x06FF],   // Arabic
        [0x0750, 0x077F],   // Arabic Supplement
        [0x08A0, 0x08FF],   // Arabic Extended-A
    ];*/
    // Ingore the [number+] & [SEIC] role
    const cleanedName = member.displayName
        .replace(constantes_1.regexRole, '')
        .replace(constantes_1.regexSEIC, '')
        .trim();
    // 1. Vérifie les caractères "pingables"
    //let nbOfOKletter = 0;
    const cleanedNameNoSpaces = cleanedName.replace(/\s+/gu, '');
    if (cleanedNameNoSpaces.length < 2) {
        numberOfUnpingable++;
        return false;
    }
    let consecutivePingable = 0;
    for (const char of cleanedNameNoSpaces) {
        const code = char.codePointAt(0);
        if (code !== undefined) {
            if (pingableChar.some(([start, end]) => code >= start && code <= end)) {
                consecutivePingable++;
                if (consecutivePingable >= 2) {
                    return true;
                }
            }
            else {
                consecutivePingable = 0;
            }
        }
    }
    // Werid Username transformed into regular ASCII
    const cleanCleanedName = (0, unidecode_plus_1.default)(cleanedName);
    if (cleanCleanedName && member.user.username.toLowerCase().includes(cleanCleanedName.toLowerCase())) {
        //console.log(`${member.user.username} : ${member.displayName} : ${cleanedName} : ${cleanCleanedName}`);
        return true;
    }
    // 3. Optionnel : si pas pingable mais il reste "rien" après nettoyage, renommer par username (exemple via un return spécial ou appel renommage)
    //console.log(`<@${member.id}> ${member.user.username} : le displayName ${member.displayName}, le clean name ${cleanCleanedName}`);
    numberOfUnpingable++;
    return false;
}
/**
 * Vrai test qui utilise le parsing Discord de base, mais j'ai pas test, et de toute façon ca fait un vrai ping, donc non
 * @param member
 * @param channel
 * @returns
 */
/*
async function isMemberTrulyPingable(member: GuildMember, channel: TextChannel): Promise<boolean> {
    const test = await channel.send({ content: `<@${member.id}>`, fetchReply: true });
    const pinged = test.mentions.has(member);
    await test.delete();
    return pinged;
}
*/ 
