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
exports.AutomatonIntrusion = void 0;
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const webhook_1 = require("../../utils/messages/webhook");
const channels_1 = require("../../utils/guilds/channels");
const config_json_1 = __importDefault(require("../../config.json"));
const client_1 = require("../../utils/client");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const UnitTime_1 = require("../../utils/times/UnitTime");
const embeds_1 = require("../../utils/messages/embeds");
const constantes_1 = require("../../utils/constantes");
let oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
const left = { unicode: "⬅️", custom: "<:HD2FR_KeyLeft:1221201626816053408>" };
const right = { unicode: "➡️", custom: "<:HD2FR_KeyRight:1221201658151960667>" };
const up = { unicode: "⬆️", custom: "<:HD2FR_KeyUp:1221201670479024188>" };
const down = { unicode: "⬇️", custom: "<:HD2FR_KeyDown:1221201613226512505>" };
class AutomatonIntrusion {
    constructor(targetChannel, options) {
        this.targetChannel = targetChannel;
        this._choosenMember = null;
        this._choosenStratagem = null;
        this.actualStratagemCodeExpectedIndex = 0;
        this.isInHackedState = false;
        this.isDecrementing = false;
        this.stepEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        this.callbacks = options !== null && options !== void 0 ? options : {};
        this.authorizedEmoji = [
            right.unicode, up.unicode, down.unicode, left.unicode,
            right.custom, up.custom, down.custom, left.custom
        ];
        this.stratagems = {
            "BOMBE DE 500kg": [up, right, down, down, down],
            "FRAPPE AÉRIENNE": [up, right, down, up],
            "MISSILE AIR-SOL DE 110mm": [up, right, up, left],
            "HELLBOMB": [down, up, left, down, up, right, down, up],
            "FRAPPE DE CANON ÉLECTROMAGNÉTIQUE ORBITAL": [right, up, down, down, right],
            "FRAPPE ORBITALE PRÉCISE": [right, right, up]
        };
        this.webhookMember = {
            "maraudeur": ["M4R4UD3R", 1]
        };
    }
    get isHacked() { return this.isInHackedState; }
    get choosenMember() { return this._choosenMember; }
    get choosenStratagem() { return this._choosenStratagem; }
    get choosenStratagemCode() { return this._choosenStratagem ? this.stratagems[this._choosenStratagem] : [{ unicode: "", custom: "" }]; }
    get stratagemStep() { return this.actualStratagemCodeExpectedIndex; }
    get currentStratagemLength() {
        var _a, _b;
        return this.choosenStratagem ? (_b = (_a = this.stratagems[this.choosenStratagem]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 : 0;
    }
    get currentStratagemExpectedEmoji() {
        var _a;
        if (!this.choosenStratagem)
            return;
        const stratagem = (_a = this.stratagems) === null || _a === void 0 ? void 0 : _a[this.choosenStratagem];
        return (stratagem &&
            this.actualStratagemCodeExpectedIndex < this.currentStratagemLength)
            ? stratagem[this.actualStratagemCodeExpectedIndex]
            : null;
    }
    /** Appelé pour résolution étape par étape du stratagème */
    handleStratagemInput(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, oneArrowPerPerson = false, canReset = false) {
            var _a, _b;
            const expectedEmoji = this.currentStratagemExpectedEmoji;
            const userInput = message.content.trim();
            if (!this.authorizedEmoji.includes(userInput)) {
                return false;
            }
            else if (oneArrowPerPerson && oneArrowPerPersonLimiter.take(message.author.id) && this.authorizedEmoji.includes(userInput)) {
                this.callbacks.onWrongStratagemStep && (yield this.callbacks.onWrongStratagemStep(message, `Vous ne pouvez pas jouer plusieurs fois, sauf si le code est réinitialisé`));
                message.deletable && (yield message.delete());
                return false;
            }
            if (!this.isInHackedState || !this._choosenStratagem)
                return false;
            if (expectedEmoji && (Object.values(expectedEmoji).includes(userInput))) {
                yield message.react("✅");
                yield message.react(`${this.stepEmoji[this.actualStratagemCodeExpectedIndex]}`);
                this.actualStratagemCodeExpectedIndex++;
                // Stratagème résolu !
                if (this.actualStratagemCodeExpectedIndex >= this.currentStratagemLength) {
                    if (oneArrowPerPerson) {
                        oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
                    }
                    this.endHack(true);
                }
            }
            else {
                if (!expectedEmoji) {
                    this.callbacks.onWrongStratagemStep
                        && (yield this.callbacks.onWrongStratagemStep(message, `Une erreur est survenue :/`));
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("No Expected Emoji"));
                    return false;
                }
                // Mauvaise étape de code, ou plusieurs emojis
                const emojiCount = this.countAuthorizedEmojisInMessage(userInput);
                if (emojiCount >= 2) {
                    this.callbacks.onWrongStratagemStep && (yield this.callbacks.onWrongStratagemStep(message, `Une étape à la fois! ${canReset ? ": Réinitialisation du stratagème, il faut reprendre du début" : ""}\nCode Stratagème : \n${((_a = this.stratagems[this._choosenStratagem]) === null || _a === void 0 ? void 0 : _a.map(emoji => emoji.custom).join(" ").toString()) || "null"}`));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                    }
                    if (oneArrowPerPerson) {
                        oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
                    }
                }
                else if (emojiCount === 1) {
                    this.callbacks.onWrongStratagemStep && (yield this.callbacks.onWrongStratagemStep(message, `Mauvaise étape de code ${canReset ? ": Réinitialisation du stratagème, il faut reprendre du début" : ""}\nCode Stratagème : \n${((_b = this.stratagems[this._choosenStratagem]) === null || _b === void 0 ? void 0 : _b.map(emoji => emoji.custom).join(" ").toString()) || "null"}`));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                    }
                    if (oneArrowPerPerson) {
                        oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
                    }
                }
                yield message.react("❌");
            }
            return true;
        });
    }
    endHack(success) {
        this.isInHackedState = false;
        this.actualStratagemCodeExpectedIndex = 0;
        this._choosenMember = null;
        this._choosenStratagem = null;
        this.callbacks.onHackEnd && this.callbacks.onHackEnd(success);
    }
    getRandomWebhookMember() {
        const keys = Object.keys(this.webhookMember);
        if (!keys.length)
            return null;
        return keys[Math.floor(Math.random() * keys.length)] || null;
    }
    getRandomStratagem() {
        const keys = Object.keys(this.stratagems);
        if (!keys.length)
            return null;
        return keys[Math.floor(Math.random() * keys.length)] || null;
    }
    countAuthorizedEmojisInMessage(content) {
        let count = 0;
        for (const emoji of this.authorizedEmoji)
            for (let idx = content.indexOf(emoji); idx !== -1; idx = content.indexOf(emoji, idx + emoji.length))
                count++;
        return count;
    }
    sendWebhook(content, channel_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const counterChannel = yield (0, channels_1.searchClientChannel)(client_1.client, channel_id ? channel_id : config_json_1.default.counterChannel);
            if (!counterChannel) {
                return null;
            }
            if (!this._choosenMember) {
                return null;
            }
            const member = this.webhookMember[this._choosenMember];
            if (!member) {
                return null;
            }
            const web = new webhook_1.WebHook(counterChannel, member[0]);
            const sentMessage = yield web.send(content);
            return sentMessage;
        });
    }
    static cleanOldIntrusion(client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
                if (!guild) {
                    console.error(`Guild with ID ${constantes_1.TARGET_GUILD_ID} not found or not in cache.`);
                    return;
                }
                for (const channel of guild.channels.cache.values()) {
                    // Filtrer les bons types de channels
                    if (channel instanceof discord_js_2.TextChannel ||
                        channel instanceof discord_js_1.NewsChannel ||
                        channel instanceof discord_js_1.ForumChannel) {
                        // Récupère tous les threads actifs du channel
                        const fetched = yield channel.threads.fetchActive();
                        for (const thread of fetched.threads.values()) {
                            if (thread.name === "Intrusion Automaton" &&
                                !thread.locked) {
                                if (!thread.locked) {
                                    yield thread.setLocked(true);
                                }
                                if (!thread.archived) {
                                    yield thread.setArchived(true);
                                }
                            }
                        }
                    }
                }
                console.log("Thread check finished");
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`cleanOldIntrusion : ${error}`));
            }
        });
    }
}
exports.AutomatonIntrusion = AutomatonIntrusion;
