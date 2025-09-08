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
exports.ManageModule = void 0;
const discord_js_1 = require("discord.js");
const Modules_1 = require("../utils/other/Modules");
const client_1 = require("../utils/client");
const embeds_1 = require("../utils/messages/embeds");
// Le gestionnaire central
class ManageModule extends Modules_1.Module {
    constructor() {
        super("Manage Module", "List of modules and their status. Click a button to activate/deactivate a module.");
        this.modules = new Map();
        this.embedMessage = null;
        this.threadId = "1406339730731307109";
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
            var _a;
            if (ManageModule.isInitialization)
                return;
            try {
                const channel = yield client_1.client.channels.fetch(this.threadId);
                if (!channel || !channel.isThread()) {
                    console.error("Thread non trouvé ou mauvais type de salon");
                    return;
                }
                const container = this.createMessageContainer();
                const thread = channel;
                //Once restarted, fetch the first message send by the bot in the thread
                if (!this.embedMessage) {
                    const messages = yield thread.messages.fetch({ limit: 50 });
                    this.embedMessage = (_a = messages.find(m => { var _a; return m.author.id === ((_a = client_1.client.user) === null || _a === void 0 ? void 0 : _a.id); })) !== null && _a !== void 0 ? _a : null;
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
            const lineText = `### ${name} ${isEnabled ? "🟢" : "🔴"} \n ${module.description}`;
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId(`toggle_${name}`)
                .setLabel(isEnabled ? "Désactiver" : "Activer")
                .setStyle(isEnabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success);
            const textDisplay = new discord_js_1.TextDisplayBuilder().setContent(lineText);
            const section = new discord_js_1.SectionBuilder()
                .addTextDisplayComponents(textDisplay)
                .setButtonAccessory(button);
            container.addSectionComponents(section);
            container.addSeparatorComponents(new discord_js_1.SeparatorBuilder());
        }
        return container;
    }
    addModule(name, module) {
        this.modules.set(name, module);
        this.syncManageModuleMessage();
    }
    enableModule(name) {
        const mod = this.modules.get(name);
        if (mod) {
            if (mod.enable()) {
                this.syncManageModuleMessage();
                return true;
            }
        }
        return false;
    }
    disableModule(name) {
        const mod = this.modules.get(name);
        if (mod) {
            if (mod.disable()) {
                this.syncManageModuleMessage();
                return true;
            }
        }
        return false;
    }
    enableAll() {
        this.modules.forEach(module => module.enable());
        this.syncManageModuleMessage();
    }
    disableAll() {
        this.modules.forEach(module => module.disable());
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
            for (const mod of this.modules.values()) {
                if (mod.enabled && typeof mod.handleInteraction === "function") {
                    yield mod.handleInteraction(interaction);
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
}
exports.ManageModule = ManageModule;
ManageModule._instance = null;
ManageModule.isInitialization = true;
