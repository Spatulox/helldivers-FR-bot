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
exports.calculerPhash = calculerPhash;
exports.calculerDhash = calculerDhash;
exports.calculerEmpreinte = calculerEmpreinte;
exports.distanceHamming = distanceHamming;
exports.sontSimilaires = sontSimilaires;
const sharp_1 = __importDefault(require("sharp"));
// Taille de la réduction avant DCT : 32x32 est la valeur classique du pHash
const TAILLE_DCT = 32;
// Bloc de basses fréquences conservé dans la DCT
const TAILLE_BLOC = 8;
// Garde-fou contre les images « bombe de décompression »
const MAX_PIXELS = 50000000;
// Table de cosinus de la DCT-II, calculée une fois : cos[x][u] = cos((2x+1) * u * PI / 2N)
const TABLE_COSINUS = construireTableCosinus();
function construireTableCosinus() {
    const table = [];
    for (let x = 0; x < TAILLE_DCT; x++) {
        const ligne = [];
        for (let u = 0; u < TAILLE_DCT; u++) {
            ligne.push(Math.cos(((2 * x + 1) * u * Math.PI) / (2 * TAILLE_DCT)));
        }
        table.push(ligne);
    }
    return table;
}
function imageSharp(buffer) {
    return (0, sharp_1.default)(buffer, { animated: false, failOn: "none", limitInputPixels: MAX_PIXELS });
}
/** Convertit 64 bits (du plus fort au plus faible) en 16 caractères hexadécimaux */
function bitsVersHex(bits) {
    let hex = "";
    for (let i = 0; i < 64; i += 4) {
        let quartet = 0;
        for (let j = 0; j < 4; j++) {
            quartet = (quartet << 1) | (bits[i + j] ? 1 : 0);
        }
        hex += quartet.toString(16);
    }
    return hex;
}
/** DCT-II 2D séparable sur une matrice carrée de TAILLE_DCT côtés */
function dct2d(pixels) {
    var _a, _b, _c, _d, _e, _f, _g;
    // Première passe : DCT sur chaque ligne
    const lignes = [];
    for (let y = 0; y < TAILLE_DCT; y++) {
        const ligne = new Array(TAILLE_DCT).fill(0);
        for (let u = 0; u < TAILLE_BLOC; u++) {
            let somme = 0;
            for (let x = 0; x < TAILLE_DCT; x++) {
                somme += ((_a = pixels[y * TAILLE_DCT + x]) !== null && _a !== void 0 ? _a : 0) * ((_c = (_b = TABLE_COSINUS[x]) === null || _b === void 0 ? void 0 : _b[u]) !== null && _c !== void 0 ? _c : 0);
            }
            ligne[u] = somme;
        }
        lignes.push(ligne);
    }
    // Seconde passe : DCT sur chaque colonne, en ne gardant que le bloc de basses fréquences
    const bloc = [];
    for (let v = 0; v < TAILLE_BLOC; v++) {
        const ligne = [];
        for (let u = 0; u < TAILLE_BLOC; u++) {
            let somme = 0;
            for (let y = 0; y < TAILLE_DCT; y++) {
                somme += ((_e = (_d = lignes[y]) === null || _d === void 0 ? void 0 : _d[u]) !== null && _e !== void 0 ? _e : 0) * ((_g = (_f = TABLE_COSINUS[y]) === null || _f === void 0 ? void 0 : _f[v]) !== null && _g !== void 0 ? _g : 0);
            }
            ligne.push(somme);
        }
        bloc.push(ligne);
    }
    return bloc;
}
/**
 * pHash seul. Relit l'image : appeler calculerPhash et calculerDhash séparément coûte deux
 * décodages, c'est ce que fait le module de debug pour chronométrer chaque algorithme.
 */
function calculerPhash(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const pixels = yield imageSharp(buffer)
            .rotate()
            .greyscale()
            .resize(TAILLE_DCT, TAILLE_DCT, { fit: "fill" })
            .raw()
            .toBuffer();
        const bloc = dct2d(new Uint8Array(pixels));
        // Le coefficient continu (0,0) porte la luminosité moyenne : il écraserait la médiane
        const coefficients = [];
        for (let v = 0; v < TAILLE_BLOC; v++) {
            for (let u = 0; u < TAILLE_BLOC; u++) {
                if (v == 0 && u == 0)
                    continue;
                coefficients.push((_b = (_a = bloc[v]) === null || _a === void 0 ? void 0 : _a[u]) !== null && _b !== void 0 ? _b : 0);
            }
        }
        const tries = [...coefficients].sort((a, b) => a - b);
        const milieu = Math.floor(tries.length / 2);
        const mediane = tries.length % 2 == 0
            ? (((_c = tries[milieu - 1]) !== null && _c !== void 0 ? _c : 0) + ((_d = tries[milieu]) !== null && _d !== void 0 ? _d : 0)) / 2
            : ((_e = tries[milieu]) !== null && _e !== void 0 ? _e : 0);
        // Bit de poids fort réservé au coefficient continu, toujours à 0
        const bits = [false, ...coefficients.map(c => c > mediane)];
        return bitsVersHex(bits);
    });
}
/** dHash seul — voir la remarque de calculerPhash sur le coût d'un appel séparé */
function calculerDhash(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // 9 colonnes pour obtenir 8 comparaisons par ligne
        const pixels = yield imageSharp(buffer)
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
        return bitsVersHex(bits);
    });
}
/**
 * Calcule les deux empreintes d'une image.
 * @returns null si l'image est illisible, dans un format non géré, ou trop grande
 */
function calculerEmpreinte(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [phash, dhash] = yield Promise.all([calculerPhash(buffer), calculerDhash(buffer)]);
            return { phash, dhash };
        }
        catch (error) {
            return null;
        }
    });
}
/** Nombre de bits qui diffèrent entre deux empreintes hexadécimales de même longueur */
function distanceHamming(hexA, hexB) {
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
        let ecart = a ^ b;
        while (ecart > 0) {
            distance += ecart & 1;
            ecart >>= 1;
        }
    }
    return distance;
}
/** Les deux distances doivent rester sous leur seuil : un seul algorithme ne suffit pas à conclure */
function sontSimilaires(a, b, seuilPhash, seuilDhash) {
    return distanceHamming(a.phash, b.phash) <= seuilPhash
        && distanceHamming(a.dhash, b.dhash) <= seuilDhash;
}
