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
dotenv_1.default.config({ path: "./src/monitoring/.env.moni" });
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const client_1 = require("./client");
const discord_js_1 = require("discord.js");
const RegisterModules_1 = require("./utils/RegisterModules");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            botName: "Monitoring [FR]",
            log: {
                info: { channelId: "1509462956826562640", console: true, discord: true },
                error: { channelId: "1509462956826562640", console: true, discord: true },
                warn: { channelId: "1509462956826562640", console: true, discord: true },
                debug: { channelId: "1509462956826562640", console: true, discord: false }
            }
        };
        const bot = new simplediscordbot_1.Bot(client_1.client, config);
        bot.client.on(discord_js_1.Events.ClientReady, () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (simplediscordbot_1.BotEnv.dev) {
                    new RegisterModules_1.RegisterModules();
                }
            }
            catch (error) {
            }
        }));
    });
}
main();
