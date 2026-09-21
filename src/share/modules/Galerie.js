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
const promises_1 = require("timers/promises");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const FileExtension_1 = require("../utils/FileExtension");
class Galerie extends discord_module_1.Module {
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.handleMessage(message); }
        };
    }
    constructor() {
        super();
        this.name = "Galerie";
        this.description = "Module to manage the gallery channel and its threads.";
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
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!this.enabled) {
                    return;
                }
                if (message.channelId != this.galerieChannel || message.channel.id == this.galerieChannel && message.author.bot || message.system) {
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
                            if ((0, FileExtension_1.isImageFile)(attach)) {
                                name = "{image}";
                                return;
                            }
                            else if ((0, FileExtension_1.isVideoFile)(attach)) {
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
                    const member = yield simplediscordbot_1.GuildManager.user.findInGuild(this.guildId, ((_a = message.member) === null || _a === void 0 ? void 0 : _a.id) || message.author.id);
                    if (member && !this.isModerator(member)) {
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
                    yield this.reactToMessage(message);
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error} : ${message.url}`));
                console.error(error);
            }
        });
    }
    reactToMessage(_message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Galerie = Galerie;
