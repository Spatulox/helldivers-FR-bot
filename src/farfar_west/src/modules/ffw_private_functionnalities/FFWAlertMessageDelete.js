"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWAlertMessageDelete = void 0;
const AlertMessageDelete_1 = require("../../../../share/modules/AlertMessageDelete");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const FFW_1 = require("../../utils/ffw_list/FFW");
class FFWAlertMessageDelete extends AlertMessageDelete_1.AlertMessageDelete {
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get neRienEcrireIciChannel() {
        return FFW_1.FFW.channel.ne_rien_ecrire_ici;
    }
    get messageAdmin() {
        return FFW_1.FFW.channel.message_admin;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isStaff(member);
    }
}
exports.FFWAlertMessageDelete = FFWAlertMessageDelete;
