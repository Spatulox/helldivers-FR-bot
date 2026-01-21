"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRFunctionnalitites = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const Counter_1 = require("./Counter");
const VoiceChannelDescription_1 = require("./VoiceChannelDescription");
const Galerie_1 = require("./Galerie");
const Member_1 = require("./Member");
const ScheduleJobs_1 = require("./ScheduleJobs");
const ServerTag_1 = require("./ServerTag");
const MoneyManager_1 = require("./MoneyManager");
const TaGueuleMee6_1 = require("./TaGueuleMee6");
class HDFRFunctionnalitites extends Modules_1.MultiModule {
    constructor() {
        super("HDFR Functionnalities", "Specifics functionnalitites for the HDFR Server");
        this.galerie = new Galerie_1.Galerie();
        this.serverTag = new ServerTag_1.ServerTag();
        this.voiceChannelDescription = new VoiceChannelDescription_1.VoiceChannelDescription();
        this.counter = new Counter_1.Counter();
        this.member = new Member_1.Member();
        this.schedulejobs = new ScheduleJobs_1.ScheduleJobs();
        this.moneyManager = new MoneyManager_1.MoneyManager();
        this.taGueuleMee6 = new TaGueuleMee6_1.TaGueuleMee6();
        this._subModuleList = [
            this.counter,
            this.galerie,
            this.member,
            this.serverTag,
            this.voiceChannelDescription,
            this.schedulejobs,
            this.moneyManager,
            this.taGueuleMee6
        ];
        this.hdfrFuncList = this._subModuleList.map(instance => instance.name);
    }
    handleMessage(message) {
        this.galerie.handleMessage(message);
        this.counter.handleMessage(message);
        this.taGueuleMee6.handleMessage(message);
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
    handleGuildMemberAdd(member) {
        this.serverTag.handleGuildMemberAdd(member);
        this.member.handleGuildMemberAdd(member);
    }
    handleGuildMemberUpdate(oldMember, newMember) {
        this.serverTag.handleGuildMemberUpdate(newMember);
        this.member.handleGuildMemberUpdate(oldMember, newMember);
    }
}
exports.HDFRFunctionnalitites = HDFRFunctionnalitites;
