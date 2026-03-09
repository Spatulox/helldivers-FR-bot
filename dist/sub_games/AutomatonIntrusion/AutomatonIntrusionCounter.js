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
exports.AutomatonIntrusionCounter = void 0;
const HDFR_1 = require("../../utils/HDFR");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutomatonIntrusion_1 = require("./AutomatonIntrusion");
class AutomatonIntrusionCounter extends AutomatonIntrusion_1.AutomatonIntrusion {
    static get CURRENT_PROBA() {
        return simplediscordbot_1.Time.DAY ? this.PROBA_DAY : this.PROBA_NIGHT;
    }
    constructor(targetChannel, callbacks = {}) {
        super(targetChannel, callbacks);
        this.decrementTimer = null;
        this.isDecrementing = false;
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.isHacked)
                return false;
            if (message.author.bot)
                return false;
            const isStratagemInput = isNaN(parseInt(message.content, 10));
            if (!isStratagemInput) {
                yield this.handleCounterMessage(message);
                return true;
            }
            if (message.channelId !== ((_a = this._thread) === null || _a === void 0 ? void 0 : _a.id)) {
                yield this.redirectToThread(message);
                return false;
            }
            return yield this.handleStratagemInput(message, false, true);
        });
    }
    getGameRules() {
        return `- Le ${this._choosenMember} décompte tant qu'il n'a pas été annihilé\n` +
            "- Une flèche à la fois\n- Dans ce fil uniquement\n" +
            "- :warning: Le code peut se réinitialiser !";
    }
    triggerBreach(message, count) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if ((yield AutomatonIntrusion_1.AutomatonIntrusion.mutex.locked) || !count)
                return false;
            try {
                this.initializeHack();
                this.triggeredMessage = message;
                yield this.createGameThread(HDFR_1.HDFRChannelID.compteur, message);
                yield this.notifyIntrusion(message, this.thread.url);
                (_b = (_a = this.callbacks).onHackStart) === null || _b === void 0 ? void 0 : _b.call(_a, this._choosenStratagem, this.choosenStratagemCode, (_d = (_c = message.member) === null || _c === void 0 ? void 0 : _c.nickname) !== null && _d !== void 0 ? _d : message.author.displayName);
                this.startDecrementTimer(count);
                return count;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
                this.resetHack();
                return count || 0;
            }
        });
    }
    startDecrementTimer(count) {
        this.isDecrementing = true;
        if (this.decrementTimer)
            clearInterval(this.decrementTimer);
        this.decrementTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (!this.isHacked)
                return this.stopDecrement();
            count = Math.max(0, count - 1);
            yield this.sendWebhook(count.toString(), HDFR_1.HDFRChannelID.compteur);
        }), simplediscordbot_1.Time.DAY ? simplediscordbot_1.Time.minute.MIN_05.toMilliseconds() : simplediscordbot_1.Time.minute.MIN_10.toMilliseconds());
    }
    endHack(success) {
        const _super = Object.create(null, {
            endHack: { get: () => super.endHack }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.stopDecrement();
            this.triggeredMessage = null;
            yield _super.endHack.call(this, success);
        });
    }
    stopDecrement() {
        if (this.decrementTimer) {
            clearInterval(this.decrementTimer);
            this.decrementTimer = null;
        }
        this.isDecrementing = false;
    }
    handleCounterMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (message.author.bot)
                return;
            (_b = (_a = this.callbacks).onHackWarning) === null || _b === void 0 ? void 0 : _b.call(_a, message, "Impossible de compter, on est hacké !!");
            message.deletable && (yield message.delete());
        });
    }
    redirectToThread(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (message.author.bot)
                return;
            (_b = (_a = this.callbacks).onHackWarning) === null || _b === void 0 ? void 0 : _b.call(_a, message, `Résolvez le mini-jeu dans le thread : ${(_c = this._thread) === null || _c === void 0 ? void 0 : _c.url}`);
            message.deletable && (yield message.delete());
        });
    }
}
exports.AutomatonIntrusionCounter = AutomatonIntrusionCounter;
AutomatonIntrusionCounter.PROBA_DAY = 0.06;
AutomatonIntrusionCounter.PROBA_NIGHT = 0.04;
