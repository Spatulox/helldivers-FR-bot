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
exports.AutoBanScamBase = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const MessageManager_1 = require("../../managers/MessageManager");
const BotDeletedMessages_1 = require("../../managers/BotDeletedMessages");
const delete_occurence_1 = require("../../interactions/context-menu/delete_occurence");
const ModerateMemberModal_1 = require("../../interactions/modal/ModerateMemberModal");
const sanction_1 = require("../../interactions/commands/moderate_members/sanction");
const AutoBanScamInterface_1 = require("./AutoBanScamInterface");
const FileExtension_1 = require("../../utils/FileExtension");
/**
 * Protection anti-scam : logique commune, ne réagit à rien toute seule.
 *
 * Chaque type de détection en hérite et fournit ses propres `events`, puis appelle `sanctionScam`.
 * Les IDs du serveur arrivent par un `AutoBanScamConfig` injecté. Sous-modules regroupés dans la
 * MultiModule « AutoBanScam » de chaque serveur :
 * - `AutoBanScamInterface` : panneau d'avertissement de #ne_rien_ecrire_ici (compteur « Rongeurs attrapés »,
 *   message de test posté puis supprimé toutes les heures) ;
 * - `NeRienEcrireIciDetection` : tout message d'un membre dans un salon « ne rien écrire ici » ;
 * - `RepeatedSpamDetection` : même message dans plusieurs salons en moins d'une minute — message de 4 images ou
 *   plus dans 4 salons : ban ; tout autre message dans 5 salons : avertissement en MP ; suppression des occurrences
 *   dans les deux cas ;
 * - `MultipleImagesDetection` : alerte dans #retour_bot pour un message à plus de 4 images (ne sanctionne pas) ;
 * - `Mee6WarningCleanup` : suppression des embeds d'avertissement de Mee6 (ne sanctionne pas).
 *
 * Sanction (`sanctionScam`) : embed dans #rapport + fil (copie du message, images, statut du MP),
 * embed dans #infraction, MP au membre, ban (exclusion 7j si staff), suppression de toutes les occurrences
 * du message sur le serveur, incrément du compteur et rafraîchissement du panneau.
 * Un technicien qui écrit `$test` déclenche la chaîne en mode test : l'embed d'infraction part dans
 * #bot-brouillons au lieu de #infraction, et aucune sanction n'est appliquée.
 */
class AutoBanScamBase extends discord_module_1.Module {
    constructor(config) {
        super();
        this.config = config;
    }
    isNeRienEcrireIciChannel(channelId) {
        return this.config.neRienEcrireIciChannels.includes(channelId);
    }
    /** Nombre d'images d'un message : pièces jointes image + liens d'images dans le contenu */
    countImages(message) {
        const attachments = message.attachments.filter(a => { var _a; return ((_a = a.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image")) || (0, FileExtension_1.isImageFile)(a.name); }).size;
        return attachments + (0, FileExtension_1.countImageUrls)(message.content);
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
            const guild = simplediscordbot_1.Bot.client.guilds.cache.get(this.config.guildId);
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
    /**
     * Chaîne de sanction anti-scam : rapport (embed + fil avec copie du message), infraction, MP,
     * puis ban (ou exclusion 7j si staff) et suppression des occurrences du message.
     * @param sendToAlert copie aussi l'embed et le message dans #alert
     */
    sanctionScam(message, sendToAlert) {
        return __awaiter(this, void 0, void 0, function* () {
            let attachmentsBuffers = [];
            let rapportThread = null;
            let triggerDeleted = false;
            yield this.config.onScamCaught();
            yield AutoBanScamInterface_1.AutoBanScamInterface.refresh();
            try {
                if (message.attachments.size > 0) {
                    attachmentsBuffers = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
                }
                // Marqué comme suppression du bot : AlertMessageDelete ne doit pas le signaler
                if (message.deletable) {
                    yield BotDeletedMessages_1.BotDeletedMessages.deleteAsBot(message);
                    triggerDeleted = true;
                }
                const auth = yield simplediscordbot_1.GuildManager.user.findInGuild(this.config.guildId, message.author.id);
                if (auth == null) {
                    return;
                }
                let title = this.config.isStaff(auth) ? sanction_1.SanctionTitle.EXCLUSION_7D : sanction_1.SanctionTitle.BANNISSEMENT;
                let description = "PROTECTION ANTI-SCAM";
                let isTesting = false;
                if (this.config.isTechnician(auth) && message.content == "$test") {
                    isTesting = true;
                    title = sanction_1.SanctionTitle.TECHNICIAN_TEST;
                    description = "LIVE TESTING, DON'T DO ANYTHING";
                }
                const embedInfraction = yield ModerateMemberModal_1.ModerateMembersModal.createMemberEmbed(message.author.id, title, description);
                // Send to #alert
                if (sendToAlert) {
                    try {
                        const channelAlert = yield simplediscordbot_1.GuildManager.channel.text.find(this.config.alertChannel);
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
                }
                // Send #rapport and create a thread
                try {
                    const channelRapport = yield simplediscordbot_1.GuildManager.channel.text.find(this.config.rapportChannel);
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
                    channelInfraction = yield simplediscordbot_1.GuildManager.channel.text.find(this.config.botBrouillonChannel);
                }
                else {
                    channelInfraction = yield simplediscordbot_1.GuildManager.channel.text.find(this.config.infractionChannel);
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
                if (this.config.isStaff(auth)) {
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
                    yield this.removeOccurence(message, triggerDeleted);
                }
                catch (error) {
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
                }
            }
        });
    }
    /**
     * Supprime les autres exemplaires du message et envoie le récapitulatif, comme la commande
     * « supprimer les occurrences » : salon admin + #retour_bot.
     * @param triggerDeleted le message déclencheur a déjà été supprimé : il figure en tête du récapitulatif
     */
    removeOccurence(message, triggerDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.inGuild()) {
                return false;
            }
            const [b, m] = yield (0, delete_occurence_1.deleteOccurrences)(message.guild, message.guild.members.me, (0, delete_occurence_1.getMessageSignature)(message), triggerDeleted ? [message] : []);
            yield (0, delete_occurence_1.sendDeleteOccurenceReport)(m, this.config.botType);
            return b;
        });
    }
}
exports.AutoBanScamBase = AutoBanScamBase;
