"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFW = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const FFWCategoriesID_1 = require("./FFWCategoriesID");
const FFWChannelID_1 = require("./FFWChannelID");
class FFW extends BasicServerConfig_1.BasicServeurConfig {
    static get guildID() {
        this.print('[FFW] guildID called');
        return simplediscordbot_1.BotEnv.dev ? "1214320754578165901" : "1458874239783407762";
    }
}
exports.FFW = FFW;
FFW.channel = FFWChannelID_1.FFWChannelID;
FFW.categories = FFWCategoriesID_1.FFWCategoriesID;
