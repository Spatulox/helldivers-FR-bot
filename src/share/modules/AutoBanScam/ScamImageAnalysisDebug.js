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
const SystemResources_1 = require("../../utils/SystemResources");
const FileExtension_1 = require("../../utils/FileExtension");
const MessageManager_1 = require("../../managers/MessageManager");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
/**
 * Jumeau de debug de ScamImageAnalysis.
 *
 * La prod court-circuite l'OCR dès que l'empreinte est reconnue : c'est ce qu'il faut en
 * exploitation, et c'est précisément ce qui empêche de régler le système. Ici les DEUX étages
 * tournent à chaque image, dans l'ordre, et tout est publié dans #retour_bot : un embed par image,
 * réécrit à chaque étape pour montrer le début et la fin de chacune, avec les durées et la charge
 * machine.
 *
 * Les banques d'empreintes sont alimentées comme en prod (une règle OCR qui tombe enregistre
 * l'image, dans la banque de la portée de la règle), mais une correspondance d'empreinte
 * n'interrompt rien : on veut savoir ce que l'OCR lit sur une image déjà connue.
 *
 * ⚠️ Les pourcentages CPU et RAM sont ceux de la MACHINE ENTIÈRE, tout processus confondu, et le
 * temps CPU se compte en jiffies de 10 ms : sur une étape de 12 ms le chiffre est très bruité.
 * Seules les lignes « pHash+dHash » et surtout « OCR » sont réellement exploitables.
 */
