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
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageHash_1 = require("../../utils/ImageHash");
const ImageOcr_1 = require("../../utils/ImageOcr");
const ScamRules_1 = require("../../utils/ScamRules");
const BotResources_1 = require("../../utils/BotResources");
const FileExtension_1 = require("../../utils/FileExtension");
const MessageManager_1 = require("../../managers/MessageManager");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
/**
 * Jumeau de debug de ScamImageAnalysis.
 *
 * La prod court-circuite l'OCR dès que l'empreinte est reconnue : c'est ce qu'il faut en
 * exploitation, et c'est précisément ce qui empêche de régler le système. Ici les DEUX étages
 * tournent à chaque image, dans l'ordre, et tout est publié dans #retour_bot : un embed par image,
 * réécrit à chaque étape pour montrer le début et la fin de chacune, avec les durées et le coût en
 * ressources.
 *
 * Les banques d'empreintes sont alimentées comme en prod, par la même méthode (feedBank) : une
 * règle OCR qui tombe met l'image en quarantaine et la publie dans l'historique, ou enregistre une
 * détection de plus sur l'entrée existante. Mais une correspondance d'empreinte n'interrompt rien :
 * on veut savoir ce que l'OCR lit sur une image déjà connue. Le verdict, lui, suit les règles de la
 * prod (ScamImageAnalysis.buildVerdict) : « hash » seulement sur une entrée confirmée reconnue
 * nettement, rien sur une entrée rejetée.
 *
 * Le rapport est un message Components V2 qui porte, juste sous son titre, l'IMAGE ANALYSÉE
 * elle-même (en spoiler) : sans elle, impossible de juger si une distance de Hamming ou un texte
 * OCR est cohérent, le message d'origine étant presque toujours déjà supprimé. L'image est
 * RÉ-UPLOADÉE dans le rapport plutôt que liée au CDN du message d'origine, pour lui survivre.
 *
 * Les mesures ne couvrent que le PROCESSUS du bot (cf. share/utils/BotResources.ts), threads
 * compris : le worker tesseract et le threadpool de sharp sont donc dedans, et c'est pour ça que
 * la ligne OCR dépasse allègrement 100 % — 100 % vaut un cœur, pas la machine. Comme en prod,
 * l'image n'est décodée qu'une fois (ligne « décodage ») : pHash, dHash et OCR repartent de ce
 * buffer, et les deux empreintes sont calculées sur l'image aux bordures rognées. La colonne mémoire
 * est le RSS et non le tas : le tas du thread principal ne bouge pas pendant l'OCR.
 *
 * ⚠️ Reste vrai : le temps CPU se compte en jiffies de 10 ms, donc sur une étape de 12 ms le
 * chiffre est grossier. Seules les lignes « pHash+dHash » et surtout « OCR » sont vraiment
 * exploitables.
 */
