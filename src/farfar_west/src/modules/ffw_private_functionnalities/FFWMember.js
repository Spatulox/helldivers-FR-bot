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
exports.FFWMember = void 0;
const FFW_1 = require("../../utils/ffw_list/FFW");
const BotGuildMember_1 = require("../../../../share/modules/BotGuildMember");
const FFWServerTag_1 = require("./FFWServerTag");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class FFWMember extends BotGuildMember_1.BotGuildMember {
    get roleRegex() {
        return /^\[P\.(\d{2}|\?\?)\]$/;
    }
    get unauthorizedClanTag() {
        return (member) => __awaiter(this, void 0, void 0, function* () { return yield new FFWServerTag_1.FFWServerTag().userIsInUnauthorizedClan(member); });
    }
    get defaultRoleIfNoMatchingRole() {
        return simplediscordbot_1.BotEnv ? "1505934312116326400" : "1504951527779995840";
    }
    get alertChannel() {
        return FFW_1.FFW.channel.alert;
    }
    findPriorityRole(roles) {
        let bestRole;
        let bestPriority = -2;
        for (const role of roles.values()) {
            const match = role.name.match(this.roleRegex);
            if (!match)
                continue;
            const value = match[1] === "??" ? -1 : Number(match[1]);
            if (value > bestPriority) {
                bestPriority = value;
                bestRole = role;
            }
        }
        return bestRole;
    }
    constructor() {
        super();
        this.guildID = FFW_1.FFW.guildID;
        //throw new Error("Need to implement the FFW Member 'checkAndUpdateMember' :/")
    }
}
exports.FFWMember = FFWMember;
