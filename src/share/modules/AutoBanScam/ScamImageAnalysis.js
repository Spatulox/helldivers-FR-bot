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
exports.ScamImageAnalysis = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const ScamRules_1 = require("../../utils/ScamRules");
const BotResources_1 = require("../../utils/BotResources");
const FileExtension_1 = require("../../utils/FileExtension");
const ImageOcr_1 = require("../../utils/ImageOcr");
const MessageManager_1 = require("../../managers/MessageManager");
const ImageHashDetection_1 = require("./ImageHashDetection");
const ImageOcrDetection_1 = require("./ImageOcrDetection");
// Au-delà, on ne déclenche pas l'OCR sur tout un album : le spam d'images est déjà traité ailleurs
const MAX_ANALYZED_IMAGES = 4;
const OCR_PREVIEW_MAX_LENGTH = 600;
// Même plafond que MAX_OCR_BYTES : au-delà on ne ré-uploade pas l'image dans le rapport
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const EMPTY_VERDICT = {
    hash: null,
    source: null,
    bankEntry: null,
    bankScope: null,
    matchedRule: null,
    ocrText: null
};
class ScamImageAnalysis extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis";
        this.description = "Chain the perceptual hash and the OCR analysis of an image, feed the matching hash bank, and report every OCR run in #retour_bot";
        this.hash = new ImageHashDetection_1.ImageHashDetection();
        this.ocr = new ImageOcrDetection_1.ImageOcrDetection();
        this.subModules = [this.hash, this.ocr];
    }
    get events() {
        return {};
    }
    /**
     * Analyse une image : empreintes d'abord, OCR seulement si elle est inconnue.
     * @param fileName affiché dans le rapport ; « image » quand l'appelant ne le connaît pas
     */
    analyze(buffer_1) {
        return __awaiter(this, arguments, void 0, function* (buffer, fileName = "image") {
            var _a;
            // Chaque fenêtre tourne un setInterval : elle doit être refermée sur tous les chemins
            const endHashes = (0, BotResources_1.startResourceWindow)();
            const hashResult = yield this.hash.analyze(buffer);
            const hashesUsage = endHashes();
            if (hashResult == null) {
                // Image illisible : ni empreinte ni OCR n'en tireront quoi que ce soit
                return Object.assign({}, EMPTY_VERDICT);
            }
            const hash = hashResult.hash;
            if (hashResult.match != null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, source: "hash", bankEntry: hashResult.match.entry, bankScope: hashResult.match.scope });
            }
            // Relevé avant l'OCR : un ajout à la fin fausserait le « N comparées » du rapport
            const bankSizes = this.hash.bankSizes();
            // ocr.analyze() renvoie aussi null sans lancer l'OCR quand aucune règle n'existe : pas de rapport
            const ocrWillRun = this.ocr.globalRules.length > 0 || this.ocr.serverRules.length > 0;
            const endOcr = (0, BotResources_1.startResourceWindow)();
            const endBank = (0, BotResources_1.startResourceWindow)();
            const ocrResult = yield this.ocr.analyze(buffer);
            const ocrUsage = endOcr();
            // L'image entre dans la banque de la portée de la règle : la prochaine fois, le premier
            // étage suffira, et une règle serveur ne fait jamais entrer d'empreinte chez les autres bots
            const matchedRule = (_a = ocrResult === null || ocrResult === void 0 ? void 0 : ocrResult.matchedRule) !== null && _a !== void 0 ? _a : null;
            const added = matchedRule != null
                ? yield this.hash.add(hash, (0, ScamRules_1.formatRules)([matchedRule.group]), matchedRule.scope)
                : null;
            const bankUsage = endBank();
            if (ocrWillRun) {
                yield this.postOcrReport({
                    fileName,
                    hash,
                    bankSizes,
                    ocr: ocrResult,
                    added,
                    steps: [
                        { name: "empreintes", usage: hashesUsage },
                        { name: "OCR", usage: ocrUsage },
                        { name: "OCR+banque", usage: bankUsage }
                    ]
                }, buffer);
            }
            if (ocrResult == null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash });
            }
            if (matchedRule == null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, ocrText: ocrResult.text });
            }
            return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, source: "ocr", matchedRule, ocrText: ocrResult.text });
        });
    }
    /** Point d'entrée pratique : télécharge les images du message et les analyse une à une */
    analyzeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.attachments.size == 0) {
                return [];
            }
            const parts = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
            const images = parts
                .filter(part => { var _a; return ((_a = part.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image")) || (0, FileExtension_1.isImageFile)(part.name); })
                .slice(0, MAX_ANALYZED_IMAGES);
            const verdicts = [];
            for (const image of images) {
                verdicts.push(yield this.analyze(image.buffer, image.name));
            }
            return verdicts;
        });
    }
    /**
     * Publie le rapport dans #retour_bot, avec l'image analysée en pièce jointe.
     *
     * Même mécanique que ScamImageAnalysisDebug : Bot.log.info() ne sait pas transporter de
     * fichier, on envoie donc soi-même dans le salon que la config de log destine au niveau info.
     * Tout ce qui manque fait retomber sur Bot.log.info(), rapport complet mais sans image. Un
     * échec d'envoi ne remonte jamais : le verdict compte plus que le rapport.
     */
    postOcrReport(report, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const logConfig = (_a = simplediscordbot_1.Bot.config.log) === null || _a === void 0 ? void 0 : _a.info;
                const image = this.buildReportAttachment(buffer, report.fileName);
                const channel = image != null && (logConfig === null || logConfig === void 0 ? void 0 : logConfig.discord) && logConfig.channelId
                    ? yield simplediscordbot_1.GuildManager.channel.text.find(logConfig.channelId)
                    : null;
                if (channel == null || image == null) {
                    yield simplediscordbot_1.Bot.log.info(this.buildOcrReport(report, null));
                    return;
                }
                yield simplediscordbot_1.Bot.message.send(channel, simplediscordbot_1.ComponentManager.toMessage(this.buildOcrReport(report, image.url), [image.attachment]));
            }
            catch (error) {
                // Rien à faire de plus : Bot.log.info a peut-être justement échoué
            }
        });
    }
    /**
     * Prépare l'image à joindre au rapport. Le nom est normalisé : un nom d'origine avec espaces ou
     * accents casse la résolution de `attachment://`.
     * @returns null si le fichier n'est pas une image ou s'il est trop lourd pour être ré-uploadé
     */
    buildReportAttachment(buffer, fileName) {
        if (!(0, FileExtension_1.isImageFile)(fileName) || buffer.length > MAX_ATTACHMENT_BYTES) {
            return null;
        }
        const name = `analyse${(0, FileExtension_1.getFileExtension)(fileName) || FileExtension_1.ImageExtension.png}`;
        return { attachment: new discord_js_1.AttachmentBuilder(buffer, { name }), url: `attachment://${name}` };
    }
    /** @param imageUrl URL `attachment://…` de l'image jointe, null si le rapport part sans elle */
    buildOcrReport(report, imageUrl) {
        var _a, _b;
        const rule = (_b = (_a = report.ocr) === null || _a === void 0 ? void 0 : _a.matchedRule) !== null && _b !== void 0 ? _b : null;
        const container = simplediscordbot_1.ComponentManager.create({
            title: `## 🔍 Analyse OCR — ${report.fileName}`,
            color: rule != null ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow,
            separator: false
        });
        // En spoiler : la pub de scam n'a pas à rester affichée en permanence dans le salon
        if (imageUrl != null) {
            simplediscordbot_1.ComponentManager.mediaGallery(container, [{ url: imageUrl, spoiler: true }]);
        }
        const compared = `${report.bankSizes.global} globale(s) + ${report.bankSizes.server} serveur`;
        simplediscordbot_1.ComponentManager.fields(container, [
            { name: "Mesures", value: this.reportMeasures(report.steps) },
            { name: "File OCR", value: (0, ImageOcr_1.formatOcrQueue)((0, ImageOcr_1.readOcrQueue)()) },
            { name: "Empreintes", value: `pHash \`${report.hash.phash}\`\ndHash \`${report.hash.dhash}\`` },
            { name: "Résultat empreinte", value: `❌ Inconnue des banques (${compared} comparées)` },
            { name: "Résultat OCR", value: this.reportOcr(report.ocr) },
            { name: "Banque", value: this.reportBank(rule, report.added) },
        ]);
        return container;
    }
    reportMeasures(steps) {
        const lines = steps.map(step => {
            const name = step.name.padEnd(12);
            const duration = `${step.usage.durationMs} ms`.padStart(8);
            const cpu = `${step.usage.cpuPercent} %`.padStart(8);
            const rss = (0, BotResources_1.formatBytes)(step.usage.rssEnd).padStart(9);
            // Le delta dit ce que l'étape a laissé derrière elle, le pic ce qu'elle a vraiment pris
            const delta = step.usage.rssEnd - step.usage.rssStart;
            const growth = `${delta >= 0 ? "+" : "-"}${(0, BotResources_1.formatBytes)(Math.abs(delta))}`;
            return `${name}${duration}   CPU ${cpu}   RSS ${rss} (pic ${(0, BotResources_1.formatBytes)(step.usage.rssPeak)}, ${growth})`;
        });
        return `\`\`\`\n${lines.join("\n")}\n\`\`\``;
    }
    reportOcr(ocr) {
        if (ocr == null) {
            return "*(OCR en échec : image trop lourde, illisible, ou délai dépassé)*";
        }
        const text = ocr.text.trim().length > 0
            ? ocr.text.slice(0, OCR_PREVIEW_MAX_LENGTH)
            : "*(aucun texte reconnu)*";
        if (ocr.matchedRule == null) {
            return `❌ Aucune règle déclenchée\nTexte lu : ${text}`;
        }
        const scope = ocr.matchedRule.scope == "global" ? "globale" : "serveur";
        return `✅ Règle ${scope} déclenchée : \`${(0, ScamRules_1.formatRules)([ocr.matchedRule.group])}\`\nTexte lu : ${text}`;
    }
    reportBank(rule, added) {
        if (rule == null || added == null) {
            return "➖ Rien à ajouter (aucune règle déclenchée)";
        }
        if (!added) {
            return "➖ Empreinte déjà présente, rien ajouté";
        }
        return `✅ Empreinte ajoutée à la ${rule.scope == "global" ? "banque globale" : "banque du serveur"}`;
    }
}
exports.ScamImageAnalysis = ScamImageAnalysis;
