"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectHDFRCrash = void 0;
const WatchingOfflineUser_1 = require("../../../share/modules/WatchingOfflineUser");
const BotType_1 = require("../../../share/BotType");
const UserList_1 = require("../../../share/utils/UserList");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class DetectHDFRCrash extends WatchingOfflineUser_1.WatchingOfflineUser {
    constructor() {
        const userToWatch = UserList_1.UserList.GGWiki.HDFR;
        simplediscordbot_1.Bot.log.info(`Watching <@${userToWatch}>`);
        super("1214320754578165901", userToWatch, BotType_1.BotType.MONITORING);
        this.name = "DetectHDFRCrash";
    }
}
exports.DetectHDFRCrash = DetectHDFRCrash;
