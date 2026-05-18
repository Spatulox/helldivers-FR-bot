"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const ActiveMembers_1 = require("./ActiveMembers");
const discord_module_1 = require("@spatulox/discord-module");
class Statistics extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "Statistics";
        this.description = "Module to handle different Statistics";
        this.subModules = [
            new ActiveMembers_1.ActiveMember()
        ];
    }
}
exports.Statistics = Statistics;
