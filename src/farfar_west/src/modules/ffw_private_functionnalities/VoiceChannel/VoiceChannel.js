"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannel = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const TmpVoiceChannel_1 = require("./TmpVoiceChannel");
const DeleteEmptyVoiceChannel_1 = require("./DeleteEmptyVoiceChannel");
const FFW_1 = require("../../../utils/ffw_list/FFW");
const WatchingOfflineUser_1 = require("../../../../../share/modules/WatchingOfflineUser");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const BotType_1 = require("../../../../../share/BotType");
const FFWUserList_1 = require("../../../utils/ffw_list/FFWUserList");
const UserList_1 = require("../../../../../share/utils/UserList");
class VoiceChannel extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "VoiceChannel";
        this.description = "Manage all modules related to voice channels";
        this.tmpVoice = new TmpVoiceChannel_1.FFWTmpVoiceChannel();
        this.deleteChannel = new DeleteEmptyVoiceChannel_1.FFWDeleteEmptyVoiceChannel();
        this.watchingBot = new WatchingOfflineUser_1.WatchingOfflineUser(FFW_1.FFW.guildID, simplediscordbot_1.BotEnv.dev ? UserList_1.UserList.shared.SPATULOX : FFWUserList_1.FFWUserList.SUVEILLANT, BotType_1.BotType.FARFAR_WEST);
        this.subModules = [
            this.tmpVoice,
            this.deleteChannel,
            this.watchingBot,
        ];
    }
    static get trainChannel() {
        return [FFW_1.FFW.channel.prime_facile, FFW_1.FFW.channel.prime_normal, FFW_1.FFW.channel.prime_hard, FFW_1.FFW.channel.prime_tres_hard, FFW_1.FFW.channel.prime_cauchemar, FFW_1.FFW.channel.farm_et_defis, FFW_1.FFW.channel.separator];
    }
    static get allTriggerChannels() {
        return [...this.trainChannel];
    }
    static get categories() {
        return [FFW_1.FFW.categories.en_chasse];
    }
}
exports.VoiceChannel = VoiceChannel;
