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
const ImageHash_1 = require("../../utils/ImageHash");
const ScamRules_1 = require("../../utils/ScamRules");
const BotResources_1 = require("../../utils/BotResources");
const FileExtension_1 = require("../../utils/FileExtension");
const ImageOcr_1 = require("../../utils/ImageOcr");
const MessageManager_1 = require("../../managers/MessageManager");
const ImageHashDetection_1 = require("./ImageHashDetection");
const ImageOcrDetection_1 = require("./ImageOcrDetection");
const ScamHashHistory_1 = require("./ScamHashHistory");
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
    bankStatus: null,
    hashMatch: null,
    bankOutcome: "none",
    confirmed: false,
    matchedRule: null,
    ocrText: null
};
class ScamImageAnalysis extends discord_module_1.MultiModule {
    constructor(config) {
        super();
        this.config = config;
        this.name = "AutoBanScam Image Analysis";
        this.description = "Chain the perceptual hash and the OCR analysis of an image, feed the matching hash bank, and report every OCR run in #retour_bot";
        this.hash = new ImageHashDetection_1.ImageHashDetection();
        this.ocr = new ImageOcrDetection_1.ImageOcrDetection();
        // Déclaré après hash : les initialiseurs de propriétés s'exécutent dans l'ordre de déclaration
        this.history = new ScamHashHistory_1.ScamHashHistory(this.config, this.hash);
        this.subModules = [this.hash, this.ocr];
    }
    get events() {
        return {};
    }
    /**
     * Une correspondance dispense de l'OCR seulement si l'entrée est CONFIRMÉE et la ressemblance
     * NETTE. En quarantaine ou proche du seuil, l'OCR tranche.
     */
    static skipsOcr(match) {
        return match != null && match.entry.status == "confirmed" && !match.near;
    }
    /**
     * La liste blanche ne vaut que pour une ressemblance NETTE avec une entrée rejetée. Une image
     * seulement proche d'une image légitime peut être une variante de scam : l'OCR tranche.
     */
    static isWhitelisted(match) {
        return match != null && match.entry.status == "rejected" && !match.near;
    }
    /**
     * Analyse une image : empreintes d'abord, OCR seulement si l'empreinte ne suffit pas à conclure.
     * @param fileName affiché dans les rapports ; « image » quand l'appelant ne le connaît pas
     * @param context message d'origine, gardé dans la banque pour la traçabilité ; null si inconnu
     */
    analyze(buffer_1) {
        return __awaiter(this, arguments, void 0, function* (buffer, fileName = "image", context = null) {
            var _a, _b;
            // Chaque fenêtre tourne un setInterval : elle doit être refermée sur tous les chemins
            const endHashes = (0, BotResources_1.startResourceWindow)();
            const image = yield this.decode(buffer);
            const hashResult = image != null ? yield this.hash.analyze(image) : null;
            const hashesUsage = endHashes();
            if (image == null || hashResult == null) {
                // Image illisible : ni empreinte ni OCR n'en tireront quoi que ce soit
                return Object.assign({}, EMPTY_VERDICT);
            }
            const hash = hashResult.hash;
            const match = hashResult.match;
            const noFeed = { outcome: "none", entry: null, scope: null };
            if (ScamImageAnalysis.isWhitelisted(match) || ScamImageAnalysis.skipsOcr(match)) {
                // Liste blanche, ou empreinte confirmée reconnue nettement : l'OCR n'apprendrait rien
                return this.buildVerdict(hash, match, null, noFeed, null);
            }
            // Relevé avant l'OCR : un ajout à la fin fausserait le « N comparées » du rapport
            const bankSizes = this.hash.bankSizes();
            // ocr.analyze() renvoie aussi null sans lancer l'OCR quand aucune règle n'existe : pas de rapport
            const ocrWillRun = this.ocr.globalRules.length > 0 || this.ocr.serverRules.length > 0;
            const endOcr = (0, BotResources_1.startResourceWindow)();
            const endBank = (0, BotResources_1.startResourceWindow)();
            const ocrResult = (0, ImageOcr_1.isOcrSizeAllowed)(buffer) ? yield this.ocr.analyze(image) : null;
            const ocrUsage = endOcr();
            const matchedRule = (_a = ocrResult === null || ocrResult === void 0 ? void 0 : ocrResult.matchedRule) !== null && _a !== void 0 ? _a : null;
            const feed = yield this.feedBank(hash, match, matchedRule, context, buffer, fileName);
            const bankUsage = endBank();
            if (ocrWillRun) {
                yield this.postOcrReport({
                    fileName,
                    hash,
                    bankSizes,
                    match,
                    ocr: ocrResult,
                    feed,
                    steps: [
                        { name: "empreintes", usage: hashesUsage },
                        { name: "OCR", usage: ocrUsage },
                        { name: "OCR+banque", usage: bankUsage }
                    ]
                }, buffer);
            }
            return this.buildVerdict(hash, match, matchedRule, feed, (_b = ocrResult === null || ocrResult === void 0 ? void 0 : ocrResult.text) !== null && _b !== void 0 ? _b : null);
        });
    }
    /**
     * Une règle OCR vient de tomber : l'image entre en banque (quarantaine, publiée dans
     * l'historique) si elle est inconnue, sinon sa détection est enregistrée sur l'entrée existante
     * (et l'historique réécrit). Une entrée serveur reconnue par une règle globale est d'abord
     * promue dans la banque globale. Une entrée rejetée ne bouge jamais : reconnue nettement, elle
     * bloque tout (liste blanche) ; seulement proche, l'image est traitée comme une autre image, et
     * rattachée à une entrée non rejetée ressemblante ou ajoutée à côté.
     * Partagé avec le jumeau de debug, pour que les deux alimentent les banques de la même façon.
     */
    feedBank(hash, match, rule, context, buffer, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (rule == null) {
                return { outcome: "none", entry: (_a = match === null || match === void 0 ? void 0 : match.entry) !== null && _a !== void 0 ? _a : null, scope: (_b = match === null || match === void 0 ? void 0 : match.scope) !== null && _b !== void 0 ? _b : null };
            }
            const reason = (0, ScamRules_1.formatRules)([rule.group]);
            const source = context != null ? Object.assign(Object.assign({}, context), { rule: reason, at: Date.now() }) : null;
            if (ScamImageAnalysis.isWhitelisted(match)) {
                return { outcome: "whitelisted", entry: (_c = match === null || match === void 0 ? void 0 : match.entry) !== null && _c !== void 0 ? _c : null, scope: (_d = match === null || match === void 0 ? void 0 : match.scope) !== null && _d !== void 0 ? _d : null };
            }
            // Proche d'une entrée rejetée seulement : on cherche une entrée non rejetée qui lui ressemble
            const known = (match === null || match === void 0 ? void 0 : match.entry.status) == "rejected" ? this.hash.findSimilar(hash, false) : match;
            if (known != null) {
                return yield this.recordKnown(known, rule, source);
            }
            const entry = yield this.hash.add(hash, reason, rule.scope, source);
            if (entry == null) {
                // Une image ressemblante est entrée entre la recherche et l'ajout (autre image du message)
                return { outcome: "unchanged", entry: null, scope: null };
            }
            yield this.history.publish(entry, rule.scope, buffer, fileName);
            return { outcome: "added", entry, scope: rule.scope };
        });
    }
    /** Image déjà en banque : promotion éventuelle, détection enregistrée, historique réécrit */
    recordKnown(match, rule, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const promoted = rule.scope == "global" && match.scope == "server";
            if (promoted) {
                yield this.hash.promote(match.entry);
            }
            const scope = promoted ? "global" : match.scope;
            const hit = yield this.hash.recordHit(match.entry, scope, source);
            if (hit != "unchanged" || promoted) {
                yield this.history.refresh(match.entry, scope);
            }
            return { outcome: hit, entry: match.entry, scope };
        });
    }
    /** Verdict commun à la prod et au debug, à partir de ce qu'ont donné les deux étages */
    buildVerdict(hash, match, rule, feed, ocrText) {
        var _a, _b, _c, _d, _e;
        const entry = (_b = (_a = feed.entry) !== null && _a !== void 0 ? _a : match === null || match === void 0 ? void 0 : match.entry) !== null && _b !== void 0 ? _b : null;
        const scope = (_d = (_c = feed.scope) !== null && _c !== void 0 ? _c : match === null || match === void 0 ? void 0 : match.scope) !== null && _d !== void 0 ? _d : null;
        const whitelisted = feed.outcome == "whitelisted" || ScamImageAnalysis.isWhitelisted(match);
        const source = whitelisted
            ? null
            : ScamImageAnalysis.skipsOcr(match) ? "hash" : (rule != null ? "ocr" : null);
        return {
            hash,
            source,
            bankEntry: entry,
            bankScope: scope,
            bankStatus: (_e = entry === null || entry === void 0 ? void 0 : entry.status) !== null && _e !== void 0 ? _e : null,
            hashMatch: match,
            bankOutcome: whitelisted ? "whitelisted" : feed.outcome,
            confirmed: source != null && (entry === null || entry === void 0 ? void 0 : entry.status) == "confirmed",
            matchedRule: rule,
            ocrText
        };
    }
    /** Statut d'une entrée en une ligne, commun à tous les rapports */
    static describeStatus(entry, scope) {
        const authors = ImageHashDetection_1.ImageHashDetection.distinctAuthors(entry);
        switch (entry.status) {
            case "quarantine": return scope == "global"
                // Banque globale : le compteur d'auteurs ne confirme pas
                ? `⏳ en quarantaine (${authors} auteur(s), validation technicien requise)`
                : `⏳ en quarantaine (${authors}/${ImageHashDetection_1.ImageHashDetection.CONFIRMATION_AUTHORS} auteurs)`;
            case "confirmed": return "🔒 confirmée — ban en prod";
            case "rejected": return "🚫 rejetée (liste blanche)";
        }
    }
    /** Résultat de la comparaison aux banques, commun aux rapports prod et debug */
    static describeMatch(match, bankSizes) {
        if (match == null) {
            return `❌ Inconnue des banques (${bankSizes.global} globale(s) + ${bankSizes.server} serveur comparées)`;
        }
        const bank = match.scope == "global" ? "banque globale" : "banque du serveur";
        const near = !match.near ? ""
            : match.entry.status == "rejected"
                ? "\n⚠️ Proche d'une image rejetée seulement : liste blanche non appliquée, OCR relancé"
                : "\n⚠️ Proche du seuil : l'empreinte seule ne suffit pas, OCR relancé";
        return `✅ Déjà connue (${bank}), ${ScamImageAnalysis.describeStatus(match.entry, match.scope)} — distances pHash ${match.phashDistance} / dHash ${match.dhashDistance}`
            + `\nRaison enregistrée : ${match.entry.reason}${near}`;
    }
    /** Ce qui a changé dans les banques, commun aux rapports prod et debug */
    static describeFeed(feed) {
        const bank = feed.scope == "global" ? "banque globale" : "banque du serveur";
        const status = feed.entry != null ? ScamImageAnalysis.describeStatus(feed.entry, feed.scope) : "";
        switch (feed.outcome) {
            case "added": return `✅ Empreinte ajoutée à la ${bank}, ${status}, publiée dans l'historique`;
            case "recorded": return `✅ Détection enregistrée (${bank}), ${status}`;
            case "confirmed": return `🔒 Détection enregistrée (${bank}) : ce troisième auteur CONFIRME l'empreinte`;
            case "unchanged": return `➖ Empreinte déjà présente, rien de nouveau (${status || "même message"})`;
            case "whitelisted": return "🚫 Empreinte rejetée par un technicien : ni ajout ni sanction";
            case "none": return "➖ Rien à ajouter (aucune règle déclenchée)";
        }
    }
    /** Seul décodage de l'image : null si elle est illisible, dans un format non géré, ou trop grande */
    decode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, ImageHash_1.decodeImage)(buffer);
            }
            catch (error) {
                return null;
            }
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
            const context = ScamImageAnalysis.sourceContext(message);
            const verdicts = [];
            for (const image of images) {
                verdicts.push(yield this.analyze(image.buffer, image.name, context));
            }
            return verdicts;
        });
    }
    /** Message d'origine tel que la banque le garde ; null hors serveur */
    static sourceContext(message) {
        if (message.guildId == null) {
            return null;
        }
        return {
            authorId: message.author.id,
            messageUrl: message.url
        };
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
        const whitelisted = report.feed.outcome == "whitelisted";
        const container = simplediscordbot_1.ComponentManager.create({
            title: `## 🔍 Analyse OCR — ${report.fileName}`,
            color: rule != null && !whitelisted ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow,
            separator: false
        });
        // En spoiler : la pub de scam n'a pas à rester affichée en permanence dans le salon
        if (imageUrl != null) {
            simplediscordbot_1.ComponentManager.mediaGallery(container, [{ url: imageUrl, spoiler: true }]);
        }
        simplediscordbot_1.ComponentManager.fields(container, [
            { name: "Mesures", value: this.reportMeasures(report.steps) },
            { name: "File OCR", value: (0, ImageOcr_1.formatOcrQueue)((0, ImageOcr_1.readOcrQueue)()) },
            { name: "Empreintes", value: `pHash \`${report.hash.phash}\`\ndHash \`${report.hash.dhash}\`` },
            { name: "Résultat empreinte", value: ScamImageAnalysis.describeMatch(report.match, report.bankSizes) },
            { name: "Résultat OCR", value: this.reportOcr(report.ocr) },
            { name: "Banque", value: ScamImageAnalysis.describeFeed(report.feed) },
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
}
exports.ScamImageAnalysis = ScamImageAnalysis;
