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
exports.WikiReportButton = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
const WikiReport_1 = require("../../modules/hdfr_public_functionnalities/WikiReport");
const WikiReportModal_1 = require("../modal/WikiReportModal");
/**
 * Bouton « Signaler une erreur » d'une fiche du wiki : ouvre le formulaire.
 *
 * Les fiches déjà affichées gardent leur bouton même après coupure du module ou blocage de
 * l'utilisateur — un message Discord ne se rafraîchit pas tout seul —, d'où les deux gardes ici :
 * elles évitent d'ouvrir un formulaire qui serait de toute façon rejeté à l'envoi.
 */
class WikiReportButton {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!WikiReport_1.WikiReport.isEnabled()) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Le signalement d'erreurs du wiki est temporairement désactivé."), true);
                    return;
                }
                const until = WikiReport_1.WikiReport.blockedUntil(interaction.user.id);
                if (until !== null) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Vous avez envoyé trop de signalements coup sur coup. " +
                        `Vous pourrez en envoyer un nouveau <t:${Math.ceil(until / 1000)}:R>.`), true);
                    return;
                }
                const key = interaction.customId.slice(WikiManager_1.WikiManager.REPORT_PREFIX.length);
                yield interaction.showModal(WikiReportModal_1.WikiReportModal.build(key));
            }
            catch (error) {
                // Le message d'origine est en Components V2 : lui répondre avec un `content` est refusé
                // par Discord, et le message d'erreur échouerait à son tour.
                if (!interaction.replied && !interaction.deferred) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Impossible d'ouvrir le formulaire de signalement."), true).catch(() => { });
                }
                simplediscordbot_1.Bot.log.error(simplediscordbot_1.EmbedManager.error(`WIKI : ouverture du signalement : ${error}`));
            }
        });
    }
}
exports.WikiReportButton = WikiReportButton;
