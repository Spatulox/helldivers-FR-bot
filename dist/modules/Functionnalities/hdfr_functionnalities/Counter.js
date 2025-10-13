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
const Modules_1 = require("../../../utils/other/Modules");
const config_json_1 = __importDefault(require("../../../config.json"));
const channels_1 = require("../../../utils/guilds/channels");
const client_1 = require("../../../utils/client");
const embeds_1 = require("../../../utils/messages/embeds");
const messages_1 = require("../../../utils/messages/messages");
const UnitTime_1 = require("../../../utils/times/UnitTime");
const SimpleMutex_1 = require("../../../utils/other/SimpleMutex");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const constantes_1 = require("../../../utils/constantes");
const log_1 = require("../../../utils/other/log");
const members_1 = require("../../../utils/guilds/members");
const Intrusion_1 = require("../mini-games/Intrusion");
const webhook_1 = require("../../../utils/messages/webhook");
class Counter extends Modules_1.Module {
    constructor( /*intrusionModule: Intrusion*/) {
        if (Counter._instance) {
            return Counter._instance;
        }
        super("Counter", "Module to manage the counter and handle messages related to it.");
        this.initializeCounterMutex = new SimpleMutex_1.SimpleMutex();
        this.intrusionModule = null;
        this.deletedMessageByBot = {};
        this.detectionIfBotIsBlocked = {};
        this.intrusionModule = Intrusion_1.Intrusion.instance;
        this.initializeCounter();
        Counter._instance = this;
    }
    static get instance() { return Counter._instance; }
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
    handleMessageDelete(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (message.channelId !== config_json_1.default.counterChannel) {
                return;
            }
            if (this.initializeCounterMutex.locked) {
                return;
            }
            if (this.deletedMessageByBot[message.id]) {
                delete this.deletedMessageByBot[message.id];
                return;
            }
            this.handleDeleteUpdateMessage(message, "supprimé");
        });
    }
    handleMessageUpdate(oldMessage, newMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (newMessage.channelId !== config_json_1.default.counterChannel) {
                return;
            }
            this.handleDeleteUpdateMessage(newMessage, "modifié", oldMessage);
        });
    }
    handleDeleteUpdateMessage(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, type = "supprimé", oldMessage = null) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            if ((_a = message.author) === null || _a === void 0 ? void 0 : _a.bot) {
                return;
            }
            if (message.content) {
                if (isNaN(parseInt(message.content, 10))) {
                    return;
                }
            }
            let incidence = false;
            if (yield (0, messages_1.isLastMessageInChannel)(message)) {
                incidence = true;
            }
            try {
                const web = new webhook_1.WebHook(message.channel, (_b = message.author) === null || _b === void 0 ? void 0 : _b.displayName, ((_c = message.author) === null || _c === void 0 ? void 0 : _c.avatarURL()) || undefined);
                if (message.content && incidence) {
                    yield web.send(message.content + `\n-# Ceci est un message automatiquement renvoyé car le message original a été ${type}`);
                    if (type === "modifié") {
                        this.deletedMessageByBot[message.id] = message.content || "";
                        message.deletable && (yield message.delete());
                    }
                    yield web.delete();
                }
                else if (incidence) {
                    (0, messages_1.sendMessageToInfoChannel)(`<@1303398589812183060> Y'a un connard qui a ${type} son message dans le <#${message.channel.url}>, et le bot n'a rien pu faire.\n
                Il faut redémarrer le bot afin de reprendre le compteur normalement`);
                }
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`handleMessageDelete error : ${error}`));
            }
            const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.error);
            embed.title = `COMPTEUR : Message ${type}`;
            embed.description = incidence ? `Le message ${type} a été automatiquement renvoyé via un webhook dans ${message.channel.url}` : "";
            embed.fields = [
                { name: "Contenu", value: (_e = (_d = message.content) === null || _d === void 0 ? void 0 : _d.slice(0, 1024)) !== null && _e !== void 0 ? _e : "Aucun contenu", inline: true },
                { name: "Nouveau Contenu", value: oldMessage != null ? (_g = (_f = oldMessage.content) === null || _f === void 0 ? void 0 : _f.slice(0, 1024)) !== null && _g !== void 0 ? _g : "Aucun contenu" : "[Message Supprimé, pas de nouveau contenu]", inline: true },
                { name: "Auteur du message", value: `<@${(_j = (_h = message.author) === null || _h === void 0 ? void 0 : _h.id) !== null && _j !== void 0 ? _j : "Inconnu"}>`, inline: true },
                { name: "Message URL", value: (_k = message.url) !== null && _k !== void 0 ? _k : "Inconnu", inline: true },
                { name: "Incidence sur le compteur", value: incidence ? "Oui" : "Non", inline: true }
            ];
            (0, embeds_1.sendEmbedToInfoChannel)(embed);
            (0, embeds_1.sendEmbedToAdminChannel)(embed);
        });
    }
    initializeCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Counter.mutex.lock();
            yield this.initializeCounterMutex.lock();
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
                                this.deletedMessageByBot[msg.id] = msg.content;
                                (0, messages_1.sendMessageToInfoChannel)(`Message deleted: ${msg.content} ${msg.author} (${msg.url})`);
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
                this.initializeCounterMutex.unlock();
            }
            (0, log_1.log)(`Last coherent number found : ${Counter._COUNT}`);
        });
    }
    incrementCounter(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const avoid = [constantes_1.AMIRAL_SUPER_TERRE_ID, config_json_1.default.clientId]; // The Automaton Webhook ID still can pass since it's not the current bot
            if (message.author.bot && avoid.includes(message.author.id)) {
                return;
            }
            yield Counter.mutex.lock();
            try {
                let number = Number(message.content); //parseInt(message.content, 10); // => let users talk after sending a number
                if (!Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked) {
                    // Allow moderators and technicians to send non-numeric messages without interference
                    const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                    if (isNaN(number) && member && ((0, members_1.isModerator)(member) || (0, members_1.isTechnician)(member))) {
                        number = parseInt(message.content, 10);
                        if (isNaN(number)) {
                            return;
                        }
                    }
                    if (isNaN(number) && !message.author.bot) {
                        yield this.handleNonNumeric(message);
                        return;
                    }
                }
                if (!message.author.bot && Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked) { // If non bot and hacked
                    yield Intrusion_1.Intrusion.counterAutomatonIntrusion.handleMessage(message);
                    return;
                }
                // When Hacked and non hacked
                if (message.author.bot && !isNaN(number)) { // If bot && it's number
                    Counter._COUNT = number;
                    Counter._EXPECTED = number;
                    Counter._EXPECTED++;
                    this.detectionIfBotIsBlocked = {};
                    return;
                }
                // Only Handle when the Webhook is send with a message
                if (message.author.bot && message.author.id == message.webhookId && isNaN(number)) {
                    return;
                }
                // Progress the counter
                if (number === Counter._EXPECTED && !Intrusion_1.Intrusion.counterAutomatonIntrusion.isHacked) {
                    Counter._COUNT = Counter._EXPECTED;
                    Counter._EXPECTED++;
                    this.detectionIfBotIsBlocked = {};
                    yield ((_b = this.intrusionModule) === null || _b === void 0 ? void 0 : _b.handleMessageInCounterChannel(message));
                    return;
                }
                // Detection if the bot is stuck (wrong visual number, and the bot wait for another number (in case if someone has trolled the bot))
                if (this.detectionIfBotIsBlocked && typeof message.content === 'string' && message.content.length > 0) {
                    if (!this.detectionIfBotIsBlocked[message.content]) {
                        this.detectionIfBotIsBlocked[message.content] = 1;
                    }
                    else {
                        const t = this.detectionIfBotIsBlocked[message.content];
                        if (t && t >= 5) {
                            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createSimpleEmbed)(`Le bot semble bloqué sur le nombre ${message.content}`));
                        }
                        this.detectionIfBotIsBlocked[message.content] = this.detectionIfBotIsBlocked[message.content] + 1;
                    }
                }
                // For fallback
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
                if (member && (!(0, members_1.isModerator)(member) && !(0, members_1.isTechnician)(member))) {
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`Non-numeric message in counter channel by <@${message.author.id}> : ${message.content}`));
                    yield (0, messages_1.replyAndDeleteReply)(message, `Le message doit être exclusivement un nombre !\n-# Ceci n'est pas compté comme une erreur`);
                    this.deletedMessageByBot[message.id] = message.content;
                    yield message.delete();
                }
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
                        ? ":warning: 1h de TO appliqués ! :eyes:"
                        : ":warning: Prochaine erreur grave : 1h de TO :eyes:\n-# Ceci est compté comme une erreur";
                }
                if (diff >= 10) {
                    yield this.notifyAdmin(message, number, to);
                    yield (0, messages_1.replyAndDeleteReply)(message, msg);
                }
                this.deletedMessageByBot[message.id] = message.content;
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
                if (member && !(0, members_1.isStaff)(member) && (force || Counter.errorRateLimiter.take(message.author.id))) {
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
                { name: "TO 1h", value: to ? "Oui" : "Non", inline: true },
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
Counter._instance = null;
