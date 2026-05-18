"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFR = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const HDFRCategoriesID_1 = require("./HDFRCategoriesID");
const HDFRChannelID_1 = require("./HDFRChannelID");
class HDFR extends BasicServerConfig_1.BasicServeurConfig {
    static get guildID() {
        this.print('[HDFR] guildID called');
        return simplediscordbot_1.BotEnv.dev ? "1214320754578165901" : "1111160769132896377";
    }
}
exports.HDFR = HDFR;
HDFR.channel = HDFRChannelID_1.HDFRChannelID;
HDFR.categories = HDFRCategoriesID_1.HDFRCategoriesID;
