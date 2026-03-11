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
exports.ContextMenuHandler = void 0;
const automaton_translate_1 = require("../../interactions/context-menu/automaton_translate");
const delete_occurence_1 = require("../../interactions/context-menu/delete_occurence");
const Modules_1 = require("../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HandlersPath_1 = require("./HandlersPath");
const silent_report_1 = require("../../interactions/context-menu/silent_report");
class ContextMenuHandler extends Modules_1.Module {
    constructor() {
        super("Context Menu Handler");
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const automaton = yield HandlersPath_1.Handlers.load('context_menu', 'automaton_translate');
            const deleteoccurence = yield HandlersPath_1.Handlers.load('context_menu', 'delete_occurence');
            const silentreportmessage = yield HandlersPath_1.Handlers.load('context_menu', 'silent_report_message');
            const silentreportuser = yield HandlersPath_1.Handlers.load('context_menu', 'silent_report_user');
            try {
                if (!interaction.isContextMenuCommand())
                    return;
                if (!this.enabled) {
                    interaction.reply({ embeds: [simplediscordbot_1.EmbedManager.error("Interaction disabled")] });
                    return;
                }
                switch (interaction.commandName) {
                    case automaton.name:
                        if (interaction.isMessageContextMenuCommand()) {
                            yield (0, automaton_translate_1.translateAutomaton)(interaction);
                            return;
                        }
                        simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue..."), true);
                        break;
                    case deleteoccurence.name:
                        if (interaction.isMessageContextMenuCommand()) {
                            yield (0, delete_occurence_1.delete_occurence_interaction)(interaction);
                            return;
                        }
                        simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue..."), true);
                        break;
                    case silentreportmessage.name:
                    case silentreportuser.name:
                        if (interaction.isMessageContextMenuCommand()) {
                            yield silent_report_1.SilentReportContextMenu.silent_report_message(interaction);
                            return;
                        }
                        else if (interaction.isUserContextMenuCommand()) {
                            yield silent_report_1.SilentReportContextMenu.silent_report_user(interaction);
                            return;
                        }
                        simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue..."), true);
                        break;
                    default:
                        yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Hmmm, what are you doing here ?? (executeContextMenu)"), true);
                        break;
                }
            }
            catch (error) {
            }
        });
    }
}
exports.ContextMenuHandler = ContextMenuHandler;
