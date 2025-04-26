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
let COUNT = 0;
let EXPECTED = COUNT;
let mutex = new SimpleMutex_1.SimpleMutex();
const timeToWait = 24 * 60 * 60; // 24 hour for the futur timeout
const errorRateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, timeToWait * 1000); // keeping the "error log" for 24 hours
function initializeCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mutex.lock();
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.counterChannel);
            if (!channel) {
                const channel2 = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.logChannelId);
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
function incrementCounter(message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield mutex.lock();
            const number = parseInt(message.content.trim(), 10);
            if (!isNaN(number)) {
                if (number == EXPECTED) {
                    COUNT = number;
                    EXPECTED++;
                    //await message.react("✅");
                }
                else {
                    //await message.react("❌")
                    // Ajout de la condition sur la différence
                    let msg = ":warning: Fait attention, ce n'est pas le bon nombre... :eyes:";
                    if (Math.abs(number - EXPECTED) > 20) {
                        try {
                            const member = yield message.guild.members.fetch(message.author.id);
                            if (member && (0, members_1.checkIfApplyMember)(member)) {
                                if (errorRateLimiter.take(message.author.id)) {
                                    try {
                                        yield ((_a = message.member) === null || _a === void 0 ? void 0 : _a.timeout(timeToWait * 1000)); // timeToWait is en minutes
                                    }
                                    catch (e) {
                                        console.error(e);
                                    }
                                }
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                        msg = ":warning: Fait vraiment attention, c'est pas bien le troll du <#1329074144289099807>..., la prochaine fois c'est 24h de TO :eyes:";
                    }
                    else if (Math.abs(number - EXPECTED) > 5) {
                        const member = yield message.guild.members.fetch(message.author.id);
                        if (member && (0, members_1.checkIfApplyMember)(member)) {
                            //if (errorRateLimiter.take(message.author.id)) {
                            try {
                                yield ((_b = message.member) === null || _b === void 0 ? void 0 : _b.timeout(timeToWait * 1000)); // timeToWait is en minutes
                            }
                            catch (e) {
                                console.error(e);
                            }
                            //}
                        }
                    }
                    (0, messages_1.sendMessageToInfoChannel)(`<@${message.author.id}> a loupé son compteur (${number} à la place de ${EXPECTED}).\nVérification aux environs de ce message : ${message.url} :/`);
                    const reply = yield message.reply((0, embeds_1.returnToSendEmbed)((0, embeds_1.createErrorEmbed)(msg)));
                    setTimeout(() => {
                        reply.delete().catch(() => { });
                    }, 7000);
                    message.delete();
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
