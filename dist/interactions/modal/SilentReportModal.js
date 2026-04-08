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
exports.SilentReportModal = void 0;
const discord_js_1 = require("discord.js");
const SilentReportSelectMenu_1 = require("../selectmenu/SilentReportSelectMenu");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const silent_report_1 = require("../context-menu/silent_report");
const HDFR_1 = require("../../utils/HDFR");
class SilentReportModal {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const [type, userId, messageId, reportTypeValue] = interaction.customId.split('|');
            if (type !== 'report_other') {
                yield interaction.reply({
                    content: 'Erreur de configuration',
                    ephemeral: true
                });
                simplediscordbot_1.Bot.log.error("Signalementsilencieux : configuration modal error");
                return;
            }
            const reason = interaction.fields.getTextInputValue(`${interaction.customId}_Raison`);
            const report = {
                element: silent_report_1.SilentReportContextMenu.getOptionByValue(reportTypeValue),
                user_id: userId || undefined,
                message_id: messageId || undefined,
                description: reason,
                author: interaction.user
            };
            SilentReportSelectMenu_1.SilentReportSelectMenu.report(report);
            const embed = simplediscordbot_1.EmbedManager.success("Merci pour votre signalement, les modérateurs en prendront connaissance sous peu");
            simplediscordbot_1.EmbedManager.field(embed, { name: "Info", value: `Si vous avez des preuves (MP, Screenshot...), veuillez ouvrir un ticket modérateur dans <#${HDFR_1.HDFRChannelID.contact_staff}>` });
            yield interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral
            });
        });
    }
}
exports.SilentReportModal = SilentReportModal;
SilentReportModal.TITLE = "Signalement";
