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
const client_1 = require("../../../utils/client");
const constantes_1 = require("../../../utils/constantes");
const log_1 = require("../../../utils/other/log");
const Modules_1 = require("../../../utils/other/Modules");
class MoneyManager extends Modules_1.Module {
    constructor() {
        if (MoneyManager._instance) {
            return MoneyManager._instance;
        }
        super("Money Manager", "Manage the economy system for the mini games");
        MoneyManager._instance = this;
    }
    static get instance() {
        return MoneyManager._instance;
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
            if (guildID != constantes_1.TARGET_GUILD_ID) {
                return false;
            }
            try {
                const guild = yield client_1.client.guilds.fetch(guildID);
                if (!guild) {
                    (0, log_1.log)(`Guild ${guildID} not found`);
                    return false;
                }
                const member = yield guild.members.fetch(userID);
                if (!member) {
                    (0, log_1.log)(`Member ${userID} not found in guild ${guildID}`);
                    return false;
                }
                yield member.roles.add(roleID);
                (0, log_1.log)(`Role ${roleID} added to user ${userID} in guild ${guildID}`);
                return true;
            }
            catch (error) {
                (0, log_1.log)(`Error adding role: ${roleID} to <@${userID}> ${error}`);
                return false;
            }
        });
    }
}
exports.MoneyManager = MoneyManager;
MoneyManager._instance = null;
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
