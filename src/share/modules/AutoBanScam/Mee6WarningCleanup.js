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
exports.Mee6WarningCleanup = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
/**
 * Supprime au bout d'une minute les embeds de bot « a reçu un avertissement » / « a été averti »
 * / « Command not found ». Ne sanctionne personne.
 */
class Mee6WarningCleanup extends AutoBanScamBase_1.AutoBanScamBase {
    constructor() {
        super(...arguments);
        this.name = "Mee6 Warning Cleanup";
        this.description = "Remove the \"{user} a reçu un avertissement\" bot embeds after 1 min";
    }
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.removeMee6Warning(message); }
        };
    }
    // Mee6 embed with "a reçu un avertissement"
    removeMee6Warning(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.guildId != this.config.guildId) {
                return;
            }
            setTimeout(() => {
                var _a, _b;
                if (message.author.bot && //(message.author.id === AMIRAL_SUPER_TERRE_ID || message.author.id === "491769129318088714"  ) && // this is the stat bot id
                    message.embeds &&
                    ((_b = (_a = message.embeds[0]) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b.name) &&
                    (message.embeds[0].author.name.includes("a été averti") ||
                        message.embeds[0].author.name.includes("a reçu un avertissement") ||
                        message.embeds[0].author.name.includes("Command not found"))) {
                    try {
                        message.deletable && message.delete();
                    }
                    catch (error) {
                    }
                }
            }, simplediscordbot_1.Time.minute.MIN_01.toMilliseconds());
        });
    }
}
exports.Mee6WarningCleanup = Mee6WarningCleanup;
