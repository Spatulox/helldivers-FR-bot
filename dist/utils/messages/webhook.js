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
exports.WebHook = void 0;
const embeds_1 = require("./embeds");
class WebHook {
    constructor(channel, name = "Bot Webhook", avatarURL) {
        this.channel = channel;
        this.name = name;
        this.avatarURL = avatarURL;
        this.webhook = null;
    }
    // Récupère/Crée le webhook si nécessaire, et le retourne
    getOrCreateWebhook() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.webhook)
                return this.webhook;
            // Vérifie si déjà existant
            const webhooks = yield this.channel.fetchWebhooks();
            let hook = webhooks.find(h => h.name === this.name);
            if (!hook) {
                hook = yield this.channel.createWebhook({
                    name: this.name,
                    avatar: this.avatarURL,
                    reason: "Création automatique par WebHook wrapper"
                });
            }
            this.webhook = hook;
            return hook;
        });
    }
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield this.getOrCreateWebhook();
            if (typeof options === "string") {
                yield webhook.send({ content: options });
            }
            else {
                yield webhook.send(options);
            }
        });
    }
    sendEmbed(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send({
                embeds: (0, embeds_1.returnToSendEmbed)(embed).embeds
            });
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.webhook) {
                try {
                    yield this.webhook.delete("Suppression manuelle via WebHook wrapper");
                }
                catch (err) {
                    if (err instanceof Error) {
                        if (err.message.includes("Unknown Webhook"))
                            return;
                    }
                    throw err;
                }
                finally {
                    this.webhook = null;
                }
            }
        });
    }
}
exports.WebHook = WebHook;
