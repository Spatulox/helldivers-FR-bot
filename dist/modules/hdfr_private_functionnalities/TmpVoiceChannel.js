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
exports.TmpVoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const discord_js_1 = require("discord.js");
const HDFR_1 = require("../../utils/HDFR");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class TmpVoiceChannel extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "TmpVoiceChannel";
        this.description = "Create temporary voice channel";
    }
    get terminidChannel() {
        return [
            HDFR_1.HDFRChannelID.T_diff_1_2_3,
            HDFR_1.HDFRChannelID.T_diff_4_5_6,
            HDFR_1.HDFRChannelID.T_diff_7_8_9,
            HDFR_1.HDFRChannelID.T_diff_max
        ];
    }
    get automatonChannel() {
        return [
            HDFR_1.HDFRChannelID.A_diff_1_2_3,
            HDFR_1.HDFRChannelID.A_diff_4_5_6,
            HDFR_1.HDFRChannelID.A_diff_7_8_9,
            HDFR_1.HDFRChannelID.A_diff_max,
        ];
    }
    get illuminateChannel() {
        return [
            HDFR_1.HDFRChannelID.I_diff_1_2_3,
            HDFR_1.HDFRChannelID.I_diff_4_5_6,
            HDFR_1.HDFRChannelID.I_diff_7_8_9,
            HDFR_1.HDFRChannelID.I_diff_max,
        ];
    }
    get otherChannel() {
        return [
            HDFR_1.HDFRChannelID.farm_voc,
            "1305529203113988168",
            "1340435223057268888",
            "1426926821118836786"
        ];
    }
    get allTriggerChannels() {
        return [
            ...this.terminidChannel,
            ...this.automatonChannel,
            ...this.illuminateChannel,
            ...this.otherChannel,
        ];
    }
    getTriggerGroupForChannel(channelId) {
        if (this.terminidChannel.includes(channelId))
            return this.terminidChannel;
        if (this.automatonChannel.includes(channelId))
            return this.automatonChannel;
        if (this.illuminateChannel.includes(channelId))
            return this.illuminateChannel;
        if (this.otherChannel.includes(channelId))
            return this.otherChannel;
        return null;
    }
    get events() {
        return {
            [discord_js_1.Events.VoiceStateUpdate]: (oldState, newState) => { this.handleCreateVoice(oldState, newState); }
        };
    }
    handleCreateVoice(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (newState.guild.id != HDFR_1.HDFRChannelID.guildID)
                    return;
                // --- Suppression du channel temporaire si vide ---
                if (oldState.channelId) {
                    const leftChannel = oldState.channel;
                    if (leftChannel && !this.allTriggerChannels.includes(leftChannel.id)) {
                        if (leftChannel.members.size === 0) {
                            yield leftChannel.delete().catch(() => { });
                            return;
                        }
                    }
                }
                // --- Création d'un channel temporaire ---
                const joinedChannelId = newState.channelId;
                // L'utilisateur n'a pas rejoint un channel (déconnexion ou changement non pertinent)
                if (!joinedChannelId)
                    return;
                // Le channel rejoint n'est pas un déclencheur
                if (!this.allTriggerChannels.includes(joinedChannelId))
                    return;
                const guild = newState.guild;
                const triggerChannel = newState.channel;
                if (!triggerChannel)
                    return;
                const category = triggerChannel.parent;
                if (!category)
                    return;
                // Channels vocaux existants dans la catégorie
                const voiceChannelsInCategory = category.children.cache.filter((ch) => ch.type === discord_js_1.ChannelType.GuildVoice);
                // Nombre de channels "déclencheurs" dans ce groupe
                const triggerGroup = this.getTriggerGroupForChannel(joinedChannelId);
                const triggerCount = triggerGroup.length;
                // Numéro du nouveau channel = (total vocaux dans catégorie) - triggerCount + 1
                const newChannelNumber = voiceChannelsInCategory.size - triggerCount + 1;
                // Nom du nouveau channel : nom du channel déclencheur + numéro
                const newChannelName = `${triggerChannel.name} ${newChannelNumber}`;
                // Création du channel vocal temporaire dans la même catégorie
                const tmpChannel = yield guild.channels.create({
                    name: newChannelName,
                    type: discord_js_1.ChannelType.GuildVoice,
                    parent: category.id,
                    userLimit: 4,
                    permissionOverwrites: triggerChannel.permissionOverwrites.cache.map((overwrite) => ({
                        id: overwrite.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny,
                    })),
                });
                yield ((_a = newState.member) === null || _a === void 0 ? void 0 : _a.voice.setChannel(tmpChannel));
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(`${e}`);
            }
        });
    }
}
exports.TmpVoiceChannel = TmpVoiceChannel;
