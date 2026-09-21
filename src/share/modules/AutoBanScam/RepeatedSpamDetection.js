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
exports.RepeatedSpamDetection = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
const ScamRules_1 = require("../../utils/ScamRules");
// Messages identiques comptés sur cette fenêtre, dans des salons différents
const WINDOW_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
// Message d'au moins MULTI_IMAGES_MIN images (scam « MrBeast ») : analysé sans attendre de répétition
const MULTI_IMAGES_MIN = 4;
// Même message avec au moins une image, répété dans REPEAT_CHANNELS_WITH_IMAGE salons → analyse
const REPEAT_CHANNELS_WITH_IMAGE = 4;
// Même message sans aucune image, répété dans REPEAT_CHANNELS_TEXT_ONLY salons → signalement seul
const REPEAT_CHANNELS_TEXT_ONLY = 5;
// Spam sans pièce jointe : texte plus court ignoré (« gg », « ok »… dans plusieurs salons)
const MIN_TEXT_LENGTH = 20;
const CONTENT_PREVIEW_MAX_LENGTH = 1000;
const OCR_PREVIEW_MAX_LENGTH = 800;
/**
 * Spam répété dans tous les salons écrits (hors « ne rien écrire ici ») : le même message (auteur + contenu
 * + pièces jointes) posté dans plusieurs salons différents en moins de WINDOW_MS, et messages contenant
 * beaucoup d'images.
 *
 * MODE OBSERVATION : ce module ne sanctionne plus rien — pas de ban, pas d'avertissement en MP, pas de
 * suppression. Il déclenche ScamImageAnalysis (empreintes perceptuelles puis OCR) et publie tout ce
 * qu'il trouve dans #retour_bot, le temps de régler les seuils et d'écrire les règles de mots-clés.
 * Le salon piège (NeRienEcrireIciDetection) continue, lui, de bannir normalement.
 *
 * Trois cas :
 * - message d'au moins MULTI_IMAGES_MIN images : analysé immédiatement, sans attendre de répétition ;
 * - même message avec au moins une image, vu dans REPEAT_CHANNELS_WITH_IMAGE salons : analysé ;
 * - même message sans image, vu dans REPEAT_CHANNELS_TEXT_ONLY salons : signalé seulement, il n'y a
 *   rien à analyser.
 */
