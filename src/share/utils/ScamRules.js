"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyserRegles = analyserRegles;
exports.formaterRegles = formaterRegles;
exports.formaterReglesLignes = formaterReglesLignes;
exports.chercherRegle = chercherRegle;
const ImageOcr_1 = require("./ImageOcr");
/** Découpe une chaîne de règles en groupes normalisés, en ignorant les entrées vides */
function analyserRegles(texte) {
    return texte
        .split(/[;\n]/)
        .map(groupe => groupe
        .split(",")
        .map(mot => (0, ImageOcr_1.normaliserTexte)(mot))
        .filter(mot => mot.length > 0))
        .filter(groupe => groupe.length > 0);
}
/** Opération inverse d'analyserRegles, pour le stockage : tout sur une ligne */
function formaterRegles(groupes) {
    return groupes.map(groupe => groupe.join(",")).join(";");
}
/** Même chose, mais un groupe par ligne : la forme lisible dans le formulaire de paramètres */
function formaterReglesLignes(groupes) {
    return groupes.map(groupe => groupe.join(",")).join("\n");
}
/**
 * Cherche la première règle entièrement satisfaite par le texte.
 * @param texteNormalise texte déjà passé par normaliserTexte
 * @returns le groupe déclencheur (il sert de motif de sanction), ou null
 */
function chercherRegle(texteNormalise, groupes) {
    for (const groupe of groupes) {
        if (groupe.every(mot => texteNormalise.includes(mot))) {
            return groupe;
        }
    }
    return null;
}
