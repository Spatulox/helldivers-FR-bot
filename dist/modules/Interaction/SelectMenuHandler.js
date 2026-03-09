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
exports.SelectMenuHandler = void 0;
const discord_js_1 = require("discord.js");
const wikiListSubthematics_1 = require("../../interactions/selectmenu/wikiListSubthematics");
const wikiSubject_1 = require("../../interactions/selectmenu/wikiSubject");
const wikiListSubjects_1 = require("../../interactions/selectmenu/wikiListSubjects");
const Modules_1 = require("../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
class SelectMenuHandler extends Modules_1.Module {
    constructor() {
        super("Select Menu Handler");
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!interaction.isAnySelectMenu())
                    return;
                if (!this.enabled) {
                    interaction.reply({ embeds: [simplediscordbot_1.EmbedManager.error("Interaction disabled")] });
                    return;
                }
                const selectedValue = interaction.values[0];
                switch (interaction.customId) {
                    case "wikiThematic": // go to wikiSubthematic
                        (0, wikiListSubthematics_1.loadWikiSubthematic)(interaction, selectedValue);
                        break;
                    case "wikiSubThematic": // go to wikiSuject
                        (0, wikiListSubjects_1.loadWikiSubjects)(interaction, selectedValue);
                        break;
                    case "wikiSubject": // show the subject
                        (0, wikiSubject_1.loadWikiSubject)(interaction, selectedValue);
                        return;
                    default:
                        const { choice, embed } = yield WikiManager_1.WikiManager.embedError();
                        yield interaction.reply({
                            content: `Quel sujet vous intéresse ?`,
                            embeds: [embed],
                            components: choice ? [choice] : [],
                            flags: discord_js_1.MessageFlags.Ephemeral
                        });
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Wrong thematic ID`));
                        break;
                }
            }
            catch (error) {
            }
        });
    }
}
exports.SelectMenuHandler = SelectMenuHandler;
