"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntrusionSubModule = void 0;
const discord_module_1 = require("@spatulox/discord-module");
/**
 * Sous-module d'Intrusion : le désactiver arrête aussi l'intrusion qu'il gère si elle est en cours.
 * ModuleUI passe par toggle() et MultiModule/ModuleManager par disable() : il faut les deux.
 */
class IntrusionSubModule extends discord_module_1.Module {
    toggle() {
        super.toggle();
        if (!this.enabled) {
            void this.stopRunningIntrusion();
        }
    }
    disable() {
        super.disable();
        void this.stopRunningIntrusion();
    }
}
exports.IntrusionSubModule = IntrusionSubModule;
