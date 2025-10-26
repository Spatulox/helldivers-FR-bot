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
        this._subModuleList = [
            this.counter,
            this.galerie,
            this.member,
            this.serverTag,
            this.voiceChannelDescription,
            this.schedulejobs,
            this.moneyManager
        ];
        this.hdfrFuncList = this._subModuleList.map(instance => instance.name);
    }
    handleAny(data) {
        this.serverTag.handleAny(data);
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
    handleGuildMemberAdd(member) {
        this.member.handleGuildMemberAdd(member);
    }
    handleGuildMemberUpdate(oldMember, newMember) {
        this.member.handleGuildMemberUpdate(oldMember, newMember);
    }
}
exports.HDFRFunctionnalitites = HDFRFunctionnalitites;
