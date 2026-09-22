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
exports.normalizeText = normalizeText;
exports.extractText = extractText;
exports.stopOcr = stopOcr;
const promises_1 = require("fs/promises");
const sharp_1 = __importDefault(require("sharp"));
const tesseract_js_1 = require("tesseract.js");
const unidecode_plus_1 = __importDefault(require("unidecode-plus"));
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const LANGUAGES = ["fra", "eng"];
// Au-delà, l'OCR coûte trop cher pour ce qu'il rapporte sur une image de scam
const MAX_OCR_BYTES = 8 * 1024 * 1024;
const OCR_TIMEOUT_MS = 20000;
// En dessous de cette largeur, le texte est trop petit pour être reconnu : on agrandit
const MIN_WIDTH = 1000;
const MAX_PIXELS = 50000000;
let worker = null;
const mutex = new simplediscordbot_1.SimpleMutex();
function cacheFolder() {
    var _a;
    return `${(_a = process.env.CACHE_FOLDER) !== null && _a !== void 0 ? _a : "."}/.tesseract_cache`;
}
function getWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        if (worker == null) {
            // tesseract.js n'écrit les données de langue que si le dossier existe déjà, et échoue en
            // silence sinon : sans ça, les ~15 Mo seraient retéléchargés à chaque démarrage du bot
            const cachePath = cacheFolder();
            yield (0, promises_1.mkdir)(cachePath, { recursive: true });
            worker = yield (0, tesseract_js_1.createWorker)(LANGUAGES, undefined, { cachePath });
        }
        return worker;
    });
}
/** Niveaux de gris, agrandissement des petites images, normalisation du contraste, netteté */
function prepareImage(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const image = (0, sharp_1.default)(buffer, { animated: false, failOn: "none", limitInputPixels: MAX_PIXELS })
            .rotate()
            .greyscale();
        const metadata = yield image.metadata();
        if (((_a = metadata.width) !== null && _a !== void 0 ? _a : 0) < MIN_WIDTH) {
            image.resize({ width: MIN_WIDTH, withoutEnlargement: false, kernel: "lanczos3" });
        }
        return yield image.normalise().sharpen().png().toBuffer();
    });
}
/** Accents, casse et espaces multiples supprimés : les règles de mots-clés travaillent là-dessus */
function normalizeText(text) {
    return (0, unidecode_plus_1.default)(text).toLowerCase().replace(/\s+/g, " ").trim();
}
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(null), timeoutMs))
    ]);
}
/**
 * Extrait le texte d'une image.
 * @returns null si l'image est trop lourde, illisible, ou si l'OCR dépasse le délai
 */
function extractText(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (buffer.length > MAX_OCR_BYTES) {
            return null;
        }
        yield mutex.lock();
        try {
            const prepared = yield prepareImage(buffer);
            const engine = yield getWorker();
            const result = yield withTimeout(engine.recognize(prepared), OCR_TIMEOUT_MS);
            if (result == null) {
                return null;
            }
            const text = (_a = result.data.text) !== null && _a !== void 0 ? _a : "";
            return { text: text.trim(), normalizedText: normalizeText(text) };
        }
        catch (error) {
            return null;
        }
        finally {
            mutex.unlock();
        }
    });
}
/** Libère le worker : à appeler à l'arrêt du bot, ou dans un script de test pour rendre la main */
function stopOcr() {
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
