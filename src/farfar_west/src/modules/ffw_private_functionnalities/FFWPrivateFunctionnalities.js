"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWPrivateFunctionnalities = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const AutoBanScamFFW_1 = require("./AutoBanScamFFW");
const FFWMember_1 = require("./FFWMember");
const FFWAlertMessageDelete_1 = require("./FFWAlertMessageDelete");
const VoiceChannel_1 = require("./VoiceChannel/VoiceChannel");
const FFWServerTag_1 = require("./FFWServerTag");
class FFWPrivateFunctionnalities extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "FFW Private Functionnalities";
        this.description = "Specifics functionnalitites for the FFW Server";
        this.autoBanScam = new AutoBanScamFFW_1.AutoBanScamFFW();
        this.alertMessageDelete = new FFWAlertMessageDelete_1.FFWAlertMessageDelete();
        this.member = new FFWMember_1.FFWMember();
        this.voiceChannel = new VoiceChannel_1.VoiceChannel();
        this.serverTag = new FFWServerTag_1.FFWServerTag();
        this.subModules = [
            //this.autoBanScam,
            //this.alertMessageDelete,
            this.member,
            //this.serverTag,
            //this.voiceChannel
        ];
    }
}
exports.FFWPrivateFunctionnalities = FFWPrivateFunctionnalities;
