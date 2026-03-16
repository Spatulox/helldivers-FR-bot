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
const promises_1 = require("timers/promises");
const sanction_1 = require("../commands/moderate_members/sanction");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class ModerateMembers {
    static getUsername(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield simplediscordbot_1.Bot.client.users.fetch(userId);
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
    static createAdminEmbed(author, title, description, user_ids, signalement_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.yellow);
            let titleBis = title;
            if (title.startsWith(sanction_1.SanctionTitle.SIGNALEMENT)) {
                const titleArray = title.split(" ");
                titleBis = `${titleArray[0]} (${signalement_number}/3) ${titleArray[1]}`;
            }
            embed.setDescription(`# ${titleBis}`);
            embed.setAuthor({
                name: author.username,
                iconURL: author.avatarURL
            });
            const fields = [
                { name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬", value: user_ids.join(" / ") },
                { name: "▬▬▬ 🅰️ LISTING ▬▬▬", value: yield ModerateMembers.formatMentions(user_ids, true) },
                { name: "▬▬▬ 🅱️ RAISON ▬▬▬", value: description }
            ];
            simplediscordbot_1.EmbedManager.fields(embed, fields);
            return this.detectAndFillBooks(embed);
        });
    }
    static createMemberEmbed(userId, title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.yellow);
            embed.setTitle("Helldivers 2 [FR]");
            embed.setDescription(`# ${title}`);
            const fields = [
                { name: "▬▬▬▬▬ 🆔 ▬▬▬▬▬", value: userId },
                { name: "▬▬▬ 🅰️ LISTING ▬▬▬", value: `<@${userId}>` },
                { name: "▬▬▬ 🅱️ RAISON ▬▬▬", value: description }
            ];
            simplediscordbot_1.EmbedManager.fields(embed, fields);
            return this.detectAndFillBooks(embed);
        });
    }
    static detectAndFillBooks(embed) {
        var _a, _b;
        try {
            const description = embed.data.description;
            if (description === null || description === void 0 ? void 0 : description.startsWith("SIGNALEMENT")) {
                const match = description.match(sanction_1.SIGNALEMENT_REGEX);
                if (match && match[1]) {
                    const bookNumber = parseInt(match[1]);
                    embed.addFields({
                        name: "Niveau du signalement",
                        value: `${(_a = ModerateMembers.books[bookNumber]) !== null && _a !== void 0 ? _a : "Inconnu"} ${bookNumber == 1 ? "er" : "ème"} signalement`,
                        inline: true // ou false selon tes préférences
                    });
                    return embed;
                }
            }
            else if (description === sanction_1.SanctionTitle.BANNISSEMENT) {
                embed.addFields({
                    name: "Niveau du signalement",
                    value: `${(_b = ModerateMembers.books[3]) !== null && _b !== void 0 ? _b : "Inconnu"} Ban`,
                    inline: true
                });
            }
        }
        catch (e) {
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : Impossible to detect the signalement embed`));
        }
        return embed;
    }
    static sendDMToUsers(author_1, user_ids_1, title_1, description_1) {
        return __awaiter(this, arguments, void 0, function* (author, user_ids, title, description, sendConfirmation = true) {
            let okUser = 0;
            if (author.guild == null) {
                return okUser;
            }
            for (const userId of user_ids) {
                if (!userId)
                    continue;
                try {
                    const member = yield author.guild.members.fetch(userId);
                    const embed = yield ModerateMembers.createMemberEmbed(userId, title, description);
                    if (!embed) {
                        console.error("Impossible to createMemberEmbed");
                        return okUser;
                    }
                    yield member.send(simplediscordbot_1.EmbedManager.toMessage(embed));
                    okUser++;
                }
                catch (_a) {
                    if (sendConfirmation)
                        if (author.channelId) {
                            simplediscordbot_1.Bot.message.send(author.channelId, `Impossible d'envoyer un MP à <@${userId}> ${userId}`);
                        }
                        else {
                            simplediscordbot_1.Bot.log.info(`Impossible d'envoyer un MP à <@${userId}> ${userId}`);
                        }
                }
                yield (0, promises_1.setTimeout)(simplediscordbot_1.Time.second.SEC_01.toMilliseconds());
            }
            if (sendConfirmation)
                if (author.channelId) {
                    simplediscordbot_1.Bot.message.send(author.channelId, `Tous les utilisateurs ont été traités`);
                }
            return okUser;
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
                const title = interaction.fields.getTextInputValue('moderate_members_Title');
                const description = interaction.fields.getTextInputValue('moderate_members_Raison');
                let user_id = interaction.fields.getTextInputValue('moderate_members_Utilisateur(s)');
                let signalement_number;
                if (title.startsWith(sanction_1.SanctionTitle.SIGNALEMENT)) {
                    signalement_number = interaction.fields.getTextInputValue('moderate_members_N° Signalement');
                }
                const user_ids = user_id
                    .split(/[,/]+/)
                    .map(it => it.trim());
                const author = {
                    username: interaction.user.username,
                    avatarURL: interaction.user.avatarURL() || "",
                    guild: interaction.guild,
                    channelId: interaction.channelId
                };
                if (signalement_number) {
                    const num = parseInt(signalement_number);
                    if (!(num >= 1 && num <= 3)) {
                        simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("N° Signalement doit être compris entre 1 et 3"));
                        return;
                    }
                }
                const embedAdmin = yield ModerateMembers.createAdminEmbed(author, title, description, user_ids, signalement_number);
                simplediscordbot_1.Bot.interaction.send(interaction, embedAdmin);
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
ModerateMembers.books = ["📗", "📙", "📕", "📓"];
