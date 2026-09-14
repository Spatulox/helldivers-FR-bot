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
exports.SendAs = void 0;
class SendAs {
    static sendAsWebhook(interaction, webhook, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.channel || interaction.channel.isDMBased()) {
                yield interaction.editReply("This command should only be used in BasedGuildTextChannel");
                return;
            }
            //const webhook: WebhookManager | undefined = await webhookCreation(integrationName)
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
}
exports.SendAs = SendAs;
