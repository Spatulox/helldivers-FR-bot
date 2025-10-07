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
        this.democraticRoulette = DemocraticRoulette_1.DemocraticRoulette.instance;
        this.stratagemHero = StratagemHero_1.StratagemHero.instance;
        this.intrusion = Intrusion_1.Intrusion.instance;
        this.intances = [
            this.democraticRoulette,
            this.stratagemHero,
            this.intrusion
        ];
        this.miniGamesList = this.intances.map(instance => instance.name);
        this.enable();
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
        var _a, _b, _c, _d;
        if (!this.enabled)
            return;
        (_b = (_a = this.intrusion).handleMessage) === null || _b === void 0 ? void 0 : _b.call(_a, message);
        (_d = (_c = this.stratagemHero).handleMessage) === null || _d === void 0 ? void 0 : _d.call(_c, message);
    }
}
exports.MiniGames = MiniGames;
