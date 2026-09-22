"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRules = parseRules;
exports.formatRules = formatRules;
exports.formatRulesLines = formatRulesLines;
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
 * Cherche la première règle entièrement satisfaite par le texte.
 * @param normalizedText texte déjà passé par normalizeText
 * @returns le groupe déclencheur (il sert de motif de sanction), ou null
 */
function findRule(normalizedText, groups) {
    for (const group of groups) {
        if (group.every(word => normalizedText.includes(word))) {
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
/** Deux groupes disent la même chose quel que soit l'ordre des mots : ils sont liés par un ET */
function sameGroup(a, b) {
    return [...a].sort().join(",") == [...b].sort().join(",");
}
/** Retire des groupes ceux qui figurent déjà dans `toRemove` : base du dédoublonnage global/serveur */
function removeGroups(groups, toRemove) {
    return groups.filter(group => !toRemove.some(other => sameGroup(group, other)));
}
