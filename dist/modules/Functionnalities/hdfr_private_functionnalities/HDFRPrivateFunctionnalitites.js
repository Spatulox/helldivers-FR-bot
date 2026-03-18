"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPrivateFunctionnalitites = void 0;
const Modules_1 = require("../../Modules");
const Member_1 = require("./Member");
const ScheduleJobs_1 = require("./ScheduleJobs/ScheduleJobs");
const ServerTag_1 = require("./ServerTag");
const MoneyManager_1 = require("./MoneyManager");
const AutoBanScam_1 = require("./AutoBanScam");
const AlertMessageDelete_1 = require("./AlertMessageDelete");
class HDFRPrivateFunctionnalitites extends Modules_1.MultiModule {
    constructor() {
        super("HDFR Private Functionnalities", "Specifics functionnalitites for the HDFR Server");
        this.serverTag = new ServerTag_1.ServerTag();
        this.member = new Member_1.Member();
        this.schedulejobs = new ScheduleJobs_1.ScheduleJobs();
        this.moneyManager = new MoneyManager_1.MoneyManager();
        this.taGueuleMee6 = new AutoBanScam_1.AutoBanScam();
        this.alertMessageDelete = new AlertMessageDelete_1.AlertMessageDelete();
        this._subModuleList = [
            this.member,
            this.serverTag,
            this.schedulejobs,
            //this.moneyManager,
            this.taGueuleMee6,
            this.alertMessageDelete
        ];
        this.hdfrFuncList = this._subModuleList.map(instance => instance.name);
        this.schedulejobs.start();
    }
    handleMessage(message) {
        this.taGueuleMee6.handleMessage(message);
    }
    handleMessageDelete(message) {
        this.alertMessageDelete.handleMessageDelete(message);
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
exports.HDFRPrivateFunctionnalitites = HDFRPrivateFunctionnalitites;
