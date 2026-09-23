"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRules = parseRules;
exports.formatRules = formatRules;
exports.formatRulesLines = formatRulesLines;
exports.requiredWords = requiredWords;
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
/**
 * Cherche la première règle satisfaite par le texte (voir requiredWords).
 * @param normalizedText texte déjà passé par normalizeText
 * @returns le groupe déclencheur (il sert de motif de sanction), ou null
 */
function findRule(normalizedText, groups) {
    for (const group of groups) {
        const found = group.filter(word => normalizedText.includes(word)).length;
        if (found >= requiredWords(group)) {
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
