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
exports.TaGueuleMee6 = void 0;
const discord_js_1 = require("discord.js");
const Modules_1 = require("../../../utils/other/Modules");
const constantes_1 = require("../../../utils/constantes");
const HDFR_1 = require("../../../utils/other/HDFR");
const messages_1 = require("../../../utils/messages/messages");
const embeds_1 = require("../../../utils/messages/embeds");
const client_1 = require("../../../utils/client");
const moderate_members_1 = require("../../../interactions/modal/moderate_members");
const channels_1 = require("../../../utils/guilds/channels");
const members_1 = require("../../../utils/guilds/members");
const UnitTime_1 = require("../../../utils/times/UnitTime");
const promises_1 = require("timers/promises");
class TaGueuleMee6 extends Modules_1.Module {
    constructor() {
        if (TaGueuleMee6._instance) {
            return TaGueuleMee6._instance;
        }
        super("TaGueuleMee6", "Remove the \"{user} a reçu un avertissement\"");
        TaGueuleMee6._instance = this;
    }
    static get instance() {
        return TaGueuleMee6._instance;
    }
    banMemberViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.searchUserViaMessage(message);
            if (!member) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to find the user"));
                return;
            }
            yield member.ban({ reason: "Protection anti-scam" });
        });
    }
    timeoutMemberViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.searchUserViaMessage(message);
            if (!member) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to find the user"));
                return;
            }
            yield (member === null || member === void 0 ? void 0 : member.timeout(UnitTime_1.Time.day.DAY_07.toMilliseconds(), "Protection anti-scam"));
        });
    }
    searchUserViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = client_1.client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
            if (!guild) {
                console.error("Guild not found");
                return null;
            }
            const member = yield guild.members.fetch(message.author.id).catch(() => null);
            if (!member) {
                console.error("Member not found in guild");
                return null;
            }
            return member;
        });
    }
    getAttachementBuffer(message) {
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
    sendAttachement(attachementBuff, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            attachementBuff.forEach((_a) => __awaiter(this, [_a], void 0, function* ({ buffer, name, contentType }) {
                const isImage = contentType.startsWith("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                const attachment = new discord_js_1.AttachmentBuilder(buffer, { name });
                if (isImage) {
                    const embedImage = {
                        title: name !== null && name !== void 0 ? name : "Image",
                        color: embeds_1.EmbedColor.botColor,
                        timestamp: new Date(),
                        image: { url: `attachment://${name}` }
                    };
                    yield channel.send({ embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embedImage)], files: [attachment] });
                }
                else {
                    yield channel.send({ files: [attachment] });
                }
            }));
        });
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.guildId != constantes_1.TARGET_GUILD_ID) {
                return;
            }
            this.neRienEcrireIci(message);
            this.taGueuleLAvertissementMee6(message);
        });
    }
    neRienEcrireIci(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.channelId != HDFR_1.HDFRDEBUGChannelID.ne_rien_ecrire_ici) {
                return;
            }
            let attachmentsBuffers = [];
            let deletedMessage = false;
            let rapportThread = null;
            // Message by a user
            if (!message.author.bot) {
                try {
                    if (message.attachments.size > 0) {
                        attachmentsBuffers = yield this.getAttachementBuffer(message);
                    }
                    message.deletable && (yield message.delete());
                    deletedMessage = true;
                    const auth = yield (0, channels_1.searchClientGuildMember)(message.author.id);
                    if (auth == null) {
                        return;
                    }
                    let title = (0, members_1.isStaff)(auth) ? "EXCLUSION (7j) 🔇" : "BANNISSEMENT  ⛔";
                    let description = "PROTECTION ANTI-SCAM";
                    const embedInfraction = yield moderate_members_1.ModerateMembers.createMemberEmbed(message.author.id, title, description);
                    // Send to #alert
                    try {
                        const channelAlert = yield (0, channels_1.searchClientChannel)(client_1.client, HDFR_1.HDFRDEBUGChannelID.alert);
                        if (channelAlert == null) {
                            (0, messages_1.sendMessageToInfoChannel)("Impossible to select the channelInfraction");
                            return;
                        }
                        (0, embeds_1.sendEmbed)(embedInfraction, channelAlert);
                        if (message.content)
                            channelAlert.send((0, embeds_1.returnToSendEmbed)((0, embeds_1.createSimpleEmbed)(message.content)));
                        this.sendAttachement(attachmentsBuffers, channelAlert);
                    }
                    catch (error) {
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`infraction : ${error}`));
                    }
                    // Send #rapport and create a thread
                    try {
                        const channelRapport = yield (0, channels_1.searchClientChannel)(client_1.client, HDFR_1.HDFRDEBUGChannelID.rapport);
                        if (channelRapport == null) {
                            (0, messages_1.sendMessageToInfoChannel)("Impossible to select the channelReport");
                            return;
                        }
                        const msg = yield (0, embeds_1.sendEmbed)(embedInfraction, channelRapport);
                        if (msg != null) {
                            rapportThread = yield msg.startThread({
                                name: "commande /sanction",
                                autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.OneHour,
                                reason: "Thread Automatique"
                            });
                            if (message.content)
                                rapportThread.send((0, embeds_1.returnToSendEmbed)((0, embeds_1.createSimpleEmbed)(message.content)));
                            this.sendAttachement(attachmentsBuffers, rapportThread);
                        }
                    }
                    catch (error) {
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`rapport : ${error}`));
                    }
                    try {
                        // Send message to #infraction
                        const channelInfraction = yield (0, channels_1.searchClientChannel)(client_1.client, HDFR_1.HDFRDEBUGChannelID.infraction);
                        if (channelInfraction == null) {
                            (0, messages_1.sendMessageToInfoChannel)("Impossible to select the channelInfraction");
                            return;
                        }
                        (0, embeds_1.sendEmbed)(embedInfraction, channelInfraction);
                    }
                    catch (error) {
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`infraction : ${error}`));
                    }
                    // Send DM to USER (/sanction)
                    try {
                        const data = {
                            username: message.author.displayName,
                            avatarURL: message.author.avatarURL() || "",
                            guild: message.guild,
                            channelId: message.channelId
                        };
                        const okUser = yield moderate_members_1.ModerateMembers.sendDMToUsers(data, [message.author.id], title, description, false);
                        (0, messages_1.sendMessage)(`<@${message.author.id}> ` + (okUser == 1 ? "" : "n'") + "a reçu le MP", rapportThread);
                    }
                    catch (error) {
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`DM USER : ${error}`));
                    }
                    // Active protection
                    if ((0, members_1.isStaff)(auth)) {
                        yield this.timeoutMemberViaMessage(message);
                        return;
                    }
                    yield this.banMemberViaMessage(message);
                }
                catch (error) {
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
                }
                finally {
                    if (!deletedMessage) {
                        message.deletable && (yield message.delete());
                    }
                }
                return;
            }
        });
    }
    // Mee6 embed with "a reçu un avertissement"
    taGueuleLAvertissementMee6(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            (0, promises_1.setTimeout)(UnitTime_1.Time.minute.MIN_01.toMilliseconds());
            if (message.author.id == constantes_1.AMIRAL_SUPER_TERRE_ID && message.embeds && ((_b = (_a = message.embeds[0]) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b.name.includes("a reçu un avertissement"))) {
                try {
                    message.deletable && message.delete();
                }
                catch (error) {
                }
            }
        });
    }
}
exports.TaGueuleMee6 = TaGueuleMee6;
TaGueuleMee6._instance = null;
