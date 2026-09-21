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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScamImageAnalysisDebug = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageHash_1 = require("../../utils/ImageHash");
const ImageOcr_1 = require("../../utils/ImageOcr");
const ScamRules_1 = require("../../utils/ScamRules");
const SystemResources_1 = require("../../utils/SystemResources");
const FileExtension_1 = require("../../utils/FileExtension");
const MessageManager_1 = require("../../managers/MessageManager");
const ScamImageAnalysis_1 = require("./ScamImageAnalysis");
/**
 * Jumeau de debug de ScamImageAnalysis.
 *
 * La prod court-circuite l'OCR dès que l'empreinte est reconnue : c'est ce qu'il faut en
 * exploitation, et c'est précisément ce qui empêche de régler le système. Ici les DEUX étages
 * tournent à chaque image, dans l'ordre, et tout est publié dans #retour_bot : un embed par image,
 * réécrit à chaque étape pour montrer le début et la fin de chacune, avec les durées et la charge
 * machine.
 *
 * La banque d'empreintes est alimentée comme en prod (une règle OCR qui tombe enregistre l'image),
 * mais une correspondance d'empreinte n'interrompt rien : on veut savoir ce que l'OCR lit sur une
 * image déjà connue.
 *
 * ⚠️ Les pourcentages CPU et RAM sont ceux de la MACHINE ENTIÈRE, tout processus confondu, et le
 * temps CPU se compte en jiffies de 10 ms : sur une étape de 12 ms le chiffre est très bruité.
 * Seules les lignes « pHash+dHash » et surtout « OCR » sont réellement exploitables.
 */
