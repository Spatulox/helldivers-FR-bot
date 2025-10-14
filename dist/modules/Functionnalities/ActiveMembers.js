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
exports.ActiveMember = void 0;
const Modules_1 = require("../../utils/other/Modules");
const UnitTime_1 = require("../../utils/times/UnitTime");
const constantes_1 = require("../../utils/constantes");
class ActiveMember extends Modules_1.Module {
    constructor() {
        super("ActiveMembers", "Module to track active members on the server.");
        this.cleanInterval = null;
        this.forbiddenChannelId = ["1213981643447205999", "1304584943065890846"]; // chill-tryhard / farm-debutant
        this.MIN_WINDOW = UnitTime_1.Time.minute.MIN_01.toMilliseconds();
        this.MAX_WINDOW = UnitTime_1.Time.minute.MIN_10.toMilliseconds();
        this.RESTART_COOLDOWN = UnitTime_1.Time.second.SEC_05.toMilliseconds();
        this.ACTUAL_WINDOW = this.MAX_WINDOW;
        this.lastRestart = 0;
        this.startCleaning();
    }
    static get activeMembers() {
        return ActiveMember._activeMembers;
    }
    // Function to adjust the interval based on the number of active members
    f(x) {
        const k = 0.1;
        return (1 + 9 * Math.exp(-k * x) * 60 * 1000);
    }
    // Calcule l'intervalle en fonction du nombre d'éléments, with a min and max
    computeInterval() {
        const base = Math.max(this.MIN_WINDOW, this.f(ActiveMember._activeMembers.size));
        return Math.min(this.MAX_WINDOW, base);
    }
    startCleaning() {
        return __awaiter(this, arguments, void 0, function* (force = false) {
            if (ActiveMember._activeMembers.size === 0 && !force) {
                if (this.cleanInterval) {
                    clearInterval(this.cleanInterval);
                    this.cleanInterval = null;
                }
                return;
            }
            const now = Date.now();
            if (!force && now - this.lastRestart < this.RESTART_COOLDOWN)
                return;
            const newInterval = this.computeInterval();
            // Redémarrer que si la nouvelle durée diffère significativement (15s ici)
            if (this.ACTUAL_WINDOW && Math.abs(this.ACTUAL_WINDOW - newInterval) < 15000 && this.cleanInterval) {
                return;
            }
            this.lastRestart = now;
            if (this.cleanInterval) {
                clearInterval(this.cleanInterval);
            }
            this.ACTUAL_WINDOW = newInterval;
            // Crée un intervalle qui déclenche cleanMembers à la fin de la durée
            this.cleanInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield this.cleanMembers();
                yield this.startCleaning();
            }), this.ACTUAL_WINDOW);
        });
    }
    cleanMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            //const beforeCount = this._activeMembers.size;
            let removedCount = 0;
            for (const [memberId, lastMessageDate] of ActiveMember._activeMembers) {
                if (now - lastMessageDate.getTime() > this.ACTUAL_WINDOW) {
                    ActiveMember._activeMembers.delete(memberId);
                    removedCount++;
                }
            }
            return removedCount;
        });
    }
    handleMessage(message) {
        if (message.guildId != constantes_1.TARGET_GUILD_ID || this.forbiddenChannelId.includes(message.channelId))
            return;
        if (message.author.bot)
            return;
        const memberKey = message.author.id;
        // Si le membre n'était pas actif avant, on l'ajoute et on envoie un message
        ActiveMember._activeMembers.set(memberKey, new Date());
        this.startCleaning();
    }
    getActiveMembers() {
        return new Map(ActiveMember._activeMembers);
    }
    isActive(memberId) {
        return ActiveMember._activeMembers.has(memberId);
    }
    activeCount() {
        return ActiveMember._activeMembers.size;
    }
}
exports.ActiveMember = ActiveMember;
ActiveMember._activeMembers = new Map();