class RepeatedSpamDetection extends AutoBanScamBase_1.AutoBanScamBase {
    /** @param analyse laissé à null si le serveur ne branche pas l'analyse d'images */
    constructor(config, analyse = null) {
        super(config);
        this.analyse = analyse;
        this.name = "AutoBanScam RepeatedSpam";
        this.description = "Observation mode: report repeated messages and multi-image messages in #retour_bot and run the image analysis on them, without any sanction";
        // clé du message (auteur + contenu + pièces jointes) → salon → horodatage du dernier envoi
        this.tracker = new Map();
        this.analyseEnCours = new Set();
    }
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.detectRepeatedSpam(message); }
        };
    }
    detectRepeatedSpam(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!message.inGuild() || message.guildId != this.config.guildId || message.author.bot
                || this.isNeRienEcrireIciChannel(message.channelId)) {
                return;
            }
            const now = Date.now();
            this.purge(now);
            // Texte sans pièce jointe trop court : ne concerne que le spam classique, 4 liens d'images ne tiennent
            // pas dans MIN_TEXT_LENGTH caractères
            if (message.attachments.size === 0 && message.content.trim().length < MIN_TEXT_LENGTH) {
                return;
            }
            if (this.analyseEnCours.has(message.author.id)) {
                return;
            }
            // Taille + dimensions + type : un même fichier renvoyé les garde, contrairement à son nom
            const attachmentsKey = message.attachments.map(a => `${a.size}:${a.width}x${a.height}:${a.contentType}`).sort().join("|");
            const key = JSON.stringify([message.author.id, message.content, attachmentsKey]);
            const channels = (_a = this.tracker.get(key)) !== null && _a !== void 0 ? _a : new Map();
            channels.set(message.channelId, now);
            this.tracker.set(key, channels);
            const nbImages = this.countImages(message);
            const messageMultiImages = nbImages >= MULTI_IMAGES_MIN;
            const repetitionAvecImage = nbImages > 0 && channels.size >= REPEAT_CHANNELS_WITH_IMAGE;
            const repetitionSansImage = nbImages == 0 && channels.size >= REPEAT_CHANNELS_TEXT_ONLY;
            if (!messageMultiImages && !repetitionAvecImage && !repetitionSansImage) {
                return;
            }
            const motif = messageMultiImages
                ? `${nbImages} images dans un seul message`
                : `message identique dans ${channels.size} salons en moins d'une minute`;
            // Compteur remis à zéro, et pas de second déclenchement pendant le traitement
            this.tracker.delete(key);
            this.analyseEnCours.add(message.author.id);
            try {
                const verdicts = repetitionSansImage ? null : yield this.lancerAnalyse(message);
                yield this.signaler(message, motif, channels.size, nbImages, verdicts);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Spam répété : ${error}`));
            }
            finally {
                this.analyseEnCours.delete(message.author.id);
            }
        });
    }
    purge(now) {
        for (const [key, channels] of this.tracker) {
            for (const [channelId, timestamp] of channels) {
                if (now - timestamp > WINDOW_MS)
                    channels.delete(channelId);
            }
            if (channels.size === 0)
                this.tracker.delete(key);
        }
    }
    /** @returns null si aucune analyse n'est branchée sur ce serveur */
    lancerAnalyse(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.analyse == null) {
                return null;
            }
            return yield this.analyse.analyserMessage(message);
        });
    }
    /** Rapport complet dans #retour_bot : c'est la seule action du module pendant l'observation */
    signaler(message, motif, nbSalons, nbImages, verdicts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const trouve = (_a = verdicts === null || verdicts === void 0 ? void 0 : verdicts.some(verdict => verdict.origine != null)) !== null && _a !== void 0 ? _a : false;
                const embed = simplediscordbot_1.EmbedManager.create(trouve ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow);
                embed.setTitle(trouve ? "🚨 Spam détecté, image reconnue" : "⚠️ Spam détecté, image non reconnue");
                const content = message.content.trim();
                simplediscordbot_1.EmbedManager.fields(embed, [
                    { name: "Déclencheur", value: motif },
                    { name: "Auteur", value: `<@${message.author.id}> / ${message.author.username} (${message.author.id})` },
                    { name: "Salon", value: `<#${message.channelId}>` },
                    { name: "Salons touchés", value: `${nbSalons}` },
                    { name: "Images", value: `${nbImages}` },
                    { name: "Message", value: message.url },
                    { name: "Contenu", value: content ? content.slice(0, CONTENT_PREVIEW_MAX_LENGTH) : "*(message sans texte)*" },
                ]);
                simplediscordbot_1.EmbedManager.fields(embed, this.champsAnalyse(verdicts));
                yield simplediscordbot_1.Bot.log.info(embed);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Rapport de spam répété : ${error}`));
            }
        });
    }
    champsAnalyse(verdicts) {
        if (verdicts == null) {
            return [{ name: "Analyse", value: "*(aucune analyse d'images branchée sur ce serveur, ou message sans image)*" }];
        }
        if (verdicts.length == 0) {
            return [{ name: "Analyse", value: "*(aucune pièce jointe analysable : les liens d'images ne sont pas téléchargés)*" }];
        }
        return verdicts.map((verdict, index) => ({
            name: `Image ${index + 1}`,
            value: this.decrireVerdict(verdict)
        }));
    }
    decrireVerdict(verdict) {
        if (verdict.empreinte == null) {
            return "Image illisible (format non géré ou fichier corrompu)";
        }
        const empreinte = `pHash \`${verdict.empreinte.phash}\` / dHash \`${verdict.empreinte.dhash}\``;
        if (verdict.origine == "empreinte" && verdict.entreeBanque != null) {
            return `✅ Déjà dans la banque — ${empreinte}\nRaison enregistrée : ${verdict.entreeBanque.raison} (vue ${verdict.entreeBanque.vues} fois)`;
        }
        if (verdict.origine == "ocr" && verdict.regleDeclenchee != null) {
            return `✅ Règle OCR déclenchée : \`${(0, ScamRules_1.formaterRegles)([verdict.regleDeclenchee])}\`\n${empreinte}\nTexte lu : ${this.extraitOcr(verdict.texteOcr)}`;
        }
        return `❌ Rien trouvé — ${empreinte}\nTexte lu : ${this.extraitOcr(verdict.texteOcr)}`;
    }
    extraitOcr(texte) {
        if (texte == null) {
            return "*(OCR non exécuté : aucune règle définie, ou image trop lourde)*";
        }
        if (texte.trim().length == 0) {
            return "*(aucun texte reconnu)*";
        }
        return texte.slice(0, OCR_PREVIEW_MAX_LENGTH);
    }
}
exports.RepeatedSpamDetection = RepeatedSpamDetection;
