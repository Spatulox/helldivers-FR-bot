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
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
const ScamRules_1 = require("../../utils/ScamRules");
// Messages identiques comptés sur cette fenêtre, dans des salons différents
const WINDOW_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
// Message d'au moins MULTI_IMAGES_MIN images (scam « MrBeast ») : analysé sans attendre de répétition
const MULTI_IMAGES_MIN = 4;
// Même message avec au moins une image, répété dans REPEAT_CHANNELS_WITH_IMAGE salons → analyse
const REPEAT_CHANNELS_WITH_IMAGE = 4;
// Même message sans aucune image, répété dans REPEAT_CHANNELS_TEXT_ONLY salons → signalement seul
const REPEAT_CHANNELS_TEXT_ONLY = 5;
// Un seul déclenchement par auteur sur ce délai : une rafale de spam n'est analysée qu'une fois
const ANALYSIS_COOLDOWN_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
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
 *
 * Un auteur ne déclenche qu'une analyse (ou un signalement) par ANALYSIS_COOLDOWN_MS : les
 * déclenchements suivants de la même rafale sont ignorés en silence.
 */
class RepeatedSpamDetection extends AutoBanScamBase_1.AutoBanScamBase {
    /** @param analysis laissé à null si le serveur ne branche pas l'analyse d'images */
    constructor(config, analysis = null) {
        super(config);
        this.analysis = analysis;
        this.name = "AutoBanScam RepeatedSpam";
        this.description = "Observation mode: report repeated messages and multi-image messages in #retour_bot and run the image analysis on them, without any sanction";
        // clé du message (auteur + contenu + pièces jointes) → salon → horodatage du dernier envoi
        this.tracker = new Map();
        this.runningAnalysis = new Set();
        // Consulté seulement quand un déclencheur tombe : l'appeler à chaque message consommerait le jeton
        // sur un message banal, et le vrai spam de la minute ne serait jamais analysé
        this.analysisLimiter = new discord_js_rate_limiter_1.RateLimiter(1, ANALYSIS_COOLDOWN_MS);
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
            if (this.runningAnalysis.has(message.author.id)) {
                return;
            }
            // Taille + dimensions + type : un même fichier renvoyé les garde, contrairement à son nom
            const attachmentsKey = message.attachments.map(a => `${a.size}:${a.width}x${a.height}:${a.contentType}`).sort().join("|");
            const key = JSON.stringify([message.author.id, message.content, attachmentsKey]);
            const channels = (_a = this.tracker.get(key)) !== null && _a !== void 0 ? _a : new Map();
            channels.set(message.channelId, now);
            this.tracker.set(key, channels);
            const imageCount = this.countImages(message);
            const multiImageMessage = imageCount >= MULTI_IMAGES_MIN;
            const repeatWithImage = imageCount > 0 && channels.size >= REPEAT_CHANNELS_WITH_IMAGE;
            const repeatTextOnly = imageCount == 0 && channels.size >= REPEAT_CHANNELS_TEXT_ONLY;
            if (!multiImageMessage && !repeatWithImage && !repeatTextOnly) {
                return;
            }
            const trigger = multiImageMessage
                ? `${imageCount} images dans un seul message`
                : `message identique dans ${channels.size} salons en moins d'une minute`;
            // Compteur remis à zéro, et pas de second déclenchement pendant le traitement
            this.tracker.delete(key);
            // Déjà déclenché il y a moins d'une minute : la rafale est connue, on ne relance rien. runningAnalysis
            // reste utile, le délai part du début de l'analyse et l'OCR de 4 images peut dépasser la minute
            if (this.analysisLimiter.take(message.author.id)) {
                return;
            }
            this.runningAnalysis.add(message.author.id);
            try {
                const verdicts = repeatTextOnly ? null : yield this.runAnalysis(message);
                yield this.report(message, trigger, channels.size, imageCount, verdicts);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Spam répété : ${error}`));
            }
            finally {
                this.runningAnalysis.delete(message.author.id);
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
    runAnalysis(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.analysis == null) {
                return null;
            }
            return yield this.analysis.analyzeMessage(message);
        });
    }
    /** Rapport complet dans #retour_bot : c'est la seule action du module pendant l'observation */
    report(message, trigger, channelCount, imageCount, verdicts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const found = (_a = verdicts === null || verdicts === void 0 ? void 0 : verdicts.some(verdict => verdict.source != null)) !== null && _a !== void 0 ? _a : false;
                // Mode observation : on dit seulement ce que la prod ferait
                const confirmed = (_b = verdicts === null || verdicts === void 0 ? void 0 : verdicts.some(verdict => verdict.confirmed)) !== null && _b !== void 0 ? _b : false;
                const embed = simplediscordbot_1.EmbedManager.create(found ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow);
                embed.setTitle(confirmed
                    ? "🚨 Spam détecté, empreinte confirmée (ban en prod)"
                    : found ? "🚨 Spam détecté, image reconnue" : "⚠️ Spam détecté, image non reconnue");
                const content = message.content.trim();
                simplediscordbot_1.EmbedManager.fields(embed, [
                    { name: "Déclencheur", value: trigger },
                    { name: "Auteur", value: `<@${message.author.id}> / ${message.author.username} (${message.author.id})` },
                    { name: "Salon", value: `<#${message.channelId}>` },
                    { name: "Salons touchés", value: `${channelCount}` },
                    { name: "Images", value: `${imageCount}` },
                    { name: "Message", value: message.url },
                    { name: "Contenu", value: content ? content.slice(0, CONTENT_PREVIEW_MAX_LENGTH) : "*(message sans texte)*" },
                ]);
                simplediscordbot_1.EmbedManager.fields(embed, this.analysisFields(verdicts));
                yield simplediscordbot_1.Bot.log.info(embed);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Rapport de spam répété : ${error}`));
            }
        });
    }
    analysisFields(verdicts) {
        if (verdicts == null) {
            return [{ name: "Analyse", value: "*(aucune analyse d'images branchée sur ce serveur, ou message sans image)*" }];
        }
        if (verdicts.length == 0) {
            return [{ name: "Analyse", value: "*(aucune pièce jointe analysable : les liens d'images ne sont pas téléchargés)*" }];
        }
        return verdicts.map((verdict, index) => ({
            name: `Image ${index + 1}`,
            value: this.describeVerdict(verdict)
        }));
    }
    describeVerdict(verdict) {
        if (verdict.hash == null) {
            return "Image illisible (format non géré ou fichier corrompu)";
        }
        const hash = `pHash \`${verdict.hash.phash}\` / dHash \`${verdict.hash.dhash}\``;
        const status = verdict.bankEntry != null ? ScamImageAnalysis_1.ScamImageAnalysis.describeStatus(verdict.bankEntry, verdict.bankScope) : null;
        if (verdict.bankOutcome == "whitelisted") {
            return `🚫 Empreinte rejetée par un technicien (liste blanche), aucune sanction — ${hash}`;
        }
        if (verdict.source == "hash" && verdict.bankEntry != null) {
            const bank = verdict.bankScope == "global" ? "banque globale" : "banque du serveur";
            return `✅ Déjà dans la ${bank}, ${status} — ${hash}\nRaison enregistrée : ${verdict.bankEntry.reason}`;
        }
        if (verdict.source == "ocr" && verdict.matchedRule != null) {
            const scope = verdict.matchedRule.scope == "global" ? "globale" : "serveur";
            return `✅ Règle OCR ${scope} déclenchée : \`${(0, ScamRules_1.formatRules)([verdict.matchedRule.group])}\``
                + (status != null ? `\nEmpreinte ${status}` : "")
                + `\n${hash}\nTexte lu : ${this.ocrExcerpt(verdict.ocrText)}`;
        }
        if (verdict.hashMatch != null) {
            return `❌ Empreinte connue (${status}) mais l'OCR ne la confirme pas — ${hash}\nTexte lu : ${this.ocrExcerpt(verdict.ocrText)}`;
        }
        return `❌ Rien trouvé — ${hash}\nTexte lu : ${this.ocrExcerpt(verdict.ocrText)}`;
    }
    ocrExcerpt(text) {
        if (text == null) {
            return "*(OCR non exécuté : aucune règle définie, ou image trop lourde)*";
        }
        if (text.trim().length == 0) {
            return "*(aucun texte reconnu)*";
        }
        return text.slice(0, OCR_PREVIEW_MAX_LENGTH);
    }
}
exports.RepeatedSpamDetection = RepeatedSpamDetection;
