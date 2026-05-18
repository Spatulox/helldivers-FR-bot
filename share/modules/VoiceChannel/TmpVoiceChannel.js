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
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class TmpVoiceChannel extends discord_module_1.Module {
    constructor() {
        super(...arguments);
        this.name = "TmpVoiceChannel";
        this.description = "Create temporary voice channel";
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
                if (newState.guild.id != this.guildId)
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
                //const hellpodRegex = /^.+\s+hellpod\s+(\d+)[TAI]?(?:\s.*)?$/;
                const channelRegex = this.channelRegex;
                const existingChannelNumbers = Array.from(category.children.cache.values())
                    .filter((ch) => ch.type === discord_js_1.ChannelType.GuildVoice)
                    .map(ch => {
                    const match = ch.name.match(channelRegex);
                    return match && match[1] ? parseInt(match[1], 10) : 0;
                })
                    .filter(n => n > 0)
                    .sort((a, b) => b - a); // tri descendant
                if (existingChannelNumbers.length > 0 && existingChannelNumbers[0]) {
                    nextNumber = existingChannelNumbers[0] + 1;
                }
                const newChannelName = this.formatChannelName(triggerChannel, nextNumber);
                // Création du channel vocal temporaire dans la même catégorie
                const tmpChannel = yield guild.channels.create({
                    name: newChannelName,
                    type: discord_js_1.ChannelType.GuildVoice,
                    parent: category.id,
                    userLimit: this.userLimit,
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
