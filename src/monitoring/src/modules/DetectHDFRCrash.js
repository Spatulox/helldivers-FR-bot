"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectHDFRCrash = void 0;
const WatchingOfflineUser_1 = require("../../../share/modules/WatchingOfflineUser");
const HDFR_1 = require("../../../hdfr/src/utils/hdfr_list/HDFR");
const BotType_1 = require("../../../share/BotType");
const UserList_1 = require("../../../share/utils/UserList");
class DetectHDFRCrash extends WatchingOfflineUser_1.WatchingOfflineUser {
    constructor() {
        super(HDFR_1.HDFR.guildID, UserList_1.UserList.GGWiki.HDFR, BotType_1.BotType.MONITORING);
        this.name = "DetectHDFRCrash";
    }
}
exports.DetectHDFRCrash = DetectHDFRCrash;
