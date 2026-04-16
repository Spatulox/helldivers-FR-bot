"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGames = void 0;
const DemocraticRoulette_1 = require("./DemocraticRoulette");
const StratagemHero_1 = require("./StratagemHero");
const Intrusion_1 = require("./intrusion/Intrusion");
const discord_module_1 = require("@spatulox/discord-module");
class MiniGames extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "Mini Games";
        this.description = "Module for custom mini games";
        this.democraticRoulette = new DemocraticRoulette_1.DemocraticRoulette();
        this.stratagemHero = new StratagemHero_1.StratagemHero();
        this.intrusion = new Intrusion_1.Intrusion();
        this.subModules = [
            this.intrusion,
            this.democraticRoulette,
            this.stratagemHero
        ];
    }
}
exports.MiniGames = MiniGames;
