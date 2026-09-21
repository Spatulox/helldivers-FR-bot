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
exports.MultipleImagesDetection = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
// Alerte au-delà de ce nombre d'images dans un seul message
const MAX_IMAGES_PER_MESSAGE = 4;
const CONTENT_PREVIEW_MAX_LENGTH = 1000;
/**
 * Détection seule, sans sanction : un message d'un membre contenant plus de MAX_IMAGES_PER_MESSAGE images
 * (pièces jointes + liens d'images dans le contenu) envoie une alerte dans #retour_bot (canal de Bot.log.info).
 */
class MultipleImagesDetection extends AutoBanScamBase_1.AutoBanScamBase {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam MultipleImages";
        this.description = `Alert in #retour_bot when a message contains more than ${MAX_IMAGES_PER_MESSAGE} images`;
    }
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.detectMultipleImages(message); }
        };
    }
    detectMultipleImages(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.guildId != this.config.guildId || message.author.bot) {
                return;
            }
            const count = this.countImages(message);
            if (count < MAX_IMAGES_PER_MESSAGE) {
                return;
            }
            try {
                const content = message.content.trim();
                const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.yellow);
                embed.setTitle("⚠️ Message avec plusieurs images");
                simplediscordbot_1.EmbedManager.fields(embed, [
                    { name: "Auteur", value: `<@${message.author.id}> / ${message.author.username} (${message.author.id})` },
                    { name: "Salon", value: `<#${message.channelId}>` },
                    { name: "Images", value: `${count}` },
                    { name: "Message", value: message.url },
                    { name: "Contenu", value: content ? content.slice(0, CONTENT_PREVIEW_MAX_LENGTH) : "*(message sans texte)*" },
                ]);
                yield simplediscordbot_1.Bot.log.info(embed);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Détection d'images multiples : ${error}`));
            }
        });
    }
}
exports.MultipleImagesDetection = MultipleImagesDetection;
