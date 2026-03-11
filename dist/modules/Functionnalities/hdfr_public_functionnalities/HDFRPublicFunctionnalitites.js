"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPublicFunctionnalitites = void 0;
const Modules_1 = require("../../Modules");
const Counter_1 = require("./Counter");
const VoiceChannelDescription_1 = require("./VoiceChannelDescription");
const Galerie_1 = require("./Galerie");
class HDFRPublicFunctionnalitites extends Modules_1.MultiModule {
    constructor() {
        super("HDFR Public Functionnalities", "Specifics functionnalitites for the HDFR Server");
        this.galerie = new Galerie_1.Galerie();
        this.voiceChannelDescription = new VoiceChannelDescription_1.VoiceChannelDescription();
        this.counter = new Counter_1.Counter();
        this._subModuleList = [
            this.counter,
            this.galerie,
            this.voiceChannelDescription,
        ];
        this.hdfrFuncList = this._subModuleList.map(instance => instance.name);
    }
    handleMessage(message) {
        this.galerie.handleMessage(message);
        this.counter.handleMessage(message);
    }
    handleMessageUpdate(oldMessage, newMessage) {
        this.counter.handleMessageUpdate(oldMessage, newMessage);
    }
    handleMessageDelete(message) {
        this.counter.handleMessageDelete(message);
    }
    handleVoiceState(oldState, newState) {
        this.voiceChannelDescription.handleVoiceState(oldState, newState);
    }
}
exports.HDFRPublicFunctionnalitites = HDFRPublicFunctionnalitites;
