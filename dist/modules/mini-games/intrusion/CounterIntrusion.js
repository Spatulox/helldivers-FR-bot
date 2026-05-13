"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterIntrusion = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
class CounterIntrusion extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "Automaton Intrusion Counter";
        this.description = `Intrusion Automaton in the <#${HDFR_1.HDFR.channel.compteur}>`;
    }
    get events() {
        return {};
    }
}
exports.CounterIntrusion = CounterIntrusion;
