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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./src/farfar_west/.env.ffw" });
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const client_1 = require("./client");
const discord_js_1 = require("discord.js");
const activities_1 = require("./activities");
const RegisterInteractions_1 = require("./utils/RegisterInteractions");
const RegisterModules_1 = require("./utils/RegisterModules");
const discord_module_1 = require("@spatulox/discord-module");
const FFW_1 = require("./utils/ffw_list/FFW");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            botName: "Shériff",
            log: {
                info: { channelId: FFW_1.FFW.channel.retour_bot, console: true, discord: true },
                error: { channelId: FFW_1.FFW.channel.farfar_west_bot_log, console: true, discord: true },
                warn: { channelId: FFW_1.FFW.channel.farfar_west_bot_log, console: true, discord: true },
                debug: { channelId: FFW_1.FFW.channel.farfar_west_bot_log, console: true, discord: false }
            }
        };
        const bot = new simplediscordbot_1.Bot(client_1.client, config);
        bot.client.once(discord_js_1.Events.ClientReady, () => __awaiter(this, void 0, void 0, function* () {
            try {
                new RegisterModules_1.RegisterModules(); // Need to register module before, because we need some in the RegisterInteraction
                new RegisterInteractions_1.RegisterInteraction();
                new discord_module_1.ModuleUI(client_1.client, FFW_1.FFW.channel.module_et_auto);
                simplediscordbot_1.Bot.setRandomActivity(activities_1.activities, simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds());
            }
            catch (error) {
            }
        }));
    });
}
main();
