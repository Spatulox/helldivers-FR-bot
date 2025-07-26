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
//import { setTimeout } from 'timers/promises';
const webhook_1 = require("./messages/webhook");
let COUNT = 0, EXPECTED = 0;
let TIMESTAMP_WHEN_HACK_TIMEOUT = 0;
const timeToWait = UnitTime_1.Time.hour.HOUR_12.toMilliseconds();
const errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, timeToWait);
let choosenMember = "";
let choosenStratagem = "";
let actualStratagemCodeExpectedIndex = 0;
let isInHackedState = false;
let isDecrementing = false;
const mutex = new SimpleMutex_1.SimpleMutex();
const webhookMember = {
    "maraudeur": ["M4R4UD3R", 5]
};
const stratagems = {
    /*"BOMBE DE 500kg":["⬆️", "➡️", "⬇️", "⬇️", "⬇️"],
    "FRAPPE AÉRIENNE": ["⬆️", "➡️", "⬇️", "⬆️"],
    "MISSILE AIR-SOL DE 110mm":["⬆️","➡️","⬆️","⬅️"],
    "HELLBOMB":["⬇️", "⬆️", "⬅️", "⬇️","⬆️","➡️","⬇️","⬆️"],
    "FRAPPE DE CANON ÉLECTROMAGNÉTIQUE ORBITAL":["➡️","⬆️","⬇️","⬇️","➡️"],*/
    "FRAPPE ORBITALE PRÉCISE": ["➡️", "➡️", "⬆️"]
};
const authorizedEmoji = ["➡️", "⬆️", "⬇️", "⬅️"];
function initializeCounter() {
    return __awaiter(this, void 0, void 0, function* () {
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
                if (msg.author.bot && (msg.author.id === constantes_1.AMIRAL_SUPER_TERRE_ID || msg.author.id === config_json_1.default.clientId))
                    continue;
                const n = parseInt(msg.content.trim(), 10);
                if (!isNaN(n)) {
                    COUNT = EXPECTED = n;
                    EXPECTED++;
                }
            }
            COUNT = 2000;
            EXPECTED = COUNT + 1;
        }
        catch (e) {
            console.error(e);
            yield (0, messages_1.sendMessageError)(`${e}`);
        }
        finally {
            mutex.unlock();
        }
        console.log(`Last coherent number found : ${COUNT}`);
    });
}
function incrementCounter(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const avoid = [constantes_1.AMIRAL_SUPER_TERRE_ID, config_json_1.default.clientId];
        if (message.author.bot && (avoid.includes(message.author.id)))
            return;
        yield mutex.lock();
        try {
            // Problème dans l'ordre de check (on peut mettre un mauvais nombre et ca va faire pop le bot Automaton quand même)
            const number = parseInt(message.content, 10);
            console.log(number, isInHackedState, isDecrementing);
            if (isNaN(number) && !isInHackedState)
                return yield handleNonNumeric(message); // If the message is not a number, and not in the hacked State
            if (isNaN(number) && isInHackedState) { // If the message is a stratagem code => not a number and in hacked State
                yield handleResolveStratagemCode(message);
                return;
            }
            if (!message.author.bot && number && isInHackedState) {
                yield replyAndDeleteReply(message, "Impossible de compter, on est hacké !!");
                message.delete();
                return;
            }
            if (number === EXPECTED && !isInHackedState) { //
                COUNT = number;
                EXPECTED++;
                yield shouldBeIsHacked(message, number); // Decide if the channel should be hacked or not (and send the bot message)
                return;
            }
            if (yield handleIsHacked(message, number)) { // The one case when  message is sent and it's a number, and it's the "hacked bot"
                return;
            }
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
function decrementHackedCounter(remainingMinutes, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        const intervalMs = (remainingMinutes / 2) * 60 * 1000;
        let firstSkipped = false;
        function delay(ms) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => setTimeout(resolve, ms));
            });
        }
        while (true) {
            if (firstSkipped) {
                yield mutex.lock();
                try {
                    isDecrementing = true;
                    if (!isInHackedState) {
                        isDecrementing = false;
                        mutex.unlock();
                        return;
                    }
                    if (new Date().getTime() >= TIMESTAMP_WHEN_HACK_TIMEOUT * 1000) {
                        cancelHack();
                        const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.error);
                        embed.title = "Mission échouée";
                        embed.description = "Vous n'avez pas réussi à arrêter l'Automaton, heureusement il a décidé de partir tout seul...";
                        (0, embeds_1.sendEmbed)(embed, channel);
                        return;
                    }
                    COUNT = Math.max(0, COUNT - 1);
                    EXPECTED = COUNT + 1;
                    if (!choosenMember) {
                        (0, messages_1.sendMessageToInfoChannel)("Impossible to have the choosenMember name in the decrementHackedCounter");
                        return;
                    }
                    const web = new webhook_1.WebHook(channel, webhookMember[choosenMember][0]);
                    web.send(COUNT.toString());
                }
                finally {
                    mutex.unlock();
                }
            }
            firstSkipped = true;
            yield delay(intervalMs);
        }
    });
}
function cancelHack() {
    isInHackedState = false;
    actualStratagemCodeExpectedIndex = 0;
    choosenMember = null;
    choosenStratagem = null;
    isDecrementing = false;
}
function handleResolveStratagemCode(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!choosenStratagem) {
                (0, messages_1.sendMessageToInfoChannel)("choosenStratagem is null, can't check if the bot is in hacked state");
                return;
            }
            if (!stratagems[choosenStratagem]) {
                (0, messages_1.sendMessageToInfoChannel)("stratagems[choosenStratagem] is null, can't check if the bot is in hacked state");
                return;
            }
            if (message.content == stratagems[choosenStratagem][actualStratagemCodeExpectedIndex]) {
                actualStratagemCodeExpectedIndex++;
                if (actualStratagemCodeExpectedIndex >= stratagems[choosenStratagem].length) {
                    cancelHack();
                    const embed = (0, embeds_1.createEmbed)();
                    embed.title = "Automaton Détruit !";
                    embed.description = `Félicitation, vous avez détruit l'automaton infiltré, malheureusement la Super Terre, n'ayant pas fait de backup, il faut recommancer le compteur à partir de **${COUNT}**`;
                    const channel = yield (0, channels_1.searchClientChannel)(client_1.client, message.channelId);
                    if (!channel) {
                        (0, messages_1.sendMessageToInfoChannel)("No channel to send the hacked message");
                        isInHackedState = false;
                        return false;
                    }
                    (0, embeds_1.sendEmbed)(embed, channel);
                    (0, messages_1.sendMessage)(COUNT.toString(), channel);
                    console.log(EXPECTED);
                }
                return;
            }
            const emojiCount = countAuthorizedEmojisInMessage(message.content.trim());
            if (emojiCount >= 2) {
                yield replyAndDeleteReply(message, "Vous devez envoyer chaque partie du code séparément");
                message.delete();
            }
            else if (emojiCount === 1) {
                yield replyAndDeleteReply(message, "Mauvais code de stratagème");
                message.delete();
            }
            return;
        }
        catch (error) {
            console.error(error);
            (0, messages_1.sendMessageToInfoChannel)(`Impossible de handleResolveStratagemCode : ${error}`);
        }
    });
}
function countAuthorizedEmojisInMessage(content) {
    let count = 0;
    for (const emoji of authorizedEmoji) {
        let startIndex = 0;
        while (true) {
            const index = content.indexOf(emoji, startIndex);
            if (index === -1)
                break;
            count++;
            startIndex = index + emoji.length;
        }
    }
    return count;
}
/**
 * If the channel is "hacked" (message send by a bot (webhook))
 */
