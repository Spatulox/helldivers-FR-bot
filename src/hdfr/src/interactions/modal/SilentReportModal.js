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
class SilentReportModal {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const [type, userId, messageId, reportTypeValue] = interaction.customId.split('|');
            if (type !== 'report_other') {
                yield interaction.reply({
                    content: 'Erreur de configuration',
                    flags: discord_js_1.MessageFlags.Ephemeral
                });
                simplediscordbot_1.Bot.log.error("Signalementsilencieux : configuration modal error");
                return;
            }
            const fromMessage = interaction.isFromMessage();
            // Formulaire resté ouvert pendant que le quota se remplissait (autre onglet, autre signalement)
            if (!SilentReportSelectMenu_1.SilentReportSelectMenu.isExempt(interaction) && !SilentReportSelectMenu_1.SilentReportSelectMenu.limiter.consume(interaction.user.id)) {
                const embed = SilentReportSelectMenu_1.SilentReportSelectMenu.limitedEmbed(interaction.user.id);
                if (fromMessage) {
                    yield interaction.update({ content: "", embeds: [embed], components: [] });
                }
                else {
                    yield interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
                }
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
            // Ouverte depuis le menu de signalement : on remplacera ce message pour retirer le menu.
            // Accusé de réception d'abord, l'envoi peut dépasser les 2 s surveillées par ErrorGuard
            if (fromMessage) {
                yield interaction.deferUpdate();
            }
            else {
                yield interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            }
            const embed = SilentReportSelectMenu_1.SilentReportSelectMenu.resultEmbed(yield SilentReportSelectMenu_1.SilentReportSelectMenu.report(report));
            yield interaction.editReply({ content: fromMessage ? "" : undefined, embeds: [embed], components: [] });
        });
    }
}
exports.SilentReportModal = SilentReportModal;
SilentReportModal.TITLE = "Signalement";
