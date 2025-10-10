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
const Modules_1 = require("../../utils/other/Modules");
const embeds_1 = require("../../utils/messages/embeds");
const CommandHandler_1 = require("./CommandHandler");
const ModalHandler_1 = require("./ModalHandler");
const SelectMenuHandler_1 = require("./SelectMenuHandler");
const ContextMenuHandler_1 = require("./ContextMenuHandler");
const ButtonHandler_1 = require("./ButtonHandler");
/**
 * The class Handle All Interaction type and dispatch them by type.
 * All functions "executeX" will be rewrite to match the new Module Architecture
 */
class InteractionHandler extends Modules_1.MultiModule {
    /**
     * The "enabled" herited var is kinda useless, unless you want to disable all interaction type
     */
    constructor() {
        super("Interaction Handler", "This Module handle all interactions between the user and the bot (Commands, Button, SelectMenu, ContextMenu, Modal)");
        this.buttonHandler = new ButtonHandler_1.ButtonHandler();
        this.commandHandler = new CommandHandler_1.CommandHandler();
        this.contextMenuHandler = new ContextMenuHandler_1.ContextMenuHandler();
        this.modalHandler = new ModalHandler_1.ModalHandler();
        this.selectMenuHandler = new SelectMenuHandler_1.SelectMenuHandler();
        this._subModuleList = [
            this.buttonHandler,
            this.commandHandler,
            this.contextMenuHandler,
            this.modalHandler,
            this.selectMenuHandler
        ];
    }
    answerInteraction(interaction, message) {
        interaction.isRepliable() && interaction.reply(Object.assign(Object.assign({}, (0, embeds_1.returnToSendEmbedForInteraction)((0, embeds_1.createErrorEmbed)(message || "This interaction type is disabled"))), { flags: discord_js_1.MessageFlags.Ephemeral }));
    }
    handleInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.enabled) { // Add an exeption for the button to enable/disable the InteractionModule
                    this.answerInteraction(interaction, "All Interactions are disabled");
                    return;
                }
                InteractionHandler.lastInteraction = new Date();
                if (interaction.isChatInputCommand()) {
                    this.commandHandler.execute(interaction);
                }
                else if (interaction.isModalSubmit()) {
                    this.modalHandler.execute(interaction);
                }
                else if (interaction.isStringSelectMenu()) {
                    this.selectMenuHandler.execute(interaction);
                }
                else if (interaction.isContextMenuCommand()) {
                    this.contextMenuHandler.execute(interaction);
                }
                else if (interaction.isButton()) {
                    this.buttonHandler.execute(interaction);
                }
                else {
                    this.answerInteraction(interaction, "Interaction not allowed");
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
InteractionHandler.lastInteraction = null;
