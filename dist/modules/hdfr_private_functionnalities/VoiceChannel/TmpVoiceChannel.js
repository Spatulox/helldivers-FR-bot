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
const HDFR_1 = require("../../../utils/hdfr_list/HDFR");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const VoiceChannel_1 = require("./VoiceChannel");
class TmpVoiceChannel extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "TmpVoiceChannel";
        this.description = "Create temporary voice channel";
    }
    get terminidChannel() {
        return VoiceChannel_1.VoiceChannel.terminidChannel;
    }
    get automatonChannel() {
        return VoiceChannel_1.VoiceChannel.automatonChannel;
    }
    get illuminateChannel() {
        return VoiceChannel_1.VoiceChannel.illuminateChannel;
    }
    get otherChannel() {
        return VoiceChannel_1.VoiceChannel.otherChannel;
    }
    get allTriggerChannels() {
        return [
            ...this.terminidChannel,
            ...this.automatonChannel,
            ...this.illuminateChannel,
            ...this.otherChannel,
        ];
    }
    /*
    private getTriggerGroupForChannel(channelId: string): string[] | null {
        if (this.terminidChannel.includes(channelId))  return this.terminidChannel;
        if (this.automatonChannel.includes(channelId)) return this.automatonChannel;
        if (this.illuminateChannel.includes(channelId)) return this.illuminateChannel;
        if (this.otherChannel.includes(channelId))     return this.otherChannel;
        return null;
    }
    */
    get events() {
        return {
            [discord_js_1.Events.VoiceStateUpdate]: (oldState, newState) => { this.handleCreateVoice(oldState, newState); }
        };
    }
    handleCreateVoice(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (newState.guild.id != HDFR_1.HDFR.guildID)
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
                let nextNumber = 1;
                const hellpodRegex = /^.+\s+hellpod\s+(\d+)[TAI]?(?:\s.*)?$/;
                const existingHellpodNumbers = Array.from(category.children.cache.values())
                    .filter((ch) => ch.type === discord_js_1.ChannelType.GuildVoice)
                    .map(ch => {
                    const match = ch.name.match(hellpodRegex);
                    return match && match[1] ? parseInt(match[1], 10) : 0;
                })
                    .filter(n => n > 0)
                    .sort((a, b) => b - a); // tri descendant
                if (existingHellpodNumbers.length > 0 && existingHellpodNumbers[0]) {
                    nextNumber = existingHellpodNumbers[0] + 1;
                }
                const emote = triggerChannel.name.split(" ")[0];
                let upperLetter;
                if (this.terminidChannel.includes(triggerChannel.id)) {
                    upperLetter = "T";
                }
                else if (this.automatonChannel.includes(triggerChannel.id)) {
                    upperLetter = "A";
                }
                else if (this.illuminateChannel.includes(triggerChannel.id)) {
                    upperLetter = "I";
                }
                else {
                    upperLetter = triggerChannel.name.slice(0, 1).toUpperCase();
                }
                const newChannelName = `${emote} hellpod ${nextNumber}${upperLetter}`;
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