// Même plafond que la prod : on n'analyse pas un album entier
const MAX_IMAGES_ANALYSEES = 4;
const OCR_PREVIEW_MAX_LENGTH = 600;
class ScamImageAnalysisDebug extends ScamImageAnalysis_1.ScamImageAnalysis {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam Image Analysis Debug";
        this.description = "Debug: always run both the perceptual hash and the OCR, and report each step, timing and machine load in #retour_bot";
    }
    /**
     * Enchaîne les deux étages et raconte chaque étape.
     * @param nomFichier affiché dans le rapport ; « image » quand l'appelant ne le connaît pas
     */
    analyser(buffer_1) {
        return __awaiter(this, arguments, void 0, function* (buffer, nomFichier = "image") {
            const etat = {
                nomFichier,
                etapes: [],
                enCours: "pHash",
                empreinte: null,
                imageIllisible: false,
                correspondance: null,
                empreintesEnBanque: 0,
                texteOcr: null,
                regle: null,
                banque: null
            };
            if (!this.enabled) {
                return this.verdict(etat);
            }
            // Un message posté tout de suite, puis réécrit : le déroulé est visible en direct sans
            // noyer le salon sous une notification par étape
            const rapport = yield this.envoyerRapport(etat);
            const fermerTotal = (0, SystemResources_1.startResourceWindow)();
            const fermerHashes = (0, SystemResources_1.startResourceWindow)();
            const fermerPhash = (0, SystemResources_1.startResourceWindow)();
            const phash = yield this.calculer(() => (0, ImageHash_1.calculerPhash)(buffer));
            etat.etapes.push({ nom: "pHash", usage: fermerPhash() });
            etat.enCours = "dHash";
            yield this.editerRapport(rapport, etat);
            const fermerDhash = (0, SystemResources_1.startResourceWindow)();
            const dhash = yield this.calculer(() => (0, ImageHash_1.calculerDhash)(buffer));
            etat.etapes.push({ nom: "dHash", usage: fermerDhash() });
            etat.etapes.push({ nom: "pHash+dHash", usage: fermerHashes() });
            if (phash != null && dhash != null) {
                etat.empreinte = { phash, dhash };
            }
            else {
                etat.imageIllisible = true;
            }
            // Une correspondance ne coupe pas la chaîne : l'OCR tourne quand même, c'est tout l'intérêt
            const fermerComparaison = (0, SystemResources_1.startResourceWindow)();
            etat.empreintesEnBanque = this.hash.cache.empreintes.length;
            etat.correspondance = etat.empreinte != null ? this.hash.chercherSimilaire(etat.empreinte) : null;
            etat.etapes.push({ nom: "comparaison", usage: fermerComparaison() });
            if (etat.correspondance != null) {
                yield this.hash.incrementerVues(etat.correspondance.entree);
            }
            etat.enCours = "OCR";
            yield this.editerRapport(rapport, etat);
            // Appel direct des utilitaires : this.ocr.analyser() sort avant l'OCR quand aucune règle
            // n'est définie, alors qu'ici on veut toujours le texte lu
            const fermerOcr = (0, SystemResources_1.startResourceWindow)();
            etat.texteOcr = yield (0, ImageOcr_1.extraireTexte)(buffer);
            if (etat.texteOcr != null) {
                etat.regle = (0, ScamRules_1.chercherRegle)(etat.texteOcr.texteNormalise, (0, ScamRules_1.analyserRegles)(this.ocr.reglesTexte));
            }
            etat.etapes.push({ nom: "OCR", usage: fermerOcr() });
            etat.banque = yield this.alimenterBanque(etat);
            etat.etapes.push({ nom: "total", usage: fermerTotal() });
            etat.enCours = null;
            yield this.editerRapport(rapport, etat);
            return this.verdict(etat);
        });
    }
    /** Comme la prod : l'empreinte entre dans la banque quand une règle OCR tombe */
    alimenterBanque(etat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (etat.empreinte == null || etat.regle == null) {
                return "rien";
            }
            const ajoutee = yield this.hash.ajouter(etat.empreinte, (0, ScamRules_1.formaterRegles)([etat.regle]));
            return ajoutee ? "ajoutee" : "deja_presente";
        });
    }
    /** calculerPhash / calculerDhash jettent sur une image illisible, contrairement à calculerEmpreinte */
    calculer(calcul) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield calcul();
            }
            catch (error) {
                return null;
            }
        });
    }
    verdict(etat) {
        var _a, _b, _c, _d;
        return {
            empreinte: etat.empreinte,
            origine: etat.correspondance != null ? "empreinte" : (etat.regle != null ? "ocr" : null),
            entreeBanque: (_b = (_a = etat.correspondance) === null || _a === void 0 ? void 0 : _a.entree) !== null && _b !== void 0 ? _b : null,
            regleDeclenchee: etat.regle,
            // Toujours renseigné, même sur correspondance d'empreinte : l'OCR a tourné de toute façon
            texteOcr: (_d = (_c = etat.texteOcr) === null || _c === void 0 ? void 0 : _c.texte) !== null && _d !== void 0 ? _d : null
        };
    }
    /** @returns null si le log n'a pas produit de message éditable (console seule, ou envoi en échec) */
    envoyerRapport(etat) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Bot.log.info est typé Message | void : void quand le niveau n'écrit qu'en console
                const envoye = yield simplediscordbot_1.Bot.log.info(this.construireEmbed(etat));
                return envoye !== null && envoye !== void 0 ? envoye : null;
            }
            catch (error) {
                return null;
            }
        });
    }
    editerRapport(rapport, etat) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (rapport == null) {
                    // Pas de message à réécrire : on n'envoie que le récapitulatif final
                    if (etat.enCours == null) {
                        yield simplediscordbot_1.Bot.log.info(this.construireEmbed(etat));
                    }
                    return;
                }
                yield rapport.edit({ embeds: [this.construireEmbed(etat)] });
            }
            catch (error) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Rapport d'analyse debug : ${error}`));
            }
        });
    }
    construireEmbed(etat) {
        const termine = etat.enCours == null;
        const trouve = etat.correspondance != null || etat.regle != null;
        const embed = simplediscordbot_1.EmbedManager.create(trouve ? simplediscordbot_1.SimpleColor.red : simplediscordbot_1.SimpleColor.yellow);
        embed.setTitle(`${termine ? "🔍" : "⏳"} Analyse debug — ${etat.nomFichier}`);
        const champs = [
            { name: "Mesures", value: this.tableauMesures(etat) }
        ];
        if (termine) {
            champs.push({ name: "Empreintes", value: this.decrireEmpreintes(etat) }, { name: "Résultat empreinte", value: this.decrireCorrespondance(etat) }, { name: "Résultat OCR", value: this.decrireOcr(etat) }, { name: "Banque", value: this.decrireBanque(etat) });
        }
        simplediscordbot_1.EmbedManager.fields(embed, champs);
        return embed;
    }
    tableauMesures(etat) {
        const lignes = etat.etapes.map(etape => {
            const nom = etape.nom.padEnd(12);
            const duree = `${etape.usage.durationMs} ms`.padStart(8);
            const cpu = `${etape.usage.cpuPercent} %`.padStart(7);
            const ram = `${etape.usage.memoryPercent} %`;
            const pic = `${etape.usage.memoryPeakPercent} % / ${(0, SystemResources_1.formatBytes)(etape.usage.memoryPeakUsed)}`;
            return `${nom}${duree}   CPU ${cpu}   RAM ${ram} (pic ${pic})`;
        });
        if (etat.enCours != null) {
            lignes.push(`${etat.enCours.padEnd(12)}en cours…`);
        }
        return `\`\`\`\n${lignes.join("\n")}\n\`\`\``;
    }
    decrireEmpreintes(etat) {
        if (etat.empreinte == null) {
            return "*(image illisible : format non géré ou fichier corrompu)*";
        }
        return `pHash \`${etat.empreinte.phash}\`\ndHash \`${etat.empreinte.dhash}\``;
    }
    decrireCorrespondance(etat) {
        if (etat.empreinte == null) {
            return "*(pas d'empreinte à comparer)*";
        }
        if (etat.correspondance == null) {
            return `❌ Inconnue de la banque (${etat.empreintesEnBanque} empreintes comparées)`;
        }
        const entree = etat.correspondance.entree;
        return `✅ Déjà connue — distances pHash ${etat.correspondance.distancePhash} / dHash ${etat.correspondance.distanceDhash}`
            + `\nRaison enregistrée : ${entree.raison} (vue ${entree.vues} fois)`;
    }
    decrireOcr(etat) {
        if (etat.texteOcr == null) {
            return "*(OCR en échec : image trop lourde, illisible, ou délai dépassé)*";
        }
        const texte = etat.texteOcr.texte.trim().length > 0
            ? etat.texteOcr.texte.slice(0, OCR_PREVIEW_MAX_LENGTH)
            : "*(aucun texte reconnu)*";
        if (etat.regle == null) {
            return `❌ Aucune règle déclenchée\nTexte lu : ${texte}`;
        }
        return `✅ Règle déclenchée : \`${(0, ScamRules_1.formaterRegles)([etat.regle])}\`\nTexte lu : ${texte}`;
    }
    decrireBanque(etat) {
        switch (etat.banque) {
            case "ajoutee": return "✅ Empreinte ajoutée à la banque";
            case "deja_presente": return "➖ Empreinte déjà présente, rien ajouté";
            default: return "➖ Rien à ajouter (aucune règle déclenchée)";
        }
    }
    /** Comme la prod, mais transmet le nom du fichier au rapport */
    analyserMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.attachments.size == 0) {
                return [];
            }
            const pieces = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
            const images = pieces
                .filter(piece => { var _a; return ((_a = piece.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image")) || (0, FileExtension_1.isImageFile)(piece.name); })
                .slice(0, MAX_IMAGES_ANALYSEES);
            const verdicts = [];
            for (const image of images) {
                verdicts.push(yield this.analyser(image.buffer, image.name));
            }
            return verdicts;
        });
    }
}
exports.ScamImageAnalysisDebug = ScamImageAnalysisDebug;
