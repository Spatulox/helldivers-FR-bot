"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalIntrusion = void 0;
const IntrusionSubModule_1 = require("./IntrusionSubModule");
const Intrusion_1 = require("./Intrusion");
class GlobalIntrusion extends IntrusionSubModule_1.IntrusionSubModule {
    constructor() {
        super(...arguments);
        this.name = "Automaton Intrusion Global";
        this.description = `Intrusion Automaton in the Discord`;
    }
    get events() {
        return {};
    }
    stopRunningIntrusion() {
        return Intrusion_1.Intrusion.stopGlobalIntrusion();
    }
}
exports.GlobalIntrusion = GlobalIntrusion;
