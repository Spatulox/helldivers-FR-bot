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
exports.AutoBanScam = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../../utils/HDFR");
const MessageManager_1 = require("../../utils/Manager/MessageManager");
const MemberManager_1 = require("../../utils/Manager/MemberManager");
const sanction_1 = require("../../interactions/commands/moderate_members/sanction");
const ModerateMemberModal_1 = require("../../interactions/modal/ModerateMemberModal");
const constantes_1 = require("../../constantes");
const delete_occurence_1 = require("../../interactions/context-menu/delete_occurence");
class AutoBanScam extends discord_module_1.Module {
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.handleMessage(message); }
        };
    }
    constructor() {
        super();
        this.name = "AutoBanScam";
        this.description = "Automatically ban person who send message in <#1437904268467376268>. Also remove the \"{user} a reçu un avertissement\"";
    }
    banMemberViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.searchUserViaMessage(message);
            if (!member) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error("Impossible to find the user"));
                return;
            }
            yield member.ban({ reason: "Protection anti-scam" });
        });
    }
    timeoutMemberViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.searchUserViaMessage(message);
            if (!member) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error("Impossible to find the user"));
                return;
            }
            yield (member === null || member === void 0 ? void 0 : member.timeout(simplediscordbot_1.Time.day.DAY_07.toMilliseconds(), "Protection anti-scam"));
        });
    }
    searchUserViaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = simplediscordbot_1.Bot.client.guilds.cache.get(HDFR_1.HDFRChannelID.guildID);
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
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.guildId != HDFR_1.HDFRChannelID.guildID) {
                return;
            }
            this.neRienEcrireIci(message);
            this.taGueuleLAvertissementMee6(message);
        });
    }
    neRienEcrireIci(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.channelId != HDFR_1.HDFRChannelID.ne_rien_ecrire_ici) {
                return;
            }
            let attachmentsBuffers = [];
            let rapportThread = null;
            // Message by a user
            if (!message.author.bot) {
                try {
                    if (message.attachments.size > 0) {
                        attachmentsBuffers = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
                    }
                    message.deletable && (yield message.delete());
                    const auth = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFRChannelID.guildID, message.author.id);
                    if (auth == null) {
                        return;
                    }
                    let title = MemberManager_1.MemberManager.isStaff(auth) ? sanction_1.SanctionTitle.EXCLUSION_7D : sanction_1.SanctionTitle.BANNISSEMENT;
                    let description = "PROTECTION ANTI-SCAM";
                    let isTesting = false;
                    if (MemberManager_1.MemberManager.isTechnician(auth) && message.content == "$test") {
                        isTesting = true;
                        title = sanction_1.SanctionTitle.TECHNICIAN_TEST;
                        description = "LIVE TESTING, DON'T DO ANYTHING";
                    }
                    const embedInfraction = yield ModerateMemberModal_1.ModerateMembersModal.createMemberEmbed(message.author.id, title, description);
                    // Send to #alert
                    try {
                        const channelAlert = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.alert);
                        if (channelAlert == null) {
                            simplediscordbot_1.Bot.log.info("Impossible to select the channelInfraction");
                            return;
                        }
                        simplediscordbot_1.Bot.message.send(channelAlert, simplediscordbot_1.EmbedManager.toMessage(embedInfraction));
                        if (message.content)
                            channelAlert.send(simplediscordbot_1.EmbedManager.toMessage(simplediscordbot_1.EmbedManager.simple(message.content)));
                        MessageManager_1.MessageManager.sendAttachement(attachmentsBuffers, channelAlert);
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`infraction : ${error}`));
                    }
                    // Send #rapport and create a thread
                    try {
                        const channelRapport = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.rapport);
                        if (channelRapport == null) {
                            simplediscordbot_1.Bot.log.info("Impossible to select the channelReport");
                            return;
                        }
                        const msg = yield simplediscordbot_1.Bot.message.send(channelRapport, embedInfraction);
                        if (msg != null) {
                            rapportThread = yield msg.startThread({
                                name: "commande /sanction",
                                autoArchiveDuration: discord_js_1.ThreadAutoArchiveDuration.OneHour,
                                reason: "Thread Automatique"
                            });
                            if (rapportThread) {
                                if (message.content) {
                                    rapportThread.send(simplediscordbot_1.EmbedManager.toMessage(simplediscordbot_1.EmbedManager.simple(message.content)));
                                }
                                MessageManager_1.MessageManager.sendAttachement(attachmentsBuffers, rapportThread);
                            }
                        }
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`rapport : ${error}`));
                    }
                    let channelInfraction;
                    if (isTesting) {
                        channelInfraction = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.bot_brouillons);
                    }
                    else {
                        channelInfraction = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.infraction);
                    }
                    try {
                        // Send message to #infraction
                        if (channelInfraction == null) {
                            simplediscordbot_1.Bot.log.info("Impossible to select the channelInfraction");
                            return;
                        }
                        simplediscordbot_1.Bot.message.send(channelInfraction, embedInfraction);
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`infraction : ${error}`));
                    }
                    // Send DM to USER (/sanction)
                    try {
                        const data = {
                            username: message.author.displayName,
                            avatarURL: message.author.avatarURL() || "",
                            guild: message.guild,
                            channelId: message.channelId
                        };
                        const okUser = yield ModerateMemberModal_1.ModerateMembersModal.sendDMToUsers(data, [message.author.id], title, description, false);
                        if (rapportThread)
                            simplediscordbot_1.Bot.message.send(rapportThread, `<@${message.author.id}> ` + (okUser == 1 ? "" : "n'") + "a reçu le MP");
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`DM USER : ${error}`));
                    }
                    if (isTesting) {
                        return;
                    }
                    // Active protection
                    if (MemberManager_1.MemberManager.isStaff(auth)) {
                        yield this.timeoutMemberViaMessage(message);
                        return;
                    }
                    yield this.banMemberViaMessage(message);
                }
                catch (error) {
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
                }
                finally {
                    try {
                        yield this.removeOccurence(message);
                    }
                    catch (error) {
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
                    }
                }
                return;
            }
        });
    }
    // Mee6 embed with "a reçu un avertissement"
    taGueuleLAvertissementMee6(message) {
        return __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => {
                "a été averti";
                "a reçu un avertissement";
                var _a, _b;
                if ((message.author.id === constantes_1.AMIRAL_SUPER_TERRE_ID || message.author.id === "491769129318088714") && // this is the stat bot id
                    message.embeds &&
                    ((_b = (_a = message.embeds[0]) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b.name) &&
                    (message.embeds[0].author.name.includes("a été averti") ||
                        message.embeds[0].author.name.includes("a reçu un avertissement") ||
                        message.embeds[0].author.name.includes("Command not found"))) {
                    try {
                        message.deletable && message.delete();
                    }
                    catch (error) {
                    }
                }
            }, simplediscordbot_1.Time.minute.MIN_01.toMilliseconds());
        });
    }
    removeOccurence(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild) {
                return false;
            }
            const [b, m] = yield (0, delete_occurence_1.deleteOccurrences)(message.guild, message.guild.members.me, (0, delete_occurence_1.getMessageSignature)(message));
            simplediscordbot_1.Bot.log.info((0, delete_occurence_1.formatDeleteOccurenceMessage)(m));
            return b;
        });
    }
}
exports.AutoBanScam = AutoBanScam;
