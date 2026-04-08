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
exports.send_as = send_as;
const discord_js_1 = require("discord.js");
const automaton_lang_1 = require("./automaton_lang");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFRIntegrationList_1 = require("../../utils/HDFRIntegrationList");
function send_as(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const integrationName = interaction.options.getString("integration");
        if (!integrationName) {
            yield interaction.reply("\"Integration\" parameter is mandatory");
            return;
        }
        let message = interaction.options.getString("message");
        if (!message) {
            yield interaction.reply("\"Message\" parameter is mandatory");
            return;
        }
        if (!interaction.channel || interaction.channel.isDMBased()) {
            yield interaction.reply("This command should only be used in Guildchannel");
            return;
        }
        let webhook;
        switch (integrationName) {
            case HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.name:
                message = yield (0, automaton_lang_1.textIntoAutomaton)(message);
                webhook = new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.avatarUrl);
                break;
            case HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.name:
                webhook = new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.avatarUrl);
                break;
            default:
                yield interaction.editReply("Unknown integration choice");
                return;
        }
        if (!webhook) {
            yield interaction.editReply("Webhook initialization failed");
            return;
        }
        if (yield webhook.send(interaction.channelId, message)) {
            yield interaction.editReply("Message sent successfully.");
            return;
        }
        yield interaction.editReply("Error when sending message.");
    });
}
