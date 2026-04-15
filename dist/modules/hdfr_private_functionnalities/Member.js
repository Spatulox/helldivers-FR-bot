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
exports.Member = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../../utils/HDFR");
const constantes_1 = require("../../constantes");
const MemberManager_1 = require("../../utils/Manager/MemberManager");
class Member extends discord_module_1.Module {
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
            if (member.guild.id === HDFR_1.HDFRChannelID.guildID) {
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(member.user.id) || member.user.bot) {
                    simplediscordbot_1.Log.info(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                    return;
                }
                yield MemberManager_1.MemberManager.handleNewMember(member);
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
            if (newMember.guild.id === HDFR_1.HDFRChannelID.guildID) {
                oldMember;
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(newMember.user.id) || newMember.user.bot) {
                    simplediscordbot_1.Log.info(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                    return;
                }
                yield MemberManager_1.MemberManager.handleMemberUpdate(newMember);
            }
        });
    }
}
exports.Member = Member;
