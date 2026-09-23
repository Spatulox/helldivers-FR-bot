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
exports.decodeImage = decodeImage;
exports.trimBorders = trimBorders;
exports.computePhash = computePhash;
exports.computeDhash = computeDhash;
exports.computeHash = computeHash;
exports.hexToBigInt = hexToBigInt;
exports.toNumericHash = toNumericHash;
exports.hammingDistance = hammingDistance;
exports.areSimilar = areSimilar;
const sharp_1 = __importDefault(require("sharp"));
// Taille de la réduction avant DCT : 32x32 est la valeur classique du pHash
const DCT_SIZE = 32;
// Bloc de basses fréquences conservé dans la DCT
const BLOCK_SIZE = 8;
// Garde-fou contre les images « bombe de décompression »
const MAX_PIXELS = 50000000;
// Cadres imbriqués rognés au maximum (cadre ajouté, puis fond de l'image, puis marge éventuelle)
const MAX_TRIM_PASSES = 4;
// Table de cosinus de la DCT-II, calculée une fois : cos[x][u] = cos((2x+1) * u * PI / 2N)
const COSINE_TABLE = buildCosineTable();
function buildCosineTable() {
    const table = [];
    for (let x = 0; x < DCT_SIZE; x++) {
        const row = [];
        for (let u = 0; u < DCT_SIZE; u++) {
            row.push(Math.cos(((2 * x + 1) * u * Math.PI) / (2 * DCT_SIZE)));
        }
        table.push(row);
    }
    return table;
}
/** Relit une image déjà décodée, sans repasser par le décodeur PNG / JPEG */
function sharpRaw(image) {
    return (0, sharp_1.default)(image.data, { raw: { width: image.width, height: image.height, channels: 1 } });
}
/**
 * Seul décodage de l'image compressée : orientation EXIF appliquée, niveaux de gris, pixels bruts.
 * Jette si l'image est illisible, dans un format non géré, ou trop grande.
 */
function decodeImage(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, info } = yield (0, sharp_1.default)(buffer, { animated: false, failOn: "none", limitInputPixels: MAX_PIXELS })
            .rotate()
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
        if (info.channels != 1) {
            throw new Error(`Décodage en niveaux de gris : ${info.channels} canaux au lieu d'un`);
        }
        return { data, width: info.width, height: info.height };
    });
}
/** Un passage de rognage ; null si sharp n'a rien pu rogner (image unie) */
function trimOnce(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Le rognage ressort l'image en couleurs : on la ramène à un canal
            const { data, info } = yield sharpRaw(image)
                .trim()
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });
            if (info.channels != 1 || info.width == 0 || info.height == 0) {
                return null;
            }
            return { data, width: info.width, height: info.height };
        }
        catch (error) {
            return null;
        }
    });
}
/**
 * Rogne les bordures unies jusqu'au contenu. sharp ne retire que la couleur du pixel en haut à
 * gauche : un cadre noir ajouté autour d'une capture au fond gris ne part qu'au premier passage,
 * le fond gris au second. Sans répéter, l'image d'origine (fond rogné) et l'image encadrée (cadre
 * seul rogné) n'arriveraient pas au même contenu. Une image unie est gardée telle quelle.
 */
