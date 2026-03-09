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
exports.ModalHandler = void 0;
const moderate_members_1 = require("../../interactions/modal/moderate_members");
const Modules_1 = require("../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class ModalHandler extends Modules_1.Module {
    constructor() {
        super("Modal Handler");
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!interaction.isModalSubmit())
                    return;
                if (!this.enabled) {
                    interaction.reply({ embeds: [simplediscordbot_1.EmbedManager.error("Interaction disabled")] });
                    return;
                }
                switch (interaction.customId) {
                    case "moderate_members":
                        moderate_members_1.ModerateMembers.moderate(interaction);
                        break;
                    default:
                        yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Hmmm, what are you doing here ?? (executeModalSubmit)"), true);
                        break;
                }
            }
            catch (error) {
            }
        });
    }
}
exports.ModalHandler = ModalHandler;
