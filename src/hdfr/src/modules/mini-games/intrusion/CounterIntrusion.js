"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterIntrusion = void 0;
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const IntrusionSubModule_1 = require("./IntrusionSubModule");
const Intrusion_1 = require("./Intrusion");
class CounterIntrusion extends IntrusionSubModule_1.IntrusionSubModule {
    constructor() {
        super(...arguments);
        this.name = "Automaton Intrusion Counter";
        this.description = `Intrusion Automaton in the <#${HDFR_1.HDFR.channel.compteur}>`;
    }
    get events() {
        return {};
    }
    stopRunningIntrusion() {
        return Intrusion_1.Intrusion.stopCounterIntrusion();
    }
}
exports.CounterIntrusion = CounterIntrusion;
