"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GWWWiki = void 0;
/**
 * Serveur « GWW Wiki » : serveur de travail commun, hors HDFR et FFW, où le bot publie ce qui doit
 * survivre aux salons de logs des serveurs (historique des empreintes anti-scam).
 *
 * Un seul jeu d'IDs, sans bascule dev/prod : le même salon sert aux deux environnements. Un ID vide
 * désactive la fonctionnalité qui en dépend (elle le signale une fois dans les logs).
 */
class GWWWiki {
}
exports.GWWWiki = GWWWiki;
GWWWiki.channel = {
    historique_hash_ocr: "1552298190831886386",
};
