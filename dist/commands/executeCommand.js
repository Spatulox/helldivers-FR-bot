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
exports.executeSlashCommand = executeSlashCommand;
const embeds_1 = require("../utils/messages/embeds");
const automaton_lang_1 = require("./execute/automaton_lang");
const senateur_1 = require("./execute/senateur");
const liberthe_1 = require("./execute/liberthe");
const wiki_1 = require("./execute/wiki");
function executeSlashCommand(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isCommand())
            return;
        switch (interaction.commandName) {
            case "senateur":
                (0, senateur_1.senateur)(interaction);
                break;
            case "automaton":
                (0, automaton_lang_1.automaton_lang)(interaction);
                break;
            case 'liber-thé':
                (0, liberthe_1.liberthe)(interaction);
                break;
            case 'wiki':
                (0, wiki_1.wikiMenu)(interaction);
                break;
            default:
                yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeSlashCommand)"), true);
                break;
        }
    });
}
