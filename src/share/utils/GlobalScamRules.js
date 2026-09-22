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
exports.globalRules = globalRules;
exports.loadedGlobalRules = loadedGlobalRules;
exports.globalRulesLoadError = globalRulesLoadError;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ScamRules_1 = require("./ScamRules");
/**
 * Règles OCR globales : le jeu de mots-clés commun aux trois bots, versionné dans le dépôt
 * (`src/share/scamRules/global_ocr_rules.json`, chemin relatif au cwd comme le wiki et les handlers).
 *
 * Ce sont les SEULES règles qui alimentent la banque d'empreintes globale : ce qu'un serveur
 * enregistre grâce à elles vaut pour tous les autres. Les règles propres à un serveur vivent dans le
 * cache d'ImageOcrDetection et n'alimentent que la banque de ce bot.
 *
 * Le fichier est lu UNE fois et gardé en mémoire : le modifier demande un redémarrage du bot, c'est
 * voulu. Le format est un tableau d'un groupe par entrée (diffs git lisibles), recollé puis découpé
 * par parseRules, donc avec la même grammaire et la même normalisation que les règles serveur.
 */
const RULES_FILE = "./src/share/scamRules/global_ocr_rules.json";
let loadedRules = null;
let loading = null;
let error = null;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield simplediscordbot_1.FileManager.readJsonFile(RULES_FILE);
        if (stored == false || stored == null) {
            error = `fichier introuvable ou illisible (${RULES_FILE}) : aucune règle globale, la banque globale ne sera pas alimentée`;
            loadedRules = [];
            return loadedRules;
        }
        if (!Array.isArray(stored.rules)) {
            error = `clé « rules » absente ou mal formée dans ${RULES_FILE} : aucune règle globale`;
            loadedRules = [];
            return loadedRules;
        }
        error = null;
        loadedRules = (0, ScamRules_1.parseRules)(stored.rules.join(";"));
        return loadedRules;
    });
}
/** Charge les règles globales au premier appel, puis renvoie la version gardée en mémoire */
function globalRules() {
    return __awaiter(this, void 0, void 0, function* () {
        if (loadedRules != null) {
            return loadedRules;
        }
        loading !== null && loading !== void 0 ? loading : (loading = load());
        return yield loading;
    });
}
/** Accès synchrone, pour les chemins chauds : tableau vide tant que le chargement n'a pas eu lieu */
function loadedGlobalRules() {
    return loadedRules !== null && loadedRules !== void 0 ? loadedRules : [];
}
/** Message d'erreur du dernier chargement, à journaliser par l'appelant, ou null */
function globalRulesLoadError() {
    return error;
}
