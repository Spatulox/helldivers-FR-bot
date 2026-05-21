"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBanScamFFW = void 0;
const AutoBanScam_1 = require("../../../../share/modules/AutoBanScam");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const FFW_1 = require("../../utils/ffw_list/FFW");
class AutoBanScamFFW extends AutoBanScam_1.AutoBanScam {
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get alertChannel() {
        return FFW_1.FFW.channel.alert;
    }
    get rapportChannel() {
        return FFW_1.FFW.channel.rapport;
    }
    get infractionChannel() {
        return FFW_1.FFW.channel.avertissement;
    }
    get botBrouillonChannel() {
        return FFW_1.FFW.channel.bot_brouillons;
    }
    get neRienEcrireIciChannel() {
        return FFW_1.FFW.channel.ne_rien_ecrire_ici;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isStaff(member);
    }
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isBricoleur(member);
    }
}
exports.AutoBanScamFFW = AutoBanScamFFW;
