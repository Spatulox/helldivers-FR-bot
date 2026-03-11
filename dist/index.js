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
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const client_1 = require("./client");
const discord_js_1 = require("discord.js");
const ManageModules_1 = require("./modules/ManageModules");
const MiniGames_1 = require("./modules/Functionnalities/mini-games/MiniGames");
const HDFRPrivateFunctionnalitites_1 = require("./modules/Functionnalities/hdfr_private_functionnalities/HDFRPrivateFunctionnalitites");
const InteractionHandler_1 = require("./modules/Interaction/InteractionHandler");
const Statistics_1 = require("./modules/Functionnalities/statistiques/Statistics");
const Status_1 = require("./modules/Functionnalities/Status");
const AutomatonIntrusion_1 = require("./sub_games/AutomatonIntrusion/AutomatonIntrusion");
const activities_1 = require("./activities");
const HDFR_1 = require("./utils/HDFR");
const HDFRPublicFunctionnalitites_1 = require("./modules/Functionnalities/hdfr_public_functionnalities/HDFRPublicFunctionnalitites");
dotenv_1.default.config();
let manager = null;
const mutex = new simplediscordbot_1.SimpleMutex();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            botName: "Helldivers [FR]",
            log: {
                logChannelId: HDFR_1.HDFRChannelID.retour_bot,
                errorChannelId: HDFR_1.HDFRChannelID.helldivers_bot_log,
                info: { console: true, discord: true },
                error: { console: true, discord: true },
                warn: { console: true, discord: true },
                debug: { console: true, discord: false }
            }
        };
        const bot = new simplediscordbot_1.Bot(client_1.client, config);
        bot.client.on(discord_js_1.Events.ClientReady, () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield mutex.lock();
                manager = new ManageModules_1.ManageModule();
                mutex.unlock();
                if (!manager) {
                    simplediscordbot_1.Bot.log.error(simplediscordbot_1.EmbedManager.error("Impossible to initialize the Manager Module :/"));
                    return;
                }
                const mini_game = new MiniGames_1.MiniGames();
                const hdfr_private_functionnalities = new HDFRPrivateFunctionnalitites_1.HDFRPrivateFunctionnalitites();
                const hdfr_public_functionnalities = new HDFRPublicFunctionnalitites_1.HDFRPublicFunctionnalitites();
                const interaction = new InteractionHandler_1.InteractionHandler();
                const statistics = new Statistics_1.Statistics();
                const status = new Status_1.Status();
                manager.addModule(mini_game.name, mini_game);
                manager.addModule(hdfr_private_functionnalities.name, hdfr_private_functionnalities);
                manager.addModule(hdfr_public_functionnalities.name, hdfr_public_functionnalities);
                manager.addModule(interaction.name, interaction);
                manager.addModule(statistics.name, statistics);
                manager.addModule(status.name, status);
                if (client_1.client && client_1.client.user) {
                    manager.enableAll();
                    ManageModules_1.ManageModule.isInitialization = false;
                    manager.syncManageModuleMessage();
                    AutomatonIntrusion_1.AutomatonIntrusion.cleanOldIntrusion();
                }
                simplediscordbot_1.Bot.setRandomActivity(activities_1.activities, simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds());
            }
            catch (error) {
            }
            finally {
                mutex.unlock();
            }
        }));
        client_1.client.on(discord_js_1.Events.GuildMemberAdd, (member) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleGuildMemberAdd(member);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.GuildMemberUpdate, (oldMember, newMember) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleGuildMemberUpdate(oldMember, newMember);
            }
            catch (error) {
            }
        }));
        client_1.client.ws.on(discord_js_1.GatewayDispatchEvents.GuildMemberUpdate, (data) => __awaiter(this, void 0, void 0, function* () {
            const mod = manager === null || manager === void 0 ? void 0 : manager.getModule("Server Tag Check");
            if (mod) {
                mod.handleAny && mod.handleAny(data);
            }
        }));
        client_1.client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleInteraction(interaction);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.MessageCreate, (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleMessage(message);
            }
            catch (error) {
            }
            finally {
            }
        }));
        client_1.client.on(discord_js_1.Events.MessageDelete, (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleMessageDelete(message);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.MessageUpdate, (oldMessage, newMessage) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleMessageUpdate(oldMessage, newMessage);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.VoiceStateUpdate, (oldState, newState) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleVoiceState(oldState, newState);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.MessageReactionAdd, (message, user) => __awaiter(this, void 0, void 0, function* () {
            if (message.partial) {
                try {
                    yield message.fetch();
                }
                catch (e) {
                    console.log("Failed to fetch reaction");
                    return;
                }
            }
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    return;
                }
                manager.handleReaction(message, user);
            }
            catch (error) {
            }
        }));
    });
}
main();
