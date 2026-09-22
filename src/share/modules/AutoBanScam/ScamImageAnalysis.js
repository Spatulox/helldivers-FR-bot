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
const discord_module_1 = require("@spatulox/discord-module");
const ScamRules_1 = require("../../utils/ScamRules");
const FileExtension_1 = require("../../utils/FileExtension");
const MessageManager_1 = require("../../managers/MessageManager");
const ImageHashDetection_1 = require("./ImageHashDetection");
const ImageOcrDetection_1 = require("./ImageOcrDetection");
// Au-delà, on ne déclenche pas l'OCR sur tout un album : le spam d'images est déjà traité ailleurs
const MAX_ANALYZED_IMAGES = 4;
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
        this.description = "Chain the perceptual hash and the OCR analysis of an image, and feed the matching hash bank";
        this.hash = new ImageHashDetection_1.ImageHashDetection();
        this.ocr = new ImageOcrDetection_1.ImageOcrDetection();
        this.subModules = [this.hash, this.ocr];
    }
    get events() {
        return {};
    }
    /** Analyse une image : empreintes d'abord, OCR seulement si elle est inconnue */
    analyze(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashResult = yield this.hash.analyze(buffer);
            if (hashResult == null) {
                // Image illisible : ni empreinte ni OCR n'en tireront quoi que ce soit
                return Object.assign({}, EMPTY_VERDICT);
            }
            const hash = hashResult.hash;
            if (hashResult.match != null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, source: "hash", bankEntry: hashResult.match.entry, bankScope: hashResult.match.scope });
            }
            const ocrResult = yield this.ocr.analyze(buffer);
            if (ocrResult == null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash });
            }
            if (ocrResult.matchedRule == null) {
                return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, ocrText: ocrResult.text });
            }
            // L'image entre dans la banque de la portée de la règle : la prochaine fois, le premier
            // étage suffira, et une règle serveur ne fait jamais entrer d'empreinte chez les autres bots
            yield this.hash.add(hash, (0, ScamRules_1.formatRules)([ocrResult.matchedRule.group]), ocrResult.matchedRule.scope);
            return Object.assign(Object.assign({}, EMPTY_VERDICT), { hash, source: "ocr", matchedRule: ocrResult.matchedRule, ocrText: ocrResult.text });
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
                verdicts.push(yield this.analyze(image.buffer));
            }
            return verdicts;
        });
    }
}
exports.ScamImageAnalysis = ScamImageAnalysis;
