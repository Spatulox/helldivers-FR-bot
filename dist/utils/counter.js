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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAutomaton = initializeAutomaton;
exports.initializeCounter = initializeCounter;
exports.incrementCounter = incrementCounter;
const config_json_1 = __importDefault(require("../config.json"));
const client_1 = require("./client");
const channels_1 = require("./guilds/channels");
const embeds_1 = require("./messages/embeds");
const messages_1 = require("./messages/messages");
const SimpleMutex_1 = require("./SimpleMutex");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const members_1 = require("./guilds/members");
const UnitTime_1 = require("./times/UnitTime");
const constantes_1 = require("./constantes");
const AutomatonIntrusionCounter_1 = require("../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const log_1 = require("./log");
let COUNT = 0, EXPECTED = 0;
const timeToWait = UnitTime_1.Time.hour.HOUR_12.toMilliseconds();
const errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, timeToWait);
const mutex = new SimpleMutex_1.SimpleMutex();
let counterChannel;
let automatonCounter;

function getDayNight() {
  const hour = new Date().getHours();
  const DAY = hour >= 7 && hour < 23;
  const NIGHT = !DAY;
  return { DAY, NIGHT };
}

function initializeAutomaton() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.counterChannel);
            if (!channel || !channel.isTextBased()) {
                throw new Error("Channel counter is null or not a text channel");
            }
            if (!channel) {
                return null;
            }
            counterChannel = channel;
            automatonCounter = new AutomatonIntrusionCounter_1.AutomatonIntrusionCounter(counterChannel, {
                onHackedWarning(messageToReplied, messageNotifyUser) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield replyAndDeleteReply(messageToReplied, messageNotifyUser);
                    });
                },
                onHackStart() {
                    return __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const embed = (0, embeds_1.createEmbed)();
                        embed.title = "Automaton Intrusion";
                        embed.description = `Une nouvelle intrusion automaton a été crée ici : ${(_a = automatonCounter === null || automatonCounter === void 0 ? void 0 : automatonCounter.AutomatonMessage) === null || _a === void 0 ? void 0 : _a.url}`;
                        (0, embeds_1.sendEmbedToInfoChannel)(embed);
                        //sendEmbedToAdminChannel(embed)
                    });
                },
                onHackEnd(success, originalAutomatonMessage) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.botColor);
                        if (success) {
                            embed.title = "Automaton Détruit !";
                            embed.description = `Félicitations, vous avez détruit l'automaton infiltré, malheureusement lors de l'explosion les backups se sont détruits, il faut recommencer le compteur à partir de ${COUNT}`;
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
                            yield (0, embeds_1.sendEmbed)(embed, counterChannel);
                        }
                        (0, messages_1.sendMessage)(COUNT.toString(), counterChannel);
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
            return true;
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`initializeAutomaton : ${error}`));
        }
    });
}
function initializeCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield initializeAutomaton())) {
            (0, messages_1.sendMessageToInfoChannel)("Impossible to initialize the counter channel");
            return;
        }
        yield mutex.lock();
        try {
            const [counterChannel, logChannel] = yield Promise.all([
                (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.counterChannel),
                (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel)
            ]);
            if (!counterChannel || !counterChannel.isTextBased()) {
                logChannel
                    ? (0, embeds_1.sendEmbedErrorMessage)("Counter channel is null T_T", logChannel)
                    : (0, messages_1.sendMessage)("Channel counter is null WELP");
                return;
            }
            const messages = (yield counterChannel.messages.fetch({ limit: 20 })).reverse();
            for (const msg of messages.values()) {
                const n = parseInt(msg.content.trim(), 10);
                /**
                 * If BOT :
                 * - If it's AMIRAL SUPER TERRE, continue
                 * - If it's the bot itself, check if the message is numeric
                 *   - If numeric, set COUNT and EXPECTED to that number + 1
                 *   - If not numeric, continue
                 */
                if (msg.author.bot && (msg.author.id === constantes_1.AMIRAL_SUPER_TERRE_ID)) { // || (msg.author.id === config.clientId && isNaN(n) ) )){
                    continue;
                }
                if (!isNaN(n)) { // If it's a number
                    if (EXPECTED == 0 || n == EXPECTED || msg.author.bot) { // EXPECTED is 0 => Initial state // n = EXPECTED => Coherent number // msg.author.bot => Bot message AND is number
                        COUNT = EXPECTED = n;
                        EXPECTED++;
                    }
                    else {
                        try {
                            msg.deletable && (yield msg.delete());
                            (0, messages_1.sendMessageToInfoChannel)(`Message deleted: ${msg.content} (${msg.url})`);
                        }
                        catch (error) {
                            console.error(`Error deleting message ${msg.content}: ${error}`);
                            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`initializeCounter : ${error} ${msg.url}`));
                        }
                    }
                }
            }
            /* COUNT = 2000
            EXPECTED = COUNT + 1 */
        }
        catch (e) {
            console.error(e);
            yield (0, messages_1.sendMessageError)(`${e}`);
        }
        finally {
            mutex.unlock();
        }
        (0, log_1.log)(`Last coherent number found : ${COUNT}`);
    });
}
function incrementCounter(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const avoid = [constantes_1.AMIRAL_SUPER_TERRE_ID, config_json_1.default.clientId]; // The Automaton Webhook ID still can pass since it's not the current bot
        if (message.author.bot && avoid.includes(message.author.id)) {
            return;
        }
        yield mutex.lock();
        try {
            const number = parseInt(message.content, 10);
            if (isNaN(number) && !automatonCounter.isHacked && !message.author.bot) {
                yield handleNonNumeric(message);
                return;
            }
            if (!message.author.bot && automatonCounter.isHacked) { // If non bot and hacked
                yield automatonCounter.handleMessage(message);
                return;
            }
            if (message.author.bot && !isNaN(number)) { // If bot && it's number
                COUNT = number;
                EXPECTED = number;
                EXPECTED++;
                return;
            }
            // Only Handle when the Webhook is send with a message
            if (message.author.bot && message.author.id == message.webhookId && isNaN(number)) {
                return;
            }
            // Pas hack, message numérique :
            if (number === EXPECTED && !automatonCounter.isHacked) {
                COUNT = EXPECTED;
                EXPECTED++;

                let { DAY, NIGHT } = getDayNight();

                // 10% de chance de déclencher l'intrusion
                if (Math.random() <= 0.10 && DAY || Math.random() <= 0.04 && NIGHT) { // 5% après
                    try {
                        const res = yield automatonCounter.triggerBreach(message, COUNT);
                        if (res === false) {
                            return;
                        }
                        COUNT = res;
                        automatonCounter.startDecrementTimer(COUNT);
                    }
                    catch (error) {
                        console.error(`${error}`);
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`1% proba counter Automaton Intrusion ${error}`));
                        automatonCounter.endHack(false);
                        return;
                    }
                }
                return;
            }
            // Si le message ne correspond pas à l’attendu
            yield handleMismatch(message, number);
        }
        catch (e) {
            console.error(e);
            yield (0, messages_1.sendMessageError)(`${e}`);
        }
        finally {
            mutex.unlock();
        }
    });
}
// -------------------------------------------------------------------------------- //
// -------------------------------------------------------------------------------- //
function handleNonNumeric(message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
            if (member && (0, members_1.checkIfApplyMember)(member)) {
                yield replyAndDeleteReply(message, `Le message doit commencer par un nombre :\n> - 12 exemple\n-# Ceci n'est pas compté comme une erreur`);
            }
            yield message.delete();
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`handleNonNumeric error : ${error}`));
        }
    });
}
function handleMismatch(message, number) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const diff = Math.abs(number - EXPECTED);
            let to = false, msg = ":warning: Ce n'est pas le bon nombre... :eyes:";
            if (diff > 10) {
                to = yield tryTimeout(message, diff > 500);
                msg = diff > 500
                    ? ":warning: 12h de TO appliqués ! :eyes:"
                    : ":warning: Prochaine erreur grave : 12h de TO :eyes:\n-# Ceci est compté comme une erreur";
            }
            if (diff >= 10) {
                yield notifyAdmin(message, number, to);
                yield replyAndDeleteReply(message, msg);
            }
            yield message.delete();
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(` handleMismatch error ${error}`));
        }
    });
}
function tryTimeout(message_1) {
    return __awaiter(this, arguments, void 0, function* (message, force = false) {
        var _a, _b;
        try {
            const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
            if (member && (0, members_1.checkIfApplyMember)(member) && (force || errorRateLimiter.take(message.author.id))) {
                try {
                    yield ((_b = message.member) === null || _b === void 0 ? void 0 : _b.timeout(timeToWait));
                    return true;
                }
                catch (err) {
                    console.error("Impossible to timeout", err);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
        return false;
    });
}
function notifyAdmin(message, number, to) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.botColor);
        embed.title = "Erreur Compteur";
        embed.description = `<@${message.author.id}> a loupé son compteur`;
        embed.fields = [
            { name: "Attendu", value: EXPECTED.toString(), inline: true },
            { name: "Donné", value: number.toString(), inline: true },
            { name: "TO 12h", value: to ? "Oui" : "Non", inline: true },
            { name: "Message", value: message.url, inline: true }
        ];
        const adminChannel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.adminChannel);
        const logChannel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
        if (adminChannel)
            (0, embeds_1.sendEmbed)(embed, adminChannel);
        if (logChannel)
            (0, embeds_1.sendEmbed)(embed, logChannel);
        if (!adminChannel && !logChannel) {
            (0, messages_1.sendMessageToAdminChannel)((_a = embed.description) !== null && _a !== void 0 ? _a : "");
            (0, messages_1.sendMessageToInfoChannel)((_b = embed.description) !== null && _b !== void 0 ? _b : "");
        }
    });
}
function replyAndDeleteReply(message, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reply = yield message.reply((0, embeds_1.returnToSendEmbed)((0, embeds_1.createErrorEmbed)(msg)));
            setTimeout(() => {
                reply.delete().catch(() => { });
            }, UnitTime_1.Time.second.SEC_10.toMilliseconds());
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(` replyAndDeleteReply error ${error}`));
        }
    });
}
