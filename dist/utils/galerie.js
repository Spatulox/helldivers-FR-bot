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
exports.galerie = galerie;
const discord_js_1 = require("discord.js");
const constantes_1 = require("./constantes");
const embeds_1 = require("./messages/embeds");
const channels_1 = require("./guilds/channels");
const client_1 = require("./client");
const promises_1 = require("timers/promises");
const members_1 = require("./guilds/members");
const messages_1 = require("./messages/messages");
const UnitTime_1 = require("./times/UnitTime");
var image;
(function (image) {
    image["png"] = ".png";
    image["jpg"] = ".jpg";
    image["jpeg"] = ".jpeg";
    image["gif"] = ".gif";
    image["webp"] = ".webp";
    image["bmp"] = ".bmp";
    image["tiff"] = ".tiff";
    image["tif"] = ".tif";
    image["svg"] = ".svg";
    image["ico"] = ".ico";
    image["heic"] = ".heic";
    image["heif"] = ".heif";
    image["avif"] = ".avif";
    image["jfif"] = ".jfif";
    image["pjpeg"] = ".pjpeg";
    image["pjp"] = ".pjp";
    image["apng"] = ".apng";
    image["raw"] = ".raw";
})(image || (image = {}));
var video;
(function (video) {
    video["mp4"] = ".mp4";
    video["mov"] = ".mov";
    video["webm"] = ".webm";
    video["avi"] = ".avi";
    video["mkv"] = ".mkv";
    video["flv"] = ".flv";
    video["wmv"] = ".wmv";
    video["m4v"] = ".m4v";
    video["mpg"] = ".mpg";
    video["mpeg"] = ".mpeg";
    video["ogv"] = ".ogv";
    video["ts"] = ".ts";
    video["mts"] = ".mts";
    video["m2ts"] = ".m2ts";
})(video || (video = {}));
function getFileExtension(url) {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/i);
    if (match && match[1]) {
        return '.' + match[1].toLowerCase();
    }
    return '';
}
function isInEnum(ext, enumObj) {
    return Object.values(enumObj).includes(ext);
}
function galerie(message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds());
            // Re-fetch message if it still exist (deleted by another bot against malicious links (Mee6))
            try {
                const fetchedMessage = yield message.channel.messages.fetch(message.id);
                if (fetchedMessage && fetchedMessage.hasThread) {
                    return;
                }
                // Success
            }
            catch (e) {
                console.error(e);
                return;
            }
            let name = "{thread}";
            if (message.attachments.size > 0) {
                if (message.attachments.size > 1) {
                    name = "{items}";
                }
                else {
                    name = "{item}";
                    message.attachments.forEach(attachment => {
                        const attach = attachment.url;
                        const ext = getFileExtension(attach);
                        if (ext && isInEnum(ext, image)) {
                            name = "{image}";
                            return;
                        }
                        else if (ext && isInEnum(ext, video)) {
                            name = "{video}";
                            return;
                        }
                    });
                }
            }
            else if (message.reference) {
                name = "{forwarded}";
            }
            else if (message.content.match(constantes_1.URL_REGEX)) {
                name = "{lien}";
            }
            else {
                const member = yield (0, channels_1.searchClientGuildMember)(((_a = message.member) === null || _a === void 0 ? void 0 : _a.id) || message.author.id);
                if (member && (0, members_1.checkIfApplyMember)(member)) {
                    const channel = yield (0, channels_1.searchClientChannel)(client_1.client, message.channel.id);
                    if (!channel) {
                        message.delete();
                        return;
                    }
                    const msgRep = yield message.reply((0, embeds_1.returnToSendEmbed)((0, embeds_1.createErrorEmbed)("Vous ne pouvez pas écrire dans ce channel. Veuillez réagir dans les fils prévus.")));
                    message.delete();
                    yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_07.toMilliseconds());
                    msgRep.delete();
                    return;
                }
                message.delete();
            }
            message.startThread({
                name: name,
                autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.ThreeDays,
                reason: "Thread Automatique"
            });
            (0, messages_1.sendMessageToInfoChannel)(`[MESSAGE TEMPORAIRE] : Thread crée pour le message ${message.url}`);
        }
        catch (error) {
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
            console.error(error);
        }
    });
}
