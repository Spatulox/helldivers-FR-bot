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
exports.SimpleMutex = void 0;
class SimpleMutex {
    constructor() {
        this.locked = false;
        this.queue = [];
    }
    /**
     * Verrouille le mutex. Si le mutex est déjà verrouillé, la méthode retourne une promesse qui sera résolue une fois que le mutex sera disponible.
     * @returns Une promesse résolue lorsque le mutex est verrouillé.
     */
    lock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.locked) {
                return new Promise((resolve) => {
                    this.queue.push(resolve);
                });
            }
            this.locked = true;
            return Promise.resolve();
        });
    }
    /**
     * Déverrouille le mutex. Si une file d'attente existe, débloque le prochain élément dans la file.
     */
    unlock() {
        if (this.queue.length > 0) {
            const nextResolve = this.queue.shift();
            if (nextResolve) {
                nextResolve(); // Résout la promesse du prochain élément dans la file
            }
            return;
        }
        this.locked = false; // Déverrouille complètement si la file d'attente est vide
    }
}
exports.SimpleMutex = SimpleMutex;
