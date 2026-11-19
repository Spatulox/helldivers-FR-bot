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
exports.DebugPanel = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const HDFR_1 = require("../utils/hdfr_list/HDFR");
const GlobalMemberManager_1 = require("../../../share/managers/GlobalMemberManager");
const Counter_1 = require("./hdfr_public_functionnalities/Counter");
const UpdateAllMembers_1 = require("./hdfr_private_functionnalities/ScheduleJobs/UpdateAllMembers");
const AutoBanScamBase_1 = require("../../../share/modules/AutoBanScam/AutoBanScamBase");
const Intrusion_1 = require("./mini-games/intrusion/Intrusion");
/**
 * Persistent panel of staff debug actions in #module_et_auto.
 *
 * It replaces the former text commands (`check all -force`, `<n> -force`, `$test`, `$skip`) :
 * Discord does not grant the MESSAGE_CONTENT intent for text commands, so every manual action
 * goes through a button here. Each click checks the rights of the member itself, the visibility
 * of the channel is not relied upon.
 */
class DebugPanel extends discord_module_1.ModuleWithCachedMessage {
    get events() {
        return {};
    }
    get channelId() {
        return HDFR_1.HDFR.channel.module_et_auto;
    }
    initData() {
        return {
            channel_id: this.channelId,
            message_id: ""
        };
    }
    constructor() {
        super();
        this.name = DebugPanel.NAME;
        this.description = "Staff debug actions (force counter, update members, anti-scam test, skip intrusion)";
        this.cacheKey = "debug_panel";
        this.ready = this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCache();
            this.cacheData.channel_id = this.channelId;
            yield this.writeCache();
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            yield this.triggerUpdateMessage();
        });
    }
    enable() {
        super.enable();
        void this.refresh();
    }
    toggle() {
        super.toggle();
        if (this.enabled) {
            void this.refresh();
        }
    }
    getChannel() {
        return simplediscordbot_1.GuildManager.channel.any.find(this.channelId);
    }
    buildMessage() {
        return this.createMessage();
    }
    editMessage() {
        return this.createMessage();
    }
    createMessage() {
        const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.orange);
        embed.setTitle("Debug Panel");
        embed.setDescription("Manual staff actions. Every click is logged.\n\n" +
            "- **Update all members** *(technician)* : runs the 2-hour member scan now\n" +
            "- **Force counter** *(admin / technician)* : the bot posts the given number in the counter (logged with your name), the next expected number follows it\n" +
            "- **Arm anti-scam test** *(technician)* : your next message in a « ne rien écrire ici » channel, within 5 minutes, runs the anti-scam chain in test mode (no sanction)\n" +
            "- **Skip global / counter intrusion** *(technician)* : closes the running Automaton intrusion as solved");
        const buttons = simplediscordbot_1.ButtonManager.toMessage([
            simplediscordbot_1.ButtonManager.row([
                simplediscordbot_1.ButtonManager.primary({ customId: DebugPanel.UPDATE_MEMBERS, label: "Update all members", emoji: "👥" }),
                simplediscordbot_1.ButtonManager.primary({ customId: DebugPanel.FORCE_COUNTER, label: "Force counter", emoji: "🔢" }),
                simplediscordbot_1.ButtonManager.danger({ customId: DebugPanel.ARM_SCAM_TEST, label: "Arm anti-scam test", emoji: "🧀" }),
            ]),
            simplediscordbot_1.ButtonManager.row([
                simplediscordbot_1.ButtonManager.secondary({ customId: DebugPanel.SKIP_GLOBAL_INTRUSION, label: "Skip global intrusion", emoji: "⏭️" }),
                simplediscordbot_1.ButtonManager.secondary({ customId: DebugPanel.SKIP_COUNTER_INTRUSION, label: "Skip counter intrusion", emoji: "⏭️" }),
            ])
        ]);
        return {
            embeds: [embed],
            components: buttons.components
        };
    }
    // ── Interaction handlers (registered in RegisterInteractions) ─────────────────────────────
    /**
     * Shared gate of every action : the panel must be enabled and the member must hold the right.
     * Replies itself (ephemeral) when refused.
     */
    static authorize(interaction, right) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = discord_module_1.ModuleRegistry.getModule(DebugPanel.NAME)) === null || _a === void 0 ? void 0 : _a.enabled)) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("The Debug Panel module is disabled"), true);
                return null;
            }
            const member = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFR.guildID, interaction.user.id);
            const allowed = member != null && (GlobalMemberManager_1.GlobalMemberManager.HDFR.isTechnician(member) ||
                (right === "adminOrTechnician" && GlobalMemberManager_1.GlobalMemberManager.HDFR.isAdmin(member)));
            if (!allowed) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("You are not allowed to use this action"), true);
                return null;
            }
            return member;
        });
    }
    static updateMembers(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield DebugPanel.authorize(interaction, "technician");
            if (!member)
                return;
            const module = discord_module_1.ModuleRegistry.getModule(UpdateAllMembers_1.UpdateAllMembers.NAME);
            if (!(module instanceof UpdateAllMembers_1.UpdateAllMembers) || !module.enabled) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error(`The ${UpdateAllMembers_1.UpdateAllMembers.NAME} module is disabled`), true);
                return;
            }
            // A full scan takes far longer than the 3 s Discord gives to answer
            yield simplediscordbot_1.Bot.interaction.defer(interaction, true);
            try {
                yield module.runNow(member.id);
                yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.success("All members updated"), true);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Update All members failed : ${e}`));
                yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("The update failed, see the logs"), true);
            }
        });
    }
    static forceCounter(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield DebugPanel.authorize(interaction, "adminOrTechnician");
            if (!member)
                return;
            yield interaction.showModal(simplediscordbot_1.ModalManager.number(DebugPanel.FORCE_COUNTER_MODAL, "Force counter", "New counter value", false));
        });
    }
    static forceCounterModal(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield DebugPanel.authorize(interaction, "adminOrTechnician");
            if (!member)
                return;
            const value = simplediscordbot_1.ModalManager.parseNumber(interaction.fields.getTextInputValue(`${DebugPanel.FORCE_COUNTER_MODAL}_input`));
            if (value === null || !Number.isInteger(value) || value < 0) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error("Please enter a positive integer"), true);
                return;
            }
            yield simplediscordbot_1.Bot.interaction.defer(interaction, true);
            const done = yield Counter_1.Counter.forceCount(interaction.user, value);
            yield simplediscordbot_1.Bot.interaction.send(interaction, done ? simplediscordbot_1.EmbedManager.success(`Counter forced to ${value}`) : simplediscordbot_1.EmbedManager.error("The counter channel is not loaded yet"), true);
        });
    }
    static armScamTest(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield DebugPanel.authorize(interaction, "technician");
            if (!member)
                return;
            const expiresAt = AutoBanScamBase_1.AutoBanScamBase.armTechnicianTest(member.id);
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.debug(`Anti-scam test armed by <@${member.id}>`));
            yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.success(`Test armed : post a message in a « ne rien écrire ici » channel before <t:${Math.floor(expiresAt.getTime() / 1000)}:T>`), true);
        });
    }
    static skipGlobalIntrusion(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DebugPanel.skipIntrusion(interaction, Intrusion_1.Intrusion.discordIntrusion, "global");
        });
    }
    static skipCounterIntrusion(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DebugPanel.skipIntrusion(interaction, Intrusion_1.Intrusion.counterIntrusion, "counter");
        });
    }
    static skipIntrusion(interaction, intrusion, label) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield DebugPanel.authorize(interaction, "technician");
            if (!member)
                return;
            if (!(intrusion === null || intrusion === void 0 ? void 0 : intrusion.isHacked)) {
                yield simplediscordbot_1.Bot.interaction.reply(interaction, simplediscordbot_1.EmbedManager.error(`No ${label} intrusion running`), true);
                return;
            }
            yield simplediscordbot_1.Bot.interaction.defer(interaction, true);
            yield intrusion.technicianSkip(member.id);
            yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.success(`The ${label} intrusion was closed`), true);
        });
    }
}
exports.DebugPanel = DebugPanel;
DebugPanel.NAME = "Debug Panel";
DebugPanel.UPDATE_MEMBERS = "debugPanel:updateMembers";
DebugPanel.FORCE_COUNTER = "debugPanel:forceCounter";
DebugPanel.FORCE_COUNTER_MODAL = "debugPanel:forceCounterModal";
DebugPanel.ARM_SCAM_TEST = "debugPanel:armScamTest";
DebugPanel.SKIP_GLOBAL_INTRUSION = "debugPanel:skipGlobalIntrusion";
DebugPanel.SKIP_COUNTER_INTRUSION = "debugPanel:skipCounterIntrusion";
