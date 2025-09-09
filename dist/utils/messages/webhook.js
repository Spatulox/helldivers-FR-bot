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
const discord_js_1 = require("discord.js");
const embeds_1 = require("./embeds");
class WebHook {
    constructor(channel, name = "Bot Webhook", avatarURL) {
        this.channel = channel;
        this.name = name;
        this.avatarURL = avatarURL;
        this.webhook = null;
        this._id = null;
    }
    get textChannel() {
        return this.channel instanceof discord_js_1.ThreadChannel
            ? this.channel.parent
            : this.channel;
    }
    get id() {
        return this._id;
    }
    // Récupère/Crée le webhook si nécessaire, et le retourne
    getOrCreateWebhook() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.webhook)
                return this.webhook;
            const webhooks = yield this.textChannel.fetchWebhooks();
            let hook = webhooks.find(h => h.name === this.name);
            if (!hook) {
                hook = yield this.textChannel.createWebhook({
                    name: this.name,
                    avatar: this.avatarURL,
                    reason: "Création automatique par WebHook wrapper"
                });
            }
            this.webhook = hook;
            this._id = hook.id;
            return hook;
        });
    }
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield this.getOrCreateWebhook();
            let baseOptions;
            if (typeof options === "string") {
                baseOptions = { content: options };
            }
            else {
                baseOptions = Object.assign({}, options);
            }
            if (this.channel instanceof discord_js_1.ThreadChannel) {
                baseOptions.threadId = this.channel.id;
            }
            return yield webhook.send(baseOptions);
        });
    }
    sendEmbed(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseOptions = {
                embeds: (0, embeds_1.returnToSendEmbed)(embed).embeds
            };
            if (this.channel instanceof discord_js_1.ThreadChannel) {
                baseOptions.threadId = this.channel.id;
            }
            yield this.send(baseOptions);
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
