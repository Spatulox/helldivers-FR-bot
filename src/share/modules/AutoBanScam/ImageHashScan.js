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
exports.ImageHashScan = void 0;
const discord_js_1 = require("discord.js");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const AutoBanScamBase_1 = require("./AutoBanScamBase");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
const RepeatedSpamDetection_1 = require("./RepeatedSpamDetection");
// Une même image du même auteur n'est signalée qu'une fois sur ce délai : une rafale = un rapport
const REPORT_COOLDOWN_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
/**
 * Scan par empreinte de TOUTES les images postées sur le serveur (hors salons « ne rien écrire
 * ici »), sans attendre de répétition : une image de scam déjà en banque, postée une seule fois dans
 * un seul salon, passait jusque-là inaperçue.
 *
 * Seul l'étage empreintes tourne (ScamImageAnalysis.scanMessage, quelques ms par image) : ni OCR, ni
 * écriture en banque. Une correspondance sans OCR ne compte pas vers la confirmation d'une entrée,
 * sinon une image légitime ajoutée par erreur se confirmerait toute seule.
 *
 * MODE OBSERVATION : rien n'est sanctionné. Un rapport n'est publié dans #retour_bot que si une
 * image est reconnue (entrée confirmée, en quarantaine, ou correspondance proche du seuil) ; une
 * image reconnue nettement comme rejetée (liste blanche) ou inconnue ne produit rien.
 *
 * Un message d'au moins MULTI_IMAGES_MIN images est laissé à RepeatedSpamDetection, qui le passe
 * déjà en entier par l'analyse complète (empreintes + OCR) : pas de double rapport.
 */
class ImageHashScan extends AutoBanScamBase_1.AutoBanScamBase {
    constructor(config, analysis) {
        super(config);
        this.analysis = analysis;
        this.name = "AutoBanScam Hash Scan";
        this.description = "Observation mode: compare every posted image with the hash banks, and report known images in #retour_bot without any OCR or sanction";
        this.reportLimiter = new discord_js_rate_limiter_1.RateLimiter(1, REPORT_COOLDOWN_MS);
    }
    get events() {
        return {
            [discord_js_1.Events.MessageCreate]: (message) => { this.scan(message); }
        };
    }
    scan(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.inGuild() || message.guildId != this.config.guildId || message.author.bot
                || this.isNeRienEcrireIciChannel(message.channelId) || message.attachments.size == 0) {
                return;
            }
            if (this.countImages(message) >= RepeatedSpamDetection_1.MULTI_IMAGES_MIN) {
                return;
            }
            try {
                const hits = yield this.analysis.scanMessage(message);
                for (const hit of hits) {
                    // Clé par entrée et non par empreinte : deux variantes de la même image ne font qu'un rapport
                    if (this.reportLimiter.take(`${message.author.id}:${hit.match.entry.id}`)) {
                        continue;
                    }
                    yield ScamImageAnalysis_1.ScamImageAnalysis.sendReport(imageUrl => this.buildReport(message, hit, imageUrl), hit.buffer, hit.name);
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Scan par empreinte : ${error}`));
            }
        });
    }
    /** @param imageUrl URL `attachment://…` de l'image jointe, null si le rapport part sans elle */
    buildReport(message, hit, imageUrl) {
        const confirmed = ScamImageAnalysis_1.ScamImageAnalysis.isConfirmedMatch(hit.match);
        const container = simplediscordbot_1.ComponentManager.create({
            title: `## ${confirmed ? "🔒 Image confirmée repérée" : "🔎 Image connue repérée"} — ${hit.name}`,
            color: confirmed ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.orange,
            separator: false
        });
        // En spoiler : la pub de scam n'a pas à rester affichée en permanence dans le salon
        if (imageUrl != null) {
            simplediscordbot_1.ComponentManager.mediaGallery(container, [{ url: imageUrl, spoiler: true }]);
        }
        simplediscordbot_1.ComponentManager.fields(container, [
            { name: "Auteur", value: `<@${message.author.id}> / ${message.author.username} (${message.author.id})` },
            { name: "Salon", value: `<#${message.channelId}>` },
            { name: "Message", value: message.url },
            { name: "Résultat", value: ScamImageAnalysis_1.ScamImageAnalysis.describeMatch(hit.match, this.analysis.hash.bankSizes()) },
            { name: "Empreintes", value: `pHash \`${hit.hash.phash}\`\ndHash \`${hit.hash.dhash}\`` },
        ]);
        return container;
    }
}
exports.ImageHashScan = ImageHashScan;
