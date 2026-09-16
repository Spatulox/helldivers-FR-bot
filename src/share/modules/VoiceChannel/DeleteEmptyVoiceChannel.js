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
exports.DeleteEmptyVoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const CLEANUP_INTERVAL_MS = simplediscordbot_1.Time.minute.MIN_10.toMilliseconds();
class DeleteEmptyVoiceChannel extends discord_module_1.Module {
    constructor() {
        super();
        this.name = "Delete Empty Voice Channel";
        this.description = "Delete old bugged empty voice channel created by Mee6";
        this.cleanupInterval = null;
        this.startCleanup();
    }
    get events() {
        return {};
    }
    startCleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stopCleanup();
            const guild = yield simplediscordbot_1.GuildManager.find(this.guildId);
            if (!guild) {
                simplediscordbot_1.Bot.log.info("Impossible to get the guild in order to cleanup the old buggued channels");
                return;
            }
            this.handleDeleteEmptyChannels(guild);
            this.cleanupInterval = setInterval(() => this.handleDeleteEmptyChannels(guild), CLEANUP_INTERVAL_MS);
        });
    }
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    handleDeleteEmptyChannels(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const persistentChannels = this.allTriggerChannel;
            for (const categoryId of this.categories) {
                const category = guild.channels.cache.get(categoryId);
                if (!category)
                    continue;
                const emptyTmpVoiceChannels = category.children.cache.filter(ch => ch.type === discord_js_1.ChannelType.GuildVoice &&
                    !persistentChannels.includes(ch.id) &&
                    ch.members.size === 0 &&
                    !DeleteEmptyVoiceChannel.pending.has(ch.id) &&
                    !DeleteEmptyVoiceChannel.ignored.has(ch.id));
                for (const channel of emptyTmpVoiceChannels.values()) {
                    yield this.sendAlert(channel);
                }
            }
        });
    }
    sendAlert(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const alertChannel = yield simplediscordbot_1.GuildManager.channel.text.find(this.alertChannelId);
                if (!alertChannel) {
                    simplediscordbot_1.Bot.log.error(`DELETE EMPTY VOICE : salon d'alerte introuvable (${this.alertChannelId})`);
                    return;
                }
                yield alertChannel.send(simplediscordbot_1.ComponentManager.toMessage(DeleteEmptyVoiceChannel.createAlertMessage(channel.id, channel)));
                DeleteEmptyVoiceChannel.pending.add(channel.id);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.error(`DELETE EMPTY VOICE : impossible de signaler <#${channel.id}> : ${e}`);
            }
        });
    }
    static handleButton(interaction, remove) {
        return __awaiter(this, void 0, void 0, function* () {
            // Acquittement immédiat : la recherche et la suppression du salon peuvent dépasser les 2 s
            // surveillées par ErrorGuard.
            yield interaction.deferUpdate();
            const prefix = remove ? this.DELETE_PREFIX : this.IGNORE_PREFIX;
            const channelId = interaction.customId.slice(prefix.length);
            this.pending.delete(channelId);
            const channel = yield simplediscordbot_1.GuildManager.channel.voice.find(channelId).catch(() => null);
            const modId = interaction.user.id;
            let decision;
            if (!remove) {
                this.ignored.add(channelId);
                decision = { text: `🙈 Ignoré par <@${modId}>`, color: simplediscordbot_1.SimpleColor.gray };
            }
            else if (!channel) {
                decision = { text: `ℹ️ Salon déjà supprimé (action de <@${modId}>)`, color: simplediscordbot_1.SimpleColor.gray };
            }
            else if (channel.members.size > 0) {
                // Quelqu'un l'a rejoint entre l'alerte et le clic : il sera re-signalé s'il se vide.
                decision = { text: `⚠️ Salon plus vide, non supprimé (action de <@${modId}>)`, color: simplediscordbot_1.SimpleColor.orange };
            }
            else {
                try {
                    yield channel.delete();
                    decision = { text: `🗑️ Supprimé par <@${modId}>`, color: simplediscordbot_1.SimpleColor.green };
                }
                catch (e) {
                    simplediscordbot_1.Bot.log.error(`DELETE EMPTY VOICE : échec de la suppression de <#${channelId}> : ${e}`);
                    yield interaction.followUp({
                        components: [simplediscordbot_1.ComponentManager.error("Échec de la suppression du salon")],
                        flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral],
                    });
                    return;
                }
            }
            // Retire les boutons pour empêcher un second traitement de la même alerte.
            yield interaction.editReply({ components: [this.createAlertMessage(channelId, channel, decision)] });
        });
    }
    static createAlertMessage(channelId, channel, decision) {
        var _a;
        const container = simplediscordbot_1.ComponentManager.create({ color: (_a = decision === null || decision === void 0 ? void 0 : decision.color) !== null && _a !== void 0 ? _a : simplediscordbot_1.SimpleColor.red });
        container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent("# Salon vocal vide 🔇"), new discord_js_1.TextDisplayBuilder().setContent(`🔊 <#${channelId}>${channel ? ` / ${channel.name}` : ""}`), new discord_js_1.TextDisplayBuilder().setContent(`🆔 ${channelId}`));
        if (channel === null || channel === void 0 ? void 0 : channel.parentId) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`📁 <#${channel.parentId}>`));
        }
        if (decision) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(decision.text));
            return container;
        }
        simplediscordbot_1.ComponentManager.fields(container, [
            { button: [
                    simplediscordbot_1.ButtonManager.danger({ label: "Supprimer", emoji: "🗑️", customId: `${this.DELETE_PREFIX}${channelId}` }),
                    simplediscordbot_1.ButtonManager.secondary({ label: "Ignorer", emoji: "🙈", customId: `${this.IGNORE_PREFIX}${channelId}` }),
                ] }
        ]);
        return container;
    }
}
exports.DeleteEmptyVoiceChannel = DeleteEmptyVoiceChannel;
DeleteEmptyVoiceChannel.BUTTON_PREFIX = "deleteEmptyVoice:";
DeleteEmptyVoiceChannel.DELETE_PREFIX = `${DeleteEmptyVoiceChannel.BUTTON_PREFIX}delete:`;
DeleteEmptyVoiceChannel.IGNORE_PREFIX = `${DeleteEmptyVoiceChannel.BUTTON_PREFIX}ignore:`;
/**
 * Salons déjà signalés (en attente d'une décision) ou ignorés : ils ne sont plus re-signalés à
 * chaque scan. Gardés en mémoire seulement : un redémarrage peut re-signaler un salon ignoré.
 */
DeleteEmptyVoiceChannel.pending = new Set();
DeleteEmptyVoiceChannel.ignored = new Set();
