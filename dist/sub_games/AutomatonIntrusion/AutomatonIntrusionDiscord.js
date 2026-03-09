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
exports.AutomatonIntrusionDiscord = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/HDFR");
const AutomatonIntrusion_1 = require("./AutomatonIntrusion");
const Intrusion_1 = require("../../modules/Functionnalities/mini-games/Intrusion");
class AutomatonIntrusionDiscord extends AutomatonIntrusion_1.AutomatonIntrusion {
    static get authorizedChannelsToSpawn() {
        return [HDFR_1.HDFRChannelID.mini_jeu];
    }
    static get authorizedChannelsToDetectActivity() {
        return [
            HDFR_1.HDFRChannelID.blabla_jeu,
            HDFR_1.HDFRChannelID.blabla_hors_sujet,
            HDFR_1.HDFRChannelID.galerie
        ];
    }
    static get authorizedMarauderReactionChannels() {
        return [
            HDFR_1.HDFRChannelID.blabla_jeu,
            HDFR_1.HDFRChannelID.blabla_hors_sujet,
            HDFR_1.HDFRChannelID.galerie,
            HDFR_1.HDFRChannelID.mini_jeu,
        ];
    }
    constructor(guild, callbacks = {}) {
        const channel = AutomatonIntrusionDiscord.getRandomChannel(guild);
        super(channel, callbacks);
        this.timeoutTimer = null;
        this.channel = channel;
        this.extendAutomatonMessages();
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (Intrusion_1.Intrusion.discordActive && AutomatonIntrusionDiscord.authorizedMarauderReactionChannels.includes(message.channelId)) {
                    yield message.react(HDFR_1.HDFREmoji.maraudeur);
                }
            }
            catch (_a) { }
        });
    }
    triggerBreach(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (yield AutomatonIntrusion_1.AutomatonIntrusion.mutex.locked) {
                simplediscordbot_1.Bot.log.error("Mutex locked, retry later");
                return;
            }
            try {
                this.initializeHack();
                this.triggeredMessage = message;
                yield this.createGameThread(this.channel.id, message);
                yield this.notifyIntrusion(message, this.thread.url);
                (_b = (_a = this.callbacks).onHackStart) === null || _b === void 0 ? void 0 : _b.call(_a, this._choosenStratagem, this.choosenStratagemCode, (_d = (_c = message.member) === null || _c === void 0 ? void 0 : _c.nickname) !== null && _d !== void 0 ? _d : message.author.displayName);
                this.startTimeout();
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
                yield this.resetHack();
            }
        });
    }
    getGameRules() {
        return "- Une flèche **par personne**, à chaque essai\n" +
            "- Dans ce fil uniquement\n" +
            "- Coche verte = prise en compte\n" +
            "- :warning: Le code peut se réinitialiser !";
    }
    extendAutomatonMessages() {
        this.possible_automaton_message.push("HAHAHAHA !", "A BAS LA DEMOCRATIE !", "HELLDIVERS SCUM!", "SUPER EARTH WILL BURN");
    }
    startTimeout() {
        if (this.timeoutTimer)
            return;
        this.timeoutTimer = setInterval(() => {
            if (!this.isHacked) {
                this.clearTimeout();
                return;
            }
            this.failWithTimeout();
        }, simplediscordbot_1.Time.day.DAY_01.toMilliseconds());
    }
    failWithTimeout() {
        this.closeThread();
        this.clearTimeout();
        this.endHack(false);
    }
    clearTimeout() {
        if (this.timeoutTimer) {
            clearInterval(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }
    closeThread() {
        var _a, _b;
        (_a = this._thread) === null || _a === void 0 ? void 0 : _a.setArchived(true);
        (_b = this._thread) === null || _b === void 0 ? void 0 : _b.setLocked(true);
    }
    resetHack() {
        const _super = Object.create(null, {
            resetHack: { get: () => super.resetHack }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.resetHack.call(this);
            this.clearTimeout();
        });
    }
    static getRandomChannel(guild) {
        const channels = AutomatonIntrusionDiscord.authorizedChannelsToSpawn;
        let foundTextChannel;
        while (!foundTextChannel && channels.length > 0) {
            const idx = Math.floor(Math.random() * channels.length);
            const channelId = channels[idx];
            if (!channelId) {
                console.error("Aucun channel ID trouvé");
                continue;
            }
            const channel = guild.channels.cache.get(channelId);
            if (channel && channel.type === discord_js_1.ChannelType.GuildText) {
                foundTextChannel = channel;
            }
            else {
                channels.splice(idx, 1);
            }
        }
        if (!foundTextChannel) {
            throw new Error("Aucun channel texte autorisé trouvé dans ce serveur.");
        }
        return foundTextChannel;
    }
}
exports.AutomatonIntrusionDiscord = AutomatonIntrusionDiscord;
AutomatonIntrusionDiscord.PROBA = 0.02;
