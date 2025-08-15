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
exports.Counter = void 0;
const Modules_1 = require("../../utils/other/Modules");
const config_json_1 = __importDefault(require("../../config.json"));
const channels_1 = require("../../utils/guilds/channels");
const client_1 = require("../../utils/client");
const embeds_1 = require("../../utils/messages/embeds");
const messages_1 = require("../../utils/messages/messages");
const UnitTime_1 = require("../../utils/times/UnitTime");
const SimpleMutex_1 = require("../../utils/other/SimpleMutex");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const constantes_1 = require("../../utils/constantes");
const log_1 = require("../../utils/other/log");
const members_1 = require("../../utils/guilds/members");
const Intrusion_1 = require("./Intrusion");
class Counter extends Modules_1.Module {
    constructor(intrusionModule) {
        super("Counter", "Module to manage the counter and handle messages related to it.");
        this.intrusionModule = null;
        this.intrusionModule = intrusionModule;
        this.initializeCounter();
    }
    static get COUNT() { return Counter._COUNT; }
    static get EXPECTED() { return Counter._EXPECTED; }
    static get counterChannel() { return Counter._counterChannel; }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            // Check for the counter channel or threads in the counter channel
            if (message.channel.id !== config_json_1.default.counterChannel && !(message.channel.isThread() && message.channel.parentId === config_json_1.default.counterChannel))
                return;
            this.incrementCounter(message);
        });
    }
    initializeCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Counter.mutex.lock();
            try {
                const [_counterChannel, logChannel] = yield Promise.all([
                    (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.counterChannel),
                    (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel)
                ]);
                if (!_counterChannel || !_counterChannel.isTextBased()) {
                    logChannel
                        ? (0, embeds_1.sendEmbedErrorMessage)("Counter channel is null T_T", logChannel)
                        : (0, messages_1.sendMessage)("Channel counter is null WELP");
                    return;
                }
                Counter._counterChannel = _counterChannel;
                const messages = (yield _counterChannel.messages.fetch({ limit: 20 })).reverse();
                for (const msg of messages.values()) {
                    const n = parseInt(msg.content.trim(), 10);
                    /**
                     * If BOT :
                     * - If it's AMIRAL SUPER TERRE, continue
                     * - If it's the bot itself, check if the message is numeric
                     *   - If numeric, set _COUNT and _EXPECTED to that number + 1
                     *   - If not numeric, continue
                     */
                    if (msg.author.bot && (msg.author.id === constantes_1.AMIRAL_SUPER_TERRE_ID)) { // || (msg.author.id === config.clientId && isNaN(n) ) )){
                        continue;
                    }
                    if (!isNaN(n)) { // If it's a number
                        if (Counter._EXPECTED == 0 || n == Counter._EXPECTED || msg.author.bot) { // _EXPECTED is 0 => Initial state // n = _EXPECTED => Coherent number // msg.author.bot => Bot message AND is number
                            Counter._COUNT = Counter._EXPECTED = n;
                            Counter._EXPECTED++;
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
                /* Counter._COUNT = 2000
                Counter._EXPECTED = Counter._COUNT + 1 */
            }
            catch (e) {
                console.error(e);
                yield (0, messages_1.sendMessageError)(`${e}`);
            }
            finally {
                Counter.mutex.unlock();
            }
            (0, log_1.log)(`Last coherent number found : ${Counter._COUNT}`);
        });
    }
    incrementCounter(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const avoid = [constantes_1.AMIRAL_SUPER_TERRE_ID, config_json_1.default.clientId]; // The Automaton Webhook ID still can pass since it's not the current bot
            if (message.author.bot && avoid.includes(message.author.id)) {
                return;
            }
            yield Counter.mutex.lock();
            try {
                const number = parseInt(message.content, 10);
                if (isNaN(number) && !Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked && !message.author.bot) {
                    yield this.handleNonNumeric(message);
                    return;
                }
                if (!message.author.bot && Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked) { // If non bot and hacked
                    yield Intrusion_1.Intrusion.counterAutomatonIntrusion.handleMessage(message);
                    return;
                }
                if (message.author.bot && !isNaN(number)) { // If bot && it's number
                    Counter._COUNT = number;
                    Counter._EXPECTED = number;
                    Counter._EXPECTED++;
                    return;
                }
                // Only Handle when the Webhook is send with a message
                if (message.author.bot && message.author.id == message.webhookId && isNaN(number)) {
                    return;
                }
                // Pas hack, message numérique :
                if (number === Counter._EXPECTED && !Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked) {
                    Counter._COUNT = Counter._EXPECTED;
                    Counter._EXPECTED++;
                    // 10%
                    yield ((_a = this.intrusionModule) === null || _a === void 0 ? void 0 : _a.handleMessageInCounterChannel(message));
                    return;
                }
                // Si le message ne correspond pas à l’attendu
                yield this.handleMismatch(message, number);
            }
            catch (e) {
                console.error(e);
                yield (0, messages_1.sendMessageError)(`${e}`);
            }
            finally {
                Counter.mutex.unlock();
            }
        });
    }
    handleNonNumeric(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                if (member && (0, members_1.checkIfApplyMember)(member)) {
                    yield (0, messages_1.replyAndDeleteReply)(message, `Le message doit commencer par un nombre :\n> - 12 exemple\n-# Ceci n'est pas compté comme une erreur`);
                }
                yield message.delete();
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`handleNonNumeric error : ${error}`));
            }
        });
    }
    handleMismatch(message, number) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const diff = Math.abs(number - Counter._EXPECTED);
                let to = false, msg = ":warning: Ce n'est pas le bon nombre... :eyes:";
                if (diff > 10) {
                    to = yield this.tryTimeout(message, diff > 500);
                    msg = diff > 500
                        ? ":warning: 12h de TO appliqués ! :eyes:"
                        : ":warning: Prochaine erreur grave : 12h de TO :eyes:\n-# Ceci est compté comme une erreur";
                }
                if (diff >= 10) {
                    yield this.notifyAdmin(message, number, to);
                    yield (0, messages_1.replyAndDeleteReply)(message, msg);
                }
                yield message.delete();
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(` handleMismatch error ${error}`));
            }
        });
    }
    tryTimeout(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, force = false) {
            var _a, _b;
            try {
                const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                if (member && (0, members_1.checkIfApplyMember)(member) && (force || Counter.errorRateLimiter.take(message.author.id))) {
                    try {
                        yield ((_b = message.member) === null || _b === void 0 ? void 0 : _b.timeout(Counter.timeToWait));
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
    notifyAdmin(message, number, to) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.botColor);
            embed.title = "Erreur Compteur";
            embed.description = `<@${message.author.id}> a loupé son compteur`;
            embed.fields = [
                { name: "Attendu", value: Counter._EXPECTED.toString(), inline: true },
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
}
exports.Counter = Counter;
Counter._COUNT = 0;
Counter._EXPECTED = 0;
Counter.mutex = new SimpleMutex_1.SimpleMutex();
Counter.timeToWait = UnitTime_1.Time.hour.HOUR_01.toMilliseconds();
Counter.errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, Counter.timeToWait);
