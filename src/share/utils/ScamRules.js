"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRules = parseRules;
exports.formatRules = formatRules;
exports.formatRulesLines = formatRulesLines;
exports.requiredScore = requiredScore;
exports.groupScore = groupScore;
exports.findRule = findRule;
exports.findRuleWithScope = findRuleWithScope;
exports.sameGroup = sameGroup;
exports.removeGroups = removeGroups;
const ImageOcr_1 = require("./ImageOcr");
const Distance_1 = require("./Distance");
// « 3|mots… » : seuil en tête de groupe
const THRESHOLD_PREFIX = /^\s*(\d+)\s*\|(.*)$/;
// « mot:2 » : poids en fin de mot. Seul un nombre après le dernier « : » est pris pour un poids
const WEIGHT_SUFFIX = /^(.*):\s*(\d+)\s*$/;
/** Un groupe brut (« 3|withdraw,rakeback:2 ») → groupe normalisé, ou null s'il est vide */
function parseGroup(raw) {
    var _a, _b;
    let body = raw;
    let threshold = null;
    const prefix = THRESHOLD_PREFIX.exec(raw);
    if (prefix != null) {
        body = (_a = prefix[2]) !== null && _a !== void 0 ? _a : "";
        const value = Number(prefix[1]);
        // Un seuil de 0 déclencherait la règle sur n'importe quelle image : on l'ignore
        threshold = value >= 1 ? value : null;
    }
    const words = [];
    for (const rawWord of body.split(",")) {
        const suffix = WEIGHT_SUFFIX.exec(rawWord);
        const text = (0, ImageOcr_1.normalizeText)(suffix != null ? (_b = suffix[1]) !== null && _b !== void 0 ? _b : "" : rawWord);
        const weight = suffix != null ? Math.max(1, Number(suffix[2])) : 1;
        // Un mot répété dans un groupe compterait deux fois pour une seule occurrence dans le texte
        if (text.length == 0 || words.some(word => word.text == text)) {
            continue;
        }
        words.push({ text, weight });
    }
    return words.length > 0 ? { words, threshold } : null;
}
/** Découpe une chaîne de règles en groupes normalisés, en ignorant les entrées vides */
function parseRules(text) {
    return text
        .split(/[;\n]/)
        .map(parseGroup)
        .filter((group) => group != null);
}
/** Forme texte d'un groupe : le seuil et les poids n'apparaissent que s'ils ont été écrits */
function formatGroup(group) {
    const words = group.words
        .map(word => word.weight > 1 ? `${word.text}:${word.weight}` : word.text)
        .join(",");
    return group.threshold != null ? `${group.threshold}|${words}` : words;
}
/** Opération inverse de parseRules, pour le stockage : tout sur une ligne */
function formatRules(groups) {
    return groups.map(formatGroup).join(";");
}
/** Même chose, mais un groupe par ligne : la forme lisible dans le formulaire de paramètres */
function formatRulesLines(groups) {
    return groups.map(formatGroup).join("\n");
}
function totalWeight(group) {
    return group.words.reduce((sum, word) => sum + word.weight, 0);
}
/**
 * Score qu'un texte doit atteindre pour satisfaire le groupe. Seuil écrit dans la règle s'il y en
 * a un, ramené au total des poids (au-delà, la règle ne se déclencherait jamais sans que personne
 * ne s'en aperçoive). Sinon : tous les points jusqu'à 2 mots, la moitié arrondie au supérieur
 * au-delà. L'OCR rate régulièrement un mot (police stylisée, texte sur l'image de fond) : exiger
 * 100 % laissait passer les scams.
 */
function requiredScore(group) {
    const total = totalWeight(group);
    if (group.threshold != null) {
        return Math.min(group.threshold, total);
    }
    if (group.words.length <= 2) {
        return total;
    }
    return Math.ceil(total / 2);
}
// Motif de chaque mot-clé, compilé une fois : les règles sont relues à chaque image
const wordPatterns = new Map();
/**
 * Motif « mot entier » d'un mot-clé normalisé : ni lettre ni chiffre juste avant ou juste après.
 * Équivaut à \bmot\b sur le texte normalisé (minuscules sans accents), mais reste juste pour un
 * mot-clé qui commence ou finit par un symbole (« $50 »), là où \b exigerait une lettre.
 */
function wordPattern(word) {
    let pattern = wordPatterns.get(word);
    if (pattern == null) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "g");
        wordPatterns.set(word, pattern);
    }
    return pattern;
}
// Sous FUZZY_MIN_LENGTH caractères, aucune faute tolérée : sur un mot court, une lettre d'écart
// change le mot (« free » / « tree », « gift » / « lift »). À partir de FUZZY_LONG_LENGTH (en
// pratique une expression de plusieurs mots), deux fautes
const FUZZY_MIN_LENGTH = 6;
const FUZZY_LONG_LENGTH = 12;
// Lettres et chiffres, mots séparés par une seule espace : la forme d'une suite de jetons contigus
const FUZZY_WORDS = /^[a-z0-9]+(?: [a-z0-9]+)*$/;
const TOKEN = /[a-z0-9]+/g;
/**
 * Nombre de fautes d'OCR tolérées pour un mot-clé. Un mot-clé à symbole (« $50 ») n'en tolère
 * aucune : le découpage en jetons alphanumériques perdrait justement ce symbole.
 */
