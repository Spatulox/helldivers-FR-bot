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
exports.owner = exports.client = void 0;
exports.initOwner = initOwner;
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config.json"));
const channels_1 = require("./guilds/channels");
const log_1 = require("./log");
exports.client = new discord_js_1.Client({ intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.DirectMessageReactions,
        discord_js_1.GatewayIntentBits.DirectMessages
    ],
    partials: [discord_js_1.Partials.Channel]
});
function initOwner() {
    return __awaiter(this, void 0, void 0, function* () {
        if (config_json_1.default.sendToOwnerOrChannel === "0") {
            try {
                exports.owner = yield exports.client.users.fetch(config_json_1.default.owner);
                exports.owner.send('Bot online');
                return true;
            }
            catch (e) {
                exports.owner = null;
                (0, log_1.log)(`ERROR : Something went wrong when searching for the owner : ${e}`);
                return false;
            }
        }
        else if (config_json_1.default.sendToOwnerOrChannel === "1") {
            try {
                const channelLogin = yield (0, channels_1.searchClientChannel)(exports.client, config_json_1.default.helldiverLogChannel);
                if (channelLogin) {
                    channelLogin.send(`<@${config_json_1.default.owner}>, Bot is online!`);
                    return true;
                }
                return false;
            }
            catch (e) {
                (0, log_1.log)(`ERROR : Something went wrong when searching for the channel to send the online message : ${e}`);
                return false;
            }
        }
        return false;
    });
}
