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
exports.BotGuildMember = void 0;
// share/abstract/BotGuildMember.ts
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MemberManager_1 = require("../managers/MemberManager");
const promises_1 = require("timers/promises");
const GlobalMemberManager_1 = require("../managers/GlobalMemberManager");
const MAX_ATTEMPTS = 3;
class BotGuildMember extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "Member";
        this.description = "This module handle the renaming of the users to match their level role";
    }
    get events() {
        return {
            [discord_js_1.Events.GuildMemberAdd]: (member) => this.handleGuildMemberAdd(member),
            [discord_js_1.Events.GuildMemberUpdate]: (oldMember, newMember) => this.handleGuildMemberUpdate(oldMember, newMember),
        };
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled || member.guild.id !== this.guildID)
                return;
            if (GlobalMemberManager_1.GlobalMemberManager.shouldIgnoreMember(member) || member.user.bot) {
                simplediscordbot_1.Log.info(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                return;
            }
            yield this.handleNewMember(member);
        });
    }
    handleGuildMemberUpdate(_oldMember, newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled || newMember.guild.id !== this.guildID)
                return;
            if (GlobalMemberManager_1.GlobalMemberManager.shouldIgnoreMember(newMember) || newMember.user.bot) {
                simplediscordbot_1.Log.info(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                return;
            }
            yield this.handleMemberUpdate(newMember);
        });
    }
    handleMemberUpdate(newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.checkAndUpdateMember(newMember);
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`${err}`);
            }
        });
    }
    handleNewMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkMemberWithDelay(member, 1);
            yield this.checkMemberWithDelay(member, 5);
        });
    }
    checkAndUpdateMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            let members;
            const updatedMembers = [];
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(this.guildID);
                members = yield MemberManager_1.MemberManager.fetchMembers(guild);
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
            simplediscordbot_1.Log.info(`${membersArray.length} membres sur le Discord`);
            for (let i = 0; i < membersArray.length; i++) {
                const member = membersArray[i];
                const memberId = member.user.id;
                try {
                    if (GlobalMemberManager_1.GlobalMemberManager.shouldIgnoreMember(member) || member.user.bot) {
                        simplediscordbot_1.Log.info(`Skipping user: ${member.user.username} (ID: ${memberId})`);
                        continue;
                    }
                    yield this.checkAndUpdateMember(member);
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
    checkMemberWithDelay(member, delayInMinutes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.setTimeout)(delayInMinutes * 60 * 1000);
                if (yield simplediscordbot_1.GuildManager.isMemberInGuild(member.user.id, member.guild.id)) {
                    yield member.fetch(true);
                    yield this.checkAndUpdateMember(member);
                }
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`checkMemberWithDelay : ${err}`);
            }
        });
    }
}
exports.BotGuildMember = BotGuildMember;
