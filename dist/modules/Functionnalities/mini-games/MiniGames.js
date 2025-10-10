"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGames = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const DemocraticRoulette_1 = require("./DemocraticRoulette");
const Intrusion_1 = require("./Intrusion");
const StratagemHero_1 = require("./StratagemHero");
class MiniGames extends Modules_1.MultiModule {
    constructor() {
        super("Mini Games", `Module for custom mini games`);
        this.democraticRoulette = new DemocraticRoulette_1.DemocraticRoulette();
        this.stratagemHero = new StratagemHero_1.StratagemHero();
        this.intrusion = new Intrusion_1.Intrusion();
        this._subModuleList = [
            this.democraticRoulette,
            this.stratagemHero,
            this.intrusion
        ];
        this.miniGamesList = this._subModuleList.map(instance => instance.name);
    }
    handleMessage(message) {
        var _a, _b;
        if (!this.enabled)
            return;
        (_a = this.intrusion) === null || _a === void 0 ? void 0 : _a.handleMessage(message);
        (_b = this.stratagemHero) === null || _b === void 0 ? void 0 : _b.handleMessage(message);
    }
}
exports.MiniGames = MiniGames;
