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
exports.Handlers = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ModerateMemberModal_1 = require("../../interactions/modal/ModerateMemberModal");
const HANDLERS_PATHS = {
    commands: [
        'automaton_lang',
        'liberthe',
        'sanction',
        'senateur',
        'stratagem_hero',
        'wiki',
        'sendas',
        "gounie"
    ],
    context_menu: [
        'automaton_translate',
        'delete_occurence',
        "silent_report_user",
        "silent_report_message"
    ],
    modal: [
        ModerateMemberModal_1.ModerateMembersModal.TITLE,
    ]
};
const jsonCache = {};
class Handlers {
    static get path() {
        return simplediscordbot_1.BotEnv.dev ? "_dev" : "";
    }
    /**
     * Check if the handler already exist
     */
    static handlerExists(category, handler) {
        return HANDLERS_PATHS[category].includes(handler);
    }
    /**
     * Load a handler with cache
     * Usage: Handlers.load('commands', 'senateur')
     */
    static load(category, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${category}/${handler}`;
            // Cache hit
            if (jsonCache[cacheKey]) {
                return jsonCache[cacheKey];
            }
            // Vérification existence
            if (!this.handlerExists(category, handler)) {
                throw new Error(`Handler ${category}.${handler} not found in HANDLERS_PATHS var, plz update HANDLERS_PATHS`);
            }
            const fileName = `${handler}.json`;
            const path = `./handlers/${category}${this.path}/${fileName}`;
            try {
                const data = yield simplediscordbot_1.FileManager.readJsonFile(path);
                jsonCache[cacheKey] = data;
                return data;
            }
            catch (error) {
                throw new Error(`Failed to load ${path}: ${error}`);
            }
        });
    }
}
exports.Handlers = Handlers;
