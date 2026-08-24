"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRAlertMessageDelete = void 0;
const AlertMessageDelete_1 = require("../../../../share/modules/AlertMessageDelete");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
class HDFRAlertMessageDelete extends AlertMessageDelete_1.AlertMessageDelete {
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    get neRienEcrireIciChannels() {
        return [
            HDFR_1.HDFR.channel.ne_rien_ecrire_ici,
            HDFR_1.HDFR.channel.ne_rien_ecrire_ici_vocal,
        ].filter(Boolean);
    }
    get messageAdmin() {
        return HDFR_1.HDFR.channel.message_admin;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isStaff(member);
    }
}
exports.HDFRAlertMessageDelete = HDFRAlertMessageDelete;