function fuzzyTolerance(keyword) {
    if (keyword.length < FUZZY_MIN_LENGTH || !FUZZY_WORDS.test(keyword)) {
        return 0;
    }
    return keyword.length >= FUZZY_LONG_LENGTH ? 2 : 1;
}
/**
 * Cherche le mot-clé à quelques fautes près : il est comparé à chaque suite d'autant de jetons
 * (« withdrawal success » à chaque paire de jetons consécutifs). Les jetons doivent être séparés
 * par une seule espace : une zone déjà masquée (plusieurs espaces) ou une ponctuation ne relie pas
 * deux jetons éloignés.
 * @returns le texte avec chaque occurrence approchée masquée, ou null si rien n'a été trouvé
 */
function maskApproximate(text, keyword) {
    const tolerance = fuzzyTolerance(keyword);
    if (tolerance == 0) {
        return null;
    }
    const size = keyword.split(" ").length;
    const tokens = [...text.matchAll(TOKEN)].map(match => {
        var _a;
        const start = (_a = match.index) !== null && _a !== void 0 ? _a : 0;
        return { start, end: start + match[0].length };
    });
    let masked = text;
    let found = false;
    for (let i = 0; i + size <= tokens.length; i++) {
        const first = tokens[i];
        const last = tokens[i + size - 1];
        if (first == null || last == null) {
            continue;
        }
        const candidate = text.slice(first.start, last.end);
        if (!FUZZY_WORDS.test(candidate) || (0, Distance_1.levenshteinDistance)(candidate, keyword, tolerance) > tolerance) {
            continue;
        }
        masked = masked.slice(0, first.start) + " ".repeat(candidate.length) + masked.slice(last.end);
        found = true;
    }
    return found ? masked : null;
}
/**
 * Somme des poids des mots du groupe présents dans le texte. Deux passes, les mots cherchés du plus
 * long au plus court dans chacune :
 * 1. en exact, chaque mot comme mot entier ;
 * 2. pour les mots pas encore trouvés, à quelques fautes d'OCR près (voir maskApproximate).
 * Chaque occurrence trouvée est effacée (remplacée par des espaces) avant de chercher le mot
 * suivant : un mot contenu dans un autre (« free » dans « free nitro ») ne peut pas recompter la
 * même portion de texte, et la passe approchée ne repêche pas ce que la passe exacte a déjà compté.
 * @param normalizedText texte déjà passé par normalizeText
 */
function groupScore(normalizedText, group) {
    let text = normalizedText;
    let score = 0;
    const missing = [];
    for (const word of [...group.words].sort((a, b) => b.text.length - a.text.length)) {
        const masked = text.replace(wordPattern(word.text), match => " ".repeat(match.length));
        if (masked != text) {
            score += word.weight;
            text = masked;
        }
        else {
            missing.push(word);
        }
    }
    for (const word of missing) {
        const masked = maskApproximate(text, word.text);
        if (masked != null) {
            score += word.weight;
            text = masked;
        }
    }
    return score;
}
/**
 * Cherche la première règle satisfaite par le texte (voir requiredScore et groupScore).
 * @param normalizedText texte déjà passé par normalizeText
 * @returns le groupe déclencheur (il sert de motif de sanction), ou null
 */
function findRule(normalizedText, groups) {
    for (const group of groups) {
        if (groupScore(normalizedText, group) >= requiredScore(group)) {
            return group;
        }
    }
    return null;
}
/**
 * Même recherche sur les deux portées. Les règles globales passent d'abord : un groupe présent des
 * deux côtés est donc annoncé comme global, et alimente la banque commune.
 */
function findRuleWithScope(normalizedText, globalRules, serverRules) {
    const global = findRule(normalizedText, globalRules);
    if (global != null) {
        return { group: global, scope: "global" };
    }
    const server = findRule(normalizedText, serverRules);
    if (server != null) {
        return { group: server, scope: "server" };
    }
    return null;
}
/**
 * Deux groupes disent la même chose quel que soit l'ordre des mots : seuls leurs mots, leurs poids
 * et le score effectivement exigé comptent (un seuil écrit égal au seuil par défaut ne change rien)
 */
function sameGroup(a, b) {
    const key = (group) => `${requiredScore(group)}|`
        + group.words.map(word => `${word.text}:${word.weight}`).sort().join(",");
    return key(a) == key(b);
}
/** Retire des groupes ceux qui figurent déjà dans `toRemove` : base du dédoublonnage global/serveur */
function removeGroups(groups, toRemove) {
    return groups.filter(group => !toRemove.some(other => sameGroup(group, other)));
}
