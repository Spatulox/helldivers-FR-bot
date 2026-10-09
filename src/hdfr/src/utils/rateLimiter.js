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
exports.SlidingWindowLimiter = void 0;
exports.setGuildErrorLimiter = setGuildErrorLimiter;
exports.isUserRateLimited = isUserRateLimited;
exports.setOrUpdateRateLimiter = setOrUpdateRateLimiter;
exports.getRateLimiter = getRateLimiter;
exports.isQuotaExempt = isQuotaExempt;
const discord_js_1 = require("discord.js");
const GlobalMemberManager_1 = require("../../../share/managers/GlobalMemberManager");
function initRateLimiter(rateLimiter, thing) {
    if (rateLimiter.take(thing)) {
        return true;
    }
    return false;
}
/*export function isUserRateLimited(rateLimiter: RateLimiter, key: string){
    if(key){
        return rateLimiter.take(key)
    }
    return false
}*/
function setGuildErrorLimiter(member, rateLimiter) {
    if (member && !GlobalMemberManager_1.GlobalMemberManager.HDFR.isStaff(member)) {
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
/**
 * Quota en fenêtre glissante, en mémoire : `max` actions par utilisateur sur `windowMs`.
 *
 * Contrairement au RateLimiter de discord.js-rate-limiter, la vérification et le décompte sont
 * séparés : un formulaire se vérifie à l'ouverture (`blockedUntil`) mais ne se décompte qu'à l'envoi
 * (`consume`), pour qu'un formulaire ouvert puis annulé ne coûte rien. L'état n'a pas à survivre à
 * un redémarrage : la fenêtre est courte.
 */
class SlidingWindowLimiter {
    constructor(max, windowMs) {
        this.max = max;
        this.windowMs = windowMs;
        /** userId → horodatages des actions retenues, du plus ancien au plus récent */
        this.history = new Map();
    }
    /** Horodatages encore dans la fenêtre ; purge au passage les entrées périmées */
    active(userId, now) {
        var _a;
        const timestamps = ((_a = this.history.get(userId)) !== null && _a !== void 0 ? _a : []).filter(t => now - t < this.windowMs);
        if (timestamps.length === 0) {
            this.history.delete(userId);
        }
        else {
            this.history.set(userId, timestamps);
        }
        return timestamps;
    }
    /** Date à laquelle une action se libère, ou `null` si l'utilisateur peut agir tout de suite */
    blockedUntil(userId) {
        const timestamps = this.active(userId, Date.now());
        const oldest = timestamps[0];
        return timestamps.length >= this.max && oldest !== undefined ? oldest + this.windowMs : null;
    }
    /** Décompte une action. @returns false, sans rien décompter, si le quota est déjà atteint */
    consume(userId) {
        const now = Date.now();
        const timestamps = this.active(userId, now);
        if (timestamps.length >= this.max) {
            return false;
        }
        timestamps.push(now);
        this.history.set(userId, timestamps);
        return true;
    }
}
exports.SlidingWindowLimiter = SlidingWindowLimiter;
/** Les modérateurs et techniciens ne sont pas soumis aux quotas des formulaires */
function isQuotaExempt(member) {
    return member != null && (GlobalMemberManager_1.GlobalMemberManager.HDFR.isModerator(member) || GlobalMemberManager_1.GlobalMemberManager.HDFR.isTechnician(member));
}
