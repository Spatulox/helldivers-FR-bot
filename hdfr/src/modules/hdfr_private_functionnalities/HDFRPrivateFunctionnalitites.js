"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPrivateFunctionnalitites = void 0;
const HDFRMember_1 = require("./HDFRMember");
const ScheduleJobs_1 = require("./ScheduleJobs/ScheduleJobs");
const HDFRServerTag_1 = require("./HDFRServerTag");
const MoneyManager_1 = require("./MoneyManager");
const AutoBanScamHDFR_1 = require("./AutoBanScamHDFR");
const discord_module_1 = require("@spatulox/discord-module");
const VoiceChannel_1 = require("./VoiceChannel/VoiceChannel");
const HDFRAlertMessageDelete_1 = require("./HDFRAlertMessageDelete");
class HDFRPrivateFunctionnalitites extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "HDFR Private Functionnalities";
        this.description = "Specifics functionnalitites for the HDFR Server";
        this.serverTag = new HDFRServerTag_1.HDFRServerTag();
        this.member = new HDFRMember_1.HDFRMember();
        this.schedulejobs = new ScheduleJobs_1.ScheduleJobs();
        this.moneyManager = new MoneyManager_1.MoneyManager();
        this.taGueuleMee6 = new AutoBanScamHDFR_1.AutoBanScamHDFR();
        this.alertMessageDelete = new HDFRAlertMessageDelete_1.HDFRAlertMessageDelete();
        this.voiceChannels = new VoiceChannel_1.VoiceChannel();
        this.subModules = [
            this.voiceChannels,
            this.member,
            this.serverTag,
            //this.schedulejobs,
            //this.moneyManager,
            this.taGueuleMee6,
            this.alertMessageDelete,
        ];
    }
}
exports.HDFRPrivateFunctionnalitites = HDFRPrivateFunctionnalitites;
