"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPublicFunctionnalitites = void 0;
const Counter_1 = require("./Counter");
const VoiceChannelDescription_1 = require("./VoiceChannelDescription");
const Galerie_1 = require("./Galerie");
const discord_module_1 = require("@spatulox/discord-module");
class HDFRPublicFunctionnalitites extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "HDFR Public Functionnalities";
        this.description = "Specifics functionnalitites for the HDFR Server";
        this.galerie = new Galerie_1.Galerie();
        this.voiceChannelDescription = new VoiceChannelDescription_1.VoiceChannelDescription();
        this.counter = new Counter_1.Counter();
        this.subModules = [
            this.counter,
            this.galerie,
            this.voiceChannelDescription
        ];
    }
}
exports.HDFRPublicFunctionnalitites = HDFRPublicFunctionnalitites;
