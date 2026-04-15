"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRPrivateFunctionnalitites = void 0;
const Member_1 = require("./Member");
const ScheduleJobs_1 = require("./ScheduleJobs/ScheduleJobs");
const ServerTag_1 = require("./ServerTag");
const MoneyManager_1 = require("./MoneyManager");
const AutoBanScam_1 = require("./AutoBanScam");
const AlertMessageDelete_1 = require("./AlertMessageDelete");
const discord_module_1 = require("@spatulox/discord-module");
class HDFRPrivateFunctionnalitites extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "HDFR Private Functionnalities";
        this.description = "Specifics functionnalitites for the HDFR Server";
        this.serverTag = new ServerTag_1.ServerTag();
        this.member = new Member_1.Member();
        this.schedulejobs = new ScheduleJobs_1.ScheduleJobs();
        this.moneyManager = new MoneyManager_1.MoneyManager();
        this.taGueuleMee6 = new AutoBanScam_1.AutoBanScam();
        this.alertMessageDelete = new AlertMessageDelete_1.AlertMessageDelete();
        this.subModules = [
            this.member,
            this.serverTag,
            //this.schedulejobs,
            //this.moneyManager,
            this.taGueuleMee6,
            this.alertMessageDelete
        ];
    }
}
exports.HDFRPrivateFunctionnalitites = HDFRPrivateFunctionnalitites;
