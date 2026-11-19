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
exports.ScamImageAnalysisDebug = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageHash_1 = require("../../utils/ImageHash");
const ImageOcr_1 = require("../../utils/ImageOcr");
const ScamRules_1 = require("../../utils/ScamRules");
const BotResources_1 = require("../../utils/BotResources");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
class ScamImageAnalysisDebug extends ScamImageAnalysis_1.ScamImageAnalysis {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis Debug";
        this.description = "Debug: always run both the perceptual hash and the OCR, and report each step, timing and machine load in #retour_bot";
    }
    /**
     * Enchaîne les deux étages et raconte chaque étape.
     * @param fileName affiché dans le rapport ; « image » quand l'appelant ne le connaît pas
     * @param context message d'origine : son auteur compte pour la confirmation en banque serveur,
     * son lien est affiché dans l'historique ; null si inconnu
     */
    analyze(buffer_1) {
        return __awaiter(this, arguments, void 0, function* (buffer, fileName = "image", context = null) {
            const state = {
                fileName,
                imageUrl: null,
                steps: [],
                current: "décodage",
                hash: null,
                unreadableImage: false,
                match: null,
                bankSizes: { global: 0, server: 0 },
                ocrText: null,
                rule: null,
                feed: null,
                context
            };
            if (!this.enabled) {
                return this.verdict(state);
            }
            // Un message posté tout de suite, puis réécrit : le déroulé est visible en direct sans
            // noyer le salon sous une notification par étape. Le buffer part avec lui : c'est le seul
            // envoi qui porte une pièce jointe, les réécritures se contentent de la référencer.
            const report = yield this.sendReport(state, buffer);
            const endTotal = (0, BotResources_1.startResourceWindow)();
            const endDecode = (0, BotResources_1.startResourceWindow)();
            const image = yield this.decode(buffer);
            state.steps.push({ name: "décodage", usage: endDecode() });
            state.current = "pHash";
            yield this.editReport(report, state);
            const endHashes = (0, BotResources_1.startResourceWindow)();
            // Rognage compté dans le pHash : c'est la première étape qui en a besoin
            const endPhash = (0, BotResources_1.startResourceWindow)();
            const trimmed = image != null ? yield (0, ImageHash_1.trimBorders)(image) : null;
            const phash = yield this.compute(trimmed, ImageHash_1.computePhash);
            state.steps.push({ name: "pHash", usage: endPhash() });
            state.current = "dHash";
            yield this.editReport(report, state);
            const endDhash = (0, BotResources_1.startResourceWindow)();
            const dhash = yield this.compute(trimmed, ImageHash_1.computeDhash);
            state.steps.push({ name: "dHash", usage: endDhash() });
            state.steps.push({ name: "pHash+dHash", usage: endHashes() });
            if (phash != null && dhash != null) {
                state.hash = { phash, dhash };
            }
            else {
                state.unreadableImage = true;
            }
            // Une correspondance ne coupe pas la chaîne : l'OCR tourne quand même, c'est tout l'intérêt
            const endComparison = (0, BotResources_1.startResourceWindow)();
            // Les banques peuvent encore se charger juste après le démarrage
            yield this.hash.ready;
            state.bankSizes = this.hash.bankSizes();
            state.match = state.hash != null ? this.hash.findSimilar(state.hash) : null;
            state.steps.push({ name: "comparaison", usage: endComparison() });
            state.current = "OCR";
            yield this.editReport(report, state);
            // Appel direct des utilitaires : this.ocr.analyze() sort avant l'OCR quand aucune règle
            // n'est définie, alors qu'ici on veut toujours le texte lu
            const endOcr = (0, BotResources_1.startResourceWindow)();
            state.ocrText = image != null && (0, ImageOcr_1.isOcrSizeAllowed)(buffer) ? yield (0, ImageOcr_1.extractText)(image) : null;
            if (state.ocrText != null) {
                state.rule = (0, ScamRules_1.findRuleWithScope)(state.ocrText.normalizedText, this.ocr.globalRules, this.ocr.serverRules);
            }
            state.steps.push({ name: "OCR", usage: endOcr() });
            state.feed = state.hash != null
                ? yield this.feedBank(state.hash, state.match, state.rule, context, buffer, fileName)
                : null;
            state.steps.push({ name: "total", usage: endTotal() });
            state.current = null;
            yield this.editReport(report, state);
            return this.verdict(state);
        });
    }
    /** computePhash / computeDhash jettent en cas d'échec, contrairement à computeHash */
    compute(image, computation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (image == null) {
                return null;
            }
            try {
                return yield computation(image);
            }
            catch (error) {
                return null;
            }
        });
    }
    verdict(state) {
        var _a, _b;
        // ocrText toujours renseigné, même sur correspondance d'empreinte : l'OCR a tourné de toute façon
        return this.buildVerdict(state.hash, state.match, state.rule, this.feed(state), (_b = (_a = state.ocrText) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : null);
    }
    /**
     * Envoie le rapport initial, avec l'image analysée en pièce jointe (ScamImageAnalysis.sendReport).
     * L'URL de l'image est retenue dans l'état : les réécritures la référencent sans ré-uploader.
     * @returns null si aucun message éditable n'a pu être obtenu (console seule, ou envoi en échec)
     */
    sendReport(state, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const sent = yield ScamImageAnalysis_1.ScamImageAnalysis.sendReport(imageUrl => {
                state.imageUrl = imageUrl;
                return this.buildContainer(state);
            }, buffer, state.fileName);
            if (sent == null) {
                // Sans message envoyé, la pièce jointe n'existe pas : plus rien ne doit la référencer
                state.imageUrl = null;
            }
            return sent;
        });
    }
    /**
     * Réécrit le rapport sans repasser le fichier : Discord conserve les pièces jointes existantes
     * tant que la charge utile ne contient pas de champ `attachments`, et la galerie continue de
     * pointer sur la même URL `attachment://` — l'image n'est donc uploadée qu'une fois.
     */
    editReport(report, state) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (report == null) {
                    // Pas de message à réécrire : on n'envoie que le récapitulatif final
                    if (state.current == null) {
                        yield simplediscordbot_1.Bot.log.info(this.buildContainer(state));
                    }
                    return;
                }
                yield report.edit(simplediscordbot_1.ComponentManager.toMessage(this.buildContainer(state)));
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Rapport d'analyse debug : ${error}`));
            }
        });
    }
    buildContainer(state) {
        const finished = state.current == null;
        const whitelisted = ScamImageAnalysis_1.ScamImageAnalysis.isWhitelisted(state.match);
        const found = !whitelisted && (state.match != null || state.rule != null);
        const container = simplediscordbot_1.ComponentManager.create({
            title: `## ${finished ? "🔍" : "⏳"} Analyse debug — ${state.fileName}`,
            color: found ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow,
            separator: false
        });
        // En spoiler : la pub de scam n'a pas à rester affichée en permanence dans le salon
        if (state.imageUrl != null) {
            simplediscordbot_1.ComponentManager.mediaGallery(container, [{ url: state.imageUrl, spoiler: true }]);
        }
        const fields = [
            { name: "Mesures", value: this.measuresTable(state) },
            // Relu à chaque réécriture : la file se vide en direct sous les yeux
            { name: "File OCR", value: (0, ImageOcr_1.formatOcrQueue)((0, ImageOcr_1.readOcrQueue)()) }
        ];
        if (finished) {
            fields.push(ScamImageAnalysis_1.ScamImageAnalysis.originField(state.context), { name: "Empreintes", value: this.describeHashes(state) }, { name: "Résultat", value: `${this.describeMatch(state)}\n${this.describeOcr(state)}` }, ...this.describeOcrDetails(state), ScamImageAnalysis_1.ScamImageAnalysis.bankField(this.feed(state), state.hash, state.match));
        }
        simplediscordbot_1.ComponentManager.fields(container, fields);
        return container;
    }
    measuresTable(state) {
        const lines = state.steps.map(step => {
            const name = step.name.padEnd(12);
            const duration = `${step.usage.durationMs} ms`.padStart(8);
            const cpu = `${step.usage.cpuPercent} %`.padStart(8);
            const rss = (0, BotResources_1.formatBytes)(step.usage.rssEnd).padStart(9);
            // Le delta dit ce que l'étape a laissé derrière elle, le pic ce qu'elle a vraiment pris
            const delta = step.usage.rssEnd - step.usage.rssStart;
            const growth = `${delta >= 0 ? "+" : "-"}${(0, BotResources_1.formatBytes)(Math.abs(delta))}`;
            return `${name}${duration}   CPU ${cpu}   RSS ${rss} (pic ${(0, BotResources_1.formatBytes)(step.usage.rssPeak)}, ${growth})`;
        });
        if (state.current != null) {
            lines.push(`${state.current.padEnd(12)}en cours…`);
        }
        return `\`\`\`\n${lines.join("\n")}\n\`\`\``;
    }
    describeHashes(state) {
        if (state.hash == null) {
            return "*(image illisible : format non géré ou fichier corrompu)*";
        }
        return `pHash \`${state.hash.phash}\`\ndHash \`${state.hash.dhash}\``;
    }
    describeMatch(state) {
        if (state.hash == null) {
            return "*(pas d'empreinte à comparer)*";
        }
        return ScamImageAnalysis_1.ScamImageAnalysis.describeMatch(state.match, state.bankSizes);
    }
    describeOcr(state) {
        if (state.ocrText == null) {
            return "*(OCR en échec : image trop lourde, illisible, ou délai dépassé)*";
        }
        if (state.rule == null) {
            return "❌ Aucune règle déclenchée";
        }
        const scope = state.rule.scope == "global" ? "globale" : "serveur";
        return `✅ Règle ${scope} déclenchée : \`${(0, ScamRules_1.formatRules)([state.rule.group])}\``;
    }
    /** Mots trouvés et texte lu ; rien si l'OCR a échoué, le champ « Résultat OCR » le dit déjà */
    describeOcrDetails(state) {
        if (state.ocrText == null) {
            return [];
        }
        return [
            {
                name: "Mots détectés",
                value: ScamImageAnalysis_1.ScamImageAnalysis.describeRuleScores(state.ocrText.normalizedText, this.ocr.globalRules, this.ocr.serverRules)
            },
            { name: "Texte lu", value: ScamImageAnalysis_1.ScamImageAnalysis.ocrTextBlock(state.ocrText.text, ScamImageAnalysis_1.OCR_TEXT_MAX_LENGTH) },
        ];
    }
    feed(state) {
        var _a;
        return (_a = state.feed) !== null && _a !== void 0 ? _a : { outcome: "none", entry: null, scope: null };
    }
    /**
     * Le debug rapporte chaque image : celle que Discord ne servait plus a donc aussi son rapport,
     * sinon elle disparaîtrait sans laisser de trace dans #retour_bot
     */
    unavailableImage(fileName) {
        const _super = Object.create(null, {
            unavailableImage: { get: () => super.unavailableImage }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.enabled) {
                yield simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Analyse d'image : \`${fileName}\` indisponible, Discord ne la sert plus `
                    + `(message supprimé avant la fin du téléchargement). Ni empreinte ni OCR.`));
            }
            return yield _super.unavailableImage.call(this, fileName);
        });
    }
}
exports.ScamImageAnalysisDebug = ScamImageAnalysisDebug;
