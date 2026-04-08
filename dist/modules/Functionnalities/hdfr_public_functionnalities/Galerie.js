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
exports.Galerie = void 0;
const discord_js_1 = require("discord.js");
const Modules_1 = require("../../Modules");
const promises_1 = require("timers/promises");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../../utils/HDFR");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
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
class Galerie extends Modules_1.Module {
    constructor() {
        if (Galerie._instance) {
            return Galerie._instance;
        }
        super("Galerie", "Module to manage the gallery channel and its threads.");
        Galerie._instance = this;
    }
    static get instance() {
        return Galerie._instance;
    }
    checkIfMessageStillExist(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.setTimeout)(simplediscordbot_1.Time.second.SEC_01.toMilliseconds());
                yield message.fetch();
                // Success
                return true;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
    getFileExtension(url) {
        const match = url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/i);
        if (match && match[1]) {
            return '.' + match[1].toLowerCase();
        }
        return '';
    }
    isInEnum(ext, enumObj) {
        return Object.values(enumObj).includes(ext);
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!this.enabled) {
                    return;
                }
                if (message.channelId != HDFR_1.HDFRChannelID.galerie || message.channel.id == HDFR_1.HDFRChannelID.galerie && message.author.bot || message.system) {
                    return;
                }
                const messageData = {
                    attachement: message.attachments.size > 0 ? true : false,
                    reference: message.reference ? true : false,
                    embed: message.embeds.length > 0 ? true : false,
                    link: message.content.match(simplediscordbot_1.DiscordRegex.URL_REGEX) ? true : false,
                    poll: message.poll ? true : false,
                };
                let name = "{thread}";
                if (message.reference && message.reference.type == discord_js_1.MessageReferenceType.Forward) {
                    name = "{forwarded}";
                }
                else if (message.attachments.size > 0) {
                    if (message.attachments.size > 1) {
                        name = "{items}";
                    }
                    else {
                        name = "{item}";
                        message.attachments.forEach(attachment => {
                            const attach = attachment.url;
                            const ext = this.getFileExtension(attach);
                            if (ext && this.isInEnum(ext, image)) {
                                name = "{image}";
                                return;
                            }
                            else if (ext && this.isInEnum(ext, video)) {
                                name = "{video}";
                                return;
                            }
                        });
                    }
                }
                else if (message.content.match(simplediscordbot_1.DiscordRegex.URL_REGEX)) {
                    name = "{lien}";
                }
                else if (message.poll) {
                    name = "{sondage}";
                }
                else if (message.embeds.length > 0) {
                    name = "{embed}";
                }
                else {
                    const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error);
                    embed.setTitle(`Message Deleted from #galerie ${message.url}`);
                    const ref = message.reference ? (message.reference.type == discord_js_1.MessageReferenceType.Default ? "Answer message" : "Forwarded") : false;
                    simplediscordbot_1.EmbedManager.fields(embed, [
                        { name: "Original Message", value: message.content },
                        { name: "Author", value: message.author.displayName },
                        { name: "Attachement", value: messageData.attachement.toString(), inline: true },
                        { name: "Reference", value: ref.toString(), inline: true },
                        { name: "Embed", value: messageData.embed.toString(), inline: true },
                        { name: "Link", value: messageData.link.toString(), inline: true },
                        { name: "Poll", value: messageData.poll.toString(), inline: true },
                        { name: simplediscordbot_1.DiscordRegex.SPACE, value: simplediscordbot_1.DiscordRegex.SPACE, inline: true }, // empty
                    ]);
                    if (!(yield this.checkIfMessageStillExist(message))) {
                        simplediscordbot_1.Bot.log.info("This message has already been deleted by another bot");
                        return;
                    }
                    simplediscordbot_1.Bot.log.info(embed);
                    const member = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFRChannelID.guildID, ((_a = message.member) === null || _a === void 0 ? void 0 : _a.id) || message.author.id);
                    if (member && !MemberManager_1.MemberManager.isModerator(member)) {
                        const channel = yield simplediscordbot_1.GuildManager.channel.text.find(message.channel.id);
                        if (!channel) {
                            message.delete();
                            return;
                        }
                        let msg = ["Raisons :\n- Veuillez réagir dans les fils prévus.\n- Vous pouvez seulement envoyer des liens / fichiers (images & vidéos) / sondages.", "Vous ne pouvez pas écrire dans ce channel."];
                        if (message.reference && message.reference.type == discord_js_1.MessageReferenceType.Default) {
                            msg = ["Raisons :\n- Veuillez réagir dans les fils prévus", "Vous ne pouvez pas écrire dans ce channel."];
                        }
                        let msgRep = yield message.reply(simplediscordbot_1.EmbedManager.toMessage(simplediscordbot_1.EmbedManager.error(msg[0]).setTitle(msg[1])));
                        message.delete();
                        yield (0, promises_1.setTimeout)(simplediscordbot_1.Time.second.SEC_12.toMilliseconds());
                        msgRep.delete();
                        return;
                    }
                    else if (!member) {
                        message.delete();
                    }
                    return;
                }
                if ((yield this.checkIfMessageStillExist(message)) && !message.hasThread) { //hasThread needs to be after the message refresh
                    yield message.startThread({
                        name: name,
                        autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.ThreeDays,
                        reason: "Thread Automatique"
                    });
                    try {
                        yield message.react(HDFR_1.HDFREmoji.love);
                    }
                    catch (e) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_love`));
                    }
                    try {
                        yield message.react(HDFR_1.HDFREmoji.bonhelldivers);
                    }
                    catch (e) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_bonhelldivers`));
                    }
                    try {
                        yield message.react(HDFR_1.HDFREmoji.xd);
                    }
                    catch (e) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_xd`));
                    }
                    try {
                        yield message.react(HDFR_1.HDFREmoji.hitass);
                    }
                    catch (e) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_HITASS`));
                    }
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error} : ${message.url}`));
                console.error(error);
            }
        });
    }
}
exports.Galerie = Galerie;
Galerie._instance = null;
