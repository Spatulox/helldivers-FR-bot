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
exports.Intrusion = void 0;
const Modules_1 = require("../../utils/other/Modules");
const AutomatonIntrusionDiscord_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const client_1 = require("../../utils/client");
const constantes_1 = require("../../utils/constantes");
const embeds_1 = require("../../utils/messages/embeds");
const members_1 = require("../../utils/guilds/members");
const messages_1 = require("../../utils/messages/messages");
const AutomatonIntrusionCounter_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const UnitTime_1 = require("../../utils/times/UnitTime");
const Counter_1 = require("./Counter");
/**
 * This Class Manage All Automaton Intrusion
 * This class manage too the Global DiscordIntrusion message and stratagem resolve
 */
class Intrusion extends Modules_1.Module {
    constructor() {
        super("Automaton Intrusion", "Module to manage the intrusion (Discord & Counter) and handle messages related to it.");
        this.initializeCounterAutomaton(); // Since the IntrusionCounterAutomaton is the same for all Intrusion, save it here
    }
    get marauderCanSpawnInCounter() {
        if (Intrusion._marauderCanSpawnInCounter === true) {
            return true;
        }
        if (typeof Intrusion._marauderCanSpawnInCounter === "number" && Intrusion._marauderCanSpawnInCounter >= Intrusion.MAX_MESSAGE_BEFORE_COUNTER_MARAUDER_REACTIVATION) {
            Intrusion._marauderCanSpawnInCounter = true;
            return true;
        }
        else {
            Intrusion._marauderCanSpawnInCounter++;
        }
        return false;
    }
    // Only handle the global Intrusion, not the counter
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            this.discordIntrusion(message);
        });
    }
    // Only handle the counter intrusion, because only valid message should trigger the Automaton Intrusion
    // Since the validation is in the Counter Module, the Counter Module call this functino
    handleMessageInCounterChannel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            this.counterIntrusion(message);
        });
    }
    counterIntrusion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.marauderCanSpawnInCounter) { // This increment the marauderCanSpawn if it's value is under Intrusion.MAX_MESSAGE_BEFORE_COUNTER_MARAUDER_REACTIVATION
                //console.log(this.marauderCanSpawnInCounter)
                return;
            }
            //console.log(Time.DAY, Time.NIGHT)
            if (Math.random() <= 0.06 && UnitTime_1.Time.DAY || Math.random() <= 0.04 && UnitTime_1.Time.NIGHT) {
                try {
                    const res = yield Intrusion.counterAutomatonIntrusion.triggerBreach(message, Counter_1.Counter.COUNT);
                    if (res === false) {
                        return;
                    }
                    Intrusion._marauderCanSpawnInCounter = 0; // New Intrusion, so we need to set the "message to 0"
                    Intrusion.counterAutomatonIntrusion.startDecrementTimer(Counter_1.Counter.COUNT);
                }
                catch (error) {
                    console.error(`${error}`);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`10% proba counter Automaton Intrusion ${error}`));
                    Intrusion.counterAutomatonIntrusion.endHack(false);
                    return;
                }
            }
        });
    }
    discordIntrusion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (Math.random() <= 0.03 && message.guildId === constantes_1.TARGET_GUILD_ID && !message.author.bot && !Intrusion.discordAutomatonIntrusion) { // || message.channelId === "1227056196297560105") { // entre 1 et 3%
                try {
                    const guild = client_1.client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
                    if (!guild) {
                        (0, messages_1.sendMessageToInfoChannel)("Guild not found for Automaton Intrusion");
                        return;
                    }
                    const member = yield guild.members
                        .fetch(message.author.id)
                        .catch(() => null);
                    if (member && (0, members_1.checkIfApplyMember)(member) && !Intrusion.discordAutomatonIntrusion) {
                        Intrusion.discordAutomatonIntrusion = new AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord(guild, {
                            onHackStart() {
                                return __awaiter(this, void 0, void 0, function* () {
                                    var _a, _b;
                                    const embed = (0, embeds_1.createEmbed)();
                                    embed.title = "Automaton Intrusion";
                                    embed.description = `Une nouvelle intrusion automaton a été crée ici : ${(_b = (_a = Intrusion.discordAutomatonIntrusion) === null || _a === void 0 ? void 0 : _a.AutomatonMessage) === null || _b === void 0 ? void 0 : _b.url}`;
                                    (0, embeds_1.sendEmbedToAdminChannel)(embed);
                                    (0, embeds_1.sendEmbedToInfoChannel)(embed);
                                });
                            },
                            onHackEnd(success, originalAutomatonMessage) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    var _a, _b;
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
                                    const automatonChannel = (_b = (_a = Intrusion.discordAutomatonIntrusion) === null || _a === void 0 ? void 0 : _a.AutomatonMessage) === null || _b === void 0 ? void 0 : _b.channel;
                                    if (!automatonChannel) {
                                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to send the Final Embed when Automaton is defeated/still here"));
                                        return;
                                    }
                                    if (originalAutomatonMessage) {
                                        originalAutomatonMessage.reply((0, embeds_1.returnToSendEmbed)(embed));
                                    }
                                    else {
                                        (0, embeds_1.sendEmbed)(embed, automatonChannel);
                                    }
                                });
                            },
                            onWrongStratagemStep(message, expected, messageDelete) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    const embed = (0, embeds_1.createEmbed)();
                                    embed.title = ":warning:";
                                    embed.description = expected;
                                    const rep = yield message.reply((0, embeds_1.returnToSendEmbed)(embed));
                                    messageDelete && setTimeout(() => {
                                        if (rep.deletable) {
                                            console.log("deletable");
                                        }
                                        rep.deletable && rep.delete();
                                    }, UnitTime_1.Time.second.SEC_10.toMilliseconds());
                                });
                            },
                        });
                        try {
                            Intrusion.discordAutomatonIntrusion.triggerBreach();
                        }
                        catch (error) {
                            console.error(`${error}`);
                            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`1% proba index.ts Automaton Intrusion ${error}`));
                            Intrusion.discordAutomatonIntrusion.endHack(false);
                            return;
                        }
                    }
                    /*const embed = createEmbed(EmbedColor.error)
                          embed.title = "Automaton Intrusion"
                          embed.description = `Une intrusion automaton ${discordAutomatonIntrusion ? "à été déclenchée" : "n'a pas réussi à être déclenché"} par ${message.author} (${message.author.id}) dans le channel <#${message.channelId}>`
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
                                  value: discordAutomatonIntrusion ? "Automaton Intrusion en cours" : "Aucune Automaton Intrusion en cours"
                              }
                          ]
                          sendEmbedToInfoChannel(embed)*/
                }
                catch (error) {
                    console.error(error);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`AutomatonInstrusionDiscord : ${error}`));
                    return;
                }
            }
            else if (Intrusion.discordAutomatonIntrusion &&
                Intrusion.discordAutomatonIntrusion.isHacked &&
                message.channelId == ((_a = Intrusion.discordAutomatonIntrusion.thread) === null || _a === void 0 ? void 0 : _a.id)) {
                Intrusion.discordAutomatonIntrusion.handleStratagemInput(message, true, true);
            }
            else if (Intrusion.discordAutomatonIntrusion &&
                Intrusion.discordAutomatonIntrusion.isHacked &&
                AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.authorizedChannels.includes(message.channelId)) {
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
            else if (Intrusion.discordAutomatonIntrusion && !Intrusion.discordAutomatonIntrusion.isHacked) {
                //sendMessageToInfoChannel(`Réinitialisation de l'automaton intrusion`)
                Intrusion.discordAutomatonIntrusion = null;
            }
        });
    }
    initializeCounterAutomaton() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Intrusion.counterAutomatonIntrusion = new AutomatonIntrusionCounter_1.AutomatonIntrusionCounter(Counter_1.Counter.counterChannel, {
                    onHackedWarning(messageToReplied, messageNotifyUser) {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, messages_1.replyAndDeleteReply)(messageToReplied, messageNotifyUser);
                        });
                    },
                    onHackStart() {
                        return __awaiter(this, void 0, void 0, function* () {
                            var _a, _b;
                            const embed = (0, embeds_1.createEmbed)();
                            embed.title = "Automaton Intrusion";
                            embed.description = `Une nouvelle intrusion automaton a été crée ici : ${(_b = (_a = Intrusion.counterAutomatonIntrusion) === null || _a === void 0 ? void 0 : _a.AutomatonMessage) === null || _b === void 0 ? void 0 : _b.url}`;
                            (0, embeds_1.sendEmbedToInfoChannel)(embed);
                            //sendEmbedToAdminChannel(embed)
                        });
                    },
                    onHackEnd(success, originalAutomatonMessage) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.botColor);
                            if (success) {
                                embed.title = "Automaton Détruit !";
                                embed.description = `Félicitations, vous avez détruit l'automaton infiltré, malheureusement lors de l'explosion les backups se sont détruits, il faut recommencer le compteur à partir de ${Counter_1.Counter.COUNT}`;
                            }
                            else {
                                embed.color = embeds_1.EmbedColor.error;
                                embed.title = "L'Automaton est toujours là !";
                                embed.description = `Malheureusement, vous n'avez pas réussi à détruire l'automaton...`;
                            }
                            if (originalAutomatonMessage) {
                                originalAutomatonMessage.reply((0, embeds_1.returnToSendEmbed)(embed));
                            }
                            else {
                                yield (0, embeds_1.sendEmbed)(embed, Counter_1.Counter.counterChannel);
                            }
                            (0, messages_1.sendMessage)(Counter_1.Counter.COUNT.toString(), Counter_1.Counter.counterChannel);
                        });
                    },
                    onWrongStratagemStep(message, expected, messageDelete) {
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                const embed = (0, embeds_1.createEmbed)();
                                embed.title = ":warning:";
                                embed.description = expected;
                                const rep = yield message.reply((0, embeds_1.returnToSendEmbed)(embed));
                                messageDelete && setTimeout(() => {
                                    rep.delete();
                                }, UnitTime_1.Time.second.SEC_10.toMilliseconds());
                            }
                            catch (error) {
                                console.error(error);
                                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
                            }
                        });
                    }
                });
                if (!Intrusion.counterAutomatonIntrusion) {
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to initialize the Intrusion Automaton Counter"));
                    return false;
                }
                return true;
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`initializeAutomaton : ${error}`));
            }
        });
    }
}
exports.Intrusion = Intrusion;
Intrusion.discordAutomatonIntrusion = null;
Intrusion._marauderCanSpawnInCounter = 10;
Intrusion.MAX_MESSAGE_BEFORE_COUNTER_MARAUDER_REACTIVATION = 10;
