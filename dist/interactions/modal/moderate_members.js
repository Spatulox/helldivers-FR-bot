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
exports.ModerateMembers = void 0;
const embeds_1 = require("../../utils/messages/embeds");
const client_1 = require("../../utils/client");
const messages_1 = require("../../utils/messages/messages");
const promises_1 = require("timers/promises");
const UnitTime_1 = require("../../utils/times/UnitTime");
class ModerateMembers {
    static getUsername(userId) {
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
    static formatMentions(user_ids_1) {
        return __awaiter(this, arguments, void 0, function* (user_ids, jumpLine = false) {
            if (Array.isArray(user_ids)) {
                const mentions = yield Promise.all(user_ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                    if (!id) {
                        return "";
                    }
                    const username = yield ModerateMembers.getUsername(id);
                    return jumpLine ? `- <@${id.trim()}> / ${username}` : `- <@${id.trim()}>`;
                })));
                return mentions.filter(Boolean).join(jumpLine ? '\n' : ', ');
            }
            else {
                const username = yield ModerateMembers.getUsername(user_ids);
                return jumpLine ? `- <@${user_ids.trim()}> / ${username}` : `- <@${user_ids}>`;
            }
        });
    }
    static createAdminEmbed(author, title, description, user_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = (0, embeds_1.createEmbed)();
            embed.color = embeds_1.EmbedColor.yellow;
            if (!embed.author) {
                embed.author = {
                    name: author.username,
                    icon_url: author.avatarURL
                };
            }
            embed.title = "";
            embed.description = `# ${title}`;
            embed.fields = [
                { name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬", value: user_ids.join(" / ") },
                { name: "▬▬▬ 🅰️ LISTING ▬▬▬", value: yield ModerateMembers.formatMentions(user_ids, true) },
                { name: "▬▬▬ 🅱️ RAISON ▬▬▬", value: description }
            ];
            return embed;
        });
    }
    static createMemberEmbed(userId, title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = (0, embeds_1.createEmbed)();
            embed.color = embeds_1.EmbedColor.yellow;
            embed.title = "";
            embed.description = `# ${title}`;
            embed.fields = [
                { name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬", value: userId },
                { name: "▬▬▬ 🅰️ LISTING ▬▬▬", value: `<@${userId}>` },
                { name: "▬▬▬ 🅱️ RAISON ▬▬▬", value: description }
            ];
            return embed;
        });
    }
    static sendDMToUsers(author_1, user_ids_1, title_1, description_1) {
        return __awaiter(this, arguments, void 0, function* (author, user_ids, title, description, sendConfirmation = true) {
            if (author.guild == null) {
                return;
            }
            for (const userId of user_ids) {
                if (!userId)
                    continue;
                try {
                    const member = yield author.guild.members.fetch(userId);
                    const embed = yield ModerateMembers.createMemberEmbed(userId, title, description);
                    if (!embed) {
                        console.error("Impossible to createMemberEmbed");
                        return;
                    }
                    yield member.send((0, embeds_1.returnToSendEmbed)(embed));
                }
                catch (_a) {
                    if (sendConfirmation)
                        yield (0, messages_1.sendMessage)(`Impossible d'envoyer un MP à <@${userId}> ${userId}`, author.channelId);
                }
                yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds());
            }
            if (sendConfirmation)
                yield (0, messages_1.sendMessage)(`Tous les utilisateurs ont été traités`, author.channelId);
        });
    }
    static moderate(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield interaction.deferReply();
                const guild = interaction.guild;
                if (!guild) {
                    return;
                }
                const title = interaction.fields.getTextInputValue('title');
                const description = interaction.fields.getTextInputValue('description');
                let user_id = interaction.fields.getTextInputValue('user');
                const user_ids = user_id.split(/[,/]+/);
                const author = {
                    username: interaction.user.username,
                    avatarURL: interaction.user.avatarURL() || "",
                    guild: interaction.guild,
                    channelId: interaction.channelId
                };
                const embedAdmin = yield ModerateMembers.createAdminEmbed(author, title, description, user_ids);
                (0, embeds_1.sendInteractionEmbed)(interaction, embedAdmin);
                yield ModerateMembers.sendDMToUsers(author, user_ids, title, description);
            }
            catch (error) {
                console.log(error);
                interaction.reply("Error :/");
            }
        });
    }
}
exports.ModerateMembers = ModerateMembers;
