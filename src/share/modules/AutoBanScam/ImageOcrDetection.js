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
exports.ImageOcrDetection = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageOcr_1 = require("../../utils/ImageOcr");
const ScamRules_1 = require("../../utils/ScamRules");
// Accroches classiques, pour que l'observation donne quelque chose avant le premier réglage.
// Dès que le cache a été écrit une fois, c'est lui qui fait foi.
const REGLES_PAR_DEFAUT = [
    "mrbeast,withdraw",
    "free nitro",
    "discord nitro,free",
    "steam,gift",
    "airdrop,claim",
    "50$,nitro"
].join(";");
// Limite Discord d'un champ de modale : au-delà, le formulaire tronquerait les règles en silence
const MAX_CHAMP_MODALE = 4000;
class ImageOcrDetection extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        return { regles: REGLES_PAR_DEFAUT };
    }
    constructor() {
        super();
        this.name = ImageOcrDetection.NAME;
        this.description = "Read the text inside images (OCR) and match it against the scam keyword rules";
        this.cacheKey = "scam_ocr_rules";
        void this.loadCache();
        // Le module enregistre lui-même l'interaction de sa page de paramètres, comme le fait
        // ModuleUI dans la lib : il est partagé entre les serveurs, ça évite de dupliquer la ligne
        // dans le RegisterInteraction de chaque bot. Le constructeur tourne depuis RegisterModules,
        // déclenché sur ClientReady, donc Bot.client existe déjà.
        discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client)
            .registerModal(ImageOcrDetection.MODAL_ID, (interaction) => {
            void this.enregistrerRegles(interaction);
        });
    }
    /** Chaîne de règles telle qu'elle est stockée, à afficher dans le formulaire */
    get reglesTexte() {
        return this.cache.regles;
    }
    /** Enregistre les règles après les avoir normalisées : entrée vide = aucune règle */
    definirRegles(texte) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.regles = (0, ScamRules_1.formaterRegles)((0, ScamRules_1.analyserRegles)(texte));
            yield this.writeCache();
        });
    }
    /**
     * Page de paramètres : une modale où éditer les règles, un groupe par ligne.
     * ModuleUI ne répond pas à l'interaction à notre place, c'est à nous de le faire.
     */
    openSettings(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const formulaire = (0, ScamRules_1.formaterReglesLignes)((0, ScamRules_1.analyserRegles)(this.reglesTexte));
            if (formulaire.length > MAX_CHAMP_MODALE) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error(`Les règles OCR font ${formulaire.length} caractères, au-delà des ${MAX_CHAMP_MODALE} `
                    + `que tient un champ de modale : il faut en retirer directement dans le cache `
                    + `\`${this.cacheKey}.json\` avant de pouvoir les rééditer ici.`), true);
                return;
            }
            yield interaction.showModal(simplediscordbot_1.ModalManager.simple(ImageOcrDetection.MODAL_ID, "Règles OCR anti-scam", {
                // 45 caractères maximum, Discord refuse la modale au-delà
                label: "Une règle par ligne, mots liés par virgule",
                type: simplediscordbot_1.ModalFieldType.LONG,
                value: formulaire,
                required: false,
                placeholder: "mrbeast,withdraw\nfree nitro"
            }));
        });
    }
    /** Validation du formulaire : on réécrit tout le jeu de règles avec ce qui a été saisi */
    enregistrerRegles(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saisie = interaction.fields.getTextInputValue(`${ImageOcrDetection.MODAL_ID}_input`);
                yield this.definirRegles(saisie);
                const groupes = (0, ScamRules_1.analyserRegles)(this.reglesTexte);
                if (groupes.length == 0) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Aucune règle enregistrée : l'OCR ne déclenchera plus rien tant que la liste reste vide."), true);
                    return;
                }
                const embed = simplediscordbot_1.EmbedManager.success(`${groupes.length} règle(s) enregistrée(s), actives immédiatement :\n`
                    + `\`\`\`\n${(0, ScamRules_1.formaterReglesLignes)(groupes)}\n\`\`\``);
                yield simplediscordbot_1.Bot.interaction.reply(interaction, embed, true);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`Règles OCR anti-scam : ${error}`);
            }
        });
    }
    /**
     * Lit le texte de l'image et cherche une règle satisfaite.
     * @returns null si l'OCR a échoué ; sinon le texte reconnu et, le cas échéant, la règle déclenchée
     */
    analyser(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupes = (0, ScamRules_1.analyserRegles)(this.cache.regles);
            if (groupes.length == 0) {
                return null;
            }
            const resultat = yield (0, ImageOcr_1.extraireTexte)(buffer);
            if (resultat == null) {
                return null;
            }
            return {
                texte: resultat.texte,
                texteNormalise: resultat.texteNormalise,
                regleDeclenchee: (0, ScamRules_1.chercherRegle)(resultat.texteNormalise, groupes)
            };
        });
    }
}
exports.ImageOcrDetection = ImageOcrDetection;
ImageOcrDetection.NAME = "AutoBanScam ImageOCR";
ImageOcrDetection.MODAL_ID = "scamOcrRules";
