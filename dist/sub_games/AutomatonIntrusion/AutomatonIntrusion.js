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
exports.AutomatonIntrusion = void 0;
const BaseAutomatonIntrusion_1 = require("./BaseAutomatonIntrusion");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/HDFR");
class AutomatonIntrusion extends BaseAutomatonIntrusion_1.BaseAutomatonIntrusion {
    constructor(targetChannel, callbacks = {}) {
        super(targetChannel, callbacks);
    }
    get notificationChannels() {
        return [HDFR_1.HDFRChannelID.blabla_jeu];
    }
    createIntrusionMessage(message) {
        var _a;
        const personMessage = `-# ${((_a = message.member) === null || _a === void 0 ? void 0 : _a.nickname) || message.author.globalName} ${this.rp_message_choosen}`;
        const randomMedia = this.getRandomMessage(this.possible_automaton_message);
        return randomMedia.startsWith("http")
            ? `[${personMessage}](${randomMedia})`
            : `${personMessage}\n${randomMedia}`;
    }
    notifyIntrusion(message, messageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const personMessage = `-# ${((_a = message.member) === null || _a === void 0 ? void 0 : _a.nickname) || message.author.globalName} ${this.rp_message_choosen}\n`;
            const helpMessage = `Venez aider à détruire l'ennemi dans ${messageUrl}`;
            for (const channelId of this.notificationChannels) {
                try {
                    yield simplediscordbot_1.Bot.message.send(channelId, personMessage + helpMessage);
                }
                catch (error) {
                    // Channel inexistant, on ignore
                }
            }
        });
    }
    createGameThread(channelId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const automatonMessage = yield this.sendWebhook(this.createIntrusionMessage(message), channelId);
            if (!automatonMessage)
                throw new Error("Webhook message failed");
            this._AutomatonMessage = automatonMessage;
            this._thread = yield automatonMessage.startThread({
                name: this.threadName,
                autoArchiveDuration: 60,
                reason: 'Déclenchement du hack Automaton'
            });
            yield this.sendGameInstructions();
        });
    }
    sendGameInstructions() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this._choosenStratagem || !this._thread)
                return;
            const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.red);
            embed.setDescription(`Vite, détruisez-le en lui envoyant une **${this._choosenStratagem}** !`);
            embed.setThumbnail(this.stratagems[this._choosenStratagem][1]);
            simplediscordbot_1.EmbedManager.fields(embed, [
                {
                    name: "Code stratagème",
                    value: ((_a = this.choosenStratagemCode) === null || _a === void 0 ? void 0 : _a.map(emoji => emoji.custom).join(" ")) || "",
                },
                {
                    name: "Comment jouer",
                    value: this.getGameRules()
                }
            ]);
            yield this._thread.send(simplediscordbot_1.EmbedManager.toMessage(embed));
        });
    }
}
exports.AutomatonIntrusion = AutomatonIntrusion;
