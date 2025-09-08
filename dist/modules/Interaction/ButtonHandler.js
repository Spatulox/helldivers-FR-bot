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
exports.ButtonHandler = void 0;
const embeds_1 = require("../../utils/messages/embeds");
const toogle_interaction_1 = require("../../button/toogle_interaction");
class ButtonHandler {
    static execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isButton())
                return;
            try {
                if (interaction.customId.startsWith("toggle_")) {
                    (0, toogle_interaction_1.toogle_interaction)(interaction);
                    return;
                }
                switch (interaction.customId) {
                    case "interaction":
                        console.log("interaction button interaction");
                        break;
                    default:
                        yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeButtonInteraction)"), true);
                        break;
                }
            }
            catch (error) {
                interaction.reply((0, embeds_1.returnToSendEmbedForInteraction)((0, embeds_1.createErrorEmbed)("An error occured while executing the button interaction"), true));
            }
        });
    }
}
exports.ButtonHandler = ButtonHandler;
