"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRCategoriesID = void 0;
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ProdHDFRCategoriesID = {
    terminids: "1205878072847630426",
    automaton: "1208924716191186944",
    illuminate: "1234477479834685451",
    farm_other: "1205878247414562826"
};
const HDFRDEBUGCategoriesID = {
    terminids: "1503500975242088471",
    automaton: "1503501018527174727",
    illuminate: "1503501091588018348",
    farm_other: "1503504272564686898"
};
class HDFRCategoriesID extends BasicServerConfig_1.BasicServeurConfig {
    static get config() {
        return simplediscordbot_1.BotEnv.dev ? HDFRDEBUGCategoriesID : ProdHDFRCategoriesID;
    }
    static get terminids() {
        this.print('[HDFR] terminids called');
        return this.config.terminids;
    }
    static get automaton() {
        this.print('[HDFR] automaton called');
        return this.config.automaton;
    }
    static get illuminate() {
        this.print('[HDFR] illuminate called');
        return this.config.illuminate;
    }
    static get farm_other() {
        this.print('[HDFR] farm_other called');
        return this.config.farm_other;
    }
}
exports.HDFRCategoriesID = HDFRCategoriesID;
