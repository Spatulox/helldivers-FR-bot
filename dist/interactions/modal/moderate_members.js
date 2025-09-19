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
exports.moderate_members = moderate_members;
const embeds_1 = require("../../utils/messages/embeds");
const client_1 = require("../../utils/client");
const messages_1 = require("../../utils/messages/messages");
const promises_1 = require("timers/promises");
const UnitTime_1 = require("../../utils/times/UnitTime");
function moderate_members(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            function getUsername(userId) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const user = yield client_1.client.users.fetch(userId);
                        return user.username;
                    }
                    catch (_a) {
                        return "Unknown";
                    }
                });
            }
            function formatMentions(user_ids_1) {
                return __awaiter(this, arguments, void 0, function* (user_ids, jumpLine = false) {
                    if (Array.isArray(user_ids)) {
                        const mentions = yield Promise.all(user_ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                            if (!id) {
                                return;
                            }
                            const username = yield getUsername(id);
                            if (jumpLine) {
                                return `- <@${id.trim()}> / ${username}`;
                            }
                            return `- <@${id.trim()}>`;
                        })));
                        return mentions.join(jumpLine ? '\n' : ', ');
                    }
                    else {
                        const username = yield getUsername(user_ids);
                        return jumpLine ? `- <@${user_ids.trim()}> / ${username}` : `- <@${user_ids}>`;
                    }
                });
            }
            function createAdminEmbed() {
                return __awaiter(this, void 0, void 0, function* () {
                    const embed = (0, embeds_1.createEmbed)();
                    embed.color = embeds_1.EmbedColor.yellow;
                    if (!embed.author) {
                        embed.author = {
                            name: interaction.user.username,
                            icon_url: interaction.user.avatarURL() || ""
                        };
                    }
                    embed.title = "";
                    embed.description = `# ${title}`;
                    embed.fields = [
                        {
                            name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬",
                            value: `${user_ids.join(" / ")}`
                        },
                        {
                            name: "▬▬▬ 🅰️ LISTING ▬▬▬",
                            value: `${yield formatMentions(user_ids, true)}`
                        },
                        {
                            name: "▬▬▬ 🅱️ RAISON ▬▬▬",
                            value: `${description}`
                        }
                    ];
                    return embed;
                });
            }
            function createMemberEmbed(userId, title, description) {
                return __awaiter(this, void 0, void 0, function* () {
                    const guild = interaction.guild;
                    if (!guild) {
                        return null;
                    }
                    const embed = (0, embeds_1.createEmbed)();
                    embed.color = embeds_1.EmbedColor.yellow;
                    embed.title = "";
                    embed.description = `# ${title}`;
                    embed.fields = [
                        {
                            name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬",
                            value: `${userId}`
                        },
                        {
                            name: "▬▬▬ 🅰️ LISTING ▬▬▬",
                            value: `<@${userId}>`
                        },
                        {
                            name: "▬▬▬ 🅱️ RAISON ▬▬▬",
                            value: `${description}`
                        }
                    ];
                    return embed;
                });
            }
            function sendDMToUsers(user_ids, title, description) {
                return __awaiter(this, void 0, void 0, function* () {
                    const guild = interaction.guild;
                    if (!guild) {
                        return;
                    }
                    for (const userId of user_ids) {
                        if (!userId) {
                            continue;
                        }
                        try {
                            const member = yield guild.members.fetch(userId);
                            const embed = yield createMemberEmbed(userId, title, description);
                            if (!embed) {
                                console.error("Impossible to createMemberEmbed");
                                return;
                            }
                            yield member.send((0, embeds_1.returnToSendEmbed)(embed));
                        }
                        catch (_a) {
                            yield (0, messages_1.sendMessage)(`Impossible d'envoyer un MP à <@${userId}> ${userId}`, interaction.channelId);
                        }
                        // Waiting to avoid Discord rate limit
                        yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds());
                    }
                    yield (0, messages_1.sendMessage)(`Tous les utilisateurs ont été traités `, interaction.channelId);
                });
            }
            yield interaction.deferReply();
            // Récupération des champs
            const title = interaction.fields.getTextInputValue('title');
            const description = interaction.fields.getTextInputValue('description');
            let user_id = interaction.fields.getTextInputValue('user');
            const user_ids = user_id.split(/[,/]+/);
            title.toUpperCase();
            const embedAdmin = yield createAdminEmbed();
            (0, embeds_1.sendInteractionEmbed)(interaction, embedAdmin);
            yield sendDMToUsers(user_ids, title, description);
        }
        catch (error) {
            console.log(error);
            interaction.reply("Error :/");
        }
    });
}
