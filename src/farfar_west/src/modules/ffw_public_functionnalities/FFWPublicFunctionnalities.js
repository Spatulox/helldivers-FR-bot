"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWPublicFunctionnalities = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const GalerieFFW_1 = require("./GalerieFFW");
class FFWPublicFunctionnalities extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "FFW Public Functionnalities";
        this.description = "Specifics functionnalitites for the FFW Server";
        this.galerie = new GalerieFFW_1.GalerieFFW();
        this.subModules = [
        //this.galerie
        ];
    }
}
exports.FFWPublicFunctionnalities = FFWPublicFunctionnalities;
