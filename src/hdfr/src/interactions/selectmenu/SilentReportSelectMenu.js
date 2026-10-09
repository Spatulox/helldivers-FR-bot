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
const rateLimiter_1 = require("../../utils/rateLimiter");
class SilentReportSelectMenu {
    /** Membre exempté du quota (modérateur, technicien) */
    static isExempt(interaction) {
        return interaction.inCachedGuild() && (0, rateLimiter_1.isQuotaExempt)(interaction.member);
    }
    /** Message d'un membre qui a atteint son quota */
    static limitedEmbed(userId) {
        const until = this.limiter.blockedUntil(userId);
        return simplediscordbot_1.EmbedManager.error("Vous avez envoyé trop de signalements coup sur coup." +
            (until !== null ? ` Vous pourrez en envoyer un nouveau <t:${Math.ceil(until / 1000)}:R>.` : "") +
            `\nUrgence ? Ouvrez un ticket modérateur dans <#${HDFR_1.HDFR.channel.contact_staff}>`);
    }
    static silentReport(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedElement = undefined;
            if (interaction.values.length >= 0 && interaction.values[0]) {
                selectedElement = silent_report_1.SilentReportContextMenu.getOptionByValue(interaction.values[0]);
            }
            if (!selectedElement) {
                yield interaction.reply({
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
                // Le formulaire ne serait refusé qu'à l'envoi : autant ne pas l'ouvrir
                if (!this.isExempt(interaction) && this.limiter.blockedUntil(interaction.user.id) !== null) {
                    yield interaction.update({ content: "", embeds: [this.limitedEmbed(interaction.user.id)], components: [] });
                    return;
                }
                yield interaction.showModal(this.createReportOtherModal(report));
                return;
            }
            if (!this.isExempt(interaction) && !this.limiter.consume(interaction.user.id)) {
                yield interaction.update({ content: "", embeds: [this.limitedEmbed(interaction.user.id)], components: [] });
                return;
            }
            // `update` remplace le message du menu : le menu disparaît, impossible de renvoyer le même
            // signalement (et de pinger la modération) en boucle
            // Accusé de réception d'abord : la recherche du membre et l'envoi peuvent dépasser les 2 s
            // surveillées par ErrorGuard
            yield interaction.deferUpdate();
            const sent = yield this.report(report);
            yield interaction.editReply({ content: "", embeds: [this.resultEmbed(sent)], components: [] });
        });
    }
    /** Réponse à l'auteur du signalement, selon que l'envoi à la modération a abouti ou non */
    static resultEmbed(sent) {
        if (!sent) {
            return simplediscordbot_1.EmbedManager.error(`Le signalement n'a pas pu être transmis. Veuillez ouvrir un ticket modérateur dans <#${HDFR_1.HDFR.channel.contact_staff}>`);
        }
        const embed = simplediscordbot_1.EmbedManager.success("Merci pour votre signalement, les modérateurs en prendront connaissance sous peu");
        simplediscordbot_1.EmbedManager.field(embed, { name: "Info", value: `Si vous avez des preuves (MP, Screenshot...), veuillez ouvrir un ticket modérateur dans <#${HDFR_1.HDFR.channel.contact_staff}>` });
        return embed;
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
    /** @returns false si le signalement n'a pas pu être posté dans le salon de modération */
    static report(report) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const embed = yield this.createReportembed(report);
                return yield this.sendReportEmbed(embed);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`Signalement silencieux non transmis : ${error}`);
                return false;
            }
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
                // Le champ de la modale accepte 4000 caractères, un champ d'embed 1024 : au-delà l'embed
                // entier était refusé et le signalement perdu
                const reason = report.description.length > this.MAX_FIELD_LENGTH
                    ? `${report.description.slice(0, this.MAX_FIELD_LENGTH - 1)}…`
                    : report.description;
                simplediscordbot_1.EmbedManager.field(embed, { name: "Raison", value: reason });
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
                return false;
            // Le rôle modérateur n'existe pas sur le serveur de test : on y pingue les techniciens
            yield modoChannel.send({
                content: `<@&${simplediscordbot_1.BotEnv.dev ? HDFRRoles_1.HDFRRoles.technicien_debug : HDFRRoles_1.HDFRRoles.moderator}>`,
                embeds: [embed],
            });
            return true;
        });
    }
    static getMessageUrl(guildId, channelId, messageId) {
        return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
    }
}
exports.SilentReportSelectMenu = SilentReportSelectMenu;
SilentReportSelectMenu.MAX_FIELD_LENGTH = 1024;
/**
 * Chaque signalement pingue la modération : 3 par 10 minutes et par membre au plus. Vérifié dès
 * le clic droit, décompté à l'envoi (choix du motif, ou formulaire « Autre » validé).
 */
SilentReportSelectMenu.limiter = new rateLimiter_1.SlidingWindowLimiter(3, simplediscordbot_1.Time.minute.MIN_10.toMilliseconds());
