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
exports.AutomatonIntrusionDiscord = void 0;
const discord_js_1 = require("discord.js");
const AutomatonIntrusion_1 = require("./AutomatonIntrusion");
const embeds_1 = require("../../utils/messages/embeds");
const UnitTime_1 = require("../../utils/times/UnitTime");
const messages_1 = require("../../utils/messages/messages");
class AutomatonIntrusionDiscord extends AutomatonIntrusion_1.AutomatonIntrusion {
    constructor(guild, callbacks = {}) {
        const channelTMP = AutomatonIntrusionDiscord.getRandomChannel(guild);
        super(channelTMP, callbacks);
        this.callbacks = callbacks;
        this.timeoutAutomatonIntrusionTimer = null;
        this.channel = channelTMP;
        this.possible_automaton_message = [
            ...this.possible_automaton_message,
            "HAHAHAHA !",
            "A BAS LA DEMOCRATIE !",
            "HELLDIVERS SCUM!",
        ];
    }
    triggerBreach() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (yield AutomatonIntrusion_1.AutomatonIntrusion.mutex.locked) {
                return (0, messages_1.sendMessageError)("Automaton Intrusion mutex is locked, please try again later.");
            }
            try {
                this.isInHackedState = true;
                this.actualStratagemCodeExpectedIndex = 0;
                this._choosenMember = this.getRandomWebhookMember();
                this._choosenStratagem = this.getRandomStratagem();
                if (!this._choosenMember || !this._choosenStratagem)
                    return;
                const code = this.stratagems[this._choosenStratagem][0];
                if (!code) {
                    return;
                }
                const member = this.webhookMember[this._choosenMember];
                if (!member) {
                    return;
                }
                const randomMessage = this.getRandomMessage(this.possible_automaton_message);
                this._AutomatonMessage = yield this.sendWebhook(randomMessage, this.channel.id);
                if (this._AutomatonMessage) {
                    // Créer un thread à partir du message envoyé par le webhook
                    const thread = yield this._AutomatonMessage.startThread({
                        name: `Intrusion Automaton`,
                        autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.OneDay,
                        reason: "Déclenchement du hack Automaton",
                    });
                    const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.red);
                    embed.title = "Brèche Automaton";
                    embed.description = `Oh non ! Un ${this._choosenMember} est apparu, vite, détruisez le en lui envoyant une ${this._choosenStratagem}`;
                    if (!embed.thumbnail) {
                        embed.thumbnail = {};
                    }
                    console.log(this.stratagems[this._choosenStratagem][1]);
                    embed.thumbnail.url = this.stratagems[this._choosenStratagem][1];
                    embed.fields = [
                        {
                            name: "Code Stratagème",
                            value: ((_a = this.stratagems[this._choosenStratagem][0]) === null || _a === void 0 ? void 0 : _a.map((emoji) => emoji.custom).join(" ").toString()) || "null",
                        },
                        {
                            name: "__**Comment jouer**__",
                            value: "- Une flèche par personne, à chaque essai\n" +
                                "- Vous devez envoyer la flèche dans le fils (celui-là)\n" +
                                "- La coche verte indique que votre flèche a été prise en compte\n" +
                                "- :warning: Le code peut se réinitialiser !",
                        },
                    ];
                    yield thread.send((0, embeds_1.returnToSendEmbed)(embed));
                    this._thread = thread;
                }
                else {
                    (0, messages_1.sendMessageToInfoChannel)("Impossible de récupérer le message webhook, thread non créé.");
                    console.error("Impossible de récupérer le message webhook, thread non créé.");
                }
                this.callbacks.onHackStart &&
                    this.callbacks.onHackStart(this._choosenStratagem, code, this._choosenMember);
                this.timeoutAutomatonIntrusion();
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
            }
        });
    }
    timeoutAutomatonIntrusion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.timeoutAutomatonIntrusionTimer != null) {
                return;
            }
            try {
                this.timeoutAutomatonIntrusionTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    if (!this.isHacked) {
                        clearInterval(this.timeoutAutomatonIntrusionTimer);
                        this.timeoutAutomatonIntrusionTimer = null;
                        this._AutomatonMessage = null;
                        return;
                    }
                    this.closeThread();
                    clearInterval(this.timeoutAutomatonIntrusionTimer);
                    this.timeoutAutomatonIntrusionTimer = null;
                    this._AutomatonMessage = null;
                    this.endHack(false);
                }), UnitTime_1.Time.day.DAY_01.toMilliseconds());
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
            }
        });
    }
    static getRandomChannel(guild) {
        const channels = [...AutomatonIntrusionDiscord.authorizedChannels];
        let foundTextChannel;
        while (!foundTextChannel && channels.length > 0) {
            const idx = Math.floor(Math.random() * channels.length);
            const channelId = channels[idx];
            if (!channelId) {
                console.error("Aucun channel ID trouvé");
                continue;
            }
            const channel = guild.channels.cache.get(channelId);
            if (channel && channel.type === discord_js_1.ChannelType.GuildText) {
                foundTextChannel = channel;
            }
            else {
                channels.splice(idx, 1);
            }
        }
        if (!foundTextChannel) {
            throw new Error("Aucun channel texte autorisé trouvé dans ce serveur.");
        }
        return foundTextChannel;
    }
    closeThread() {
        if (this._thread) {
            this._thread.setLocked(true);
            this._thread.setArchived(true);
        }
    }
}
exports.AutomatonIntrusionDiscord = AutomatonIntrusionDiscord;
// Prod bot :
AutomatonIntrusionDiscord.authorizedChannels = [
    //"1227056196297560105", // Bot et brouillons
    //"1308231599615115365", // Ordre Majeur
    //"1111160769615245324", // Blabla jeu
    //"1213848682919886929", // Blabla hors sujet
    //"1158908428387881051", // Galerie
    "1355177673554661416", // Jeu de la roulette
    //"1213981643447205999", // Chill try hard
    //"1304584943065890846", // farm débutant
];
