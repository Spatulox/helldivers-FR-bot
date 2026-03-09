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
const StratagemHero_1 = require("./mini-games/StratagemHero");
const DemocraticRoulette_1 = require("./mini-games/DemocraticRoulette");
const ActiveMembers_1 = require("./statistiques/ActiveMembers");
const Modules_1 = require("../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/HDFR");
const AutomatonIntrusionDiscord_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const AutomatonIntrusionCounter_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const Intrusion_1 = require("./mini-games/Intrusion");
class Status extends Modules_1.Module {
    constructor() {
        super("Bot Status", "Update the bot's status in an embed every X times");
        this.embedChannel = HDFR_1.HDFRChannelID.module_et_auto;
        this.embedMessage = null;
        this.interval = null;
        this.getOrSendEmbed();
        this.checkEveryXMinutes();
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
            const messageID = yield this.getXthBotMessage(this.embedChannel, 2);
            this.embedMessage = messageID;
            if (!messageID) {
                const channel = yield simplediscordbot_1.GuildManager.channel.any.find(this.embedChannel);
                if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                    console.error("Impossible d'envoyer un message dans le channel de status");
                    return;
                }
                this.embedMessage = yield channel.send({
                    components: this.createComponents(),
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
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
}
exports.Status = Status;
Status.lastBotInteraction = null;