function trimBorders(image) {
    return __awaiter(this, void 0, void 0, function* () {
        let current = image;
        for (let pass = 0; pass < MAX_TRIM_PASSES; pass++) {
            const trimmed = yield trimOnce(current);
            if (trimmed == null || (trimmed.width == current.width && trimmed.height == current.height)) {
                break;
            }
            current = trimmed;
        }
        return current;
    });
}
/** Convertit 64 bits (du plus fort au plus faible) en 16 caractères hexadécimaux */
function bitsToHex(bits) {
    let hex = "";
    for (let i = 0; i < 64; i += 4) {
        let nibble = 0;
        for (let j = 0; j < 4; j++) {
            nibble = (nibble << 1) | (bits[i + j] ? 1 : 0);
        }
        hex += nibble.toString(16);
    }
    return hex;
}
/** DCT-II 2D séparable sur une matrice carrée de DCT_SIZE côtés */
function dct2d(pixels) {
    var _a, _b, _c, _d, _e, _f, _g;
    // Première passe : DCT sur chaque ligne
    const rows = [];
    for (let y = 0; y < DCT_SIZE; y++) {
        const row = new Array(DCT_SIZE).fill(0);
        for (let u = 0; u < BLOCK_SIZE; u++) {
            let sum = 0;
            for (let x = 0; x < DCT_SIZE; x++) {
                sum += ((_a = pixels[y * DCT_SIZE + x]) !== null && _a !== void 0 ? _a : 0) * ((_c = (_b = COSINE_TABLE[x]) === null || _b === void 0 ? void 0 : _b[u]) !== null && _c !== void 0 ? _c : 0);
            }
            row[u] = sum;
        }
        rows.push(row);
    }
    // Seconde passe : DCT sur chaque colonne, en ne gardant que le bloc de basses fréquences
    const block = [];
    for (let v = 0; v < BLOCK_SIZE; v++) {
        const row = [];
        for (let u = 0; u < BLOCK_SIZE; u++) {
            let sum = 0;
            for (let y = 0; y < DCT_SIZE; y++) {
                sum += ((_e = (_d = rows[y]) === null || _d === void 0 ? void 0 : _d[u]) !== null && _e !== void 0 ? _e : 0) * ((_g = (_f = COSINE_TABLE[y]) === null || _f === void 0 ? void 0 : _f[v]) !== null && _g !== void 0 ? _g : 0);
            }
            row.push(sum);
        }
        block.push(row);
    }
    return block;
}
/** pHash seul, sur une image déjà décodée et rognée (voir computeHash) */
function computePhash(image) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        // greyscale() garantit un octet par pixel en sortie, que la lecture ci-dessous suppose
        const pixels = yield sharpRaw(image)
            .greyscale()
            .resize(DCT_SIZE, DCT_SIZE, { fit: "fill" })
            .raw()
            .toBuffer();
        const block = dct2d(new Uint8Array(pixels));
        // Le coefficient continu (0,0) porte la luminosité moyenne : il écraserait la médiane
        const coefficients = [];
        for (let v = 0; v < BLOCK_SIZE; v++) {
            for (let u = 0; u < BLOCK_SIZE; u++) {
                if (v == 0 && u == 0)
                    continue;
                coefficients.push((_b = (_a = block[v]) === null || _a === void 0 ? void 0 : _a[u]) !== null && _b !== void 0 ? _b : 0);
            }
        }
        const sorted = [...coefficients].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 == 0
            ? (((_c = sorted[middle - 1]) !== null && _c !== void 0 ? _c : 0) + ((_d = sorted[middle]) !== null && _d !== void 0 ? _d : 0)) / 2
            : ((_e = sorted[middle]) !== null && _e !== void 0 ? _e : 0);
        // Bit de poids fort réservé au coefficient continu, toujours à 0
        const bits = [false, ...coefficients.map(c => c > median)];
        return bitsToHex(bits);
    });
}
/** dHash seul, sur une image déjà décodée et rognée (voir computeHash) */
function computeDhash(image) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // 9 colonnes pour obtenir 8 comparaisons par ligne
        // greyscale() garantit un octet par pixel en sortie, que la lecture ci-dessous suppose
        const pixels = yield sharpRaw(image)
            .greyscale()
            .resize(9, 8, { fit: "fill" })
            .raw()
            .toBuffer();
        const bits = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                bits.push(((_a = pixels[y * 9 + x]) !== null && _a !== void 0 ? _a : 0) > ((_b = pixels[y * 9 + x + 1]) !== null && _b !== void 0 ? _b : 0));
            }
        }
        return bitsToHex(bits);
    });
}
/**
 * Calcule les deux empreintes d'une image décodée, bordures rognées.
 * @returns null si le calcul échoue
 */
function computeHash(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const trimmed = yield trimBorders(image);
            const [phash, dhash] = yield Promise.all([computePhash(trimmed), computeDhash(trimmed)]);
            return { phash, dhash };
        }
        catch (error) {
            return null;
        }
    });
}
const HASH_HEX_LENGTH = 16;
const HEX_PATTERN = /^[0-9a-f]+$/i;
const ZERO = BigInt(0);
const ONE = BigInt(1);
/** 16 caractères hexadécimaux → entier 64 bits ; null si la chaîne n'est pas une empreinte valide */
function hexToBigInt(hex) {
    if (hex.length != HASH_HEX_LENGTH || !HEX_PATTERN.test(hex)) {
        return null;
    }
    return BigInt(`0x${hex}`);
}
/** null si l'une des deux empreintes est invalide (entrée de banque éditée à la main, par exemple) */
function toNumericHash(hash) {
    const phash = hexToBigInt(hash.phash);
    const dhash = hexToBigInt(hash.dhash);
    return phash != null && dhash != null ? { phash, dhash } : null;
}
/**
 * Nombre de bits qui diffèrent entre deux empreintes : XOR, puis comptage des bits à 1 par la
 * méthode de Kernighan (chaque tour éteint le bit à 1 le plus faible, donc autant de tours que de
 * bits différents, 64 au pire).
 */
function hammingDistance(a, b) {
    let diff = a ^ b;
    let distance = 0;
    while (diff != ZERO) {
        diff &= diff - ONE;
        distance++;
    }
    return distance;
}
/**
 * Les deux distances doivent rester sous leur seuil : un seul algorithme ne suffit pas à conclure.
 * Le pHash, au seuil le plus strict, est testé d'abord : la plupart des entrées s'arrêtent là.
 */
function areSimilar(a, b, phashThreshold, dhashThreshold) {
    return hammingDistance(a.phash, b.phash) <= phashThreshold
        && hammingDistance(a.dhash, b.dhash) <= dhashThreshold;
}
