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
exports.handleAutomatonIntrusion = handleAutomatonIntrusion;
const discord_js_1 = require("discord.js");
const AutomatonIntrusion_1 = require("./AutomatonIntrusion");
const embeds_1 = require("../../utils/messages/embeds");
const UnitTime_1 = require("../../utils/times/UnitTime");
const members_1 = require("../../utils/guilds/members");
const messages_1 = require("../../utils/messages/messages");
const constantes_1 = require("../../utils/constantes");
class AutomatonIntrusionDiscord extends AutomatonIntrusion_1.AutomatonIntrusion {
    constructor(guild, callbacks = {}) {
        const channelTMP = AutomatonIntrusionDiscord.getRandomChannel(guild);
        super(channelTMP, callbacks);
        this.callbacks = callbacks;
        this.timeoutAutomatonIntrusionTimer = null;
        this.channel = channelTMP;
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
                const code = this.stratagems[this._choosenStratagem];
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
                        autoArchiveDuration: 60,
                        reason: 'Déclenchement du hack Automaton'
                    });
                    const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.red);
                    embed.title = "Brèche Automaton";
                    embed.description = `Oh non ! Un ${this._choosenMember} est apparu, vite, détruisez le en lui envoyant une ${this._choosenStratagem}`;
                    embed.fields = [
                        {
                            name: "Code Stratagème",
                            value: ((_a = this.stratagems[this._choosenStratagem]) === null || _a === void 0 ? void 0 : _a.map(emoji => emoji.custom).join(" ").toString()) || "null",
                        },
                        {
                            name: "__**Comment jouer**__",
                            value: "- Une flèche par personne, à chaque essai\n" +
                                "- Vous devez envoyer la flèche dans le fils (celui-là)\n" +
                                "- La coche verte indique que votre flèche a été prise en compte\n" +
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
                this.callbacks.onHackStart && this.callbacks.onHackStart(this._choosenStratagem, code, this._choosenMember);
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
    "1208772607776923710", // Bienvenue
    "1308231599615115365", // Ordre Majeur
    "1308231675486015600", // Alliance SEIC
    "1210669952403771392", // Twitch-Youtube
    "1111160769615245324", // Blabla jeu
    "1213848682919886929", // Blabla hors sujet
    "1158908428387881051", // Galerie
    "1355177673554661416", // Jeu de la roulette
    "1213981643447205999", // Chill try hard
    "1304584943065890846", // farm débutant
];
let automatonIntrusion = null;
function handleAutomatonIntrusion(message, client) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if ((Math.random() <= 0.05 && message.guildId === constantes_1.TARGET_GUILD_ID && !message.author.bot && !automatonIntrusion)) { // || message.channelId === "1227056196297560105") { // entre 1 et 3%
            try {
                const guild = client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
                if (!guild) {
                    (0, messages_1.sendMessageToInfoChannel)("Guild not found for Automaton Intrusion");
                    return;
                }
                const member = yield guild.members.fetch(message.author.id).catch(() => null);
                if (member && (0, members_1.checkIfApplyMember)(member) && !automatonIntrusion) {
                    automatonIntrusion = new AutomatonIntrusionDiscord(guild, {
                        onHackStart() {
                            return __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                const embed = (0, embeds_1.createEmbed)();
                                embed.title = "Automaton Intrusion";
                                embed.description = `Une nouvelle intrusion automaton a été crée ici : ${(_a = automatonIntrusion === null || automatonIntrusion === void 0 ? void 0 : automatonIntrusion.AutomatonMessage) === null || _a === void 0 ? void 0 : _a.url}`;
                                (0, embeds_1.sendEmbedToAdminChannel)(embed);
                                (0, embeds_1.sendEmbedToInfoChannel)(embed);
                            });
                        },
                        onHackEnd(success) {
                            return __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.botColor);
                                if (success) {
                                    embed.title = "Automaton détruit !";
                                    embed.description = `Félicitations, vous avez détruit l'automaton infiltré`;
                                }
                                else {
                                    embed.color = embeds_1.EmbedColor.error;
                                    embed.title = "L'Automaton est toujours là !";
                                    embed.description = `Malheureusment vous n'avez pas réussi à détruire l'automaton`;
                                }
                                const automatonChannel = (_a = automatonIntrusion === null || automatonIntrusion === void 0 ? void 0 : automatonIntrusion.AutomatonMessage) === null || _a === void 0 ? void 0 : _a.channel;
                                if (!automatonChannel) {
                                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to send the Final Embed when Automaton is defeated/still here"));
                                    return;
                                }
                                (0, embeds_1.sendEmbed)(embed, automatonChannel);
                            });
                        },
                        onWrongStratagemStep(message, expected) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const embed = (0, embeds_1.createEmbed)();
                                embed.title = ":warning:";
                                embed.description = expected;
                                yield message.reply((0, embeds_1.returnToSendEmbed)(embed));
                            });
                        }
                    });
                    try {
                        automatonIntrusion.triggerBreach();
                    }
                    catch (error) {
                        console.error(`${error}`);
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`1% proba index.ts Automaton Intrusion ${error}`));
                        automatonIntrusion.endHack(false);
                        return;
                    }
                }
                /*const embed = createEmbed(EmbedColor.error)
                embed.title = "Automaton Intrusion"
                embed.description = `Une intrusion automaton ${automatonIntrusion ? "à été déclenchée" : "n'a pas réussi à être déclenché"} par ${message.author} (${message.author.id}) dans le channel <#${message.channelId}>`
                embed.fields = [
                    {
                        name: "Auteur",
                        value: `${message.author} (${message.author.id})`,
                    },
                    {
                        name: "Channel",
                        value: `<#${message.channelId}> (${message.channelId})`,
                    },
                    {
                        name: "Message",
                        value: message.content || "Aucun contenu"
                    },
                    {
                        name: "Membre",
                        value: member ? `${member.user.username} (${member.id})` : "Membre introuvable"
                    },
                    {
                        name: "Member Defined ?",
                        value: member ? "Oui" : "Non"
                    },
                    {
                        name: "Member partial ?",
                        value: member?.partial ? "Oui" : "Non"
                    },
                    {
                        name: "Apply to member ?",
                        value: member && checkIfApplyMember(member) ? "Oui" : "Non"
                    },
                    {
                        name: "Status Intrusion",
                        value: automatonIntrusion ? "Automaton Intrusion en cours" : "Aucune Automaton Intrusion en cours"
                    }
                ]
                sendEmbedToInfoChannel(embed)*/
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`global : ${error}`));
                return;
            }
        }
        else if (automatonIntrusion && automatonIntrusion.isHacked && message.channelId == ((_a = automatonIntrusion.thread) === null || _a === void 0 ? void 0 : _a.id)) {
            automatonIntrusion.handleStratagemInput(message, false, true);
        }
        else if (automatonIntrusion && automatonIntrusion.isHacked && AutomatonIntrusionDiscord.authorizedChannels.includes(message.channelId)) {
            const member = message.member;
            if (member && (0, members_1.checkIfApplyMember)(member)) {
                try {
                    yield message.react("M4R4UD3R:1402086718894768220");
                }
                catch (error) {
                    console.error(error);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`message react : ${error}`));
                }
            }
        }
        else if (automatonIntrusion && !automatonIntrusion.isHacked) {
            //sendMessageToInfoChannel(`Réinitialisation de l'automaton intrusion`)
            automatonIntrusion = null;
        }
    });
}
