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
const GlobalScamRules_1 = require("../../utils/GlobalScamRules");
const ScamRules_1 = require("../../utils/ScamRules");
// Limite Discord d'un champ de modale : au-delà, le formulaire tronquerait les règles en silence
const MAX_MODAL_FIELD = 4000;
// Aperçu des règles globales dans la confirmation : l'embed a ses propres limites
const GLOBAL_RULES_PREVIEW_MAX_LENGTH = 1000;
class ImageOcrDetection extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        // Les accroches universelles vivent dans les règles globales : la liste serveur part vide
        return { rules: "" };
    }
    constructor() {
        super();
        this.name = ImageOcrDetection.NAME;
        this.description = "Read the text inside images (OCR) and match it against the global and server scam keyword rules";
        this.cacheKey = "local_ocr_rules";
        void this.setup();
        // Le module enregistre lui-même l'interaction de sa page de paramètres, comme le fait
        // ModuleUI dans la lib : il est partagé entre les serveurs, ça évite de dupliquer la ligne
        // dans le RegisterInteraction de chaque bot. Le constructeur tourne depuis RegisterModules,
        // déclenché sur ClientReady, donc Bot.client existe déjà.
        discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client)
            .registerModal(ImageOcrDetection.MODAL_ID, (interaction) => {
            void this.saveRules(interaction);
        });
    }
    /** Charge les deux portées, signale un fichier global absent, puis dédoublonne le cache */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadCache();
                const global = yield (0, GlobalScamRules_1.globalRules)();
                const error = (0, GlobalScamRules_1.globalRulesLoadError)();
                if (error != null) {
                    simplediscordbot_1.Bot.log.error(`Règles OCR globales : ${error}`);
                }
                const server = (0, ScamRules_1.removeGroups)((0, ScamRules_1.parseRules)(this.cache.rules), global);
                const text = (0, ScamRules_1.formatRules)(server);
                if (text != this.cache.rules) {
                    this.cache.rules = text;
                    yield this.writeCache();
                }
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`Règles OCR anti-scam : ${error}`);
            }
        });
    }
    /** Chaîne de règles serveur telle qu'elle est stockée, à afficher dans le formulaire */
    get rulesText() {
        return this.cache.rules;
    }
    get serverRules() {
        return (0, ScamRules_1.parseRules)(this.cache.rules);
    }
    get globalRules() {
        return (0, GlobalScamRules_1.loadedGlobalRules)();
    }
    /**
     * Enregistre les règles serveur après les avoir normalisées : entrée vide = aucune règle serveur.
     * Les groupes déjà couverts par une règle globale sont retirés.
     */
    setRules(text) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.rules = (0, ScamRules_1.formatRules)((0, ScamRules_1.removeGroups)((0, ScamRules_1.parseRules)(text), this.globalRules));
            yield this.writeCache();
        });
    }
    /**
     * Page de paramètres : une modale où éditer les règles SERVEUR, un groupe par ligne.
     * ModuleUI ne répond pas à l'interaction à notre place, c'est à nous de le faire.
     */
    openSettings(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = (0, ScamRules_1.formatRulesLines)(this.serverRules);
            if (form.length > MAX_MODAL_FIELD) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error(`Les règles OCR du serveur font ${form.length} caractères, au-delà des ${MAX_MODAL_FIELD} `
                    + `que tient un champ de modale : il faut en retirer directement dans le cache `
                    + `\`${this.cacheKey}.json\` avant de pouvoir les rééditer ici.`), true);
                return;
            }
            yield interaction.showModal(simplediscordbot_1.ModalManager.simple(ImageOcrDetection.MODAL_ID, "Règles OCR du serveur", {
                // 45 caractères maximum, Discord refuse la modale au-delà
                label: "Une règle par ligne, mots liés par virgule",
                type: simplediscordbot_1.ModalFieldType.LONG,
                value: form,
                required: false,
                placeholder: "mrbeast,withdraw\nfree nitro"
            }));
        });
    }
    /** Validation du formulaire : on réécrit tout le jeu de règles serveur avec ce qui a été saisi */
    saveRules(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const input = interaction.fields.getTextInputValue(`${ImageOcrDetection.MODAL_ID}_input`);
                const global = this.globalRules;
                const submitted = (0, ScamRules_1.parseRules)(input);
                const duplicates = submitted.filter(group => (0, ScamRules_1.removeGroups)([group], global).length == 0);
                yield this.setRules(input);
                const server = this.serverRules;
                if (global.length == 0 && server.length == 0) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Aucune règle enregistrée, ni globale ni serveur : l'OCR ne déclenchera plus rien "
                        + "tant que les deux listes restent vides."), true);
                    return;
                }
                const embed = simplediscordbot_1.EmbedManager.success(`${server.length} règle(s) serveur enregistrée(s), actives immédiatement :\n`
                    + `\`\`\`\n${server.length > 0 ? (0, ScamRules_1.formatRulesLines)(server) : "(aucune)"}\n\`\`\``
                    + (duplicates.length > 0
                        ? `\n${duplicates.length} règle(s) retirée(s), déjà couverte(s) par les règles globales :\n`
                            + `\`\`\`\n${(0, ScamRules_1.formatRulesLines)(duplicates)}\n\`\`\``
                        : "")
                    + `\n${global.length} règle(s) globale(s), en lecture seule `
                    + `(\`src/share/scamRules/global_ocr_rules.json\`, appliquées au redémarrage) :\n`
                    + `\`\`\`\n${this.globalRulesPreview(global)}\n\`\`\``);
                yield simplediscordbot_1.Bot.interaction.reply(interaction, embed, true);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`Règles OCR anti-scam : ${error}`);
            }
        });
    }
    globalRulesPreview(global) {
        if (global.length == 0) {
            return "(aucune)";
        }
        const text = (0, ScamRules_1.formatRulesLines)(global);
        return text.length > GLOBAL_RULES_PREVIEW_MAX_LENGTH
            ? `${text.slice(0, GLOBAL_RULES_PREVIEW_MAX_LENGTH)}\n…`
            : text;
    }
    /**
     * Lit le texte de l'image déjà décodée et cherche une règle satisfaite, globales d'abord. Le
     * poids du fichier d'origine est à vérifier avant (isOcrSizeAllowed).
     * @returns null si l'OCR a échoué ; sinon le texte reconnu et, le cas échéant, la règle déclenchée
     */
    analyze(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const global = this.globalRules;
            const server = this.serverRules;
            if (global.length == 0 && server.length == 0) {
                return null;
            }
            const result = yield (0, ImageOcr_1.extractText)(image);
            if (result == null) {
                return null;
            }
            return {
                text: result.text,
                normalizedText: result.normalizedText,
                matchedRule: (0, ScamRules_1.findRuleWithScope)(result.normalizedText, global, server)
            };
        });
    }
}
exports.ImageOcrDetection = ImageOcrDetection;
ImageOcrDetection.NAME = "AutoBanScam ImageOCR";
ImageOcrDetection.MODAL_ID = "scamOcrRules";