// Même plafond que la prod : on n'analyse pas un album entier
const MAX_ANALYZED_IMAGES = 4;
const OCR_PREVIEW_MAX_LENGTH = 600;
class ScamImageAnalysisDebug extends ScamImageAnalysis_1.ScamImageAnalysis {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis Debug";
        this.description = "Debug: always run both the perceptual hash and the OCR, and report each step, timing and machine load in #retour_bot";
    }
    /**
     * Enchaîne les deux étages et raconte chaque étape.
     * @param fileName affiché dans le rapport ; « image » quand l'appelant ne le connaît pas
     */
    analyze(buffer_1) {
        return __awaiter(this, arguments, void 0, function* (buffer, fileName = "image") {
            const state = {
                fileName,
                steps: [],
                current: "pHash",
                hash: null,
                unreadableImage: false,
                match: null,
                bankSizes: { global: 0, server: 0 },
                ocrText: null,
                rule: null,
                bank: null
            };
            if (!this.enabled) {
                return this.verdict(state);
            }
            // Un message posté tout de suite, puis réécrit : le déroulé est visible en direct sans
            // noyer le salon sous une notification par étape
            const report = yield this.sendReport(state);
            const endTotal = (0, SystemResources_1.startResourceWindow)();
            const endHashes = (0, SystemResources_1.startResourceWindow)();
            const endPhash = (0, SystemResources_1.startResourceWindow)();
            const phash = yield this.compute(() => (0, ImageHash_1.computePhash)(buffer));
            state.steps.push({ name: "pHash", usage: endPhash() });
            state.current = "dHash";
            yield this.editReport(report, state);
            const endDhash = (0, SystemResources_1.startResourceWindow)();
            const dhash = yield this.compute(() => (0, ImageHash_1.computeDhash)(buffer));
            state.steps.push({ name: "dHash", usage: endDhash() });
            state.steps.push({ name: "pHash+dHash", usage: endHashes() });
            if (phash != null && dhash != null) {
                state.hash = { phash, dhash };
            }
            else {
                state.unreadableImage = true;
            }
            // Une correspondance ne coupe pas la chaîne : l'OCR tourne quand même, c'est tout l'intérêt
            const endComparison = (0, SystemResources_1.startResourceWindow)();
            state.bankSizes = this.hash.bankSizes();
            state.match = state.hash != null ? this.hash.findSimilar(state.hash) : null;
            state.steps.push({ name: "comparaison", usage: endComparison() });
            if (state.match != null) {
                yield this.hash.incrementSeen(state.match.entry, state.match.scope);
            }
            state.current = "OCR";
            yield this.editReport(report, state);
            // Appel direct des utilitaires : this.ocr.analyze() sort avant l'OCR quand aucune règle
            // n'est définie, alors qu'ici on veut toujours le texte lu
            const endOcr = (0, SystemResources_1.startResourceWindow)();
            state.ocrText = yield (0, ImageOcr_1.extractText)(buffer);
            if (state.ocrText != null) {
                state.rule = (0, ScamRules_1.findRuleWithScope)(state.ocrText.normalizedText, this.ocr.globalRules, this.ocr.serverRules);
            }
            state.steps.push({ name: "OCR", usage: endOcr() });
            state.bank = yield this.feedBank(state);
            state.steps.push({ name: "total", usage: endTotal() });
            state.current = null;
            yield this.editReport(report, state);
            return this.verdict(state);
        });
    }
    /** Comme la prod : l'empreinte entre dans la banque de la portée de la règle OCR déclenchée */
    feedBank(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (state.hash == null || state.rule == null) {
                return "none";
            }
            const added = yield this.hash.add(state.hash, (0, ScamRules_1.formatRules)([state.rule.group]), state.rule.scope);
            return added ? "added" : "already_present";
        });
    }
    /** computePhash / computeDhash jettent sur une image illisible, contrairement à computeHash */
    compute(computation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield computation();
            }
            catch (error) {
                return null;
            }
        });
    }
    verdict(state) {
        var _a, _b, _c, _d, _e, _f;
        return {
            hash: state.hash,
            source: state.match != null ? "hash" : (state.rule != null ? "ocr" : null),
            bankEntry: (_b = (_a = state.match) === null || _a === void 0 ? void 0 : _a.entry) !== null && _b !== void 0 ? _b : null,
            bankScope: (_d = (_c = state.match) === null || _c === void 0 ? void 0 : _c.scope) !== null && _d !== void 0 ? _d : null,
            matchedRule: state.rule,
            // Toujours renseigné, même sur correspondance d'empreinte : l'OCR a tourné de toute façon
            ocrText: (_f = (_e = state.ocrText) === null || _e === void 0 ? void 0 : _e.text) !== null && _f !== void 0 ? _f : null
        };
    }
    /** @returns null si le log n'a pas produit de message éditable (console seule, ou envoi en échec) */
    sendReport(state) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Bot.log.info est typé Message | void : void quand le niveau n'écrit qu'en console
                const sent = yield simplediscordbot_1.Bot.log.info(this.buildEmbed(state));
                return sent !== null && sent !== void 0 ? sent : null;
            }
            catch (error) {
                return null;
            }
        });
    }
    editReport(report, state) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (report == null) {
                    // Pas de message à réécrire : on n'envoie que le récapitulatif final
                    if (state.current == null) {
                        yield simplediscordbot_1.Bot.log.info(this.buildEmbed(state));
                    }
                    return;
                }
                yield report.edit({ embeds: [this.buildEmbed(state)] });
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Rapport d'analyse debug : ${error}`));
            }
        });
    }
    buildEmbed(state) {
        const finished = state.current == null;
        const found = state.match != null || state.rule != null;
        const embed = simplediscordbot_1.EmbedManager.create(found ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow);
        embed.setTitle(`${finished ? "🔍" : "⏳"} Analyse debug — ${state.fileName}`);
        const fields = [
            { name: "Mesures", value: this.measuresTable(state) }
        ];
        if (finished) {
            fields.push({ name: "Empreintes", value: this.describeHashes(state) }, { name: "Résultat empreinte", value: this.describeMatch(state) }, { name: "Résultat OCR", value: this.describeOcr(state) }, { name: "Banque", value: this.describeBank(state) });
        }
        simplediscordbot_1.EmbedManager.fields(embed, fields);
        return embed;
    }
    measuresTable(state) {
        const lines = state.steps.map(step => {
            const name = step.name.padEnd(12);
            const duration = `${step.usage.durationMs} ms`.padStart(8);
            const cpu = `${step.usage.cpuPercent} %`.padStart(7);
            const ram = `${step.usage.memoryPercent} %`;
            const peak = `${step.usage.memoryPeakPercent} % / ${(0, SystemResources_1.formatBytes)(step.usage.memoryPeakUsed)}`;
            return `${name}${duration}   CPU ${cpu}   RAM ${ram} (pic ${peak})`;
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
        const compared = `${state.bankSizes.global} globale(s) + ${state.bankSizes.server} serveur`;
        if (state.hash == null) {
            return "*(pas d'empreinte à comparer)*";
        }
        if (state.match == null) {
            return `❌ Inconnue des banques (${compared} comparées)`;
        }
        const entry = state.match.entry;
        const bank = state.match.scope == "global" ? "banque globale" : "banque du serveur";
        return `✅ Déjà connue (${bank}) — distances pHash ${state.match.phashDistance} / dHash ${state.match.dhashDistance}`
            + `\nRaison enregistrée : ${entry.reason} (vue ${entry.seen} fois)`;
    }
    describeOcr(state) {
        if (state.ocrText == null) {
            return "*(OCR en échec : image trop lourde, illisible, ou délai dépassé)*";
        }
        const text = state.ocrText.text.trim().length > 0
            ? state.ocrText.text.slice(0, OCR_PREVIEW_MAX_LENGTH)
            : "*(aucun texte reconnu)*";
        if (state.rule == null) {
            return `❌ Aucune règle déclenchée\nTexte lu : ${text}`;
        }
        const scope = state.rule.scope == "global" ? "globale" : "serveur";
        return `✅ Règle ${scope} déclenchée : \`${(0, ScamRules_1.formatRules)([state.rule.group])}\`\nTexte lu : ${text}`;
    }
    describeBank(state) {
        var _a;
        const bank = ((_a = state.rule) === null || _a === void 0 ? void 0 : _a.scope) == "global" ? "banque globale" : "banque du serveur";
        switch (state.bank) {
            case "added": return `✅ Empreinte ajoutée à la ${bank}`;
            case "already_present": return "➖ Empreinte déjà présente, rien ajouté";
            default: return "➖ Rien à ajouter (aucune règle déclenchée)";
        }
    }
    /** Comme la prod, mais transmet le nom du fichier au rapport */
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
}
exports.ScamImageAnalysisDebug = ScamImageAnalysisDebug;
