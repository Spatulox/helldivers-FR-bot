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
exports.ScheduleJobs = void 0;
const OldInvites_1 = require("../../../../share/modules/OldInvites");
const CleanNicknameEmoji_1 = require("../../../../share/modules/CleanNicknameEmoji");
const discord_module_1 = require("@spatulox/discord-module");
const FFW_1 = require("../../utils/ffw_list/FFW");
const FFWUpdateAllMembers_1 = require("./FFWUpdateAllMembers");
class ScheduleJobs extends discord_module_1.MultiModule {
    constructor() {
        super();
        this.name = "ScheduleJobs";
        this.description = "This Module manage all the schedule Jobs";
        this.updateMembers = new FFWUpdateAllMembers_1.FFWUpdateAllMembers();
        this.deleteInvites = new OldInvites_1.OldInvites(FFW_1.FFW.guildID);
        this.cleanEmoji = new CleanNicknameEmoji_1.CleanNicknameEmoji(FFW_1.FFW.guildID);
        this.subModules = [
            this.updateMembers,
            this.deleteInvites,
            this.cleanEmoji,
        ];
        this.start();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateMembers.start();
            yield this.deleteInvites.start();
            yield this.cleanEmoji.start();
        });
    }
}
exports.ScheduleJobs = ScheduleJobs;
