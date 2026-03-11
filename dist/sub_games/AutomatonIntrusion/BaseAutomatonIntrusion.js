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
exports.BaseAutomatonIntrusion = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const discord_js_1 = require("discord.js");
const HelldiversStratagems_1 = require("../src/stratagems/HelldiversStratagems");
const MemberManager_1 = require("../../utils/Manager/MemberManager");
const MessageManager_1 = require("../../utils/Manager/MessageManager");
const MoneyManager_1 = require("../../modules/Functionnalities/hdfr_private_functionnalities/MoneyManager");
const HDFR_1 = require("../../utils/HDFR");
const emoji_1 = require("../../utils/emoji");
class BaseAutomatonIntrusion {
    constructor(targetChannel, options) {
        this.targetChannel = targetChannel;
        this._choosenMember = null;
        this._choosenStratagem = null;
        this.actualStratagemCodeExpectedIndex = 0;
        this.players = {};
        this.rateArrowTimeLimiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.minute.MIN_05.toMilliseconds());
        this.oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.day.DAY_01.toMilliseconds());
        this.isInHackedState = false;
        this.isDecrementing = false;
        this.possible_automaton_message = [
            "https://tenor.com/view/helldivers-helldivers-2-automaton-robot-stealing-baby-gif-16195253252211596411",
            "https://tenor.com/view/cyberstan-automaton-march-helldivers-helldivers-2-gif-537670437011192453",
            "https://tenor.com/view/helldivers2-helldive-automaton-arrowhead-cyberstan-gif-15180271924773402523",
            "https://tenor.com/view/automaton-helldivers-2-marching-robot-robots-gif-14090133636459797134",
            "https://tenor.com/view/helldivers-helldivers-2-automatons-freedom-liber-tea-gif-4704290022450713731"
        ];
        this.rp_messages = [
            "a branché une clé USB bizarre sur son PC",
            "a ouvert un mail suspect intitulé 'Vous avez gagné un iPhone !'",
            "a cliqué sur un lien douteux dans un message privé",
            "a téléchargé un fichier nommé 'setup_super_safe.exe'",
            "a oublié de mettre à jour son antivirus depuis 2015",
            "a désactivé le pare-feu 'juste pour voir si ça marche mieux'",
            "a accepté une invitation inconnue sur un vieux réseau social",
            "a tenté d'installer des mods venus d’un forum obscur",
            "a branché un disque dur inconnu trouvé dans un parking",
            "a essayé de pirater le wifi du voisin sans VPN",
            "a accepté les cookies sans lire les conditions",
            "a laissé son ordinateur sans verrouiller la session",
            "a lancé un script trouvé sur un forum russe",
            "a cliqué sur une publicité annonçant un concours Bitcoin",
            "a activé le mode développeur et tout a mal tourné",
            "a connecté son PC au réseau public du fast-food du coin",
            "a branché un périphérique inconnu en pensant que c’était une souris"
        ];
        this.rp_message_choosen = "";
        this._thread = null;
        this._AutomatonMessage = null;
        this.triggeredMessage = null;
        this.callbacks = options !== null && options !== void 0 ? options : {};
        this.stratagems = this.flattenHelldiversStratagems();
        this.webhookMember = {
            maraudeur: ["M4R4UD3R", 1],
        };
    }
    /**
     * Make the new HelldiversStratagem like the old stratagem list
     * @returns
     */
    flattenHelldiversStratagems() {
        const result = {};
        const category = Object.assign(Object.assign(Object.assign({}, HelldiversStratagems_1.HelldiversStratagems.Hangar), HelldiversStratagems_1.HelldiversStratagems["Orbital Cannons"]), {
            "FRAPPE ORBITALE AU GAZ": HelldiversStratagems_1.HelldiversStratagems.Bridge["FRAPPE ORBITALE AU GAZ"],
            "FRAPPE ORBITALE DE PRÉCISION": HelldiversStratagems_1.HelldiversStratagems.Bridge["FRAPPE ORBITALE DE PRÉCISION"],
            "FRAPPE ORBITALE EMS": HelldiversStratagems_1.HelldiversStratagems.Bridge["FRAPPE ORBITALE EMS"],
            "FRAPPE ORBITALE FUMIGÈNE": HelldiversStratagems_1.HelldiversStratagems.Bridge["FRAPPE ORBITALE FUMIGÈNE"],
            "HELLBOMB": HelldiversStratagems_1.HelldiversStratagems.Objectives.HELLBOMB,
            "ARTILLERIE SEAF": HelldiversStratagems_1.HelldiversStratagems.Objectives["ARTILLERIE SEAF"],
        });
        //console.log(category)
        for (const [name, [link, code]] of Object.entries(category)) {
            result[name] = [[...code], link]; // Invert the link/code (to avoid to rewrite this class) and make code mutable since in the HelldiversStratagem it's a readonly type
        }
        return result;
    }
    get isHacked() {
        return this.isInHackedState;
    }
    get threadName() {
        return "Intrusion Automaton";
    }
    static get threadName() {
        return "Intrusion Automaton";
    }
    get authorizedEmoji() {
        return BaseAutomatonIntrusion._authorizedEmoji;
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
    initializeHack() {
        this.isInHackedState = true;
        this.actualStratagemCodeExpectedIndex = 0;
        this._choosenMember = this.getRandomWebhookMember();
        this._choosenStratagem = this.getRandomStratagem();
        this.rp_message_choosen = this.chooseRpMessage();
    }
    resetHack() {
        this._AutomatonMessage = null;
        this.isInHackedState = false;
        this.triggeredMessage = null;
        this._thread = null;
    }
    chooseRpMessage() {
        return this.getRandomMessage(this.rp_messages);
    }
    get currentStratagemLength() {
        var _a, _b;
        return this.choosenStratagem
            ? (_b = (_a = this.stratagems[this.choosenStratagem][0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0
            : 0;
    }
    get currentStratagemExpectedEmoji() {
        var _a;
        if (!this.choosenStratagem)
            return;
        const stratagem = (_a = this.stratagems) === null || _a === void 0 ? void 0 : _a[this.choosenStratagem][0];
        return stratagem &&
            this.actualStratagemCodeExpectedIndex < this.currentStratagemLength
            ? stratagem[this.actualStratagemCodeExpectedIndex]
            : null;
    }
    resetOneArrowPerPersonLimiter() {
        this.oneArrowPerPersonLimiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.day.DAY_01.toMilliseconds());
    }
    resetRateArrowTimeLimiter() {
        this.rateArrowTimeLimiter = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.minute.MIN_05.toMilliseconds());
    }
    resetPlayers() {
        this.players = {};
    }
    /** Appelé pour résolution étape par étape du stratagème */
    handleStratagemInput(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, oneArrowPerPerson = false, canReset = false) {
            var _a, _b, _c, _d, _e, _f, _g;
            const expectedEmoji = this.currentStratagemExpectedEmoji;
            const userInput = message.content.trim();
            let isTechnicianBool;
            let isTechnicianBypass = false;
            try {
                const member = yield simplediscordbot_1.GuildManager.user.find(message.author.id, HDFR_1.HDFRChannelID.guildID);
                isTechnicianBool = member && MemberManager_1.MemberManager.isTechnician(member);
            }
            catch (error) {
                isTechnicianBool = false;
            }
            if (!message.author.bot) {
                this.players[message.author.id] = ((_a = this.players[message.author.id]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            if (message.content.includes("$skip") && isTechnicianBool) {
                const embed = simplediscordbot_1.EmbedManager.create();
                embed.setTitle(`Technician Bypass ${(_b = this.webhookMember[this._choosenMember || "NULL"]) === null || _b === void 0 ? void 0 : _b[0]}`);
                embed.setDescription(`<@${message.author.id}> utilisé son droit de bypass pour fermer le mini-jeu Automaton Intrusion : ${(_c = this._AutomatonMessage) === null || _c === void 0 ? void 0 : _c.url}`);
                simplediscordbot_1.Bot.log.info(embed);
                MessageManager_1.MessageManager.sendToAdminChannel(embed);
                this.endHack(true);
                return true;
            }
            const emojiCount = this.countAuthorizedEmojisInMessage(userInput);
            if (emojiCount == 0) {
                return false;
            }
            if (emojiCount == 1 && !BaseAutomatonIntrusion._authorizedEmoji.includes(userInput)) {
                return false;
            }
            else if (emojiCount == 1 &&
                oneArrowPerPerson &&
                this.oneArrowPerPersonLimiter.take(message.author.id) &&
                BaseAutomatonIntrusion._authorizedEmoji.includes(userInput)) {
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
            if (expectedEmoji && Object.values(expectedEmoji).includes(userInput) && emojiCount == 1) {
                if (isTechnicianBool && isTechnicianBypass) {
                    try {
                        const embed = simplediscordbot_1.EmbedManager.create();
                        embed.setTitle(`Technician Bypass ${(_d = this.webhookMember[this._choosenMember || "NULL"]) === null || _d === void 0 ? void 0 : _d[0]}`);
                        embed.setDescription(`<@${message.author.id}> utilisé son droit de bypass pour envoyer une flèche dans le mini-jeu Automaton Intrusion ${message.url} : ${(_e = this._AutomatonMessage) === null || _e === void 0 ? void 0 : _e.url}`);
                        simplediscordbot_1.Bot.log.info(embed);
                        MessageManager_1.MessageManager.sendToAdminChannel(embed);
                        yield MessageManager_1.MessageManager.replyAndDeleteReply(message, `Vous avez utilisé votre droit de bypass pour envoyer une flèche dans le mini-jeu Automaton Intrusion`);
                    }
                    catch (error) {
                        console.error(error);
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`handleStratagemInput AdminBypass : ${error}`));
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
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error("No Expected Emoji"));
                    return false;
                }
                // Mauvaise étape de code, ou plusieurs emojis
                if (emojiCount >= 2) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Une étape à la fois! ${canReset
                            ? ": Réinitialisation du stratagème, il faut reprendre du début"
                            : ""}\nCode Stratagème : \n${((_f = this.stratagems[this._choosenStratagem][0]) === null || _f === void 0 ? void 0 : _f.map((emoji) => emoji.custom).join(" ").toString()) || "null"}`, false));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                        this.resetRateArrowTimeLimiter();
                        this.resetPlayers();
                    }
                    if (oneArrowPerPerson) {
                        this.resetOneArrowPerPersonLimiter();
                        this.resetPlayers();
                    }
                }
                else if (emojiCount === 1) {
                    this.callbacks.onWrongStratagemStep &&
                        (yield this.callbacks.onWrongStratagemStep(message, `Mauvaise étape de code ${canReset
                            ? ": Réinitialisation du stratagème, il faut reprendre du début"
                            : ""}\nCode Stratagème : \n${((_g = this.stratagems[this._choosenStratagem][0]) === null || _g === void 0 ? void 0 : _g.map((emoji) => emoji.custom).join(" ").toString()) || "null"}`, false));
                    if (canReset) {
                        this.actualStratagemCodeExpectedIndex = 0;
                        this.resetRateArrowTimeLimiter();
                        this.resetPlayers();
                    }
                    if (oneArrowPerPerson) {
                        this.resetOneArrowPerPersonLimiter();
                        this.resetPlayers();
                    }
                }
                //await message.react("❌")
                return false;
            }
        });
    }
    endHack(success) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                this.callbacks.onHackEnd &&
                    (yield this.callbacks.onHackEnd(success, this._AutomatonMessage));
                yield ((_a = this._thread) === null || _a === void 0 ? void 0 : _a.delete());
                yield ((_b = this._AutomatonMessage) === null || _b === void 0 ? void 0 : _b.react("💥"));
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`endHack : ${error}`));
            }
            finally {
                this.giveRewardsToPlayers();
                this.resetRateArrowTimeLimiter();
                this.resetOneArrowPerPersonLimiter();
                this.resetPlayers();
                this.actualStratagemCodeExpectedIndex = 0;
                this._choosenMember = null;
                this._choosenStratagem = null;
                this.resetHack();
            }
        });
    }
    giveRewardsToPlayers() {
        const money = new MoneyManager_1.MoneyManager();
        for (const player in this.players) {
            money.addRole(HDFR_1.HDFRChannelID.guildID, player, HDFR_1.HDFRRoles.senateur["2+"]);
        }
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
        for (const emoji of BaseAutomatonIntrusion._authorizedEmoji)
            for (let idx = content.indexOf(emoji); idx !== -1; idx = content.indexOf(emoji, idx + emoji.length))
                count++;
        return count;
    }
    sendWebhook(content, channel_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const counterChannel = yield simplediscordbot_1.GuildManager.channel.text.find(channel_id);
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
            const web = new simplediscordbot_1.WebhookManager(counterChannel, member[0]);
            return yield web.send(content);
        });
    }
    static cleanOldIntrusion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.mutex.lock();
                const guild = yield simplediscordbot_1.GuildManager.find(HDFR_1.HDFRChannelID.guildID);
                if (!guild) {
                    console.error(`Guild with ID ${HDFR_1.HDFRChannelID.guildID} not found or not in cache.`);
                    return;
                }
                const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.yellow);
                embed.setTitle("Protocole de défense de la Super Terre");
                embed.setDescription(`L'ennemi à été détruit par le protocole automatique de défense de la Super Terre.`);
                for (const channel of guild.channels.cache.values()) {
                    // Filtrer les bons types de channels
                    if (channel instanceof discord_js_1.TextChannel ||
                        channel instanceof discord_js_1.NewsChannel ||
                        channel instanceof discord_js_1.ForumChannel) {
                        // Récupère tous les threads actifs du channel
                        const fetched = yield channel.threads.fetchActive();
                        for (const thread of fetched.threads.values()) {
                            if (thread.name === this.threadName) {
                                try {
                                    if (thread.archived) {
                                        continue;
                                    }
                                    const starterMessage = yield thread.fetchStarterMessage();
                                    if (starterMessage) {
                                        starterMessage.reply(simplediscordbot_1.EmbedManager.toMessage(embed));
                                    }
                                    else {
                                        simplediscordbot_1.Bot.message.send(thread.parent, embed);
                                    }
                                }
                                catch (error) {
                                    console.error(`Error fetching starter message for thread ${thread.id} : `, error);
                                }
                                finally {
                                    try {
                                        yield thread.delete("Nettoyage automatique des threads d'intrusion Automaton");
                                    }
                                    catch (error) {
                                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Impossible to delete a thread : ${error}`));
                                    }
                                }
                            }
                        }
                    }
                }
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.description("AutomatonIntrusion Thread check finished"));
                this.mutex.unlock();
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`cleanOldIntrusion : ${error}`));
            }
            finally {
                this.mutex.unlock();
            }
        });
    }
}
exports.BaseAutomatonIntrusion = BaseAutomatonIntrusion;
BaseAutomatonIntrusion._authorizedEmoji = [
    emoji_1.ArrowEmojis.right.unicode, emoji_1.ArrowEmojis.up.unicode, emoji_1.ArrowEmojis.down.unicode, emoji_1.ArrowEmojis.left.unicode,
    emoji_1.ArrowEmojis.right.custom, emoji_1.ArrowEmojis.up.custom, emoji_1.ArrowEmojis.down.custom, emoji_1.ArrowEmojis.left.custom
];
BaseAutomatonIntrusion.stepEmoji = [
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
BaseAutomatonIntrusion.mutex = new simplediscordbot_1.SimpleMutex();
