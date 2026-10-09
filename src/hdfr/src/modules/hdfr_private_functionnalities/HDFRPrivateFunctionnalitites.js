"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPrivateFunctionnalitites = void 0;
const HDFRMember_1 = require("./HDFRMember");
const HDFRServerTag_1 = require("./HDFRServerTag");
const MoneyManager_1 = require("./MoneyManager");
const AutoBanScamHDFR_1 = require("./AutoBanScam/AutoBanScamHDFR");
const discord_module_1 = require("@spatulox/discord-module");
const VoiceChannel_1 = require("./VoiceChannel/VoiceChannel");
const HDFRAlertMessageDelete_1 = require("./HDFRAlertMessageDelete");
class HDFRPrivateFunctionnalitites extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "HDFR Private Functionnalities";
        this.description = "Specifics functionnalitites for the HDFR Server";
        this.serverTag = new HDFRServerTag_1.HDFRServerTag();
        this.member = new HDFRMember_1.NewHDFRMember();
        this.moneyManager = new MoneyManager_1.MoneyManager();
        this.autoBanScam = new AutoBanScamHDFR_1.AutoBanScamHDFR();
        this.alertMessageDelete = new HDFRAlertMessageDelete_1.HDFRAlertMessageDelete();
        this.voiceChannels = new VoiceChannel_1.VoiceChannel();
        this.subModules = [
            this.autoBanScam,
            this.voiceChannels,
            this.member,
            this.serverTag,
            this.moneyManager,
            this.alertMessageDelete,
        ];
    }
}
exports.HDFRPrivateFunctionnalitites = HDFRPrivateFunctionnalitites;
