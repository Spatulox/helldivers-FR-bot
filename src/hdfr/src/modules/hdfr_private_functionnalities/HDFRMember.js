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
exports.HDFRMember = exports.NewHDFRMember = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const constantes_1 = require("../../constantes");
const MemberManager_1 = require("../../../../share/managers/MemberManager");
const HDFRServerTag_1 = require("./HDFRServerTag");
const HDFRRoleManager_1 = require("../../utils/Manager/HDFRRoleManager");
const promises_1 = require("timers/promises");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const BotGuildMember_1 = require("../../../../share/modules/BotGuildMember");
const MAX_ATTEMPTS = 3;
class NewHDFRMember extends BotGuildMember_1.BotGuildMember {
    constructor() {
        super(...arguments);
        this.guildID = HDFR_1.HDFR.guildID;
    }
    static isVerifiedMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (member.roles.cache.has('1405553782535753949') && member.roles.cache.has('1406146031741046825')) {
                    simplediscordbot_1.Log.info("Removing Role Non Vérifié for " + member.user.tag);
                    yield member.roles.remove('1406146031741046825');
                }
            }
            catch (err) {
                console.error(`Erreur lors de la vérification du membre ${member.user.tag} :`, err);
            }
        });
    }
    checkAndUpdateMember(newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            yield NewHDFRMember.isVerifiedMember(newMember);
            const bkpMemberDisplayName = newMember.displayName;
            if (yield new HDFRServerTag_1.HDFRServerTag().userIsInUnauthorizedClan(newMember))
                return;
            const matchingRoles = newMember.roles.cache.filter((role) => constantes_1.regexRole.test(role.name));
            const seicRole = false;
            let forcedNickname = null;
            let thePriorityRoleName = "";
            if (!MemberManager_1.MemberManager.isUsernamePingable(newMember)) {
                console.log(newMember.user.username + " is unpingable");
                forcedNickname = newMember.user.username;
            }
            let renamed = false;
            if (matchingRoles.size > 0) {
                const priorityRole = HDFRRoleManager_1.HDFRRoleManager.findPriorityRole(matchingRoles);
                if (priorityRole) {
                    try {
                        yield HDFRRoleManager_1.HDFRRoleManager.updateMemberRoles(newMember, matchingRoles, priorityRole);
                        thePriorityRoleName = priorityRole.name;
                        if (!seicRole && (!newMember.nickname || !newMember.nickname.includes(priorityRole.name))) {
                            const formattedNick = MemberManager_1.MemberManager.cleanNickname(newMember, priorityRole.name, forcedNickname);
                            renamed = yield simplediscordbot_1.GuildManager.user.rename(newMember, formattedNick);
                        }
                    }
                    catch (err) {
                        console.error(`Erreur lors du renommage pour ${newMember.user.tag} :`, err);
                    }
                }
            }
            if (forcedNickname) {
                const role = thePriorityRoleName;
                const formattedNick = MemberManager_1.MemberManager.cleanNickname(newMember, role, forcedNickname);
                const uid = `<@${newMember.id[0]}>`;
                const msg = `## Renaming user: ${uid}\n> - From : ${bkpMemberDisplayName}\n> - To : ${formattedNick}`;
                if (!renamed) {
                    try {
                        yield simplediscordbot_1.GuildManager.user.rename(newMember, formattedNick);
                    }
                    catch (err) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Erreur lors du renommage pour ${newMember.user.tag} : ${err}`));
                        return;
                    }
                }
                simplediscordbot_1.Bot.log.info(msg);
                simplediscordbot_1.Bot.message.send(HDFR_1.HDFR.channel.alert, msg);
            }
        });
    }
    static unMuteAndDeafAllMember(guildID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(guildID);
                if (!guild) {
                    throw "No Guild found";
                }
                const members = (yield simplediscordbot_1.GuildManager.fetchAllMembers(guild)).values();
                let numberOfUnmutedMember = 0;
                let numberOfUndeafenMember = 0;
                let numberOfFailedUnmutedMember = 0;
                let numberOfFailedUndeafenMember = 0;
                for (const mem of members) {
                    if (mem.voice.serverMute) {
                        try {
                            MemberManager_1.MemberManager.toggleMuteMember(mem);
                            numberOfUnmutedMember++;
                        }
                        catch (error) {
                            numberOfFailedUnmutedMember++;
                        }
                    }
                    if (mem.voice.serverDeaf) {
                        try {
                            MemberManager_1.MemberManager.toggleDeafMember(mem);
                            numberOfUndeafenMember++;
                        }
                        catch (error) {
                            numberOfFailedUndeafenMember++;
                        }
                    }
                }
                const embed = simplediscordbot_1.EmbedManager.create();
                embed.setTitle("UNMUTING / UNDEFEAN MEMBERS");
                embed.setDescription("Automatic jobs to unmuted / undeafen members");
                const fields = [
                    {
                        name: "Number of unmuted person",
                        value: numberOfUnmutedMember.toString()
                    },
                    {
                        name: "Number of undeafen person",
                        value: numberOfUndeafenMember.toString()
                    },
                    {
                        name: "Number of failed unmuted person",
                        value: numberOfFailedUndeafenMember.toString()
                    },
                    {
                        name: "Number of failed undeafen person",
                        value: numberOfFailedUndeafenMember.toString()
                    }
                ];
                simplediscordbot_1.EmbedManager.fields(embed, fields);
                simplediscordbot_1.Bot.log.info(embed);
                return true;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`${error}`);
            }
            return false;
        });
    }
}
exports.NewHDFRMember = NewHDFRMember;
class HDFRMember extends discord_module_1.Module {
    get events() {
        return {
            [discord_js_1.Events.GuildMemberAdd]: (member) => { this.handleGuildMemberAdd(member); },
            [discord_js_1.Events.GuildMemberUpdate]: (oldMember, newMember) => this.handleGuildMemberUpdate(oldMember, newMember),
        };
    }
    constructor() {
        super();
        this.name = "Member";
        this.description = "This module handle the renaming of the users to match their level role / SEIC role, and add missing roles like category roles";
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (member.guild.id === HDFR_1.HDFR.guildID) {
                if (GlobalMemberManager_1.GlobalMemberManager.HDFR.shouldIgnoreMember(member) || member.user.bot) {
                    simplediscordbot_1.Log.info(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                    return;
                }
                yield HDFRMember.handleNewMember(member);
            }
        });
    }
    /**
     * Rename the user, based on their role
     * @param oldMember
     * @param newMember
     * @returns
     */
    handleGuildMemberUpdate(oldMember, newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (newMember.guild.id === HDFR_1.HDFR.guildID) {
                oldMember;
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(newMember.user.id) || newMember.user.bot) {
                    simplediscordbot_1.Log.info(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                    return;
                }
                yield HDFRMember.handleMemberUpdate(newMember);
            }
        });
    }
    static isVerifiedMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (member.roles.cache.has('1405553782535753949') && member.roles.cache.has('1406146031741046825')) {
                    simplediscordbot_1.Log.info("Removing Role Non Vérifié for " + member.user.tag);
                    yield member.roles.remove('1406146031741046825');
                }
            }
            catch (err) {
                console.error(`Erreur lors de la vérification du membre ${member.user.tag} :`, err);
            }
        });
    }
    static unMuteAndDeafAllMember(guildID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(guildID);
                if (!guild) {
                    throw "No Guild found";
                }
                const members = (yield simplediscordbot_1.GuildManager.fetchAllMembers(guild)).values();
                let numberOfUnmutedMember = 0;
                let numberOfUndeafenMember = 0;
                let numberOfFailedUnmutedMember = 0;
                let numberOfFailedUndeafenMember = 0;
                for (const mem of members) {
                    if (mem.voice.serverMute) {
                        try {
                            MemberManager_1.MemberManager.toggleMuteMember(mem);
                            numberOfUnmutedMember++;
                        }
                        catch (error) {
                            numberOfFailedUnmutedMember++;
                        }
                    }
                    if (mem.voice.serverDeaf) {
                        try {
                            MemberManager_1.MemberManager.toggleDeafMember(mem);
                            numberOfUndeafenMember++;
                        }
                        catch (error) {
                            numberOfFailedUndeafenMember++;
                        }
                    }
                }
                const embed = simplediscordbot_1.EmbedManager.create();
                embed.setTitle("UNMUTING / UNDEFEAN MEMBERS");
                embed.setDescription("Automatic jobs to unmuted / undeafen members");
                const fields = [
                    {
                        name: "Number of unmuted person",
                        value: numberOfUnmutedMember.toString()
                    },
                    {
                        name: "Number of undeafen person",
                        value: numberOfUndeafenMember.toString()
                    },
                    {
                        name: "Number of failed unmuted person",
                        value: numberOfFailedUndeafenMember.toString()
                    },
                    {
                        name: "Number of failed undeafen person",
                        value: numberOfFailedUndeafenMember.toString()
                    }
                ];
                simplediscordbot_1.EmbedManager.fields(embed, fields);
                simplediscordbot_1.Bot.log.info(embed);
                return true;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`${error}`);
            }
            return false;
        });
    }
    /**
     * Vérifie et met à jour les membres d'un serveur Discord.
     * Fonction four-tout dès qu'il faut faire une action sur un utilisateur toutes les deux heures :/
     * @returns Une liste des IDs des membres mis à jour.
     */
    static checkAndUpdateMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            let members;
            const updatedMembers = [];
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(HDFR_1.HDFR.guildID); // Récupère le serveur cible
                members = yield MemberManager_1.MemberManager.fetchMembers(guild); // Récupère tous les membres du serveur
            }
            catch (finalError) {
                console.error(`Échec final: ${finalError}`);
                simplediscordbot_1.Bot.log.info(`Échec final après ${MAX_ATTEMPTS} tentatives: ${finalError}`);
                return updatedMembers;
            }
            if (!members) {
                console.error('Aucun membre récupéré.');
                return updatedMembers;
            }
            const membersArray = Array.from(members.values());
            const totalMembers = members.size;
            let processedMembers = 0;
            let lastPercentage = 0;
            simplediscordbot_1.Log.info(`${membersArray.length} membres sur le Discord HD2 FR`);
            for (let i = 0; i < membersArray.length; i++) {
                const member = membersArray[i];
                const memberId = member.user.id;
                try {
                    // Ignore les bots et certains utilisateurs spécifiques
                    if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(memberId) || member.user.bot) {
                        simplediscordbot_1.Log.info(`Skipping user: ${member.user.username} (ID: ${memberId})`);
                        continue;
                    }
                    // Vérifie et met à jour le membre
                    yield HDFRMember.checkAndUpdateMember(member);
                    yield HDFRMember.isVerifiedMember(member);
                    updatedMembers.push(memberId);
                }
                catch (error) {
                    const msg = `Error updating member ${memberId}: ${error}`;
                    console.error(msg);
                    simplediscordbot_1.Bot.log.info(msg);
                }
                processedMembers++;
                const currentPercentage = Math.floor((processedMembers / totalMembers) * 100);
                if (currentPercentage >= lastPercentage + 5) {
                    simplediscordbot_1.Log.info(`Progress: ${currentPercentage}%`);
                    lastPercentage = currentPercentage;
                }
            }
            simplediscordbot_1.Log.info("Number of person unpingable : " + MemberManager_1.MemberManager.numberOfUnpingable);
            return updatedMembers;
        });
    }
    /**
     * Vérifie et met à jour les rôles et le pseudo d'un membre.
     * @param newMember - Le membre à vérifier et mettre à jour.
     */
    static checkAndUpdateMember(newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            const bkpMemberDisplayName = newMember.displayName;
            if (yield new HDFRServerTag_1.HDFRServerTag().userIsInUnauthorizedClan(newMember)) {
                return;
            }
            // 1. Récupérer les rôles correspondant aux regex
            const matchingRoles = newMember.roles.cache.filter((role) => constantes_1.regexRole.test(role.name));
            /*const seicRole: Role | undefined = newMember.roles.cache.find((role) =>
                regexSEIC.test(role.name)
            );*/
            const seicRole = false;
            let forcedNickname = null;
            let thePriorityRoleName = "";
            if (!MemberManager_1.MemberManager.isUsernamePingable(newMember)) {
                console.log(newMember.user.username + " is unpingable");
                forcedNickname = newMember.user.username;
            }
            let renamed = false;
            // 2. Gestion des rôles et pseudo de niveau (hors SEIC)
            if (matchingRoles.size > 0) { // Si au moins un role
                const priorityRole = HDFRRoleManager_1.HDFRRoleManager.findPriorityRole(matchingRoles);
                if (priorityRole) {
                    try {
                        // Nettoyage des rôles non prioritaires
                        yield HDFRRoleManager_1.HDFRRoleManager.updateMemberRoles(newMember, matchingRoles, priorityRole);
                        thePriorityRoleName = priorityRole.name;
                        // Si le membre n'a pas SEIC et que le pseudo ne contient pas déjà le rôle
                        if (!seicRole && (!newMember.nickname || !newMember.nickname.includes(priorityRole.name))) {
                            const formattedNick = MemberManager_1.MemberManager.cleanNickname(newMember, priorityRole.name, forcedNickname);
                            renamed = yield simplediscordbot_1.GuildManager.user.rename(newMember, formattedNick);
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
                const formattedNick = MemberManager_1.MemberManager.cleanNickname(newMember, role, forcedNickname);
                const uid = `<@${newMember.id[0]}>`;
                const msg = `## Renaming user: ${uid}\n> - From : ${bkpMemberDisplayName}\n> - To : ${formattedNick}`;
                if (!renamed) {
                    try {
                        yield simplediscordbot_1.GuildManager.user.rename(newMember, formattedNick);
                    }
                    catch (err) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Erreur lors du renommage pour ${newMember.user.tag} : ${err}`));
                        return;
                    }
                }
                simplediscordbot_1.Bot.log.info(msg);
                simplediscordbot_1.Bot.message.send(HDFR_1.HDFR.channel.alert, msg);
            }
        });
    }
    /**
     * Vérifie un membre avec un délai avant l'exécution.
     * @param member - Le membre à vérifier.
     * @param delayInMinutes - Délai en minutes avant la vérification.
     */
    static checkMemberWithDelay(member, delayInMinutes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.setTimeout)(delayInMinutes * 60 * 1000);
                if (yield simplediscordbot_1.GuildManager.isMemberInGuild(member.user.id, member.guild.id)) {
                    yield member.fetch(true);
                    yield HDFRMember.checkAndUpdateMember(member);
                    yield HDFRMember.isVerifiedMember(member);
                }
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`checkMemberWithDelay : ${err}`);
            }
        });
    }
    static handleMemberUpdate(newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield HDFRMember.checkAndUpdateMember(newMember);
                yield HDFRMember.isVerifiedMember(newMember);
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`${err}`);
            }
        });
    }
    static handleNewMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            //Bot.log.info(`# New Member : ${member.user.username || member.user.globalName}`);
            yield HDFRMember.checkMemberWithDelay(member, 1);
            yield HDFRMember.checkMemberWithDelay(member, 5);
        });
    }
}
exports.HDFRMember = HDFRMember;
