"use strict";
/**
 * Distances d'édition, pour mesurer à quel point deux valeurs se ressemblent.
 *
 * - Hamming : nombre de positions qui diffèrent entre deux séquences de MÊME longueur, donc
 *   uniquement des substitutions. Adaptée aux empreintes d'image (ImageHash, BKTree) : 64 bits
 *   de part et d'autre par construction, on compte les bits qui ont changé.
 * - Levenshtein : nombre minimal de substitutions, insertions et suppressions pour passer d'une
 *   chaîne à l'autre, les longueurs peuvent différer. Adaptée au texte OCR (ScamRules) : les
 *   fautes de tesseract sont surtout des lettres mangées ou ajoutées (« ithdrawal », « awithdraw »),
 *   qui décalent tout le reste du mot et qu'Hamming ne sait pas compter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hammingDistance = hammingDistance;
exports.levenshteinDistance = levenshteinDistance;
const ZERO = BigInt(0);
const ONE = BigInt(1);
/**
 * Nombre de bits qui diffèrent entre deux entiers : XOR, puis comptage des bits à 1 par la
 * méthode de Kernighan (chaque tour éteint le bit à 1 le plus faible, donc autant de tours que de
 * bits différents, 64 au pire pour une empreinte).
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
 * Distance de Levenshtein entre deux chaînes, par programmation dynamique sur deux lignes
 * (O(n×m) en temps, O(m) en mémoire).
 *
 * Avec `max`, le calcul s'arrête dès que la distance est sûre de le dépasser, et renvoie alors
 * `max + 1` : c'est le cas courant quand on cherche un mot-clé dans tout un texte, où presque
 * toutes les comparaisons échouent. Deux sorties anticipées : une différence de longueur
 * supérieure à `max` (il faudrait au moins autant d'insertions), et une ligne dont le minimum
 * dépasse déjà `max` (les lignes suivantes ne peuvent que croître).
 */
function levenshteinDistance(a, b, max = Infinity) {
    var _a, _b, _c, _d;
    if (Math.abs(a.length - b.length) > max) {
        return max + 1;
    }
    if (a.length == 0 || b.length == 0) {
        return Math.max(a.length, b.length);
    }
    // previous[j] = distance entre les i-1 premiers caractères de a et les j premiers de b
    let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
    let current = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
        current[0] = i;
        let rowMin = i;
        for (let j = 1; j <= b.length; j++) {
            const substitution = ((_a = previous[j - 1]) !== null && _a !== void 0 ? _a : 0) + (a[i - 1] == b[j - 1] ? 0 : 1);
            const deletion = ((_b = previous[j]) !== null && _b !== void 0 ? _b : 0) + 1;
            const insertion = ((_c = current[j - 1]) !== null && _c !== void 0 ? _c : 0) + 1;
            const value = Math.min(substitution, deletion, insertion);
            current[j] = value;
            rowMin = Math.min(rowMin, value);
        }
        if (rowMin > max) {
            return max + 1;
        }
        [previous, current] = [current, previous];
    }
    const distance = (_d = previous[b.length]) !== null && _d !== void 0 ? _d : 0;
    return distance > max ? max + 1 : distance;
}
