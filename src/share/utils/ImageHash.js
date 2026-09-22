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
exports.computePhash = computePhash;
exports.computeDhash = computeDhash;
exports.computeHash = computeHash;
exports.hammingDistance = hammingDistance;
exports.areSimilar = areSimilar;
const sharp_1 = __importDefault(require("sharp"));
// Taille de la réduction avant DCT : 32x32 est la valeur classique du pHash
const DCT_SIZE = 32;
// Bloc de basses fréquences conservé dans la DCT
const BLOCK_SIZE = 8;
// Garde-fou contre les images « bombe de décompression »
const MAX_PIXELS = 50000000;
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
function sharpImage(buffer) {
    return (0, sharp_1.default)(buffer, { animated: false, failOn: "none", limitInputPixels: MAX_PIXELS });
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
/**
 * pHash seul. Relit l'image : appeler computePhash et computeDhash séparément coûte deux
 * décodages, c'est ce que fait le module de debug pour chronométrer chaque algorithme.
 */
function computePhash(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const pixels = yield sharpImage(buffer)
            .rotate()
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
/** dHash seul : voir la remarque de computePhash sur le coût d'un appel séparé */
function computeDhash(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // 9 colonnes pour obtenir 8 comparaisons par ligne
        const pixels = yield sharpImage(buffer)
            .rotate()
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
 * Calcule les deux empreintes d'une image.
 * @returns null si l'image est illisible, dans un format non géré, ou trop grande
 */
function computeHash(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [phash, dhash] = yield Promise.all([computePhash(buffer), computeDhash(buffer)]);
            return { phash, dhash };
        }
        catch (error) {
            return null;
        }
    });
}
/** Nombre de bits qui diffèrent entre deux empreintes hexadécimales de même longueur */
function hammingDistance(hexA, hexB) {
    var _a, _b;
    if (hexA.length != hexB.length) {
        return Number.MAX_SAFE_INTEGER;
    }
    let distance = 0;
    for (let i = 0; i < hexA.length; i++) {
        const a = parseInt((_a = hexA[i]) !== null && _a !== void 0 ? _a : "0", 16);
        const b = parseInt((_b = hexB[i]) !== null && _b !== void 0 ? _b : "0", 16);
        if (isNaN(a) || isNaN(b)) {
            return Number.MAX_SAFE_INTEGER;
        }
        let diff = a ^ b;
        while (diff > 0) {
            distance += diff & 1;
            diff >>= 1;
        }
    }
    return distance;
}
/** Les deux distances doivent rester sous leur seuil : un seul algorithme ne suffit pas à conclure */
function areSimilar(a, b, phashThreshold, dhashThreshold) {
    return hammingDistance(a.phash, b.phash) <= phashThreshold
        && hammingDistance(a.dhash, b.dhash) <= dhashThreshold;
}
