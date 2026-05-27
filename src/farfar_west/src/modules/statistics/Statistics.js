"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const MiscStatistics_1 = require("./MiscStatistics");
class Statistics extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "Statistics";
        this.description = "Module to handle different Statistics";
        this.subModules = [
            new MiscStatistics_1.MiscStatistics(),
        ];
    }
}
exports.Statistics = Statistics;
