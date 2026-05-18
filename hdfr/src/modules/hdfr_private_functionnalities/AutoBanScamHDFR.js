"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBanScamHDFR = void 0;
const AutoBanScam_1 = require("../../../../share/modules/AutoBanScam");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
class AutoBanScamHDFR extends AutoBanScam_1.AutoBanScam {
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get alertChannel() {
        return HDFR_1.HDFR.channel.alert;
    }
    get rapportChannel() {
        return HDFR_1.HDFR.channel.rapport;
    }
    get infractionChannel() {
        return HDFR_1.HDFR.channel.infraction;
    }
    get botBrouillonChannel() {
        return HDFR_1.HDFR.channel.bot_brouillons;
    }
    get neRienEcrireIciChannel() {
        return HDFR_1.HDFR.channel.ne_rien_ecrire_ici;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isStaff(member);
    }
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isTechnician(member);
    }
}
exports.AutoBanScamHDFR = AutoBanScamHDFR;
