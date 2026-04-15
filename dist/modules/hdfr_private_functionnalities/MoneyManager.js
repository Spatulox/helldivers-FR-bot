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
exports.MoneyManager = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../../utils/HDFR");
class MoneyManager extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Money Manager";
        this.description = "Manage the economy system for the mini games (WIP)";
    }
    /**
     * This function is temp, while waiting for a BDD implementation
     * @param guildID
     * @param userID
     * @param roleID
     * @returns
     */
    addRole(guildID, userID, roleID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return false;
            }
            if (guildID != HDFR_1.HDFRChannelID.guildID) {
                return false;
            }
            try {
                const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(guildID);
                if (!guild) {
                    simplediscordbot_1.Log.warn(`Guild ${guildID} not found`);
                    return false;
                }
                const member = yield guild.members.fetch(userID);
                if (!member) {
                    simplediscordbot_1.Log.warn(`Member ${userID} not found in guild ${guildID}`);
                    return false;
                }
                yield member.roles.add(roleID);
                simplediscordbot_1.Log.debug(`Role ${roleID} added to user ${userID} in guild ${guildID}`);
                return true;
            }
            catch (error) {
                simplediscordbot_1.Log.error(`Error adding role: ${roleID} to <@${userID}> ${error}`);
                return false;
            }
        });
    }
}
exports.MoneyManager = MoneyManager;
/**
 * This is useless rn
 */
MoneyManager.amount = {
    stratagem_hero: {
        winner: "0",
        looser: "0"
    },
    senateur: {
        "0+": "+0",
        "0-": "-2184",
        "1+": "+1",
        "1-": "-5",
        "2+": "+3",
        "2-": "-6",
        "3+": "+8",
        "3-": "-8",
        "4+": "+20",
        "4-": "-10",
        "5+": "+45",
        "5-": "-9",
        "6+": "+546",
        "6-": "-2184",
    }
};
