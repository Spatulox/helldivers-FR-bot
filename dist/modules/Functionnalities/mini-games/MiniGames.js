"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGames = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const DemocraticRoulette_1 = require("./DemocraticRoulette");
const Intrusion_1 = require("./Intrusion");
const StratagemHero_1 = require("./StratagemHero");
class MiniGames extends Modules_1.Module {
    constructor() {
        super("Mini Games", `Module for custom mini games`);
        this.democraticRoulette = new DemocraticRoulette_1.DemocraticRoulette();
        this.stratagemHero = new StratagemHero_1.StratagemHero();
        this.intrusion = new Intrusion_1.Intrusion();
        this.intances = [
            this.democraticRoulette,
            this.stratagemHero,
            this.intrusion
        ];
        this.miniGamesList = this.intances.map(instance => instance.name);
    }
    /**
     * Need to adapt enable/disable/enabled to enable/disable sub-modules
     * @returns
     */
    enable() {
        if (this.enabled)
            return true;
        this.democraticRoulette.enable();
        this.stratagemHero.enable();
        this.intrusion.enable();
        return super.enable();
    }
    disable() {
        if (!this.enabled)
            return true;
        this.democraticRoulette.disable();
        this.stratagemHero.disable();
        this.intrusion.disable();
        return super.disable();
    }
    get enabled() {
        return this.intances.every(instance => instance.enabled);
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