// Même plafond que la prod : on n'analyse pas un album entier
const MAX_ANALYZED_IMAGES = 4;
const OCR_PREVIEW_MAX_LENGTH = 600;
// Même plafond que MAX_OCR_BYTES : au-delà on ne ré-uploade pas l'image dans le rapport
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
class ScamImageAnalysisDebug extends ScamImageAnalysis_1.ScamImageAnalysis {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis Debug";
        this.description = "Debug: always run both the perceptual hash and the OCR, and report each step, timing and machine load in #retour_bot";
    }
    /**
     * Enchaîne les deux étages et raconte chaque étape.
     * @param fileName affiché dans le rapport ; « image » quand l'appelant ne le connaît pas
     * @param context message d'origine, gardé dans la banque pour la traçabilité ; null si inconnu
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
                feed: null
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
        var _a, _b, _c;
        const feed = (_a = state.feed) !== null && _a !== void 0 ? _a : { outcome: "none", entry: null, scope: null };
        // ocrText toujours renseigné, même sur correspondance d'empreinte : l'OCR a tourné de toute façon
        return this.buildVerdict(state.hash, state.match, state.rule, feed, (_c = (_b = state.ocrText) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : null);
    }
    /**
     * Prépare l'image à joindre au rapport.
     * Le nom est normalisé : un nom d'origine avec espaces ou accents casse la résolution de
     * `attachment://`, et ce nom est justement ce que la galerie va référencer.
     * @returns null si le fichier n'est pas une image ou s'il est trop lourd pour être ré-uploadé
     */
    buildAttachment(buffer, fileName) {
        if (!(0, FileExtension_1.isImageFile)(fileName) || buffer.length > MAX_ATTACHMENT_BYTES) {
            return null;
        }
        const name = `analyse${(0, FileExtension_1.getFileExtension)(fileName) || FileExtension_1.ImageExtension.png}`;
        return { attachment: new discord_js_1.AttachmentBuilder(buffer, { name }), url: `attachment://${name}` };
    }
    /**
     * Envoie le rapport initial, avec l'image analysée en pièce jointe.
     *
     * Bot.log.info() ne sait pas transporter de fichier : on envoie donc soi-même, dans le salon
     * que la config de log destine au niveau info (donc #retour_bot des deux côtés, sans écrire
     * d'identifiant en dur). Tout ce qui manque fait retomber sur Bot.log.info(), rapport complet
     * mais sans image.
     *
     * @returns null si aucun message éditable n'a pu être obtenu (console seule, ou envoi en échec)
     */
    sendReport(state, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const logConfig = (_a = simplediscordbot_1.Bot.config.log) === null || _a === void 0 ? void 0 : _a.info;
                const image = this.buildAttachment(buffer, state.fileName);
                const channel = image != null && (logConfig === null || logConfig === void 0 ? void 0 : logConfig.discord) && logConfig.channelId
                    ? yield simplediscordbot_1.GuildManager.channel.text.find(logConfig.channelId)
                    : null;
                if (channel == null || image == null) {
                    // Bot.log.info est typé Message | void : void quand le niveau n'écrit qu'en console
                    const sent = yield simplediscordbot_1.Bot.log.info(this.buildContainer(state));
                    return sent !== null && sent !== void 0 ? sent : null;
                }
                state.imageUrl = image.url;
                const sent = yield simplediscordbot_1.Bot.message.send(channel, simplediscordbot_1.ComponentManager.toMessage(this.buildContainer(state), [image.attachment]));
                if (sent == null) {
                    // Sans message envoyé, la pièce jointe n'existe pas : plus rien ne doit la référencer
                    state.imageUrl = null;
                }
                return sent;
            }
            catch (error) {
                state.imageUrl = null;
                return null;
            }
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
            fields.push({ name: "Empreintes", value: this.describeHashes(state) }, { name: "Résultat empreinte", value: this.describeMatch(state) }, { name: "Résultat OCR", value: this.describeOcr(state) }, { name: "Banque", value: this.describeBank(state) });
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
        return ScamImageAnalysis_1.ScamImageAnalysis.describeFeed((_a = state.feed) !== null && _a !== void 0 ? _a : { outcome: "none", entry: null, scope: null });
    }
    /** Comme la prod : nom du fichier pour le rapport, message d'origine pour la banque */
    analyzeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.attachments.size == 0) {
                return [];
            }
            const parts = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
            const images = parts
                .filter(part => { var _a; return ((_a = part.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image")) || (0, FileExtension_1.isImageFile)(part.name); })
                .slice(0, MAX_ANALYZED_IMAGES);
            const context = ScamImageAnalysis_1.ScamImageAnalysis.sourceContext(message);
            const verdicts = [];
            for (const image of images) {
                verdicts.push(yield this.analyze(image.buffer, image.name, context));
            }
            return verdicts;
        });
    }
}
exports.ScamImageAnalysisDebug = ScamImageAnalysisDebug;
