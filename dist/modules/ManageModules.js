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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageModule = void 0;
const discord_js_1 = require("discord.js");
const Modules_1 = require("../utils/other/Modules");
const client_1 = require("../utils/client");
const embeds_1 = require("../utils/messages/embeds");
const config_json_1 = __importDefault(require("../config.json"));
const Status_1 = require("./Functionnalities/Status");
// Le gestionnaire central
class ManageModule extends Modules_1.Module {
    constructor() {
        super("Manage Module", "List of modules and their status. Click a button to activate/deactivate a module.");
        this.modules = new Map();
        this.embedMessage = null;
        this.threadId = config_json_1.default.moduleMessageChannel;
        if (!ManageModule._instance) {
            ManageModule._instance = this;
        }
    }
    static get instance() {
        if (!this._instance) {
            throw new Error("ManageModule not initialized");
        }
        return this._instance;
    }
    syncManageModuleMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (ManageModule.isInitialization)
                return;
            try {
                const channel = yield client_1.client.channels.fetch(this.threadId);
                if (!channel || !channel.isTextBased() || !channel.isSendable()) {
                    console.error("Channel non trouvé ou impossible d'y envoyer un message");
                    return;
                }
                const container = this.createMessageContainer();
                //Once restarted, fetch the first message send by the bot in the targetted channel
                if (!this.embedMessage) {
                    this.embedMessage = yield this.getXthBotMessage(this.threadId, 1);
                }
                if (this.embedMessage) {
                    yield this.embedMessage.edit({
                        components: [container],
                        flags: discord_js_1.MessageFlags.IsComponentsV2,
                    });
                }
                else {
                    this.embedMessage = yield channel.send({
                        components: [container],
                        flags: discord_js_1.MessageFlags.IsComponentsV2,
                    });
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    createMessageContainer() {
        const container = new discord_js_1.ContainerBuilder();
        const title = new discord_js_1.TextDisplayBuilder()
            .setContent(`# ${this.name}`);
        container.addTextDisplayComponents(title);
        // --- SECTION DESCRIPTION ---
        const description = new discord_js_1.TextDisplayBuilder()
            .setContent(`${this.description}`);
        container.addTextDisplayComponents(description);
        container.addSeparatorComponents(new discord_js_1.SeparatorBuilder().setSpacing(discord_js_1.SeparatorSpacingSize.Large));
        //const sections: (SectionBuilder | SeparatorBuilder)[] = [];
        for (const [name, module] of this.modules.entries()) {
            const isEnabled = Boolean(module.enabled);
            const lineText = `### ${isEnabled ? "🟢" : "🔴"} __${name}__ \n ${module.description}`;
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId(`toggle_${name}`)
                .setLabel(isEnabled ? "Désactiver" : "Activer")
                .setStyle(isEnabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success);
            const textDisplay = new discord_js_1.TextDisplayBuilder().setContent(lineText);
            const section = new discord_js_1.SectionBuilder()
                .addTextDisplayComponents(textDisplay)
                .setButtonAccessory(button);
            container.addSectionComponents(section);
            //container.addSeparatorComponents(new SeparatorBuilder())
        }
        return container;
    }
    addModule(name, module) {
        this.modules.set(name, module);
        this.syncManageModuleMessage();
    }
    enableModule(name, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const mod = this.modules.get(name);
            if (mod) {
                if (mod instanceof Modules_1.MultiModule) {
                    if (mod.disable(interaction)) {
                        yield this.syncManageModuleMessage();
                        return true;
                    }
                }
                else {
                    if (mod.enable()) {
                        yield this.syncManageModuleMessage();
                        return true;
                    }
                }
            }
            return false;
        });
    }
    disableModule(name, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const mod = this.modules.get(name);
            if (mod) {
                if (mod instanceof Modules_1.MultiModule) {
                    if (mod.disable(interaction)) {
                        yield this.syncManageModuleMessage();
                        return true;
                    }
                }
                else {
                    if (mod.disable()) {
                        yield this.syncManageModuleMessage();
                        return true;
                    }
                }
            }
            return false;
        });
    }
    enableAll() {
        this.modules.forEach(module => {
            module.enable();
        });
        this.syncManageModuleMessage();
    }
    disableAll() {
        this.modules.forEach(module => {
            module.disable();
        });
        this.syncManageModuleMessage();
    }
    getModule(name) {
        return this.modules.get(name);
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleMessage === "function") {
                    yield mod.handleMessage(message);
                }
            }
        });
    }
    handleMessageUpdate(oldMessage, newMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleMessageUpdate === "function") {
                    yield mod.handleMessageUpdate(oldMessage, newMessage);
                }
            }
        });
    }
    handleMessageDelete(message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleMessageDelete === "function") {
                    yield mod.handleMessageDelete(message);
                }
            }
        });
    }
    handleMessageReaction(reaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleMessageReaction === "function") {
                    yield mod.handleMessageReaction(reaction, user);
                }
            }
        });
    }
    /**
     * Usually, you should only have one module to handle all interaction type, and dispatch them by type.
     * But, for dev liberty, we call all defind handleInteraction from all Module which have this function defined
     * @param interaction
     */
    handleInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Add an exception for the button to enable/disable the InteractionModule
            // Rigth now it's impossible to disable any interaction
            Status_1.Status.lastBotInteraction = new Date();
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleInteraction === "function") {
                    yield mod.handleInteraction(interaction); // Mini Games are not called from here, but from the specialized Interaction module (Commands, Button, SelectMenu, ContextMenu, Modal)
                }
                else if (!mod.enabled && typeof mod.handleInteraction === "function") {
                    const embed = (0, embeds_1.createErrorEmbed)("This Interaction is disabled");
                    try {
                        interaction.isRepliable() && (yield interaction.reply(Object.assign(Object.assign({}, (0, embeds_1.returnToSendEmbedForInteraction)(embed)), { flags: discord_js_1.MessageFlags.Ephemeral })));
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        });
    }
    handleGuildMemberAdd(member) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleGuildMemberAdd === "function") {
                    yield mod.handleGuildMemberAdd(member);
                }
            }
        });
    }
    handleGuildMemberUpdate(oldMember, newMember) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleGuildMemberUpdate === "function") {
                    yield mod.handleGuildMemberUpdate(oldMember, newMember);
                }
            }
        });
    }
    handleVoiceState(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleVoiceState === "function") {
                    yield mod.handleVoiceState(oldState, newState);
                }
            }
        });
    }
    handleAny(_any) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleAny === "function") {
                    yield mod.handleAny(_any);
                }
            }
        });
    }
    handleReaction() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleReaction === "function") {
                    yield mod.handleReaction();
                }
            }
        });
    }
}
exports.ManageModule = ManageModule;
ManageModule._instance = null;
ManageModule.isInitialization = true;
