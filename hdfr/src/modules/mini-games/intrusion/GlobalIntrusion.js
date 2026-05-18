"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalIntrusion = void 0;
const discord_module_1 = require("@spatulox/discord-module");
class GlobalIntrusion extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "Automaton Intrusion Global";
        this.description = `Intrusion Automaton in the Discord`;
    }
    get events() {
        return {};
    }
}
exports.GlobalIntrusion = GlobalIntrusion;
