"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const MiscStatisticsFFW_1 = require("./MiscStatisticsFFW");
class Statistics extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "Statistics";
        this.description = "Module to handle different Statistics";
        this.subModules = [
            new MiscStatisticsFFW_1.MiscStatisticsFFW(),
        ];
    }
}
exports.Statistics = Statistics;
