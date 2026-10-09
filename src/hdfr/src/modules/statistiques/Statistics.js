"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const ActivityTrackerHDFR_1 = require("./ActivityTrackerHDFR");
const discord_module_1 = require("@spatulox/discord-module");
const MiscStatisticsHDFR_1 = require("./MiscStatisticsHDFR");
class Statistics extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "Statistics";
        this.description = "Module to handle different Statistics";
        this.subModules = [
            new ActivityTrackerHDFR_1.ActivityTrackerHDFR(),
            new MiscStatisticsHDFR_1.MiscStatisticsHDFR(),
        ];
    }
}
exports.Statistics = Statistics;
