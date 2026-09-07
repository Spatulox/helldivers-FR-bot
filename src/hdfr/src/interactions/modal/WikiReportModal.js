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
exports.WikiReportModal = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
const WikiReport_1 = require("../../modules/hdfr_public_functionnalities/WikiReport");
const wikiSubject_1 = require("../selectmenu/wikiSubject");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const HDFRRoles_1 = require("../../utils/hdfr_list/HDFRRoles");
const UserList_1 = require("../../../../share/utils/UserList");
/**
 * Formulaire de signalement d'erreur sur une fiche du wiki.
 *
 * Le rapport part à deux endroits, chacun protégé indépendamment : #retour_bot avec un ping du
 * rôle technicien, et en MP à Spatulox. Un MP fermé ne doit pas faire perdre le signalement, et
 * inversement.
 */
class WikiReportModal {
    /** Le formulaire, construit à partir de la clé de la fiche (chemin relatif à `WIKI_ROOT`). */
    static build(key) {
        return simplediscordbot_1.ModalManager.titleDescription(WikiReportModal.PREFIX + key, "Signaler une erreur", { label: "Titre", placeholder: "Résumez l'erreur en quelques mots", required: true }, { label: "Description", placeholder: "Qu'est-ce qui est faux, et que faudrait-il écrire ?", required: true });
    }
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!WikiReport_1.WikiReport.isEnabled()) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Le signalement d'erreurs du wiki est temporairement désactivé."), true);
                    return;
                }
                const key = interaction.customId.slice(WikiReportModal.PREFIX.length);
                const subjectPath = WikiManager_1.WikiManager.reportPath(key);
                const filePath = yield (0, wikiSubject_1.findMatchingFile)(subjectPath);
                const file = filePath ? yield simplediscordbot_1.FileManager.readJsonFile(filePath) : null;
                if (!filePath || !WikiManager_1.WikiManager.isWikiFile(file)) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Fiche introuvable : le signalement n'a pas pu être enregistré."), true);
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`WIKI : signalement sur une fiche introuvable (${subjectPath})`));
                    return;
                }
                // Le quota se décompte avant l'envoi : le signalement de trop ne doit pas partir.
                if (!WikiReport_1.WikiReport.consume(interaction.user.id)) {
                    const until = WikiReport_1.WikiReport.blockedUntil(interaction.user.id);
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Vous avez envoyé trop de signalements coup sur coup, celui-ci n'a pas été transmis." +
                        (until !== null ? ` Réessayez <t:${Math.ceil(until / 1000)}:R>.` : "")), true);
                    return;
                }
                const embed = WikiReportModal.buildEmbed(interaction, file.title, key, filePath);
                const [channelSent, dmSent] = yield Promise.all([
                    WikiReportModal.sendToChannel(embed),
                    WikiReportModal.sendToSpatulox(embed)
                ]);
                if (!channelSent && !dmSent) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Le signalement n'a pas pu être transmis. Prévenez un technicien."), true);
                    return;
                }
                yield WikiReportModal.acknowledge(interaction, file, subjectPath);
            }
            catch (error) {
                // Même précaution que dans `wikiSubject.ts` : le message d'origine est en Components V2,
                // lui répondre avec un `content` est refusé par Discord.
                if (!interaction.replied && !interaction.deferred) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue lors de l'envoi du signalement."), true).catch(() => { });
                }
                simplediscordbot_1.Bot.log.error(simplediscordbot_1.EmbedManager.error(`WIKI : envoi du signalement : ${error}`));
            }
        });
    }
    static buildEmbed(interaction, subjectTitle, key, filePath) {
        const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error);
        embed.setTitle("Signalement d'erreur — Wiki");
        simplediscordbot_1.EmbedManager.fields(embed, [
            { name: "Fiche", value: `**${subjectTitle}**\n${key}` },
            { name: "Fichier à corriger", value: `\`${filePath}\`` },
            {
                name: "Auteur du signalement",
                value: `<@${interaction.user.id}>\n\`${interaction.user.tag}\` (${interaction.user.id})`
            },
            { name: "Titre", value: WikiReportModal.field(interaction, "title") },
            { name: "Description", value: WikiReportModal.field(interaction, "desc") }
        ]);
        if (interaction.message) {
            simplediscordbot_1.EmbedManager.field(embed, { name: "Message signalé", value: interaction.message.url });
        }
        return embed;
    }
    /** `ModalManager.titleDescription` nomme ses champs `<customId>_title` et `<customId>_desc`. */
    static field(interaction, suffix) {
        const value = interaction.fields.getTextInputValue(`${interaction.customId}_${suffix}`);
        return value.length > WikiReportModal.MAX_FIELD_LENGTH
            ? `${value.slice(0, WikiReportModal.MAX_FIELD_LENGTH)}…`
            : value;
    }
    static sendToChannel(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFR.channel.retour_bot);
                if (!channel) {
                    simplediscordbot_1.Bot.log.error(`WIKI : salon retour_bot ${HDFR_1.HDFR.channel.retour_bot} introuvable`);
                    return false;
                }
                const role = simplediscordbot_1.BotEnv.dev ? HDFRRoles_1.HDFRRoles.technicien_debug : HDFRRoles_1.HDFRRoles.technicien;
                yield channel.send({ content: `<@&${role}>`, embeds: [embed] });
                return true;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`WIKI : signalement non envoyé dans #retour_bot : ${error}`);
                return false;
            }
        });
    }
    static sendToSpatulox(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sent = yield simplediscordbot_1.Bot.message.sendDM(UserList_1.UserList.shared.SPATULOX, embed);
                return sent !== null;
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`WIKI : signalement non envoyé en MP : ${error}`);
                return false;
            }
        });
    }
    /**
     * Retire le bouton de la fiche signalée et remercie l'auteur.
     *
     * Le bouton disparaît pour tout le monde : la fiche est un message public, et une erreur déjà
     * remontée n'a pas besoin de l'être dix fois. `isFromMessage()` est faux si le formulaire n'a
     * pas été ouvert depuis un message — il n'y a alors rien à mettre à jour.
     */
    static acknowledge(interaction, file, subjectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const thanks = simplediscordbot_1.EmbedManager.success("Merci pour votre signalement, les techniciens vont vérifier la fiche.");
            if (!interaction.isFromMessage()) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, thanks, true);
                return;
            }
            yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(WikiManager_1.WikiManager.createContainerFromFile(file, subjectPath, { report: false }), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
            yield simplediscordbot_1.Bot.interaction.followUp(interaction, thanks, true);
        });
    }
}
exports.WikiReportModal = WikiReportModal;
/**
 * Préfixe distinct de celui du bouton : boutons et modals vivent dans deux registres séparés,
 * mais un identifiant parlant rend les rapports de l'`ErrorGuard` lisibles.
 */
WikiReportModal.PREFIX = "wikiReportModal:";
WikiReportModal.MAX_FIELD_LENGTH = 1024;
