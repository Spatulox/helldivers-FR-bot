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
exports.VoiceChannelDescription = void 0;
const client_1 = require("../../../utils/client");
const Modules_1 = require("../../../utils/other/Modules");
const embeds_1 = require("../../../utils/messages/embeds");
const constantes_1 = require("../../../utils/constantes");
class VoiceChannelDescription extends Modules_1.Module {
    constructor() {
        if (VoiceChannelDescription._instance) {
            return VoiceChannelDescription._instance;
        }
        super("Voice Channel Description", "Set the voice channel status when someone is joining certain voice channel");
        //        prod                    dev
        //private readonly voiceChannelId: string[] = ["1155492225774534696", "1215343151741403147"];
        this.string = "🚫 PAS DE HD2 ICI 🚫";
        this.voiceChannels = {
            "1155492225774534696": this.string, // detente prod
            "1215343151741403147": this.string, // detente dev
            "1426315694009749594": this.string // relaxation (prod)
        };
        VoiceChannelDescription._instance = this;
    }
    static get instance() {
        return VoiceChannelDescription._instance;
    }
    handleVoiceState(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.enabled) {
                return;
            }
            if (((_a = newState.channel) === null || _a === void 0 ? void 0 : _a.guildId) != constantes_1.TARGET_GUILD_ID) {
                return;
            }
            // join Vocal
            if (!oldState.channelId && newState.channelId && this.voiceChannels[newState.channelId]) {
                try {
                    const chanString = this.voiceChannels[newState.channelId];
                    if (chanString) {
                        const channel = yield client_1.client.channels.cache.get(newState.channelId);
                        if (channel && channel.type == 2 && channel.members.size > 1) {
                            return;
                        }
                        yield client_1.client.rest.put(`/channels/${newState.channelId}/voice-status`, { body: { status: chanString } });
                    }
                }
                catch (error) {
                    console.error(error);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to set the status of a channel"));
                }
            }
            /*
            // Leave Vocal
            if (oldState.channelId && !newState.channelId) {
                console.log(`${oldState.member?.user.username} a quitté le vocal`);
            }
            
            // Change Vocal
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                console.log(`${newState.member?.user.username} a changé de vocal : ${oldState.channelId} → ${newState.channelId}`);
            }
            */
        });
    }
}
exports.VoiceChannelDescription = VoiceChannelDescription;
VoiceChannelDescription._instance = null;
