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
exports.ImageOcrDetection = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const ImageOcr_1 = require("../../utils/ImageOcr");
const ScamRules_1 = require("../../utils/ScamRules");
// Accroches classiques, pour que l'observation donne quelque chose avant le premier réglage.
// Dès que le cache a été écrit une fois, c'est lui qui fait foi.
const REGLES_PAR_DEFAUT = [
    "mrbeast,withdraw",
    "free nitro",
    "discord nitro,free",
    "steam,gift",
    "airdrop,claim",
    "50$,nitro"
].join(";");
class ImageOcrDetection extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        return { regles: REGLES_PAR_DEFAUT };
    }
    constructor() {
        super();
        this.name = ImageOcrDetection.NAME;
        this.description = "Read the text inside images (OCR) and match it against the scam keyword rules";
        this.cacheKey = "scam_ocr_rules";
        void this.loadCache();
    }
    /** Chaîne de règles telle qu'elle est stockée, à afficher dans le formulaire */
    get reglesTexte() {
        return this.cache.regles;
    }
    /** Enregistre les règles après les avoir normalisées : entrée vide = aucune règle */
    definirRegles(texte) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.regles = (0, ScamRules_1.formaterRegles)((0, ScamRules_1.analyserRegles)(texte));
            yield this.writeCache();
        });
    }
    /**
     * Lit le texte de l'image et cherche une règle satisfaite.
     * @returns null si l'OCR a échoué ; sinon le texte reconnu et, le cas échéant, la règle déclenchée
     */
    analyser(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupes = (0, ScamRules_1.analyserRegles)(this.cache.regles);
            if (groupes.length == 0) {
                return null;
            }
            const resultat = yield (0, ImageOcr_1.extraireTexte)(buffer);
            if (resultat == null) {
                return null;
            }
            return {
                texte: resultat.texte,
                texteNormalise: resultat.texteNormalise,
                regleDeclenchee: (0, ScamRules_1.chercherRegle)(resultat.texteNormalise, groupes)
            };
        });
    }
}
exports.ImageOcrDetection = ImageOcrDetection;
ImageOcrDetection.NAME = "AutoBanScam ImageOCR";
