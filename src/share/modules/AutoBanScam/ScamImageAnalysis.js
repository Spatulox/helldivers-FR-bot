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
const MAX_IMAGES_ANALYSEES = 4;
const VERDICT_VIDE = {
    empreinte: null,
    origine: null,
    entreeBanque: null,
    regleDeclenchee: null,
    texteOcr: null
};
class ScamImageAnalysis extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis";
        this.description = "Chain the perceptual hash and the OCR analysis of an image, and feed the hash bank";
        this.hash = new ImageHashDetection_1.ImageHashDetection();
        this.ocr = new ImageOcrDetection_1.ImageOcrDetection();
        this.subModules = [this.hash, this.ocr];
    }
    get events() {
        return {};
    }
    /** Analyse une image : empreintes d'abord, OCR seulement si elle est inconnue */
    analyser(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultatEmpreinte = yield this.hash.analyser(buffer);
            if (resultatEmpreinte == null) {
                // Image illisible : ni empreinte ni OCR n'en tireront quoi que ce soit
                return Object.assign({}, VERDICT_VIDE);
            }
            const empreinte = resultatEmpreinte.empreinte;
            if (resultatEmpreinte.correspondance != null) {
                return Object.assign(Object.assign({}, VERDICT_VIDE), { empreinte, origine: "empreinte", entreeBanque: resultatEmpreinte.correspondance.entree });
            }
            const resultatOcr = yield this.ocr.analyser(buffer);
            if (resultatOcr == null) {
                return Object.assign(Object.assign({}, VERDICT_VIDE), { empreinte });
            }
            if (resultatOcr.regleDeclenchee == null) {
                return Object.assign(Object.assign({}, VERDICT_VIDE), { empreinte, texteOcr: resultatOcr.texte });
            }
            // L'image entre dans la banque : la prochaine fois, le premier étage suffira
            yield this.hash.ajouter(empreinte, (0, ScamRules_1.formaterRegles)([resultatOcr.regleDeclenchee]));
            return Object.assign(Object.assign({}, VERDICT_VIDE), { empreinte, origine: "ocr", regleDeclenchee: resultatOcr.regleDeclenchee, texteOcr: resultatOcr.texte });
        });
    }
    /** Point d'entrée pratique : télécharge les images du message et les analyse une à une */
    analyserMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.attachments.size == 0) {
                return [];
            }
            const pieces = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
            const images = pieces
                .filter(piece => { var _a; return ((_a = piece.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image")) || (0, FileExtension_1.isImageFile)(piece.name); })
                .slice(0, MAX_IMAGES_ANALYSEES);
            const verdicts = [];
            for (const image of images) {
                verdicts.push(yield this.analyser(image.buffer));
            }
            return verdicts;
        });
    }
}
exports.ScamImageAnalysis = ScamImageAnalysis;
