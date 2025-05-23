"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGuildErrorLimiter = setGuildErrorLimiter;
exports.setOrUpdateRateLimiter = setOrUpdateRateLimiter;
exports.getRateLimiter = getRateLimiter;
const members_1 = require("../guilds/members");
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
function setOrUpdateRateLimiter(rateLimiter, thing) {
    return initRateLimiter(rateLimiter, thing);
}
function getRateLimiter(rateLimiter, thing) {
    return initRateLimiter(rateLimiter, thing);
}
