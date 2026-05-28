"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserList = void 0;
const HDFRUserList_1 = require("../../hdfr/src/utils/hdfr_list/HDFRUserList");
const FFWUserList_1 = require("../../farfar_west/src/utils/ffw_list/FFWUserList");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const GlobalUserList = {
    SPATULOX: "556461959042564098",
    GOUNIE: "877326929869561877",
};
const BotList = {
    HDFR: simplediscordbot_1.BotEnv.dev ? "1358129106767577250" : "1358119106087358675",
    FFW: simplediscordbot_1.BotEnv.dev ? "1504984714057093251" : "1507005778093932562",
};
exports.UserList = {
    shared: GlobalUserList,
    HDFR: HDFRUserList_1.HDFRUserList,
    FFW: FFWUserList_1.FFWUserList,
    GGWiki: BotList
};
