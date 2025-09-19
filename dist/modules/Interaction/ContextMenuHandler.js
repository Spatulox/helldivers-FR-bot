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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuHandler = void 0;
const embeds_1 = require("../../utils/messages/embeds");
const automaton_translate_json_1 = __importDefault(require("../../../context-menu/automaton_translate.json"));
const delete_occurence_json_1 = __importDefault(require("../../../context-menu/delete_occurence.json"));
const automaton_translate_1 = require("../../interactions/context-menu/automaton_translate");
const delete_occurence_1 = require("../../interactions/context-menu/delete_occurence");
class ContextMenuHandler {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isContextMenuCommand())
                return;
            switch (interaction.commandName) {
                case automaton_translate_json_1.default.name:
                    if (interaction.isMessageContextMenuCommand()) {
                        yield (0, automaton_translate_1.translateAutomaton)(interaction);
                        return;
                    }
                    (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Une erreur est survenue..."), true);
                    break;
                case delete_occurence_json_1.default.name:
                    if (interaction.isMessageContextMenuCommand()) {
                        yield (0, delete_occurence_1.delete_occurence)(interaction);
                        return;
                    }
                    (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Une erreur est survenue..."), true);
                    break;
                default:
                    yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeContextMenu)"), true);
                    break;
            }
        });
    }
}
exports.ContextMenuHandler = ContextMenuHandler;
