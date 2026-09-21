"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyserRegles = analyserRegles;
exports.formaterRegles = formaterRegles;
exports.chercherRegle = chercherRegle;
const ImageOcr_1 = require("./ImageOcr");
/** Découpe une chaîne de règles en groupes normalisés, en ignorant les entrées vides */
function analyserRegles(texte) {
    return texte
        .split(";")
        .map(groupe => groupe
        .split(",")
        .map(mot => (0, ImageOcr_1.normaliserTexte)(mot))
        .filter(mot => mot.length > 0))
        .filter(groupe => groupe.length > 0);
}
/** Opération inverse d'analyserRegles, pour réafficher les règles dans un formulaire */
function formaterRegles(groupes) {
    return groupes.map(groupe => groupe.join(",")).join(";");
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
