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
exports.MessageManager = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../HDFR");
class MessageManager {
    static getAdminChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.alert);
            }
            catch (e) {
                simplediscordbot_1.Log.error("Error while getting admin channel");
                return null;
            }
        });
    }
    static sendToAdminChannel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield this.getAdminChannel();
                if (channel) {
                    if (typeof message === 'string') {
                        yield MessageManager.sendMessage(message, channel);
                        return;
                    }
                    yield channel.send(simplediscordbot_1.EmbedManager.toMessage(message));
                }
                else {
                    simplediscordbot_1.Bot.log.error("Impossible to detect the admin channel");
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    static sendMessage(messageContent_1) {
        return __awaiter(this, arguments, void 0, function* (messageContent, targetChannel = "", messagetoConsole = true) {
            if (messagetoConsole)
                simplediscordbot_1.Log.info(messageContent);
            let channelId = HDFR_1.HDFRChannelID.retour_bot;
            let channel;
            if (targetChannel) {
                if (typeof (targetChannel) === "string") {
                    channel = yield simplediscordbot_1.GuildManager.channel.text.find(targetChannel);
                }
                else {
                    channel = targetChannel;
                }
            }
            else {
                channel = yield simplediscordbot_1.GuildManager.channel.text.find(channelId);
            }
            try {
                if (!channel) {
                    console.error(`Canal introuvable : ${targetChannel}`);
                    return null;
                }
                return yield channel.send(messageContent);
            }
            catch (error) {
                console.error("Erreur lors de l'envoi du message :", error);
            }
            return null;
        });
    }
    static replyAndDeleteReply(message, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reply = yield message.reply(simplediscordbot_1.EmbedManager.toMessage(simplediscordbot_1.EmbedManager.debug(msg)));
                setTimeout(() => {
                    reply.delete().catch(() => { });
                }, simplediscordbot_1.Time.second.SEC_10.toMilliseconds());
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.debug(`replyAndDeleteReply error ${error}`));
            }
        });
    }
    static isLastMessageInChannel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newerMessages = yield message.channel.messages.fetch({ after: message.id });
            if (newerMessages.size > 0) {
                return false;
            }
            return true;
        });
    }
    static containsOnlyEmoji(str) {
        const cleaned = str.replace(/\s/g, "");
        const unicodeEmojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
        const discordEmojiRegex = /<a?:\w+:\d+>/g;
        const globalRegex = new RegExp(`^(?:${discordEmojiRegex.source}|${unicodeEmojiRegex.source})+$`, "u");
        return globalRegex.test(cleaned);
    }
    static getAttachementBuffer(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const attachmentsBuffers = [];
            for (const attach of message.attachments.values()) {
                try {
                    const response = yield fetch(attach.url);
                    // Récupérer Blob depuis la réponse
                    const blob = yield response.blob();
                    // Transformer Blob en ArrayBuffer
                    const arrayBuffer = yield blob.arrayBuffer();
                    // Convertir ArrayBuffer en Buffer Node.js
                    const buffer = Buffer.from(arrayBuffer);
                    attachmentsBuffers.push({
                        buffer,
                        name: (_a = attach.name) !== null && _a !== void 0 ? _a : "file",
                        contentType: (_b = attach.contentType) !== null && _b !== void 0 ? _b : ""
                    });
                }
                catch (err) {
                    console.error("Erreur téléchargement attachment", err);
                }
            }
            return attachmentsBuffers;
        });
    }
    static sendAttachement(attachementBuff, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { buffer, name, contentType } of attachementBuff) {
                const isImage = contentType.startsWith("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                const attachment = new discord_js_1.AttachmentBuilder(buffer, { name });
                if (isImage) {
                    const embed = simplediscordbot_1.EmbedManager.create();
                    embed.setTitle(name !== null && name !== void 0 ? name : "Image");
                    embed.setImage(`attachment://${name}`);
                    yield channel.send({ embeds: [embed], files: [attachment] });
                }
                else {
                    yield channel.send({ files: [attachment] });
                }
            }
        });
    }
}
exports.MessageManager = MessageManager;
