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
const AutomatonIntrusion_1 = require("./AutomatonIntrusion");
const messages_1 = require("../../utils/messages/messages");
const UnitTime_1 = require("../../utils/times/UnitTime");
const embeds_1 = require("../../utils/messages/embeds");
class AutomatonIntrusionCounter extends AutomatonIntrusion_1.AutomatonIntrusion {
    constructor(targetChannel, callbacks = {}) {
        super(targetChannel, callbacks);
        this.targetChannel = targetChannel;
        this.callbacks = callbacks;
        this.decrementTimer = null;
        this.isDecrementing = false;
        this._AutomatonMessage = null;
    }
    get AutomatonMessage() { return this._AutomatonMessage; }
    /** À appeler lors de la réception d'un message */
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (!this.isHacked) {
                    this.endHack(false);
                    return false;
                }
                // Si le message est un input stratagème (généralement non numérique)
                if (isNaN(parseInt(message.content, 10))) {
                    yield this.handleStratagemInput(message, false, true);
                    return true;
                }
                else {
                    (_b = (_a = this.callbacks).onHackedWarning) === null || _b === void 0 ? void 0 : _b.call(_a, message);
                    message.deletable && (yield message.delete());
                    return true;
                }
            }
            catch (error) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`handleMessage : ${error}`));
                return false;
            }
        });
    }
    /** Handle perte du combat contre l'automaton : décrémente régulièrement le compteur */
    startDecrementTimer(count) {
        this.isDecrementing = true;
        try {
            if (this.decrementTimer)
                clearInterval(this.decrementTimer);
            // Calcul à partir du stratagème choisi
            if (!this.stratagems || !this.choosenStratagem) {
                console.error("Impossible to choose a stratagem");
                return;
            }
            const stratagem = this.stratagems[this.choosenStratagem];
            if (!stratagem) {
                console.error("Stratagem introuvable");
                return;
            }
            let firstSkipped = false;
            this.decrementTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (!firstSkipped) {
                    firstSkipped = true;
                    return;
                }
                if (!this.isHacked) {
                    clearInterval(this.decrementTimer);
                    return;
                }
                count = Math.max(0, count - 1);
                yield this.sendWebhook(count.toString());
            }), UnitTime_1.Time.minute.MIN_15.toMilliseconds());
        }
        catch (error) {
            console.error(error);
            (0, messages_1.sendMessageToInfoChannel)(`${error}`);
        }
    }
    endHack(success) {
        if (this.decrementTimer)
            clearInterval(this.decrementTimer);
        this.isDecrementing = false;
        this._AutomatonMessage = null;
        super.endHack(success);
    }
    triggerBreach(count) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!count) {
                    (0, messages_1.sendMessageToInfoChannel)("Il faut un count dans le AutomatonIntrusionCounter");
                    return 0;
                }
                this.isInHackedState = true;
                this.actualStratagemCodeExpectedIndex = 0;
                this._choosenMember = this.getRandomWebhookMember();
                this._choosenStratagem = this.getRandomStratagem();
                if (!this._choosenMember || !this._choosenStratagem)
                    return count;
                const code = this.stratagems[this._choosenStratagem];
                if (!code) {
                    return count;
                }
                const member = this.webhookMember[this._choosenMember];
                if (!member) {
                    return count;
                }
                this._AutomatonMessage = yield this.sendWebhook((count - member[1]).toString());
                this.callbacks.onHackStart
                    && this.callbacks.onHackStart(this._choosenStratagem, code, this._choosenMember);
                return count - member[1];
            }
            catch (error) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
                return count || 0;
            }
        });
    }
}
exports.AutomatonIntrusionCounter = AutomatonIntrusionCounter;
