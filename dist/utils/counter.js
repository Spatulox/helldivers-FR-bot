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
const rateLimiter_1 = require("./server/rateLimiter");
const promises_1 = require("timers/promises");
let COUNT = 0;
let EXPECTED = COUNT;
let mutex = new SimpleMutex_1.SimpleMutex();
const HOUR_12 = 12 * 60 * 60; // 12 hour for the futur timeout
const HOUR_1 = 1 * 60 * 60;
const maxLittleError = 3;
const maxBigError = 1;
const errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(maxBigError, HOUR_12 * 1000); // keeping the "error log" for 12 hours
const littleErrorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(maxLittleError, HOUR_1 * 1000); // keeping the "error log" for 1 hour
function initializeCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mutex.lock();
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.counterChannel);
            if (!channel) {
                const channel2 = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
                if (channel2) {
                    (0, embeds_1.sendEmbedErrorMessage)("Counter channel is null T_T", channel2);
                }
                else {
                    (0, messages_1.sendMessage)("Channel counter is null WELP");
                }
                return;
            }
            if (channel && !channel.isTextBased())
                return;
            const messages = yield channel.messages.fetch({ limit: 20 });
            let firstNumberFound = false;
            for (const message of messages.reverse().values()) {
                if (message.author.bot)
                    continue;
                const number = parseInt(message.content.trim(), 10);
                if (!isNaN(number)) {
                    if (!firstNumberFound) {
                        COUNT = number;
                        EXPECTED = number;
                        firstNumberFound = true;
                    }
                    if (number === EXPECTED) {
                        COUNT = number;
                        EXPECTED++;
                        try {
                            //await message.react("✅");
                        }
                        catch (e) {
                        }
                    }
                    else {
                        //await message.react("❌")
                    }
                }
            }
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
function hammingDistanceStr(a, b) {
    if (a.length !== b.length)
        return Infinity;
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            dist++;
    }
    return dist;
}
function isAdjacentSwap(a, b) {
    if (!a || !b || a.length !== b.length || a.length === 0)
        return false;
    for (let i = 0; i < a.length - 1; i++) {
        const arr = a.split('');
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        const new_a = arr.join('');
        if (new_a === b || hammingDistanceStr(new_a, b) < 2)
            return true;
    }
    return false;
}
function sendTheMessage(_a) {
    return __awaiter(this, arguments, void 0, function* ({ message, member, builtMsg, builtMsgAdmin = null, sendPrivately = false, timeoutDuration = null, }) {
        (0, messages_1.sendMessageReply)(message, (0, embeds_1.createErrorEmbed)(builtMsg), 10000);
        if (sendPrivately && member) {
            try {
                yield member.send((0, embeds_1.returnToSendEmbed)((0, embeds_1.createErrorEmbed)(builtMsg)));
            }
            catch (e) {
                console.error("Erreur lors de l'envoi du MP :", e);
            }
        }
        if (timeoutDuration && member) {
            try {
                yield member.timeout(timeoutDuration);
            }
            catch (e) {
                console.error("Erreur lors du timeout :", e);
            }
        }
        if (builtMsgAdmin) {
            try {
                const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor2.botColor);
                embed.title = "Erreur Compteur";
                embed.description = builtMsgAdmin;
                const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.adminChannel);
                const channel2 = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
                if (channel) {
                    (0, embeds_1.sendEmbed)(embed, channel);
                    (0, embeds_1.sendEmbed)(embed, channel2);
                }
                else if (channel2) {
                    (0, embeds_1.sendEmbed)(embed, channel2);
                    (0, messages_1.sendMessageToInfoChannel)("Admin channel is null for some reason");
                }
                else {
                    (0, messages_1.sendMessageToAdminChannel)(builtMsgAdmin);
                    (0, messages_1.sendMessageToInfoChannel)(builtMsgAdmin);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    });
}
function incrementCounter(message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            yield mutex.lock();
            const match = message.content.match(/^\d+/);
            const number = match ? parseInt(match[0], 10) : NaN;
            const toNexTime12 = "La prochaine fois c'est 12h de TO :eyes:";
            const toNexTime1 = `Après ${maxLittleError} erreurs, c'est 1h de TO :eyes:`;
            const toMessage12 = "12h de TO :eyes:";
            const toMessage1 = "1h de TO :eyes:";
            const endMessageError = "-# Ceci est compté comme une **grosse** erreur";
            const endMessageLittleError = "-# Ceci est compté comme une **petite** erreur";
            const endMessageNoError = "-# Ceci n'est pas compté comme une erreur";
            if (!isNaN(number) && match) {
                const expectedStr = EXPECTED.toString();
                const numberStr = match.toString();
                if (numberStr.length !== expectedStr.length) {
                    let mesg = `:warning: Le nombre proposé (${number}) n'a pas le bon nombre de chiffres (attendu : ${EXPECTED}).`;
                    const member = yield message.guild.members.fetch(message.author.id);
                    let sendPrivately = false;
                    let timeoutDuration = null;
                    if (member) {
                        if ((0, rateLimiter_1.setGuildErrorLimiter)(member, errorRateLimiter)) {
                            mesg = `${mesg}\n${toMessage12}`;
                            timeoutDuration = HOUR_12 * 1000;
                            sendPrivately = true;
                        }
                        else {
                            mesg = `${mesg}\n${toNexTime12}\n${endMessageError}`;
                        }
                    }
                    yield sendTheMessage({
                        message: message,
                        member,
                        builtMsg: mesg,
                        sendPrivately,
                        timeoutDuration,
                    });
                    return;
                }
                if (number === EXPECTED) {
                    COUNT = number;
                    EXPECTED++;
                }
                else if (isAdjacentSwap(numberStr, expectedStr)) {
                    const msg = `:warning: Tu as inversé deux chiffres adjacents, attention !\n> Attendu : ${EXPECTED}\n> Donné : ${number}\n${endMessageNoError}`;
                    const member = yield message.guild.members.fetch(message.author.id);
                    if (!member) {
                        console.log("member is null");
                        return;
                    }
                    yield sendTheMessage({
                        message: message,
                        member,
                        builtMsg: msg,
                        sendPrivately: false
                    });
                    return;
                }
                else {
                    const dist = hammingDistanceStr(numberStr, expectedStr);
                    let msg = {
                        base: `:warning: Ce n'est pas le bon nombre... :eyes:\n`,
                        to: "",
                        expectedNumber: `Attendu: ${EXPECTED}`,
                        actualNumber: `Donné: ${number}`,
                        end: "",
                        littleError: "",
                        bigError: "",
                        reason: ""
                    };
                    let to = false;
                    let lightTo = false;
                    let forcedTO = false;
                    let globalTO = (to || lightTo || forcedTO);
                    let notifyAdmin = false;
                    let privateTOMessage = false;
                    const member = yield message.guild.members.fetch(message.author.id);
                    if (!member) {
                        console.log("member is null");
                        return;
                    }
                    function updateErrorMessage() {
                        let littleErrorAvancement = 0;
                        let ErrorAvancement = 0;
                        try {
                            littleErrorAvancement = littleErrorRateLimiter["limiters"][member.id].tokensThisInterval;
                        }
                        catch (e) { }
                        try {
                            ErrorAvancement = errorRateLimiter["limiters"][member.id].tokensThisInterval;
                        }
                        catch (e) { }
                        msg.littleError = `${littleErrorAvancement}/${maxLittleError} ${littleErrorAvancement >= maxLittleError ? "(max atteint)" : ""}`;
                        msg.bigError = `${ErrorAvancement}/${maxBigError} ${ErrorAvancement >= maxBigError ? "(max atteint)" : ""}`;
                    }
                    //More than tolerated errors && To if an error is already saved
                    if (dist > Math.floor(numberStr.length / 2)) {
                        notifyAdmin = true;
                        to = true;
                        msg.base = `:warning: 2 Fait vraiment attention :/`;
                        msg.to = `${toNexTime12}`;
                        msg.end = `${endMessageError}`;
                    }
                    // All number is the expected number is false or is longer than expected && mandatory TO even if there is 0 errors before
                    if (dist >= Math.floor(numberStr.length / 1.3)) {
                        forcedTO = true;
                        notifyAdmin = true;
                        msg.base = `:warning: Ce n'est pas du tout le bon nombre.`;
                        msg.to = `${toMessage12}`;
                        msg.end = `${endMessageError}`;
                        msg.reason = "Troll";
                    }
                    // Tolerated errors
                    if (!(dist == 1 && EXPECTED - number > 5) && dist <= Math.floor(numberStr.length / 2)) {
                        msg.base = `:warning: Ce n'est pas le bon nombre.`;
                        msg.end = `${endMessageLittleError} (${maxLittleError} max)`;
                        msg.to = toNexTime1;
                        to = false;
                        lightTo = true;
                        notifyAdmin = true;
                    }
                    globalTO = (to || lightTo || forcedTO);
                    const isApplyMember = (0, members_1.checkIfApplyMember)(member);
                    if (globalTO) {
                        try {
                            if (member && isApplyMember) {
                                if (lightTo && (0, rateLimiter_1.setGuildErrorLimiter)(member, littleErrorRateLimiter)) {
                                    privateTOMessage = true;
                                    msg.to = toMessage1;
                                    msg.end = "";
                                    yield ((_a = message.member) === null || _a === void 0 ? void 0 : _a.timeout(HOUR_1 * 1000));
                                }
                                else if (forcedTO || (to && (0, rateLimiter_1.setGuildErrorLimiter)(member, errorRateLimiter))) {
                                    privateTOMessage = true;
                                    msg.to = toMessage12;
                                    msg.end = "";
                                    yield ((_b = message.member) === null || _b === void 0 ? void 0 : _b.timeout(HOUR_12 * 1000));
                                }
                            }
                            else {
                                console.log("no member or doesn't apply to member");
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                    yield (0, promises_1.setTimeout)(500); // If not set, the next function will not works for some reason ?
                    updateErrorMessage();
                    let reason = (globalTO) && msg.littleError.includes(`${maxLittleError}/${maxLittleError}`) || msg.bigError.includes(`${maxBigError}/${maxBigError}`) ? "> Raison : Trop d'erreurs" : "";
                    reason = msg.reason != "" && (globalTO) ? `> Raison : ${msg.reason}` : reason;
                    let builtMsgAdmin = null;
                    if (notifyAdmin) {
                        builtMsgAdmin = `<@${message.author.id}> a loupé son compteur:
                                    > Attendu : ${EXPECTED}
                                    > Donné : ${number}
                                    > Message : ${(globalTO) ? `${msg.to}` : "Aucune sanction appliquée automatiquement."}
                                    ${reason != "" ? reason : ""}\n## Avancement des erreurs :
                                    > - Nombre de Petites erreurs : ${isApplyMember ? "N/A" : msg.littleError}
                                    > - Nombre de Grosses erreurs : ${isApplyMember ? "N/A" : msg.bigError}
                                    
                                    Vérification aux environs de ce message : ${message.url} :/`;
                    }
                    let builtMsg = `# ${msg.base}
                                > ${msg.expectedNumber}
                                > ${msg.actualNumber}
                                > Message : ${msg.to}
                                ${reason != "" ? reason : ""}\n## Avancement des erreurs :
                                > - Petite erreur : ${isApplyMember ? "N/A" : msg.littleError}
                                > - Grosse erreur : ${isApplyMember ? "N/A" : msg.bigError}\n${msg.end}`;
                    yield sendTheMessage({
                        message: message,
                        member,
                        builtMsg,
                        builtMsgAdmin,
                        sendPrivately: privateTOMessage
                    });
                }
            }
            else {
                const member = yield ((_c = message.guild) === null || _c === void 0 ? void 0 : _c.members.fetch(message.author.id));
                if (member && (0, members_1.checkIfApplyMember)(member)) {
                    (0, messages_1.sendMessageReply)(message, (0, embeds_1.createErrorEmbed)(`Le message doit forcément contenir un nombre au début du message :\n
                    > - '12 exemple'\n${endMessageNoError}`), 10000);
                }
            }
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
