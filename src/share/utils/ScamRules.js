"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRules = parseRules;
exports.formatRules = formatRules;
exports.formatRulesLines = formatRulesLines;
exports.requiredWords = requiredWords;
exports.countFoundWords = countFoundWords;
exports.findRule = findRule;
exports.findRuleWithScope = findRuleWithScope;
exports.sameGroup = sameGroup;
exports.removeGroups = removeGroups;
const ImageOcr_1 = require("./ImageOcr");
/** Découpe une chaîne de règles en groupes normalisés, en ignorant les entrées vides */
function parseRules(text) {
    return text
        .split(/[;\n]/)
        .map(group => group
        .split(",")
        .map(word => (0, ImageOcr_1.normalizeText)(word))
        .filter(word => word.length > 0))
        // Un mot répété dans un groupe compterait deux fois pour une seule occurrence dans le texte
        .map(group => [...new Set(group)])
        .filter(group => group.length > 0);
}
/** Opération inverse de parseRules, pour le stockage : tout sur une ligne */
function formatRules(groups) {
    return groups.map(group => group.join(",")).join(";");
}
/** Même chose, mais un groupe par ligne : la forme lisible dans le formulaire de paramètres */
function formatRulesLines(groups) {
    return groups.map(group => group.join(",")).join("\n");
}
/**
 * Nombre de mots d'un groupe qui doivent être présents pour qu'il soit satisfait : tous jusqu'à
 * 2 mots, la moitié arrondie au supérieur au-delà. L'OCR rate régulièrement un mot (police
 * stylisée, texte sur l'image de fond) : exiger 100 % laissait passer les scams.
 */
function requiredWords(group) {
    if (group.length <= 2) {
        return group.length;
    }
    return Math.ceil(group.length / 2);
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
/**
 * Nombre de mots du groupe présents dans le texte, chacun comme mot entier. Les mots sont cherchés
 * du plus long au plus court et chaque occurrence trouvée est effacée (remplacée par des espaces)
 * avant de chercher le suivant : un mot contenu dans un autre (« free » dans « free nitro ») ne
 * peut pas recompter la même portion de texte.
 * @param normalizedText texte déjà passé par normalizeText
 */
function countFoundWords(normalizedText, group) {
    let text = normalizedText;
    let found = 0;
    for (const word of [...group].sort((a, b) => b.length - a.length)) {
        const masked = text.replace(wordPattern(word), match => " ".repeat(match.length));
        if (masked != text) {
            found++;
            text = masked;
        }
    }
    return found;
}
/**
 * Cherche la première règle satisfaite par le texte (voir requiredWords et countFoundWords).
 * @param normalizedText texte déjà passé par normalizeText
 * @returns le groupe déclencheur (il sert de motif de sanction), ou null
 */
function findRule(normalizedText, groups) {
    for (const group of groups) {
        if (countFoundWords(normalizedText, group) >= requiredWords(group)) {
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
/** Deux groupes disent la même chose quel que soit l'ordre des mots : seul leur ensemble compte */
function sameGroup(a, b) {
    return [...a].sort().join(",") == [...b].sort().join(",");
}
/** Retire des groupes ceux qui figurent déjà dans `toRemove` : base du dédoublonnage global/serveur */
function removeGroups(groups, toRemove) {
    return groups.filter(group => !toRemove.some(other => sameGroup(group, other)));
}
