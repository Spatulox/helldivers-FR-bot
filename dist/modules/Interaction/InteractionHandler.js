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
exports.InteractionHandler = void 0;
const discord_js_1 = require("discord.js");
const log_1 = require("../../utils/other/log");
const Modules_1 = require("../../utils/other/Modules");
const embeds_1 = require("../../utils/messages/embeds");
const executeCommand_1 = require("../../commands/executeCommand");
const executeModalSubmit_1 = require("../../form/executeModalSubmit");
const executeSelectmenu_1 = require("../../selectmenu/executeSelectmenu");
const executeContextMenu_1 = require("../../context-menu/executeContextMenu");
/**
 * The class Handle All Interaction type and dispatch them by type.
 * All functions "executeX" will be rewrite to match the new Module Architecture
 */
class InteractionHandler extends Modules_1.Module {
    /**
     * The "enabled" herited var is kinda useless, unless you want to disable all interaction type
     */
    constructor() {
        super("Interaction Hanlder", "This Module handle all interactions between the user and the bot (Commands, Button, SelectMenu, ContextMenu)");
        this._interactionEnabled = {
            all: true,
            commands: true,
            buttons: true,
            modal: true,
            selectMenus: true,
            contextMenus: true,
        };
    }
    get interactionEnabled() {
        return this._interactionEnabled;
    }
    /**
     * Since to enable/disable module is by button, we can ask the user which interaction he wants to disable
     * So we need to create a container (with button) to enable/disable each interaction type
     */
    /*
    public enableInteraction(tye: string): void {
        
    }

    public disableInteraction(type: string): void {
        log("ERROR : Impossible to disable this module")
        throw new Error("ERROR : Impossible to disable this module")
    }
    */
    enable() {
        this._interactionEnabled.all = true;
    }
    disable() {
        (0, log_1.log)("ERROR : Impossible to disable this module");
        throw new Error("ERROR : Impossible to disable this module");
    }
    answerInteraction(interaction, message) {
        interaction.isRepliable() && interaction.reply(Object.assign(Object.assign({}, (0, embeds_1.returnToSendEmbedForInteraction)((0, embeds_1.createErrorEmbed)(message || "This interaction type is disabled"))), { flags: discord_js_1.MessageFlags.Ephemeral }));
    }
    handleInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) { // Add an exeption for the button to enable/disable the InteractionModule
                this.answerInteraction(interaction, "All Interactions are disabled");
                return;
            }
            try {
                if (interaction.isChatInputCommand()) {
                    if (!this._interactionEnabled.commands) {
                        this.answerInteraction(interaction);
                        return;
                    }
                    // Si l'interaction est une commande slash
                    (0, executeCommand_1.executeSlashCommand)(interaction);
                }
                else if (interaction.isModalSubmit()) {
                    if (!this._interactionEnabled.modal) {
                        this.answerInteraction(interaction);
                        return;
                    }
                    // Si l'interaction est un modal submit
                    (0, executeModalSubmit_1.executeModalSubmit)(interaction);
                }
                else if (interaction.isStringSelectMenu()) {
                    if (!this._interactionEnabled.selectMenus) {
                        this.answerInteraction(interaction);
                        return;
                    }
                    // Si l'interaction est un selectMenu
                    (0, executeSelectmenu_1.executeSelectMenu)(interaction);
                }
                else if (interaction.isContextMenuCommand()) {
                    if (!this._interactionEnabled.contextMenus) {
                        this.answerInteraction(interaction);
                        return;
                    }
                    // Si l'interaction est un context menu
                    (0, executeContextMenu_1.executeContextMenu)(interaction);
                }
                else if (interaction.isButton()) {
                    if (!this._interactionEnabled.buttons) {
                        this.answerInteraction(interaction);
                        return;
                    }
                    interaction.reply({
                        content: "Button !!",
                        flags: discord_js_1.MessageFlags.Ephemeral
                    });
                }
                else {
                    this.answerInteraction(interaction, "Interaction not allowed");
                    console.log(interaction);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`WARN : Type d'interaction non pris en charge (${discord_js_1.InteractionType[interaction.type]})`));
                    console.warn(`WARN : Type d'interaction non pris en charge (${discord_js_1.InteractionType[interaction.type]})`);
                }
            }
            catch (error) {
                console.error(`ERROR : Une erreur s'est produite lors du traitement de l'interaction`, error);
            }
        });
    }
}
exports.InteractionHandler = InteractionHandler;
