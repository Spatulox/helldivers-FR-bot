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
exports.ActivityTracker = exports.DEFAULT_ACTIVITY_CONFIG = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const ActivityIndex_1 = require("../activity/ActivityIndex");
/**
 * Réglages par défaut, surchargeables par serveur via le getter `config`.
 *
 * Les planchers sont exprimés par membre : pour 5 000 membres, la référence ne descend jamais sous
 * 2 messages / minute, 10 auteurs différents sur 15 minutes et 5 personnes en vocal.
 */
exports.DEFAULT_ACTIVITY_CONFIG = {
    bucketMs: simplediscordbot_1.Time.minute.MIN_01.toMilliseconds(),
    referencePeriodMs: simplediscordbot_1.Time.day.DAY_07.toMilliseconds(),
    smoothingMs: simplediscordbot_1.Time.minute.MIN_10.toMilliseconds(),
    normalization: { kind: "percentile", p: 0.95 },
    signals: {
        // Messages par minute
        messageRate: { kind: "rate", weight: 0.4, floorPerMember: 0.0004 },
        // Auteurs différents sur 15 minutes : 3 personnes qui spamment ne valent pas 40 qui discutent.
        // La fenêtre lisse déjà, le lissage exponentiel est donc raccourci.
        messageAuthors: {
            kind: "distinct", weight: 0.4, floorPerMember: 0.002,
            windowMs: simplediscordbot_1.Time.minute.MIN_15.toMilliseconds(),
            smoothingMs: simplediscordbot_1.Time.minute.MIN_05.toMilliseconds(),
        },
        // Personnes en vocal (hors AFK et hors bots), relevées à chaque tick
        voiceUsers: { kind: "gauge", weight: 0.2, floorPerMember: 0.001 },
    },
};
/**
 * Indice d'activité d'un serveur entre 0 et 1 (1 = heures de pointe de la semaine), calculé par
 * ActivityIndex à partir des messages (débit et auteurs distincts) et du vocal.
 *
 * Le module ne fait que collecter : il compte les messages à leur arrivée, relève le vocal et fait
 * avancer l'indice une fois par bucket. Les consommateurs lisent `activity.score()`,
 * `activity.signalScore(...)` ou `activity.snapshot()`.
 *
 * L'historique est persisté dans `<CACHE_FOLDER>/.utilscache/activity_index.json` tous les
 * PERSIST_EVERY_TICKS ticks, pour qu'un redémarrage ne fasse pas repartir la semaine de zéro.
 *
 * Intents : `GuildMessages` et `GuildVoiceStates` suffisent. Ni le contenu des messages ni la
 * liste des membres ne sont lus (`guild.memberCount` vient de l'événement de connexion).
 *
 * Chaque serveur en dérive une sous-classe qui fournit son serveur et ses salons ignorés.
 */
class ActivityTracker extends discord_module_1.ModuleWithCache {
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.handleMessage(message); }
        };
    }
    get config() {
        return exports.DEFAULT_ACTIVITY_CONFIG;
    }
    constructor() {
        super();
        this.name = "Activity Tracker";
        this.description = "Indice d'activité du serveur (messages, auteurs distincts, vocal), entre 0 et 1";
        this.cacheKey = "activity_index";
        this.ticksSinceWrite = 0;
        this.activity = new ActivityIndex_1.ActivityIndex(this.config);
        this.ready = this.loadCache()
            .then(() => { this.activity.loadState(this.cacheData); })
            .catch(error => console.log(`Chargement de l'historique d'activité : ${error}`));
        // Le timer est armé une seule fois et chaque tick teste this.enabled : le ModuleUI bascule
        // un module via toggle(), sans passer par enable()/disable() (voir Status)
        setInterval(() => void this.tick(), this.config.bucketMs);
    }
    initData() {
        return { bucketMs: 0, times: [], values: {}, smoothed: {}, peaks: {} };
    }
    handleMessage(message) {
        if (!message.inGuild() || message.guildId != this.guildId || message.author.bot)
            return;
        const ignored = this.ignoredChannelIds;
        const parentId = message.channel.isThread() ? message.channel.parentId : null;
        if (ignored.includes(message.channelId) || (parentId && ignored.includes(parentId)))
            return;
        this.activity.increment("messageRate");
        this.activity.see("messageAuthors", message.author.id);
    }
    tick() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.enabled) {
                    this.activity.skip();
                    return;
                }
                const guild = simplediscordbot_1.Bot.client.guilds.cache.get(this.guildId);
                if (!guild)
                    return;
                this.activity.set("voiceUsers", ActivityTracker.countVoiceUsers(guild));
                this.activity.tick(guild.memberCount);
                if (++this.ticksSinceWrite >= ActivityTracker.PERSIST_EVERY_TICKS) {
                    this.ticksSinceWrite = 0;
                    yield this.ready;
                    this.cacheData = this.activity.toState();
                    yield this.writeCache();
                }
            }
            catch (error) {
                console.log(`ActivityTracker.tick : ${error}`);
            }
        });
    }
    /** Personnes connectées en vocal, hors salon AFK et hors bots */
    static countVoiceUsers(guild) {
        return guild.voiceStates.cache.filter(state => {
            var _a, _b;
            return state.channelId != null &&
                state.channelId != guild.afkChannelId &&
                !((_b = (_a = state.member) === null || _a === void 0 ? void 0 : _a.user.bot) !== null && _b !== void 0 ? _b : false);
        }).size;
    }
}
exports.ActivityTracker = ActivityTracker;
/** Une écriture toutes les 10 minutes : l'historique d'une semaine pèse quelques centaines de Ko */
ActivityTracker.PERSIST_EVERY_TICKS = 10;
