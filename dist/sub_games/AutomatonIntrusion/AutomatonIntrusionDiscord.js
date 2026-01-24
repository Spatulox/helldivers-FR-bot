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
const HDFR_1 = require("../../utils/other/HDFR");
//import { HDFRDEBUGChannelID } from "../../utils/other/HDFR";
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
            "SUPER EARTH WILL BURN",
            "YOU WILL BURN",
        ];
    }
    triggerBreach(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                const personMessage = `-# ${((_a = message.member) === null || _a === void 0 ? void 0 : _a.nickname) || ((_b = message.member) === null || _b === void 0 ? void 0 : _b.displayName) || message.author.globalName} ${this.getRandomMessage(this.rp_message)}`;
                const fullRandomMessage = randomMessage.startsWith("http") ? `[${personMessage}](${randomMessage})` : `${personMessage}\n${randomMessage}`;
                this._AutomatonMessage = yield this.sendWebhook(fullRandomMessage, this.channel.id);
                const helpMessage = `\nVenez aider à détruire l'ennemi dans ${(_c = this._AutomatonMessage) === null || _c === void 0 ? void 0 : _c.url}`;
                try {
                    yield (0, messages_1.sendMessage)(personMessage + helpMessage, HDFR_1.HDFRChannelID.blabla_jeu);
                    yield (0, messages_1.sendMessage)(personMessage + helpMessage, HDFR_1.HDFRChannelID.blabla_hors_sujet);
                }
                catch (error) { }
                if (this._AutomatonMessage) {
                    // Créer un thread à partir du message envoyé par le webhook
                    const thread = yield this._AutomatonMessage.startThread({
                        name: `Intrusion Automaton`,
                        autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.OneDay,
                        reason: "Déclenchement du hack Automaton",
                    });
                    const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.red);
                    embed.title = "";
                    embed.description = `Vite, détruisez le en lui envoyant une __**${this._choosenStratagem}**__`;
                    if (!embed.thumbnail) {
                        embed.thumbnail = {};
                    }
                    embed.thumbnail.url = this.stratagems[this._choosenStratagem][1];
                    embed.fields = [
                        {
                            name: "Code Stratagème",
                            value: ((_d = this.stratagems[this._choosenStratagem][0]) === null || _d === void 0 ? void 0 : _d.map((emoji) => emoji.custom).join(" ").toString()) || "null",
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
    //HDFRChannelID.bot_brouillons,
    //HDFRChannelID.major_order,
    //HDFRChannelID.blabla_jeu,
    //HDFRChannelID.blabla_hors_sujet,
    //HDFRChannelID.galerie,
    HDFR_1.HDFRChannelID.mini_jeu,
    //HDFRChannelID.chill_tryhard,
    //HDFRChannelID.farm_debutant
];
AutomatonIntrusionDiscord.authorizedMarauderReactionChannels = [
    HDFR_1.HDFRChannelID.blabla_jeu,
    HDFR_1.HDFRChannelID.blabla_hors_sujet,
    HDFR_1.HDFRChannelID.galerie,
    HDFR_1.HDFRChannelID.mini_jeu,
];
// Dev Bot :
/*public static readonly authorizedChannels: string[] = [
    HDFRDEBUGChannelID.general
]

public static readonly authorizedMarauderReactionChannels: string[] = [
    HDFRDEBUGChannelID.general
];*/
AutomatonIntrusionDiscord.PROBA = 0.02;
