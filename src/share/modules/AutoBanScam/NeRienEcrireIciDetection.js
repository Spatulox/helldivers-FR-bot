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
exports.NeRienEcrireIciDetection = void 0;
const discord_js_1 = require("discord.js");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
/**
 * Salons pièges « ne rien écrire ici » (`config.neRienEcrireIciChannels`) : tout message d'un membre
 * déclenche la sanction, avec copie dans #alert.
 */
class NeRienEcrireIciDetection extends AutoBanScamBase_1.AutoBanScamBase {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam NeRienEcrireIci";
        this.description = "Automatically ban person who send message in <#1437904268467376268>";
    }
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.neRienEcrireIci(message); }
        };
    }
    neRienEcrireIci(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.guildId != this.config.guildId || !this.isNeRienEcrireIciChannel(message.channelId)) {
                return;
            }
            // Message by a user
            if (message.author.bot) {
                return;
            }
            yield this.sanctionScam(message, true);
        });
    }
}
exports.NeRienEcrireIciDetection = NeRienEcrireIciDetection;
