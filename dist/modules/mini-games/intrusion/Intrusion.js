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
exports.Intrusion = void 0;
const discord_js_1 = require("discord.js");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const AutomatonIntrusionDiscord_1 = require("../../../sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const AutomatonIntrusionCounter_1 = require("../../../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const HDFR_1 = require("../../../utils/HDFR");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
const MessageManager_1 = require("../../../utils/Manager/MessageManager");
const Counter_1 = require("../../hdfr_public_functionnalities/Counter");
const CounterIntrusion_1 = require("./CounterIntrusion");
const GlobalIntrusion_1 = require("./GlobalIntrusion");
class Intrusion extends discord_module_1.MultiModule {
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: this.handleMessage.bind(this),
            [discord_js_1.Events.MessageReactionAdd]: (reaction, user) => { this.handleReaction(reaction, user); }
        };
    }
    constructor() {
        super();
        this.name = "Automaton Intrusion";
        this.description = "Gère les intrusions Automaton (Discord & Compteur)";
        this.globalIntrusionClass = new GlobalIntrusion_1.GlobalIntrusion();
        this.subModules = [
            Intrusion.counterIntrusionClass,
            this.globalIntrusionClass,
        ];
        this.initializeCounterIntrusion();
    }
    static get discordActive() { var _a; return !!((_a = this.discordIntrusion) === null || _a === void 0 ? void 0 : _a.isHacked); }
    static get counterActive() { var _a; return !!((_a = this.counterIntrusion) === null || _a === void 0 ? void 0 : _a.isHacked); }
    /** Vérifie si un maraudeur peut spawn dans le compteur */
    static get canSpawnCounter() {
        if (!this.counterIntrusionClass.enabled) {
            return false;
        }
        if (Intrusion.counterActive) {
            return false;
        }
        if (Intrusion._counterMsgCount >= Intrusion.MAX_COUNTER_MSGS) {
            return true;
        }
        Intrusion._counterMsgCount++;
        return false;
    }
    /** Reset compteur après spawn réussi */
    static resetCounterSpawn() {
        Intrusion._counterMsgCount = 0;
    }
    handleReaction(reaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (user.bot)
                return;
            if (!Intrusion.discordActive && !Intrusion.counterActive) {
                return;
            }
            if (reaction.emoji.name === '💥') {
                const maraudeurId = (_a = HDFR_1.HDFREmoji.maraudeur.match(/<:.+?(\d+)>/)) === null || _a === void 0 ? void 0 : _a[1];
                const reaction1 = reaction.message.reactions.cache.find(r => r.emoji.id === maraudeurId);
                if (reaction1) {
                    yield reaction1.remove();
                    yield reaction.users.remove(user.id);
                }
            }
        });
    }
    // 📨 Points d'entrée publics
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.enabled)
                return;
            if (message.guildId != HDFR_1.HDFRChannelID.guildID)
                return;
            (_a = Intrusion.discordIntrusion) === null || _a === void 0 ? void 0 : _a.handleMessage(message);
            // Check for the counter channel or threads in the counter channel
            if (message.channel.id == HDFR_1.HDFRChannelID.compteur || (message.channel.isThread() && message.channel.parentId === HDFR_1.HDFRChannelID.compteur)) {
                yield this.handleCounterIntrusion(message);
                return;
            }
            yield this.handleDiscordIntrusion(message);
        });
    }
    // 🎮 Logique Discord Intrusion (2%)
    handleDiscordIntrusion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Handle the stratagem resolution
            if (Intrusion.discordActive) {
                if (message.channel.isThread() && message.channel.id == ((_b = (_a = Intrusion.discordIntrusion) === null || _a === void 0 ? void 0 : _a.thread) === null || _b === void 0 ? void 0 : _b.id)) {
                    (_c = Intrusion.discordIntrusion) === null || _c === void 0 ? void 0 : _c.handleStratagemInput(message);
                    (_d = Intrusion.discordIntrusion) === null || _d === void 0 ? void 0 : _d.handleStratagemInput(message, true, true);
                }
                return;
            }
            // Trigger the Intrusion
            // 1. Vérifications préalables
            if (!this.canTriggerDiscord(message))
                return;
            // 2. Spawn + setup
            const guild = yield simplediscordbot_1.GuildManager.find(HDFR_1.HDFRChannelID.guildID);
            if (!guild)
                return;
            const member = yield this.fetchMember(guild, message.author.id);
            if (!member || MemberManager_1.MemberManager.isStaff(member) || Intrusion.discordActive)
                return;
            // 3. Création & déclenchement
            yield this.createDiscordIntrusion(guild, message, member);
        });
    }
    static determineCounterIntrusion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Since it's kinda hard to sync everything between the Counter Module dans le IntrusionModule, we separate this ad call it from the Counter Module.
            if (!this.canSpawnCounter)
                return;
            const probability = AutomatonIntrusionCounter_1.AutomatonIntrusionCounter.CURRENT_PROBA;
            if (Math.random() > probability)
                return;
            try {
                Intrusion.lastCounterMarauder = new Date();
                const result = yield Intrusion.counterIntrusion.triggerBreach(message, Counter_1.Counter.COUNT);
                if (result !== false) {
                    this.resetCounterSpawn();
                    Intrusion.counterIntrusion.startDecrementTimer(Counter_1.Counter.COUNT);
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Counter Intrusion failed: ${error}`));
                (_a = Intrusion.counterIntrusion) === null || _a === void 0 ? void 0 : _a.endHack(false);
            }
        });
    }
    // ⚙️ Logique Compteur Intrusion (6% jour / 4% nuit)
    handleCounterIntrusion(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (Intrusion.counterActive) {
                (_a = Intrusion.counterIntrusion) === null || _a === void 0 ? void 0 : _a.handleMessage(message);
                return;
            }
        });
    }
    // 🛠️ Initialisation
    initializeCounterIntrusion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Intrusion.counterIntrusion = new AutomatonIntrusionCounter_1.AutomatonIntrusionCounter(Counter_1.Counter.counterChannel, {
                    onHackStart: (_stratagem, _code, member) => this.logCounterStart(member),
                    onHackEnd: (success, message) => this.logCounterEnd(success, message),
                    onHackWarning: (message, str) => this.logCounterWarning(message, str),
                    onWrongStratagemStep: this.handleWrongStep.bind(this)
                });
                return !!Intrusion.counterIntrusion;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Counter init failed: ${error}`));
                return false;
            }
        });
    }
    // 📊 Callbacks unifiés
    createDiscordIntrusion(guild, message, _member) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            Intrusion.discordIntrusion = new AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord(guild, {
                onHackStart: (_stratagem, _code, member) => this.logDiscordStart(member),
                onHackEnd: (success, message) => this.logDiscordEnd(success, message),
                onWrongStratagemStep: this.handleWrongStep.bind(this)
            });
            try {
                Intrusion.lastGlobalMarauder = new Date();
                yield Intrusion.discordIntrusion.triggerBreach(message);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Discord Intrusion failed: ${error}`));
                (_a = Intrusion.discordIntrusion) === null || _a === void 0 ? void 0 : _a.endHack(false);
            }
        });
    }
    logDiscordStart(member) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const details = {
                author: member,
                channelUrl: (_b = (_a = Intrusion.discordIntrusion) === null || _a === void 0 ? void 0 : _a.AutomatonMessage) === null || _b === void 0 ? void 0 : _b.url,
                threadUrl: (_d = (_c = Intrusion.discordIntrusion) === null || _c === void 0 ? void 0 : _c.thread) === null || _d === void 0 ? void 0 : _d.url
            };
            const embed = this.createStartEmbed("Discord", details);
            yield MessageManager_1.MessageManager.sendToAdminChannel(embed);
            simplediscordbot_1.Bot.log.info(embed);
        });
    }
    logCounterStart(member) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const details = {
                author: member,
                channelUrl: (_b = (_a = Intrusion.counterIntrusion) === null || _a === void 0 ? void 0 : _a.AutomatonMessage) === null || _b === void 0 ? void 0 : _b.url,
                threadUrl: (_d = (_c = Intrusion.counterIntrusion) === null || _c === void 0 ? void 0 : _c.thread) === null || _d === void 0 ? void 0 : _d.url
            };
            const embed = this.createStartEmbed("Compteur", details);
            simplediscordbot_1.Bot.log.info(embed);
        });
    }
    logCounterWarning(message, str) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MessageManager_1.MessageManager.replyAndDeleteReply(message, str);
        });
    }
    logDiscordEnd(success, automatonMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.createEndEmbed(success, "Discord");
            if (automatonMessage) {
                yield automatonMessage.reply(simplediscordbot_1.EmbedManager.toMessage(embed));
            }
            Intrusion.discordIntrusion = null;
        });
    }
    logCounterEnd(success, automatonMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.createEndEmbed(success, "Compteur", Counter_1.Counter.COUNT);
            if (automatonMessage) {
                yield automatonMessage.reply(simplediscordbot_1.EmbedManager.toMessage(embed));
            }
            else {
                yield simplediscordbot_1.Bot.message.send(Counter_1.Counter.counterChannel, embed);
                yield simplediscordbot_1.Bot.message.send(Counter_1.Counter.counterChannel, Counter_1.Counter.COUNT.toString());
            }
        });
    }
    handleWrongStep(message, reason, autoDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = simplediscordbot_1.EmbedManager.create().setTitle("⚠️").setDescription(reason);
            const reply = yield message.reply(simplediscordbot_1.EmbedManager.toMessage(embed));
            if (autoDelete) {
                setTimeout(() => {
                    try {
                        reply.deletable && reply.delete();
                    }
                    catch (e) {
                        console.error(`handleWrongStratagemStep : ${e}`);
                    }
                }, simplediscordbot_1.Time.second.SEC_10.toMilliseconds());
            }
        });
    }
    // 🏗️ Helpers
    canTriggerDiscord(message) {
        /*
        console.log(Math.random() <= AutomatonIntrusionDiscord.PROBA)
        console.log(AutomatonIntrusionDiscord.authorizedChannelsToDetectActivity.includes(message.channel.id))
        console.log(Intrusion.globalCooldown.take("maraudeur"))
        console.log(message.guildId === HDFRChannelID.guildID)
        console.log(!Intrusion.discordActive)
        */
        if (!this.globalIntrusionClass.enabled) {
            return false;
        }
        const bool = Math.random() >= AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.PROBA &&
            !Intrusion.discordActive &&
            !message.author.bot &&
            message.guildId === HDFR_1.HDFRChannelID.guildID &&
            AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.authorizedChannelsToDetectActivity.includes(message.channel.id) &&
            !Intrusion.globalCooldown.take("maraudeur");
        return bool;
    }
    fetchMember(guild, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield guild.members.fetch(userId).catch(() => null);
        });
    }
    createStartEmbed(type, details) {
        const embed = simplediscordbot_1.EmbedManager.create().setTitle("🚨 Automaton Intrusion");
        embed.setDescription(`Nouvelle intrusion ${type.toLowerCase()} détectée :`);
        simplediscordbot_1.EmbedManager.fields(embed, [
            { name: "Auteur", value: details.author },
            { name: "Channel", value: details.channelUrl || "N/A" },
            { name: "Thread", value: details.threadUrl || "N/A" }
        ]);
        return embed;
    }
    createEndEmbed(success, type, count) {
        const embed = simplediscordbot_1.EmbedManager.create();
        if (success) {
            embed.setTitle("💥 Automaton détruit !");
            embed.setDescription(`Félicitations, l'automaton ${type.toLowerCase()} a été éliminé !`);
            if (count !== undefined) {
                embed.setDescription(`Félicitations, vous avez détruit l'automaton infiltré, malheureusement lors de l'explosion les backups se sont détruits, il faut recommencer le compteur à partir de ${count}`);
            }
        }
        else {
            embed.setColor(simplediscordbot_1.SimpleColor.error);
            embed.setTitle("😱 L'Automaton survit !");
            embed.setDescription(`L'intrusion ${type.toLowerCase()} n'a pas été stoppée...`);
        }
        return embed;
    }
}
exports.Intrusion = Intrusion;
Intrusion.counterIntrusionClass = new CounterIntrusion_1.CounterIntrusion();
// Instances singleton
Intrusion.discordIntrusion = null;
Intrusion.counterIntrusion = null;
// Rate limiting & spawning
Intrusion.MAX_COUNTER_MSGS = 20;
Intrusion._counterMsgCount = 0;
Intrusion.globalCooldown = new discord_js_rate_limiter_1.RateLimiter(1, simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds());
// Tracking
Intrusion.lastGlobalMarauder = null;
Intrusion.lastCounterMarauder = null;
