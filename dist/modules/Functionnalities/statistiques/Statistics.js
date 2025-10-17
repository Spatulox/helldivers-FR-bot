"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const ActiveMembers_1 = require("./ActiveMembers");
//import { AverageMessage } from "./AverageMessage";
class Statistics extends Modules_1.MultiModule {
    //public readonly averageMessage = new AverageMessage()
    constructor() {
        super("Statistics", "Module to handle different Statistics");
        this.activeMember = new ActiveMembers_1.ActiveMember();
        this._subModuleList = [
            this.activeMember,
            //this.averageMessage
        ];
    }
    handleMessage(message) {
        this.activeMember.handleMessage(message);
        //this.averageMessage.handleMessage(message)
    }
}
exports.Statistics = Statistics;
