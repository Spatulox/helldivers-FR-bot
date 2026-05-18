"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalMemberManager = void 0;
const HDFRRoles_1 = require("../../hdfr/src/utils/hdfr_list/HDFRRoles");
const MemberManager_1 = require("./MemberManager");
class HDFR extends MemberManager_1.MemberManager {
    static isStaffInteraction(interaction) {
        const member = interaction.member;
        if (member && member.roles.cache.has(HDFRRoles_1.HDFRRoles.staff)) {
            return true;
        }
        return this.shouldIgnoreMember(member);
    }
    /**
     *
     * @param member The member
     * @returns false when it don't apply to the member (With certain role or a person)
     */
    static isStaff(member) {
        if (this.isBot(member)) {
            return true;
        }
        if (member && member.roles.cache.has(HDFRRoles_1.HDFRRoles.staff)) {
            return true;
        }
        return this.shouldIgnoreMember(member);
    }
    /**
     *
     * @param member The member
     * @returns false when it don't apply to the member (With certain role or a person)
     */
    static isModerator(member) {
        if (this.isBot(member)) {
            return true;
        }
        if (member && member.roles.cache.has(HDFRRoles_1.HDFRRoles.superviseur) || member.roles.cache.has(HDFRRoles_1.HDFRRoles.moderator)) { // Superviseur / Police Militaire
            return true;
        }
        return this.shouldIgnoreMember(member);
    }
    /**
     *
     * @param member The member
     * @returns false when it don't apply to the member (With certain role or a person)
     */
    static isAdmin(member) {
        if (this.isBot(member)) {
            return true;
        }
        if (member && member.roles.cache.has(HDFRRoles_1.HDFRRoles.superviseur)) { // Superviseur / Police Militaire
            return true;
        }
        return this.shouldIgnoreMember(member);
    }
    /**
     *
     * @param member The member
     * @returns true when the member is a technician
     */
    static isTechnician(member) {
        if (this.isBot(member)) {
            return true;
        }
        if (member && (member.roles.cache.has(HDFRRoles_1.HDFRRoles.technicien) || member.roles.cache.has(HDFRRoles_1.HDFRRoles.technicien_debug))) {
            return true;
        }
        return false;
    }
    /**
     *
     * @param member The member
     * @returns false when it don't apply to the member (With certain role or a person)
     */
    static isDiplomate(member) {
        if (this.isBot(member)) {
            return true;
        }
        if (member && member.roles.cache.has(HDFRRoles_1.HDFRRoles.diplomate)) { // Diplomate
            return true;
        }
        return false;
    }
}
class GlobalMemberManager extends MemberManager_1.MemberManager {
}
exports.GlobalMemberManager = GlobalMemberManager;
GlobalMemberManager.HDFR = HDFR;
