"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectFFWCrash = void 0;
const WatchingOfflineUser_1 = require("../../../share/modules/WatchingOfflineUser");
const BotType_1 = require("../../../share/BotType");
const FFW_1 = require("../../../farfar_west/src/utils/ffw_list/FFW");
const UserList_1 = require("../../../share/utils/UserList");
class DetectFFWCrash extends WatchingOfflineUser_1.WatchingOfflineUser {
    constructor() {
        super(FFW_1.FFW.guildID, UserList_1.UserList.GGWiki.FFW, BotType_1.BotType.MONITORING);
        this.name = "DetectFFWCrash";
    }
}
exports.DetectFFWCrash = DetectFFWCrash;
