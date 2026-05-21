"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWCategoriesID = void 0;
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ProdFFWCategoriesID = {
    en_chasse: "1458890365397631128",
};
const FFWDEBUGCategoriesID = {
    en_chasse: "",
};
class FFWCategoriesID extends BasicServerConfig_1.BasicServeurConfig {
    static get config() {
        return simplediscordbot_1.BotEnv.dev ? FFWDEBUGCategoriesID : ProdFFWCategoriesID;
    }
    static get en_chasse() {
        this.print('[FFW] en_chasse called');
        return this.config.en_chasse;
    }
}
exports.FFWCategoriesID = FFWCategoriesID;