function handleIsHacked(message, number) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (message.author.bot) {
                yield (0, messages_1.sendMessageToInfoChannel)(`<#1329074144289099807> overwritten by bot <@${message.author.id}>: ${message.content}`);
                COUNT = number;
                EXPECTED = number + 1;
                choosenStratagem = getRandomStratagem(stratagems);
                if (!choosenStratagem) {
                    (0, messages_1.sendMessageToInfoChannel)("Impossible to choose the stratagem");
                    isInHackedState = false;
                    return false;
                }
                const strataCode = stratagems[choosenStratagem];
                if (!strataCode) {
                    (0, messages_1.sendMessageToInfoChannel)("Impossible to choose the strata code");
                    isInHackedState = false;
                    return false;
                }
                if (!isDecrementing) {
                    const minutesRemaining = 5 + (strataCode.length * 5);
                    const timestamp = Math.floor((Date.now() + minutesRemaining * 60 * 1000) / 1000);
                    TIMESTAMP_WHEN_HACK_TIMEOUT = timestamp;
                    const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.red);
                    embed.title = `Oh non ! Un ${choosenMember} à hacké le <#${message.channelId}> !`;
                    embed.description = `### Vite, arrêtez le en lui envoyant une ${choosenStratagem} !`;
                    embed.fields = [
                        { name: "Code stratagème à réaliser", value: (strataCode === null || strataCode === void 0 ? void 0 : strataCode.join(" ")) || "" },
                        { name: "Temps restant : ", value: `<t:${timestamp}:R>` }
                    ];
                    decrementHackedCounter(minutesRemaining, message.channel);
                    const channel = yield (0, channels_1.searchClientChannel)(client_1.client, message.channelId);
                    if (!channel) {
                        (0, messages_1.sendMessageToInfoChannel)("No channel to send the hacked message");
                        isInHackedState = false;
                        return false;
                    }
                    (0, embeds_1.sendEmbed)(embed, channel);
                }
                return true;
            }
        }
        catch (error) {
            console.error(error);
            (0, messages_1.sendMessageToInfoChannel)(`Impossible to handleIsHacked : ${error}`);
            isInHackedState = false;
        }
        return false;
    });
}
/**
 * Decide if the channel should be hacked or not (1% of being hacked)
 */
function shouldBeIsHacked(message, number) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Math.random() < 0.01 && !isInHackedState) {
            (0, messages_1.sendMessageToInfoChannel)(`L'automaton a pop dans ${message.channelId}`);
            isInHackedState = true;
            choosenMember = getRandomWebhookMember(webhookMember);
            if (!choosenMember) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible te select a webhook member"));
                return;
            }
            const member = webhookMember[choosenMember];
            if (!member) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible te select a webhook member 2"));
                return;
            }
            const hook = new webhook_1.WebHook(message.channel, member[0]);
            yield hook.send((number - member[1]).toString());
            return;
        }
        return;
    });
}
function getRandomWebhookMember(obj) {
    const keys = Object.keys(obj);
    if (keys.length === 0)
        return null;
    const randomIndex = Math.floor(Math.random() * keys.length);
    const key = keys[randomIndex];
    if (!key)
        return null;
    return key;
}
function getRandomStratagem(obj) {
    const keys = Object.keys(obj);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex] || null;
}
// -------------------------------------------------------------------------------- //
function handleNonNumeric(message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const member = yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(message.author.id));
            if (member && (0, members_1.checkIfApplyMember)(member)) {
                yield replyAndDeleteReply(message, `Le message doit commencer par un nombre :\n> - 12 exemple\n-# Ceci n'est pas compté comme une erreur`);
            }
            message.delete();
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
            message.delete();
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
