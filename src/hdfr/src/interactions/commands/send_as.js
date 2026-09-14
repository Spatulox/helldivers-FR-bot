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
exports.HDFRSendAs = void 0;
const SendAs_1 = require("../../../../share/interactions/commands/SendAs");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFRIntegrationList_1 = require("../../utils/hdfr_list/HDFRIntegrationList");
const discord_js_1 = require("discord.js");
class HDFRSendAs extends SendAs_1.SendAs {
    webhookCreation(integrationName, _avatarUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (integrationName) {
                case HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.name:
                    return new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.avatarUrl);
                case HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.name:
                    return new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.avatarUrl);
                default:
                    return;
            }
        });
    }
    send_as(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            const integrationName = interaction.options.getString("integration");
            if (!integrationName) {
                yield interaction.editReply("\"Integration\" parameter is mandatory");
                return;
            }
            let message = interaction.options.getString("message");
            if (!message) {
                yield interaction.editReply("\"Message\" parameter is mandatory");
                return;
            }
            const web = yield this.webhookCreation(integrationName);
            if (!web) {
                yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.ComponentManager.error("Erreur lors de la création du webhook"));
                yield simplediscordbot_1.Bot.log.error(simplediscordbot_1.ComponentManager.error("Erreur lors de la création du webhook"));
                return;
            }
            yield SendAs_1.SendAs.sendAsWebhook(interaction, web, message);
        });
    }
}
exports.HDFRSendAs = HDFRSendAs;
