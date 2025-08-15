"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveMember = void 0;
const Modules_1 = require("../../utils/other/Modules");
//import { Time } from "../../utils/times/UnitTime";
class ActiveMember extends Modules_1.Module {
    constructor() {
        super("ActiveMembers", "Module to track active members on the server.");
        this.activeMembers = new Map();
        this.cleanInterval = null;
        this.MIN_WINDOW = 5 * 60 * 1000; // 5 min 2
        this.MAX_WINDOW = 60 * 60 * 1000; // 1h 60
        this.RESTART_COOLDOWN = 5 * 1000; // 1 minute 60
        this.lastRestart = 0;
        this.startCleaning();
        //this.show()
    }
    /*private show(){
        setTimeout(() => {
            console.log(this.activeMembers)
        }, Time.second.SEC_05.toMilliseconds())
    }*/
    // Calcule l'intervalle en fonction du nombre d'éléments
    computeInterval() {
        const base = Math.max(this.MIN_WINDOW, this.MAX_WINDOW / Math.floor(Math.sqrt(this.activeMembers.size * 2 || 1)));
        //console.log(this.MAX_WINDOW, base)
        return Math.min(this.MAX_WINDOW, base);
    }
    startCleaning(force = false) {
        const now = Date.now();
        if (!force && now - this.lastRestart < this.RESTART_COOLDOWN)
            return;
        this.lastRestart = now;
        if (this.cleanInterval)
            clearInterval(this.cleanInterval);
        const interval = this.computeInterval();
        this.cleanInterval = setInterval(() => {
            this.cleanMembers();
            // On redémarre l’intervalle si la taille change
            this.startCleaning();
        }, interval);
    }
    cleanMembers() {
        const now = Date.now();
        for (const [memberId, lastMessageDate] of this.activeMembers) {
            if (now - lastMessageDate.getTime() > this.MAX_WINDOW) {
                this.activeMembers.delete(memberId);
            }
        }
    }
    handleMessage(message) {
        if (message.author.bot)
            return;
        for (let index = 0; index < 5; index++) {
            this.activeMembers.set(message.author.id + index, new Date());
        }
        this.startCleaning();
    }
    getActiveMembers() {
        return new Map(this.activeMembers);
    }
    isActive(memberId) {
        return this.activeMembers.has(memberId);
    }
    activeCount() {
        return this.activeMembers.size;
    }
}
exports.ActiveMember = ActiveMember;
