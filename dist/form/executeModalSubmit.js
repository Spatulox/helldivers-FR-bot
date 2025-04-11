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
exports.executeModalSubmit = executeModalSubmit;
const embeds_1 = require("../utils/messages/embeds");
function executeModalSubmit(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isModalSubmit())
            return;
        switch (interaction.customId) {
            default:
                yield (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Hmmm, what are you doing here ?? (executeModalSubmit)"), true);
                break;
        }
    });
}
