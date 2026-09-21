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
exports.BotDeletedMessages = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
// Durée de vie d'une marque : si l'événement MessageDelete n'arrive jamais, l'entrée ne reste pas en mémoire
const MARK_TTL_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
/**
 * Messages supprimés par le bot lui-même (anti-scam, suppression des occurrences).
 * L'événement MessageDelete ne dit pas qui a supprimé le message : on marque l'ID avant de supprimer,
 * pour qu'AlertMessageDelete ignore ces suppressions.
 */
class BotDeletedMessages {
    static mark(messageId) {
        this.purge();
        this.marks.set(messageId, Date.now() + MARK_TTL_MS);
    }
    static unmark(messageId) {
        this.marks.delete(messageId);
    }
    /** Le message a-t-il été supprimé par le bot ? Retire la marque au passage */
    static consume(messageId) {
        this.purge();
        return this.marks.delete(messageId);
    }
    /**
     * Supprime un message en le marquant comme supprimé par le bot.
     * La marque est posée avant l'appel : MessageDelete peut arriver avant la résolution de la promesse.
     */
    static deleteAsBot(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.mark(message.id);
            try {
                yield message.delete();
            }
            catch (error) {
                // Déjà supprimé (par un autre passage du bot) : garder la marque posée par cette première suppression
                if (!(error instanceof discord_js_1.DiscordAPIError && error.code === discord_js_1.RESTJSONErrorCodes.UnknownMessage)) {
                    this.unmark(message.id);
                }
                throw error;
            }
        });
    }
    static purge() {
        const now = Date.now();
        for (const [id, expiration] of this.marks) {
            if (expiration < now)
                this.marks.delete(id);
        }
    }
}
exports.BotDeletedMessages = BotDeletedMessages;
BotDeletedMessages.marks = new Map();
