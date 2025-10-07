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
exports.CommandHandler = void 0;
const embeds_1 = require("../../utils/messages/embeds");
//-----------------
const DemocraticRouletteLogic_1 = require("../../sub_games/DemocraticRoulette/DemocraticRouletteLogic");
//-----------------
const automaton_lang_1 = require("../../interactions/commands/automaton_lang");
const liberthe_1 = require("../../interactions/commands/liberthe");
const wiki_1 = require("../../interactions/commands/wiki");
const senateur_json_1 = __importDefault(require("../../../commands/senateur.json"));
const stratagem_hero_json_1 = __importDefault(require("../../../commands_dev/stratagem_hero.json"));
const automaton_lang_json_1 = __importDefault(require("../../../commands/automaton_lang.json"));
const liberthe_json_1 = __importDefault(require("../../../commands/liberthe.json"));
const wiki_json_1 = __importDefault(require("../../../commands/wiki.json"));
//-----------------
const sanction_json_1 = __importDefault(require("../../../commands/sanction.json"));
const sanction_1 = require("../../interactions/commands/moderate_members/sanction");
const StratagemHeroLogic_1 = require("../../sub_games/StratagemHero/StratagemHeroLogic");
class CommandHandler {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            switch (interaction.commandName) {
                case senateur_json_1.default.name:
                    //senateur(interaction)
                    new DemocraticRouletteLogic_1.DemocraticRouletteLogic().senateur(interaction);
                    break;
                case automaton_lang_json_1.default.name:
                    (0, automaton_lang_1.automaton_lang)(interaction);
                    break;
                case liberthe_json_1.default.name:
                    (0, liberthe_1.liberthe)(interaction);
                    break;
                case wiki_json_1.default.name:
                    (0, wiki_1.wikiMenu)(interaction);
                    break;
                case sanction_json_1.default.name:
                    (0, sanction_1.sanction)(interaction);
                    break;
                case stratagem_hero_json_1.default.name:
                    new StratagemHeroLogic_1.StratagemHeroeLogic().stratagem_hero(interaction);
                    break;
                default:
                    yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeSlashCommand)"), true);
                    break;
            }
        });
    }
}
exports.CommandHandler = CommandHandler;
