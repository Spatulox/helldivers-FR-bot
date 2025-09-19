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
exports.toogle_interaction = toogle_interaction;
const ManageModules_1 = require("../../modules/ManageModules");
const embeds_1 = require("../../utils/messages/embeds");
function toogle_interaction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = interaction.customId.slice(7);
        const manage = ManageModules_1.ManageModule.instance;
        const mod = manage.getModule(name);
        if ((mod === null || mod === void 0 ? void 0 : mod.enabled) && manage.disableModule(name)) {
            interaction.reply((0, embeds_1.returnToSendEmbedForInteraction)((0, embeds_1.createSimpleEmbed)(`Module **${name}** has been disabled`), true));
        }
        else if (!(mod === null || mod === void 0 ? void 0 : mod.enabled) && manage.enableModule(name)) {
            interaction.reply((0, embeds_1.returnToSendEmbedForInteraction)((0, embeds_1.createSimpleEmbed)(`Module **${name}** has been enabled`), true));
        }
    });
}
