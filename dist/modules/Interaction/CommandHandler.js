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
exports.CommandHandler = void 0;
//-----------------
const DemocraticRouletteLogic_1 = require("../../sub_games/DemocraticRoulette/DemocraticRouletteLogic");
//-----------------
const automaton_lang_1 = require("../../interactions/commands/automaton_lang");
const liberthe_1 = require("../../interactions/commands/liberthe");
const wiki_1 = require("../../interactions/commands/wiki");
const sanction_1 = require("../../interactions/commands/moderate_members/sanction");
//-----------------
const StratagemHeroLogic_1 = require("../../sub_games/StratagemHero/StratagemHeroLogic");
const Modules_1 = require("../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HandlersPath_1 = require("./HandlersPath");
class CommandHandler extends Modules_1.Module {
    constructor() {
        super("Command Handler");
        this.enabled;
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const senateurJson = yield HandlersPath_1.Handlers.load('commands', 'senateur');
            const sanctionJson = yield HandlersPath_1.Handlers.load('commands', 'sanction');
            const stratagemHeroJson = yield HandlersPath_1.Handlers.load('commands', 'stratagem_hero');
            const automatonJson = yield HandlersPath_1.Handlers.load('commands', 'automaton_lang');
            const liberteJson = yield HandlersPath_1.Handlers.load('commands', 'liberthe');
            const wikiJson = yield HandlersPath_1.Handlers.load('commands', 'wiki');
            try {
                if (!interaction.isCommand())
                    return;
                if (!this.enabled) {
                    interaction.reply({ embeds: [simplediscordbot_1.EmbedManager.error("Interaction disabled")] });
                    return;
                }
                switch (interaction.commandName) {
                    case senateurJson.name:
                        //senateur(interaction)
                        new DemocraticRouletteLogic_1.DemocraticRouletteLogic().senateur(interaction);
                        break;
                    case automatonJson.name:
                        (0, automaton_lang_1.automaton_lang)(interaction);
                        break;
                    case liberteJson.name:
                        (0, liberthe_1.liberthe)(interaction);
                        break;
                    case wikiJson.name:
                        (0, wiki_1.wikiMenu)(interaction);
                        break;
                    case sanctionJson.name:
                        (0, sanction_1.sanction)(interaction);
                        break;
                    case stratagemHeroJson.name:
                        new StratagemHeroLogic_1.StratagemHeroeLogic().stratagem_hero(interaction);
                        break;
                    default:
                        yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Hmmm, what are you doing here ?? (executeSlashCommand)"), true);
                        break;
                }
            }
            catch (error) {
            }
        });
    }
}
exports.CommandHandler = CommandHandler;
