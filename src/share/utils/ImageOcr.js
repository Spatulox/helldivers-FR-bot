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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normaliserTexte = normaliserTexte;
exports.extraireTexte = extraireTexte;
exports.arreterOcr = arreterOcr;
const promises_1 = require("fs/promises");
const sharp_1 = __importDefault(require("sharp"));
const tesseract_js_1 = require("tesseract.js");
const unidecode_plus_1 = __importDefault(require("unidecode-plus"));
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const LANGUES = ["fra", "eng"];
// Au-delà, l'OCR coûte trop cher pour ce qu'il rapporte sur une image de scam
const MAX_OCR_BYTES = 8 * 1024 * 1024;
const OCR_TIMEOUT_MS = 20000;
// En dessous de cette largeur, le texte est trop petit pour être reconnu : on agrandit
const LARGEUR_MIN = 1000;
const MAX_PIXELS = 50000000;
let worker = null;
const verrou = new simplediscordbot_1.SimpleMutex();
function dossierCache() {
    var _a;
    return `${(_a = process.env.CACHE_FOLDER) !== null && _a !== void 0 ? _a : "."}/.tesseract_cache`;
}
function obtenirWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        if (worker == null) {
            // tesseract.js n'écrit les données de langue que si le dossier existe déjà, et échoue en
            // silence sinon : sans ça, les ~15 Mo seraient retéléchargés à chaque démarrage du bot
            const cachePath = dossierCache();
            yield (0, promises_1.mkdir)(cachePath, { recursive: true });
            worker = yield (0, tesseract_js_1.createWorker)(LANGUES, undefined, { cachePath });
        }
        return worker;
    });
}
/** Niveaux de gris, agrandissement des petites images, normalisation du contraste, netteté */
function preparerImage(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const image = (0, sharp_1.default)(buffer, { animated: false, failOn: "none", limitInputPixels: MAX_PIXELS })
            .rotate()
            .greyscale();
        const metadonnees = yield image.metadata();
        if (((_a = metadonnees.width) !== null && _a !== void 0 ? _a : 0) < LARGEUR_MIN) {
            image.resize({ width: LARGEUR_MIN, withoutEnlargement: false, kernel: "lanczos3" });
        }
        return yield image.normalise().sharpen().png().toBuffer();
    });
}
/** Accents, casse et espaces multiples supprimés : les règles de mots-clés travaillent là-dessus */
function normaliserTexte(texte) {
    return (0, unidecode_plus_1.default)(texte).toLowerCase().replace(/\s+/g, " ").trim();
}
function avecDelai(promesse, delaiMs) {
    return Promise.race([
        promesse,
        new Promise(resolve => setTimeout(() => resolve(null), delaiMs))
    ]);
}
/**
 * Extrait le texte d'une image.
 * @returns null si l'image est trop lourde, illisible, ou si l'OCR dépasse le délai
 */
function extraireTexte(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (buffer.length > MAX_OCR_BYTES) {
            return null;
        }
        yield verrou.lock();
        try {
            const preparee = yield preparerImage(buffer);
            const moteur = yield obtenirWorker();
            const resultat = yield avecDelai(moteur.recognize(preparee), OCR_TIMEOUT_MS);
            if (resultat == null) {
                return null;
            }
            const texte = (_a = resultat.data.text) !== null && _a !== void 0 ? _a : "";
            return { texte: texte.trim(), texteNormalise: normaliserTexte(texte) };
        }
        catch (error) {
            return null;
        }
        finally {
            verrou.unlock();
        }
    });
}
/** Libère le worker : à appeler à l'arrêt du bot, ou dans un script de test pour rendre la main */
function arreterOcr() {
    return __awaiter(this, void 0, void 0, function* () {
        if (worker == null) {
            return;
        }
        try {
            yield worker.terminate();
        }
        catch (error) {
            // Le worker est déjà mort : rien à faire
        }
        finally {
            worker = null;
        }
    });
}
