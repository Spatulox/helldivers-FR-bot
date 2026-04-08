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
exports.Counter = void 0;
const Modules_1 = require("../../Modules");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const constantes_1 = require("../../../constantes");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
const HDFR_1 = require("../../../utils/HDFR");
const MessageManager_1 = require("../../../utils/Manager/MessageManager");
const Intrusion_1 = require("../mini-games/Intrusion");
class Counter extends Modules_1.Module {
    constructor() {
        if (Counter._instance) {
            return Counter._instance;
        }
        super("Counter", "Module to manage the counter and handle messages related to it.");
        this.initializeCounterMutex = new simplediscordbot_1.SimpleMutex();
        this.deletedMessageByBot = {};
        this.detectionIfBotIsBlocked = {};
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
            if (message.channel.id !== HDFR_1.HDFRChannelID.compteur && !(message.channel.isThread() && message.channel.parentId === HDFR_1.HDFRChannelID.compteur))
                return;
            this.incrementCounter(message);
        });
    }
    handleMessageDelete(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            if (message.channelId !== HDFR_1.HDFRChannelID.compteur) {
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
            if (newMessage.channelId !== HDFR_1.HDFRChannelID.compteur) {
                return;
            }
            this.handleDeleteUpdateMessage(newMessage, "modifié", oldMessage);
        });
    }
    handleDeleteUpdateMessage(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, type = "supprimé", oldMessage = null) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if ((_a = message.author) === null || _a === void 0 ? void 0 : _a.bot) {
                return;
            }
            if (Intrusion_1.Intrusion.counterActive) {
                return;
            }
            if (type == "supprimé" && isNaN(Number(message.content))) {
                return;
            }
            yield Counter.mutex.lock();
            let incidence = false;
            if (yield MessageManager_1.MessageManager.isLastMessageInChannel(message)) {
                incidence = true;
            }
            try {
                const web = new simplediscordbot_1.WebhookManager(message.channel, (_b = message.author) === null || _b === void 0 ? void 0 : _b.displayName, ((_c = message.author) === null || _c === void 0 ? void 0 : _c.avatarURL()) || undefined);
                if (message.content && incidence) {
                    let message_content = message.content;
                    if (type == "modifié" && (oldMessage === null || oldMessage === void 0 ? void 0 : oldMessage.content)) {
                        message_content = oldMessage.content;
                    }
                    yield web.send(message_content + `\n-# Ceci est un message automatiquement renvoyé car le message original a été ${type}`);
                    if (type === "modifié") {
                        this.deletedMessageByBot[message.id] = message.content || "";
                        message.deletable && (yield message.delete());
                    }
                    yield web.delete();
                }
                else if (incidence) {
                    try {
                        const member = yield ((_d = message.member) === null || _d === void 0 ? void 0 : _d.fetch());
                        yield (member === null || member === void 0 ? void 0 : member.timeout(Counter.timeToWait));
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info("Impossible de timeout l'utilisateur qui a troll (dernier recours)" + error);
                    }
                    simplediscordbot_1.Bot.log.info(`<@1303398589812183060> Y'a un connard qui a ${type} son message dans le <#${message.channel.url}>, et le bot n'a rien pu faire.\n
                Il faut redémarrer le bot afin de reprendre le compteur normalement`);
                }
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error((`handleMessageDelete error : ${error}`)));
            }
            finally {
                Counter.mutex.unlock();
            }
            const embed = simplediscordbot_1.EmbedManager.error(incidence ? `Le message ${type} a été automatiquement renvoyé via un webhook dans ${message.channel.url}` : "Message supprimé");
            embed.setTitle(`COMPTEUR : Message ${type}`);
            simplediscordbot_1.EmbedManager.fields(embed, [
                { name: "Contenu", value: (_g = (_f = message.content) === null || _f === void 0 ? void 0 : _f.slice(0, 1024)) !== null && _g !== void 0 ? _g : "Aucun contenu", inline: true },
                { name: "Nouveau Contenu", value: oldMessage != null ? (_j = (_h = oldMessage.content) === null || _h === void 0 ? void 0 : _h.slice(0, 1024)) !== null && _j !== void 0 ? _j : "Aucun contenu" : "[Message Supprimé, pas de nouveau contenu]", inline: true },
                { name: "Auteur du message", value: `<@${(_l = (_k = message.author) === null || _k === void 0 ? void 0 : _k.id) !== null && _l !== void 0 ? _l : "Inconnu"}>`, inline: true },
                { name: "Message URL", value: (_m = message.url) !== null && _m !== void 0 ? _m : "Inconnu", inline: true },
                { name: "Incidence sur le compteur", value: incidence ? "Oui" : "Non", inline: true }
            ]);
            simplediscordbot_1.Bot.log.info(embed);
            simplediscordbot_1.Bot.message.send(HDFR_1.HDFRChannelID.alert, embed);
        });
    }
    initializeCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Counter.mutex.lock();
            yield this.initializeCounterMutex.lock();
            try {
                const [_counterChannel, logChannel] = yield Promise.all([
                    yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.compteur),
                    yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.helldivers_bot_log),
                ]);
                if (!_counterChannel || !_counterChannel.isTextBased()) {
                    logChannel
                        ? simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error("Counter channel is null T_T"))
                        : simplediscordbot_1.Bot.message.send(HDFR_1.HDFRChannelID.helldivers_bot_log, "Channel counter is null WELP");
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
                                simplediscordbot_1.Bot.log.info(`Message deleted: ${msg.content} ${msg.author} (${msg.url})`);
                            }
                            catch (error) {
                                console.error(`Error deleting message ${msg.content}: ${error}`);
                                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error((`initializeCounter : ${error} ${msg.url}`)));
                            }
                        }
                    }
                }
                /* Counter._COUNT = 2000
                Counter._EXPECTED = Counter._COUNT + 1 */
            }
            catch (e) {
                console.error(e);
                yield simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e}`));
            }
            finally {
                Counter.mutex.unlock();
                this.initializeCounterMutex.unlock();
            }
            simplediscordbot_1.Log.info(`Last coherent number found : ${Counter._COUNT}`);
        });
    }
    incrementCounter(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const avoid = [constantes_1.AMIRAL_SUPER_TERRE_ID, simplediscordbot_1.Bot.config.clientId]; // The Automaton Webhook ID still can pass since it's not the current bot
            if (message.author.bot && avoid.includes(message.author.id)) {
                return;
            }
            yield Counter.mutex.lock();
            try {
                let number = Number(message.content); //parseInt(message.content, 10); // => let users talk after sending a number
                if (Intrusion_1.Intrusion.counterActive) {
                    if (message.author.bot && !isNaN(number)) {
                        Counter._COUNT = number;
                        Counter._EXPECTED = number;
                        Counter._EXPECTED++;
                        this.detectionIfBotIsBlocked = {};
                    }
                    return;
                }
                // Allow moderators and technicians to send non-numeric messages without interference
                const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                if (isNaN(number) && member && (MemberManager_1.MemberManager.isModerator(member) || MemberManager_1.MemberManager.isTechnician(member))) {
                    number = parseInt(message.content, 10);
                }
                if (isNaN(number) && !message.author.bot) {
                    yield this.handleNonNumeric(message);
                    return;
                }
                // If bot && it's not a number
                if (message.author.bot && isNaN(number)) {
                    return;
                }
                // If bot && it's number
                if (message.author.bot && !isNaN(number)) {
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
                if (number === Counter._EXPECTED && !Intrusion_1.Intrusion.counterActive) {
                    Counter._COUNT = Counter._EXPECTED;
                    Counter._EXPECTED++;
                    this.detectionIfBotIsBlocked = {};
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
                            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.simple(`Le bot semble bloqué sur le nombre ${message.content}`));
                        }
                        this.detectionIfBotIsBlocked[message.content] = this.detectionIfBotIsBlocked[message.content] + 1;
                    }
                }
                // For fallback
                yield this.handleMismatch(message, number);
            }
            catch (e) {
                console.error(e);
                yield simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e}`));
            }
            finally {
                Counter.mutex.unlock();
                if (Number(message.content)) { // Only start an intrusion if the message is a number
                    yield Intrusion_1.Intrusion.determineCounterIntrusion(message);
                }
            }
        });
    }
    handleNonNumeric(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                if (member && (!MemberManager_1.MemberManager.isModerator(member) && !MemberManager_1.MemberManager.isTechnician(member))) {
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error((`Non-numeric message in counter channel by <@${message.author.id}> : ${message.content}`)));
                    yield MessageManager_1.MessageManager.replyAndDeleteReply(message, `Le message doit être exclusivement un nombre !\n-# Ceci n'est pas compté comme une erreur`);
                    this.deletedMessageByBot[message.id] = message.content;
                    yield message.delete();
                }
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error((`handleNonNumeric error : ${error}`)));
            }
        });
    }
    handleMismatch(message, number) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const diff = Math.abs(number - Counter._EXPECTED);
                let to = false, msg = ":warning: Ce n'est pas le bon nombre... :eyes:";
                if (diff > 10) {
                    to = yield this.tryTimeout(message, diff > Counter.DIFFERENCE_INTERVAL);
                    msg = diff > Counter.DIFFERENCE_INTERVAL
                        ? ":warning: 1h de TO appliqués ! :eyes:"
                        : ":warning: Prochaine erreur grave : 1h de TO :eyes:\n-# Ceci est compté comme une erreur";
                }
                if (diff >= 10) {
                    yield this.notifyAdmin(message, number, to);
                    yield MessageManager_1.MessageManager.replyAndDeleteReply(message, msg);
                }
                this.deletedMessageByBot[message.id] = message.content;
                yield message.delete();
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error((` handleMismatch error ${error}`)));
            }
        });
    }
    tryTimeout(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, force = false) {
            var _a, _b;
            try {
                const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
                if (member && !MemberManager_1.MemberManager.isStaff(member) && (force || Counter.errorRateLimiter.take(message.author.id))) {
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
            const embed = simplediscordbot_1.EmbedManager.simple(`<@${message.author.id}> a loupé son compteur`);
            embed.setTitle("Erreur Compteur");
            simplediscordbot_1.EmbedManager.fields(embed, [
                { name: "Attendu", value: Counter._EXPECTED.toString(), inline: true },
                { name: "Donné", value: number.toString(), inline: true },
                { name: "TO 1h", value: to ? "Oui" : "Non", inline: true },
                { name: "Message", value: message.url, inline: false },
                { name: "Différence", value: (Math.abs(number - Counter._EXPECTED)).toString(), inline: true },
                { name: "Différence Tolérée", value: Counter.DIFFERENCE_INTERVAL.toString(), inline: true }
            ]);
            const adminChannel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.alert);
            const logChannel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.retour_bot);
            if (adminChannel)
                simplediscordbot_1.Bot.message.send(adminChannel, embed);
            if (logChannel)
                simplediscordbot_1.Bot.message.send(logChannel, embed);
            if (!adminChannel && !logChannel) {
                simplediscordbot_1.Bot.log.info("Admin channel and Log Channel are false for Counter.ts");
            }
        });
    }
}
exports.Counter = Counter;
Counter._COUNT = 0;
Counter._EXPECTED = 0;
Counter.DIFFERENCE_INTERVAL = 1000;
Counter.mutex = new simplediscordbot_1.SimpleMutex();
Counter.timeToWait = simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds();
Counter.errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, Counter.timeToWait);
Counter._instance = null;
