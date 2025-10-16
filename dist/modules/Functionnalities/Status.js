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
exports.Status = void 0;
const discord_js_1 = require("discord.js");
const Modules_1 = require("../../utils/other/Modules");
const messages_1 = require("../../utils/messages/messages");
const UnitTime_1 = require("../../utils/times/UnitTime");
const config_json_1 = __importDefault(require("../../config.json"));
const client_1 = require("../../utils/client");
const Intrusion_1 = require("./mini-games/Intrusion");
const InteractionHandler_1 = require("../Interaction/InteractionHandler");
const StratagemHero_1 = require("./mini-games/StratagemHero");
const DemocraticRoulette_1 = require("./mini-games/DemocraticRoulette");
const ActiveMembers_1 = require("./statistiques/ActiveMembers");
const AutomatonIntrusionDiscord_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const AutomatonIntrusionCounter_1 = require("../../sub_games/AutomatonIntrusion/AutomatonIntrusionCounter");
const AverageMessage_1 = require("./statistiques/AverageMessage");
class Status extends Modules_1.Module {
    constructor() {
        super("Bot Status", "Update the bot's status in an embed every X times");
        this.embedChannel = config_json_1.default.moduleMessageChannel;
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
                const channel = yield client_1.client.channels.fetch(this.embedChannel);
                if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                    console.error("Impossible d'envoyer un message dans le channel de status");
                    return;
                }
                const message = yield channel.send({
                    components: this.createComponents(),
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
                this.embedMessage = message;
                return;
            }
            this.editEmbed();
        });
    }
    editEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.embedMessage)
                return;
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
        const container = new discord_js_1.ContainerBuilder()
            .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`# ${this.name}`), new discord_js_1.TextDisplayBuilder().setContent("The Bot status, updated every 10 minutes"), new discord_js_1.TextDisplayBuilder().setContent(`In ${client_1.client.guilds.cache.size} server${client_1.client.guilds.cache.size > 0 ? "s" : ""}`))
            .addSeparatorComponents(new discord_js_1.SeparatorBuilder()
            .setSpacing(discord_js_1.SeparatorSpacingSize.Large)
            .setDivider(true))
            .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`**Start Time :** <t:${startTime}:F>`), new discord_js_1.TextDisplayBuilder().setContent(`**Last Status Updated :** <t:${Math.floor(Date.now() / 1000)}:F>`), new discord_js_1.TextDisplayBuilder().setContent(`**Uptime :** <t:${startTime}:R>`), new discord_js_1.TextDisplayBuilder().setContent(`**Last Bot Interaction :** ${InteractionHandler_1.InteractionHandler.lastInteraction ? this.discordTimestamp(InteractionHandler_1.InteractionHandler.lastInteraction) : "N/A"}`))
            .addSeparatorComponents(new discord_js_1.SeparatorBuilder()
            .setSpacing(discord_js_1.SeparatorSpacingSize.Small)
            .setDivider(true))
            .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`**Average active members (HDFR) :** ${ActiveMembers_1.ActiveMember.activeMembers.size}`), new discord_js_1.TextDisplayBuilder().setContent("**Last Mini Games :**"), new discord_js_1.TextDisplayBuilder().setContent(`Marauder :\n` +
            `> - Global (${AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.PROBA * 100}%) : ${this.discordTimestamp(Intrusion_1.Intrusion.lastGlobalMarauder)}\n` +
            `> - Compteur (${AutomatonIntrusionCounter_1.AutomatonIntrusionCounter.CURRENT_PROBA * 100}%) : ${this.discordTimestamp(Intrusion_1.Intrusion.lastCounterMarauder)}`), new discord_js_1.TextDisplayBuilder().setContent(`Roulette Démocratique :\n` +
            `> - ${this.discordTimestamp(DemocraticRoulette_1.DemocraticRoulette.lastRoulette)}`), new discord_js_1.TextDisplayBuilder().setContent(`Strata'Code :\n` +
            `> - ${this.discordTimestamp(StratagemHero_1.StratagemHero.lastStrataCode)}`))
            .addSeparatorComponents(new discord_js_1.SeparatorBuilder()
            .setSpacing(discord_js_1.SeparatorSpacingSize.Small)
            .setDivider(true))
            .addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(AverageMessage_1.AverageMessage.HISTORIC_REPORT_MESSAGE));
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
                    (0, messages_1.sendMessageToInfoChannel)(`Check Status error : ${error}`);
                }
            }), UnitTime_1.Time.minute.MIN_10.toMilliseconds());
        });
    }
}
exports.Status = Status;
Status.lastBotInteraction = null;
