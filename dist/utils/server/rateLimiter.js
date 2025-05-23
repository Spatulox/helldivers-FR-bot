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
exports.setGuildErrorLimiter = setGuildErrorLimiter;
exports.isUserRateLimited = isUserRateLimited;
exports.setOrUpdateRateLimiter = setOrUpdateRateLimiter;
exports.getRateLimiter = getRateLimiter;
const members_1 = require("../guilds/members");
const discord_js_1 = require("discord.js");
function initRateLimiter(rateLimiter, thing) {
    if (rateLimiter.take(thing)) {
        return true;
    }
    return false;
}
function setGuildErrorLimiter(member, rateLimiter) {
    if (member && (0, members_1.checkIfApplyMember)(member)) {
        return rateLimiter.take(member.id);
    }
    return false;
}
function isUserRateLimited(interaction, rateLimiter, second) {
    return __awaiter(this, void 0, void 0, function* () {
        const limited = rateLimiter.take(interaction.user.id);
        if (limited) {
            yield interaction.reply({
                content: `Commande utilisée trop fréquemment, attendez ${second} secondes :)`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return true;
        }
        return false;
    });
}
function setOrUpdateRateLimiter(rateLimiter, thing) {
    return initRateLimiter(rateLimiter, thing);
}
function getRateLimiter(rateLimiter, thing) {
    return initRateLimiter(rateLimiter, thing);
}
