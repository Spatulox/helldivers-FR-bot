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
exports.SilentReportSelectMenu = void 0;
const discord_js_1 = require("discord.js");
const silent_report_1 = require("../context-menu/silent_report");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const SilentReportModal_1 = require("../modal/SilentReportModal");
const HDFRRoles_1 = require("../../utils/hdfr_list/HDFRRoles");
class SilentReportSelectMenu {
    static silentReport(interaction) {
        let selectedElement = undefined;
        if (interaction.values.length >= 0 && interaction.values[0]) {
            selectedElement = silent_report_1.SilentReportContextMenu.getOptionByValue(interaction.values[0]);
        }
        if (!selectedElement) {
            interaction.reply({
                content: "You need to select an element...",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const user_or_message_id = this.getIdFromString(interaction.customId);
        let report = {
            element: selectedElement,
            user_id: undefined,
            message_id: undefined,
            author: interaction.user,
        };
        if (interaction.customId.startsWith("report_user")) {
            report = Object.assign(Object.assign({}, report), { user_id: user_or_message_id });
        }
        else if (interaction.customId.startsWith("report_message")) {
            report = Object.assign(Object.assign({}, report), { message_id: user_or_message_id });
        }
        else {
            console.log("??? : " + interaction.customId);
        }
        if (selectedElement.value == "autre") {
            interaction.showModal(this.createReportOtherModal(report));
            return;
        }
        const embed = simplediscordbot_1.EmbedManager.success("Merci pour votre signalement, les modérateurs en prendront connaissance sous peu");
        simplediscordbot_1.EmbedManager.field(embed, { name: "Info", value: `Si vous avez des preuves (MP, Screenshot...), veuillez ouvrir un ticket modérateur dans <#${HDFR_1.HDFR.channel.contact_staff}>` });
        this.report(report);
        interaction.reply({
            embeds: [embed],
            flags: discord_js_1.MessageFlags.Ephemeral
        });
    }
    static getIdFromString(string) {
        return string.split("_")[2];
    }
    static createReportOtherModal(_report) {
        const data = [
            'report_other',
            _report.user_id || '',
            _report.message_id || '',
            _report.element.value
        ].join('|');
        const modal = simplediscordbot_1.ModalManager.create(SilentReportModal_1.SilentReportModal.TITLE, data); //report.user_id ?? report.message_id ?? "N/A")
        const fields = [
            { type: simplediscordbot_1.ModalFieldType.LONG, label: "Raison", placeholder: "Expliquer la raison de votre signalement", required: true },
        ];
        simplediscordbot_1.ModalManager.add(modal, fields);
        return modal;
    }
    static report(report) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = yield this.createReportembed(report);
            yield this.sendReportEmbed(embed);
        });
    }
    static fetchGuildMember(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = yield simplediscordbot_1.GuildManager.find(HDFR_1.HDFR.guildID);
            if (!guild)
                return null;
            return yield guild.members.fetch(user_id).catch(() => null);
        });
    }
    /**
     * Noms de la personne au moment du signalement : la mention, elle, suit les changements de
     * pseudo, donc elle ne dit plus rien à la modération si la personne se renomme entre temps.
     */
    static formatNames(user, member) {
        var _a;
        const lines = [];
        if (member === null || member === void 0 ? void 0 : member.nickname) {
            lines.push(`\`${(0, discord_js_1.escapeInlineCode)(member.nickname)}\` (surnom serveur)`);
        }
        else if (member) {
            lines.push("-# aucun surnom serveur");
        }
        else {
            lines.push("-# membre absent du serveur");
        }
        const pseudo = (_a = user === null || user === void 0 ? void 0 : user.globalName) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user.username;
        if (pseudo) {
            lines.push(`\`${(0, discord_js_1.escapeInlineCode)(pseudo)}\` (pseudo Discord)`);
        }
        return lines.join("\n");
    }
    static createReportembed(report) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error);
            embed.setTitle(report.user_id ? "Signalement d'utilisateur" : "Signalement de message");
            simplediscordbot_1.EmbedManager.fields(embed, [
                { name: "Auteur du signalement", value: `<@${report.author.id}>` },
                { name: "Type", value: `${report.element.emoji} ${report.element.label}` },
            ]);
            if (report.description) {
                simplediscordbot_1.EmbedManager.field(embed, { name: "Raison", value: report.description });
            }
            const isProfileReport = report.element.value === silent_report_1.SilentReportContextMenu.PROFILE_VALUE;
            if (report.user_id) {
                const member = yield this.fetchGuildMember(report.user_id);
                let value = `<@${report.user_id}>`;
                if (isProfileReport) {
                    const user = (_a = member === null || member === void 0 ? void 0 : member.user) !== null && _a !== void 0 ? _a : yield simplediscordbot_1.Bot.client.users.fetch(report.user_id).catch(() => null);
                    value += `\n${this.formatNames(user, member)}`;
                }
                simplediscordbot_1.EmbedManager.field(embed, { name: "Utilisateur signalé", value: value });
                if (member === null || member === void 0 ? void 0 : member.voice.channel) {
                    simplediscordbot_1.EmbedManager.field(embed, { name: "Utilisateur en vocal", value: `<#${member.voice.channel.id}>` });
                }
            }
            else if (report.message_id) {
                const channelId = report.message_id.split("-")[0];
                const messageId = report.message_id.split("-")[1];
                const messageUrl = this.getMessageUrl(HDFR_1.HDFR.guildID, channelId, messageId);
                simplediscordbot_1.EmbedManager.field(embed, { name: "Message signalé", value: `${messageUrl}` });
                if (isProfileReport) {
                    const message = yield simplediscordbot_1.GuildManager.channel.any.message.fetchOne(channelId, messageId);
                    if (message) {
                        simplediscordbot_1.EmbedManager.field(embed, {
                            name: "Auteur du message signalé",
                            value: `<@${message.author.id}>\n${this.formatNames(message.author, message.member)}`
                        });
                    }
                }
            }
            return embed;
        });
    }
    static sendReportEmbed(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            const modoChannel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFR.channel.alert);
            if (!modoChannel)
                return;
            modoChannel.send({
                content: `<@&${HDFRRoles_1.HDFRRoles.moderator}>`,
                embeds: [embed],
            });
        });
    }
    static getMessageUrl(guildId, channelId, messageId) {
        return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
    }
}
exports.SilentReportSelectMenu = SilentReportSelectMenu;
