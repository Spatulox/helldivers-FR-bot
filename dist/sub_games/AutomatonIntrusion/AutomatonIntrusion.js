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
const SimpleMutex_1 = require("../../utils/other/SimpleMutex");
const members_1 = require("../../utils/guilds/members");
const messages_1 = require("../../utils/messages/messages");
const emoji_1 = require("../../utils/other/emoji");
const Intrusion_1 = require("../../modules/Functionnalities/mini-games/Intrusion");
class AutomatonIntrusion {
    constructor(targetChannel, options) {
        this.targetChannel = targetChannel;
        this._choosenMember = null;
        this._choosenStratagem = null;
        this.actualStratagemCodeExpectedIndex = 0;
        this.rateArrowTimeLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.minute.MIN_05.toMilliseconds());
        this.oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
        this.isInHackedState = false;
        this.isDecrementing = false;
        this.possible_automaton_message = [
            "https://tenor.com/view/helldivers-helldivers-2-automaton-robot-stealing-baby-gif-16195253252211596411",
            "https://tenor.com/view/cyberstan-automaton-march-helldivers-helldivers-2-gif-537670437011192453",
        ];
        this._thread = null;
        this._AutomatonMessage = null;
        this.callbacks = options !== null && options !== void 0 ? options : {};
        this._authorizedEmoji = Intrusion_1.Intrusion.authorizedEmoji;
        this.stratagems = {
            "BOMBE DE 500kg": [[emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.down], "https://media.discordapp.net/attachments/1215438009479073812/1217534875565953134/HD2-E500.png"],
            "FRAPPE AÉRIENNE": [[emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up], "https://media.discordapp.net/attachments/1215438009479073812/1217534875939377152/HD2-EA.png"],
            "MISSILE AIR-SOL DE 110mm": [[emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.left], "https://media.discordapp.net/attachments/1215438009479073812/1217534875259764857/HD2-E110.png"],
            "HELLBOMB": [[emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.left, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up], "https://media.discordapp.net/attachments/1215438009479073812/1217565043957170246/HD2-Hellbomb.png"],
            "FRAPPE DE CANON ÉLECTROMAGNÉTIQUE ORBITAL": [[emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.right], "https://media.discordapp.net/attachments/1215438009479073812/1217557685935800480/HD2-ORS.png"],
            "FRAPPE ORBITALE PRÉCISE": [[emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.up], "https://media.discordapp.net/attachments/1215438009479073812/1217557685667369000/HD2-OPS.png"],
            "FRAPPE AU NAPALM": [[emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up], "https://media.discordapp.net/attachments/1215438009479073812/1217534873833701376/HD2-ENA.png"],
            "LASER ORBITAL": [[emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down], "https://media.discordapp.net/attachments/1215438009479073812/1217557685424361532/HD2-OL.png"],
            "FRAPPE CHIMIQUE ORBITALE": [[emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.right, emoji_1.ArrowEmojis.down, emoji_1.ArrowEmojis.up], "https://media.discordapp.net/attachments/1215438009479073812/1217557685159854111/HD2-OGS.png"],
        };
        this.webhookMember = {
            maraudeur: ["M4R4UD3R", 1],
        };
    }
    get isHacked() {
        return this.isInHackedState;
    }
    get authorizedEmoji() {
        return this._authorizedEmoji;
    }
    get stratagemsList() {
        return Object.keys(this.stratagems);
    }
    get choosenMember() {
        return this._choosenMember;
    }
    get choosenStratagem() {
        return this._choosenStratagem;
    }
    get choosenStratagemCode() {
        return this._choosenStratagem
            ? this.stratagems[this._choosenStratagem][0]
            : [{ unicode: "", custom: "" }];
    }
    get AutomatonMessage() {
        return this._AutomatonMessage;
    }
    get thread() {
        return this._thread;
    }
    get stratagemStep() {
        return this.actualStratagemCodeExpectedIndex;
    }
    get currentStratagemLength() {
        var _a, _b;
        return this.choosenStratagem
            ? (_b = (_a = this.stratagems[this.choosenStratagem]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0
            : 0;
    }
    get currentStratagemExpectedEmoji() {
        var _a;
        if (!this.choosenStratagem)
            return;
        const stratagem = (_a = this.stratagems) === null || _a === void 0 ? void 0 : _a[this.choosenStratagem];
        return stratagem &&
            this.actualStratagemCodeExpectedIndex < this.currentStratagemLength
            ? stratagem[this.actualStratagemCodeExpectedIndex]
            : null;
    }
    resetOneArrowPerPersonLimiter() {
        this.oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.day.DAY_01.toMilliseconds());
    }
    resetRateArrowTimeLimiter() {
        this.rateArrowTimeLimiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.minute.MIN_05.toMilliseconds());
    }
    /** Appelé pour résolution étape par étape du stratagème */
    handleStratagemInput(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, oneArrowPerPerson = false, canReset = false) {
            var _a, _b, _c, _d, _e, _f;
            const expectedEmoji = this.currentStratagemExpectedEmoji;
            const userInput = message.content.trim();
            let isTechnicianBool;
            let isTechnicianBypass = false;
            try {
                const member = yield (0, channels_1.searchClientGuildMember)(message.author.id);
                isTechnicianBool = member && (0, members_1.isTechnician)(member); // || member?.id === "556461959042564098" // Debug statement
            }
            catch (error) {
                isTechnicianBool = false;
            }
            if (message.content.includes("$skip") && isTechnicianBool) {
                const embed = (0, embeds_1.createEmbed)();
                embed.title = `Technician Bypass ${(_a = this.webhookMember[this._choosenMember || "NULL"]) === null || _a === void 0 ? void 0 : _a[0]}`;
                embed.description = `<@${message.author.id}> utilisé son droit de bypass pour fermer le mini-jeu Automaton Intrusion : ${(_b = this._AutomatonMessage) === null || _b === void 0 ? void 0 : _b.url}`;
                (0, embeds_1.sendEmbedToInfoChannel)(embed);
                (0, embeds_1.sendEmbedToAdminChannel)(embed);
                this.endHack(true);
                return true;
            }
            if (!this._authorizedEmoji.includes(userInput)) {
                return false;
            }
            else if (oneArrowPerPerson &&
                this.oneArrowPerPersonLimiter.take(message.author.id) &&
                this._authorizedEmoji.includes(userInput)) {
                if (!isTechnicianBool) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Vous ne pouvez pas jouer plusieurs fois, sauf si le code est réinitialisé`, true));
                    message.deletable && (yield message.delete());
                    return false;
                }
                else {
                    isTechnicianBypass = true;
                }
            }
            else if (!oneArrowPerPerson &&
                this.rateArrowTimeLimiter.take(message.author.id)) {
                if (!isTechnicianBool) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Veuillez attendre 5 minutes entre chaque envoi de flèche`, true));
                    message.deletable && (yield message.delete());
                    return false;
                }
                else {
                    isTechnicianBypass = true;
                }
            }
            if (!this.isInHackedState || !this._choosenStratagem)
                return false;
            if (expectedEmoji && Object.values(expectedEmoji).includes(userInput)) {
                if (isTechnicianBool && isTechnicianBypass) {
                    try {
                        const embed = (0, embeds_1.createEmbed)();
                        embed.title = `Technician Bypass ${(_c = this.webhookMember[this._choosenMember || "NULL"]) === null || _c === void 0 ? void 0 : _c[0]}`;
                        embed.description = `<@${message.author.id}> utilisé son droit de bypass pour envoyer une flèche dans le mini-jeu Automaton Intrusion ${message.url} : ${(_d = this._AutomatonMessage) === null || _d === void 0 ? void 0 : _d.url}`;
                        (0, embeds_1.sendEmbedToInfoChannel)(embed);
                        (0, embeds_1.sendEmbedToAdminChannel)(embed);
                        yield (0, messages_1.replyAndDeleteReply)(message, `Vous avez utilisé votre droit de bypass pour envoyer une flèche dans le mini-jeu Automaton Intrusion`);
                    }
                    catch (error) {
                        console.error(error);
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`handleStratagemInput AdminBypass : ${error}`));
                    }
                }
                yield message.react("✅");
                //await message.react(`${this.stepEmoji[this.actualStratagemCodeExpectedIndex]}`)
                this.actualStratagemCodeExpectedIndex++;
                // Stratagème résolu !
                if (this.actualStratagemCodeExpectedIndex >= this.currentStratagemLength) {
                    this.endHack(true);
                }
                return true;
            }
            else {
                if (!expectedEmoji) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Une erreur est survenue :/`, true));
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("No Expected Emoji"));
                    return false;
                }
                // Mauvaise étape de code, ou plusieurs emojis
                const emojiCount = this.countAuthorizedEmojisInMessage(userInput);
                if (emojiCount >= 2) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Une étape à la fois! ${canReset
                            ? ": Réinitialisation du stratagème, il faut reprendre du début"
                            : ""}\nCode Stratagème : \n${((_e = this.stratagems[this._choosenStratagem][0]) === null || _e === void 0 ? void 0 : _e.map((emoji) => emoji.custom).join(" ").toString()) || "null"}`, false));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                        this.resetRateArrowTimeLimiter();
                    }
                    if (oneArrowPerPerson) {
                        this.resetOneArrowPerPersonLimiter();
                    }
                }
                else if (emojiCount === 1) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Mauvaise étape de code ${canReset
                            ? ": Réinitialisation du stratagème, il faut reprendre du début"
                            : ""}\nCode Stratagème : \n${((_f = this.stratagems[this._choosenStratagem][0]) === null || _f === void 0 ? void 0 : _f.map((emoji) => emoji.custom).join(" ").toString()) || "null"}`, false));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                        this.resetRateArrowTimeLimiter();
                    }
                    if (oneArrowPerPerson) {
                        this.resetOneArrowPerPersonLimiter();
                    }
                }
                //await message.react("❌")
                return null;
            }
        });
    }
    endHack(success) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield ((_a = this._thread) === null || _a === void 0 ? void 0 : _a.delete());
                this.callbacks.onHackEnd &&
                    (yield this.callbacks.onHackEnd(success, this._AutomatonMessage));
                yield ((_b = this._AutomatonMessage) === null || _b === void 0 ? void 0 : _b.react("💥"));
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`endHack : ${error}`));
            }
            finally {
                this.resetRateArrowTimeLimiter();
                this.resetOneArrowPerPersonLimiter();
                this.isInHackedState = false;
                this.actualStratagemCodeExpectedIndex = 0;
                this._choosenMember = null;
                this._choosenStratagem = null;
                this._AutomatonMessage = null;
                this._thread = null;
            }
        });
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
    getRandomMessage(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex] ? arr[randomIndex] : "HAHAHA";
    }
    countAuthorizedEmojisInMessage(content) {
        let count = 0;
        for (const emoji of this._authorizedEmoji)
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
                yield this.mutex.lock();
                const guild = client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
                if (!guild) {
                    console.error(`Guild with ID ${constantes_1.TARGET_GUILD_ID} not found or not in cache.`);
                    return;
                }
                const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.yellow);
                embed.title = "Protocole de défense de la Super Terre";
                embed.description = `L'ennemi à été détruit par le protocole automatique de défense de la Super Terre.`;
                for (const channel of guild.channels.cache.values()) {
                    // Filtrer les bons types de channels
                    if (channel instanceof discord_js_2.TextChannel ||
                        channel instanceof discord_js_1.NewsChannel ||
                        channel instanceof discord_js_1.ForumChannel) {
                        // Récupère tous les threads actifs du channel
                        const fetched = yield channel.threads.fetchActive();
                        for (const thread of fetched.threads.values()) {
                            if (thread.name === "Intrusion Automaton") {
                                try {
                                    const starterMessage = yield thread.fetchStarterMessage();
                                    if (starterMessage) {
                                        starterMessage.reply((0, embeds_1.returnToSendEmbed)(embed));
                                    }
                                    else {
                                        (0, embeds_1.sendEmbed)(embed, thread.parent);
                                    }
                                }
                                catch (error) {
                                    console.error(`Error fetching starter message for thread ${thread.id} : `, error);
                                }
                                finally {
                                    yield thread.delete("Nettoyage automatique des threads d'intrusion Automaton");
                                }
                            }
                        }
                    }
                }
                (0, messages_1.sendMessageToInfoChannel)("AutomatonIntrusion Thread check finished");
                this.mutex.unlock();
            }
            catch (error) {
                console.error(error);
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`cleanOldIntrusion : ${error}`));
            }
        });
    }
}
exports.AutomatonIntrusion = AutomatonIntrusion;
AutomatonIntrusion.stepEmoji = [
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
];
AutomatonIntrusion.mutex = new SimpleMutex_1.SimpleMutex();
