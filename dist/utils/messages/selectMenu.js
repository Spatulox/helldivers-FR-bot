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
exports.SelectMenu = void 0;
exports.sendInteractionSelectMenu = sendInteractionSelectMenu;
const discord_js_1 = require("discord.js");
const log_1 = require("../log");
class SelectMenu {
    constructor(name, content = "") {
        this.menu = {
            name: '',
            content: '',
            components: [],
            select_menu: new discord_js_1.StringSelectMenuBuilder(),
            flags: discord_js_1.MessageFlags.Ephemeral
        };
        this.menu.name = name;
        this.menu.content = content;
    }
    create(placeholder, customId) {
        this.menu.select_menu = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder);
    }
}
exports.SelectMenu = SelectMenu;
function returnToSendSelectMenu(selectMenu, content, privateVisibility = false) {
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    return {
        content: content,
        components: [row],
        flags: privateVisibility ? discord_js_1.MessageFlags.Ephemeral : undefined
    };
}
function returnToSendSelectMenuForEditInteraction(selectMenu, content) {
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    return {
        content: content,
        components: [row]
    };
}
function sendInteractionSelectMenu(interaction, selectMenu, privateVisibility) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isRepliable()) {
            console.log("WARNING : L'interaction ne peut pas recevoir de réponse : (sendInteractionSelectMenu)");
            return false;
        }
        try {
            const replyOptions = returnToSendSelectMenu(selectMenu.select_menu, selectMenu.content, privateVisibility);
            if (interaction.deferred) {
                const replyEditOptions = returnToSendSelectMenuForEditInteraction(selectMenu.select_menu, selectMenu.content);
                yield interaction.editReply(replyEditOptions);
            }
            else if (interaction.replied) {
                yield interaction.followUp(replyOptions);
            }
            else if (interaction.isRepliable()) {
                yield interaction.reply(replyOptions);
            }
            else {
                (0, log_1.log)("Error when sending interaction !");
                return false;
            }
            console.log(`INFO : SelectMenu '${selectMenu.content || 'sans titre :/'}' envoyé à l'utilisateur via l'interaction '${interaction.id}'`);
            return true;
        }
        catch (e) {
            console.error(`ERROR : Impossible d'envoyer le SelectMenu '${selectMenu.content || 'sans titre :/'}' via l'interaction '${interaction.id}' : ${e}`);
            return false;
        }
    });
}
