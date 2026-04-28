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
exports.Status = void 0;
const discord_js_1 = require("discord.js");
const ActiveMembers_1 = require("./statistiques/ActiveMembers");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../utils/HDFR");
const discord_module_1 = require("@spatulox/discord-module");
const DemocraticRoulette_1 = require("./mini-games/DemocraticRoulette");
const StratagemHero_1 = require("./mini-games/StratagemHero");
const AutomatonIntrusionDiscord_1 = require("../sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const AutomatonIntrusionCounter_1 = require("../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const Intrusion_1 = require("./mini-games/intrusion/Intrusion");
class Status extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Bot Status";
        this.description = "Update the bot's status in an embed every X times";
        this.cacheKey = "status_cache";
        this.embedChannel = HDFR_1.HDFRChannelID.module_et_auto;
        this.embedMessage = null;
        this.interval = null;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initCache();
            yield this.getOrSendEmbed();
            this.checkEveryXMinutes();
        });
    }
    initCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield simplediscordbot_1.CacheManager.getOrCreateCache(this.cacheKey, { channel_id: this.embedChannel, message_id: null });
            //console.log(cache)
            if (cache && cache.message_id != null) {
                this.embedMessage = yield simplediscordbot_1.GuildManager.channel.text.message.fetchOne(cache.channel_id, cache.message_id);
            }
        });
    }
    updateCacheMessageId(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield simplediscordbot_1.CacheManager.updateCacheProperty(this.cacheKey, { key: "message_id", value: message.id });
        });
    }
    disable() {
        super.disable();
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            return true;
        }
        return false;
    }
    enable() {
        super.enable();
        if (!this.interval) {
            this.checkEveryXMinutes();
            return true;
        }
        return false;
    }
    getOrSendEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.embedMessage) {
                const channel = yield simplediscordbot_1.GuildManager.channel.any.find(this.embedChannel);
                if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                    console.error("Impossible d'envoyer un message dans le channel de status");
                    return;
                }
                this.embedMessage = yield channel.send({
                    components: this.createComponents(),
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
                if (this.embedMessage) {
                    yield this.updateCacheMessageId(this.embedMessage);
                }
                return;
            }
            this.editEmbed();
        });
    }
    editEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.embedMessage)
                return;
            const channel = this.embedMessage.channel;
            if (channel.isThread() && channel.archived) {
                try {
                    yield channel.setArchived(false);
                    console.log(`Thread ${channel.name} désarchivé pour mise à jour du statut.`);
                }
                catch (error) {
                    console.error(`Impossible de désarchiver le thread : ${error}`);
                    return; // évite l'appel à .edit() pour ne pas renvoyer une erreur
                }
            }
            yield this.embedMessage.edit({
                components: this.createComponents(),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        });
    }
    discordTimestamp(date) {
        return date ? `<t:${Math.floor(date.getTime() / 1000)}:R>` : "N/A";
    }
    createComponents() {
        const startTime = Math.floor((Date.now() - process.uptime() * 1000) / 1000);
        const container = simplediscordbot_1.ComponentManager.create({
            title: `# ${this.name}`,
            description: `The Bot status, updated every 10 minutes\nIn ${simplediscordbot_1.Bot.client.guilds.cache.size} server${simplediscordbot_1.Bot.client.guilds.cache.size > 0 ? "s" : ""}`,
            color: simplediscordbot_1.SimpleColor.transparent,
            separator: discord_js_1.SeparatorSpacingSize.Large
        });
        const field = [
            { value: `**Start Time :** <t:${startTime}:F>`, separator: false },
            { value: `**Last Status Updated :** <t:${Math.floor(Date.now() / 1000)}:F>`, separator: false },
            { value: `**Uptime :** <t:${startTime}:R>`, separator: discord_js_1.SeparatorSpacingSize.Large },
            { value: `**Average active members (HDFR) :** ${ActiveMembers_1.ActiveMember.activeMembers.size}`, separator: false },
            { value: "**Last Mini Games :**", separator: false },
            { value: `Marauder :\n` +
                    `> - Global (${AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.PROBA * 100}%) : ${this.discordTimestamp(Intrusion_1.Intrusion.lastGlobalMarauder)}\n` +
                    `> - Compteur (${AutomatonIntrusionCounter_1.AutomatonIntrusionCounter.CURRENT_PROBA * 100}%) : ${this.discordTimestamp(Intrusion_1.Intrusion.lastCounterMarauder)}`, separator: false },
            { value: `Roulette Démocratique :\n` +
                    `> - ${this.discordTimestamp(DemocraticRoulette_1.DemocraticRoulette.lastRoulette)}`, separator: false },
            { value: `Strata'Code :\n` +
                    `> - ${this.discordTimestamp(StratagemHero_1.StratagemHero.lastStrataCode)}`, separator: false },
        ];
        simplediscordbot_1.ComponentManager.fields(container, field);
        return [container];
    }
    checkEveryXMinutes() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.editEmbed();
            this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    yield this.editEmbed();
                }
                catch (error) {
                    console.error(error);
                    simplediscordbot_1.Bot.log.info(`Check Status error : ${error}`);
                }
            }), simplediscordbot_1.Time.minute.MIN_10.toMilliseconds());
        });
    }
    /**
     * Get the x-th message sent by the bot in a specific channel
     * @param channelId the channel id (lol)
     * @param x begin at 1 (1 = first message, 2 = second message, etc.)
     * @returns the channel || null
     */
    getXthBotMessage(channelId, x) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield simplediscordbot_1.GuildManager.channel.any.find(channelId);
            if (!channel) {
                console.error(`Impossible de trouver ou d'accéder au channel texte avec l'id ${channelId}`);
                return null;
            }
            // Récupérer au maximum 100 derniers messages dans le channel
            const messages = yield channel.messages.fetch({ limit: 100 });
            // Filtrer les messages envoyés par le bot
            const botMessages = messages.filter(m => { var _a; return m.author.id === ((_a = simplediscordbot_1.Bot.client.user) === null || _a === void 0 ? void 0 : _a.id); });
            // Trier par date de création croissante (du plus ancien au plus récent)
            const sortedBotMessages = botMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            // Récupérer le x-ième message (ex: x=2 pour le deuxième message)
            // L'index est x-1 car tableau indexé à partir de 0
            if (x < 1 || x > sortedBotMessages.size) {
                console.warn(`Le channel ne contient pas ${x} messages envoyés par le bot.`);
                return null;
            }
            return sortedBotMessages.at(x - 1) || null;
        });
    }
}
exports.Status = Status;
Status.lastBotInteraction = null;
