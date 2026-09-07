"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPublicFunctionnalitites = void 0;
const Counter_1 = require("./Counter");
const VoiceChannelDescription_1 = require("./VoiceChannelDescription");
const GalerieHDFR_1 = require("./GalerieHDFR");
const WikiReport_1 = require("./WikiReport");
const discord_module_1 = require("@spatulox/discord-module");
class HDFRPublicFunctionnalitites extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "HDFR Public Functionnalities";
        this.description = "Specifics functionnalitites for the HDFR Server";
        this.galerie = new GalerieHDFR_1.GalerieHDFR();
        this.voiceChannelDescription = new VoiceChannelDescription_1.VoiceChannelDescription();
        this.counter = new Counter_1.Counter();
        this.wikiReport = new WikiReport_1.WikiReport();
        this.subModules = [
            this.counter,
            this.galerie,
            this.voiceChannelDescription,
            this.wikiReport
        ];
    }
}
exports.HDFRPublicFunctionnalitites = HDFRPublicFunctionnalitites;
