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
exports.UnmutePersonAtMidnight = void 0;
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const HDFRMember_1 = require("../HDFRMember");
const ExecuteTaskWithCron_1 = require("../../../../../share/modules/ExecuteTaskWithCron");
class UnmutePersonAtMidnight extends ExecuteTaskWithCron_1.ExecuteTaskWithCron {
    get events() {
        return {};
    }
    constructor() {
        //super('0 0 * * *', async () => {await HDFRMember.unMuteAndDeafAllMember(HDFR.guildID)});
        super('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
            yield HDFRMember_1.NewHDFRMember.unMuteAndDeafAllMember(HDFR_1.HDFR.guildID);
        }));
        this.name = "UnmutePersonAtMidnight";
        this.description = "Automatically unmute/undeafen users at midnight";
    }
}
exports.UnmutePersonAtMidnight = UnmutePersonAtMidnight;
