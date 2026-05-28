"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWUpdateAllMembers = void 0;
const ExecuteTaskWithCron_1 = require("../../../../share/modules/ExecuteTaskWithCron");
const FFWMember_1 = require("../ffw_private_functionnalities/FFWMember");
/*
import {ModuleEventsMap} from "@spatulox/discord-module";
import {Events, Message} from "discord.js";
import {GuildManager} from "@spatulox/simplediscordbot";
import {FFW} from "../../utils/ffw_list/FFW";
import {MemberManager} from "../../../../share/managers/MemberManager";
*/
class FFWUpdateAllMembers extends ExecuteTaskWithCron_1.ExecuteTaskWithCron {
    /*get events(): ModuleEventsMap {
        return {
            [Events.MessageCreate] : this.handleMessage.bind(this),
        }
    }*/
    /*private async handleMessage(message: Message) {
        if(message.content == "update-all"){
            await this.member.checkAndUpdateMembers()
        }

        if(message.content == "update-all-reset"){
            await this.reset()
        }
    }*/
    constructor() {
        super('0 */2 * * *', () => __awaiter(this, void 0, void 0, function* () { yield this.member.checkAndUpdateMembers(); }));
        this.name = "UpdateAllMembers";
        this.description = "Automatically update all members every 2 hours";
        this.member = new FFWMember_1.FFWMember();
    }
}
exports.FFWUpdateAllMembers = FFWUpdateAllMembers;
