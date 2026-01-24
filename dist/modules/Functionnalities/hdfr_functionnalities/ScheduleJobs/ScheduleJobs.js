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
const Modules_1 = require("../../../../utils/other/Modules");
const UnmutePersonAtMidnight_1 = require("./UnmutePersonAtMidnight");
const UpdateAllMembers_1 = require("./UpdateAllMembers");
const OldInvites_1 = require("./OldInvites");
const CleanNicknameEmoji_1 = require("./CleanNicknameEmoji");
class ScheduleJobs extends Modules_1.MultiModule {
    constructor() {
        super("ScheduleJobs", "This Module manage all the schedule Jobs");
        this.unmutePerson = new UnmutePersonAtMidnight_1.UnmutePersonAtMidnight();
        this.updateMembers = new UpdateAllMembers_1.UpdateAllMembers();
        this.deleteInvites = new OldInvites_1.OldInvites();
        this.cleanEmoji = new CleanNicknameEmoji_1.CleanNicknameEmoji();
        this._subModuleList = [
            this.unmutePerson,
            this.updateMembers,
            this.deleteInvites,
            this.cleanEmoji,
        ];
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unmutePerson.start();
            yield this.updateMembers.start();
            yield this.deleteInvites.start();
            yield this.cleanEmoji.start();
        });
    }
}
exports.ScheduleJobs = ScheduleJobs;
