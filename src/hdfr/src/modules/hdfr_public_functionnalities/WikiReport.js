"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikiReport = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
/**
 * Interrupteur du bouton « Signaler une erreur » des fiches du wiki.
 *
 * Le module ne branche aucun événement : tout part d'une interaction, pas d'un message. Il n'existe
 * que pour apparaître dans le panneau `ModuleUI` (#module_et_auto) et pouvoir couper le système en
 * direct si les signalements deviennent ingérables.
 *
 * Il porte aussi le garde-fou anti-spam : le bouton est posé sur un message public, n'importe qui
 * peut l'enchaîner. L'état est volontairement en mémoire — un compteur d'une minute n'a aucune
 * raison de survivre à un redémarrage, et un cache disque coûterait une écriture par signalement.
 */
class WikiReport extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = WikiReport.NAME;
        this.description = "Bouton de signalement d'erreur sur les fiches du wiki";
    }
    get events() {
        return {};
    }
    /**
     * Les handlers interrogent l'état du module sans avoir à l'instancier : `ModuleRegistry` rend
     * l'instance enregistrée par `RegisterModules`, la seule dont l'état soit à jour.
     */
    static isEnabled() {
        var _a, _b;
        return (_b = (_a = discord_module_1.ModuleRegistry.getModule(WikiReport.NAME)) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
    }
    /**
     * Date de fin du blocage de l'utilisateur, ou `null` s'il peut signaler.
     * Purge au passage les entrées périmées : sans événement pour déclencher un nettoyage, c'est
     * la lecture qui fait le ménage.
     */
    static blockedUntil(userId) {
        const until = WikiReport.blocked.get(userId);
        if (until === undefined) {
            return null;
        }
        if (until <= Date.now()) {
            WikiReport.blocked.delete(userId);
            WikiReport.history.delete(userId);
            return null;
        }
        return until;
    }
    /**
     * Décompte un signalement du quota, juste avant de l'envoyer. Rend `false` — et bloque
     * l'utilisateur — quand il s'agit du signalement de trop, qui ne doit donc pas partir.
     *
     * Seuls les signalements réellement soumis sont comptés : ouvrir un formulaire puis l'annuler
     * ne produit rien, il n'y a rien à limiter.
     */
    static consume(userId) {
        var _a;
        // Un blocage court-circuite le quota : sans ça, un formulaire resté ouvert le temps que la
        // fenêtre d'une minute s'écoule repasserait alors que la pénalité de dix minutes court.
        if (WikiReport.blockedUntil(userId) !== null) {
            return false;
        }
        const now = Date.now();
        const timestamps = ((_a = WikiReport.history.get(userId)) !== null && _a !== void 0 ? _a : []).filter(t => now - t < WikiReport.WINDOW_MS);
        if (timestamps.length >= WikiReport.MAX_REPORTS) {
            WikiReport.history.set(userId, timestamps);
            WikiReport.blocked.set(userId, now + WikiReport.BLOCK_MS);
            return false;
        }
        timestamps.push(now);
        WikiReport.history.set(userId, timestamps);
        return true;
    }
}
exports.WikiReport = WikiReport;
WikiReport.NAME = "Wiki Report";
/** Signalements tolérés par utilisateur dans la fenêtre glissante. */
WikiReport.MAX_REPORTS = 3;
WikiReport.WINDOW_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
WikiReport.BLOCK_MS = simplediscordbot_1.Time.minute.MIN_10.toMilliseconds();
/** userId → horodatages des signalements retenus, du plus ancien au plus récent. */
WikiReport.history = new Map();
/** userId → date de fin de blocage. */
WikiReport.blocked = new Map();
