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
    }
    /** À appeler lors de la réception d'un message */
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                if (!this.isHacked) {
                    this.endHack(false);
                    return false;
                }
                // Si le message est un input stratagème (généralement non numérique)
                if (isNaN(parseInt(message.content, 10))) {
                    if (message.channelId !== ((_a = this._thread) === null || _a === void 0 ? void 0 : _a.id)) { // If not in the thread
                        this.callbacks.onHackedWarning && (yield ((_c = (_b = this.callbacks).onHackedWarning) === null || _c === void 0 ? void 0 : _c.call(_b, message, `Veuillez résoudre le mini jeu dans le thread dédié => ${(_d = this._thread) === null || _d === void 0 ? void 0 : _d.url}`)));
                        message.deletable && (yield message.delete());
                        return false;
                    }
                    yield this.handleStratagemInput(message, false, true);
                    return true;
                }
                else {
                    this.callbacks.onHackedWarning && (yield ((_f = (_e = this.callbacks).onHackedWarning) === null || _f === void 0 ? void 0 : _f.call(_e, message, "Impossible de compter, on est hacké !!")));
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
            }), UnitTime_1.Time.minute.MIN_05.toMilliseconds());
        }
        catch (error) {
            console.error(error);
            (0, messages_1.sendMessageToInfoChannel)(`${error}`);
        }
    }
    endHack(success) {
        const _super = Object.create(null, {
            endHack: { get: () => super.endHack }
        });
        return __awaiter(this, void 0, void 0, function* () {
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createSimpleEmbed)(`Hack terminé avec succès : ${success}`));
            if (this.decrementTimer)
                clearInterval(this.decrementTimer);
            this.isDecrementing = false;
            _super.endHack.call(this, success);
        });
    }
    triggerBreach(message, count) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
                if (this._AutomatonMessage) {
                    // Créer un thread à partir du message envoyé par le webhook
                    const thread = yield this._AutomatonMessage.startThread({
                        name: `Intrusion Automaton`,
                        autoArchiveDuration: 60,
                        reason: 'Déclenchement du hack Automaton',
                        rateLimitPerUser: UnitTime_1.Time.minute.MIN_03.toSeconds()
                    });
                    const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.red);
                    embed.title = `Oh non ! Un ${this._choosenMember} a hacké le <#${message.channelId}> !`;
                    embed.description = `### Vite, arrêtez le en lui envoyant une ${this._choosenStratagem} !`;
                    embed.fields = [
                        {
                            name: "Code stratagème à réaliser",
                            value: ((_b = (_a = this.choosenStratagemCode) === null || _a === void 0 ? void 0 : _a.map(emoji => emoji.custom)) === null || _b === void 0 ? void 0 : _b.join(" ")) || ""
                        },
                        {
                            name: "__**Comment jouer**__",
                            value: "- Une flèche à la fois\n" +
                                "- Vous devez envoyer la flèche dans ce fils (celui-là)\n" +
                                "- La coche verte indique que votre flèche a été prise en compte\n" +
                                `- Le ${this._choosenMember} décompte tant qu'il n'a pas été annihilé\n` +
                                "- :warning: Le code peut se réinitialiser !"
                        }
                    ];
                    yield thread.send((0, embeds_1.returnToSendEmbed)(embed));
                    this._thread = thread;
                }
                else {
                    (0, messages_1.sendMessageToInfoChannel)("Impossible de récupérer le message webhook, thread non créé.");
                    console.error("Impossible de récupérer le message webhook, thread non créé.");
                }
                /*if(this._AutomatonMessage){
                    await this._AutomatonMessage?.reply(returnToSendEmbed(embed))
                } else {
                    sendEmbed(embed, message.channel as TextChannel)
                }*/
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
