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
const Modules_1 = require("../../../utils/other/Modules");
const constantes_1 = require("../../../utils/constantes");
const members_1 = require("../../../utils/guilds/members");
const log_1 = require("../../../utils/other/log");
class Member extends Modules_1.Module {
    constructor() {
        if (Member._instance) {
            return Member._instance;
        }
        super("Member", "This module handle the renaming of the users to match their level role / SEIC role, and add missing roles like category roles");
        Member._instance = this;
    }
    static get instance() {
        return Member._instance;
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (member.guild.id === constantes_1.TARGET_GUILD_ID) {
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(member.user.id) || member.user.bot) {
                    (0, log_1.log)(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                    return;
                }
                yield (0, members_1.handleNewMember)(member);
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
            if (newMember.guild.id === constantes_1.TARGET_GUILD_ID) {
                oldMember;
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(newMember.user.id) || newMember.user.bot) {
                    (0, log_1.log)(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                    return;
                }
                yield (0, members_1.handleMemberUpdate)(newMember);
            }
        });
    }
}
exports.Member = Member;
Member._instance = null;
