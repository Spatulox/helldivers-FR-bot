"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemocraticRoulette = void 0;
const discord_module_1 = require("@spatulox/discord-module");
/**
 * This class only manager the StratagemHero module, not how the mini-games works
 */
class DemocraticRoulette extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Democratic Roulette";
        this.description = "Module for the Democratic Roulette mini-game";
    }
}
exports.DemocraticRoulette = DemocraticRoulette;
DemocraticRoulette.lastRoulette = null;
