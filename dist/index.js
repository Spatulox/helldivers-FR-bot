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
const discord_js_1 = require("discord.js");
const client_1 = require("./utils/client");
const ActiveMembers_1 = require("./modules/Functionnalities/ActiveMembers");
const Counter_1 = require("./modules/Functionnalities/Counter");
const Intrusion_1 = require("./modules/Functionnalities/Intrusion");
const Status_1 = require("./modules/Functionnalities/Status");
const Galerie_1 = require("./modules/Functionnalities/Galerie");
const ManageModules_1 = require("./modules/ManageModules");
const log_1 = require("./utils/other/log");
const checkInternetCo_1 = require("./utils/server/checkInternetCo");
const login_1 = require("./utils/login");
const AutomatonIntrusion_1 = require("./sub_games/AutomatonIntrusion/AutomatonIntrusion");
const messages_1 = require("./utils/messages/messages");
const SimpleMutex_1 = require("./utils/other/SimpleMutex");
const embeds_1 = require("./utils/messages/embeds");
const ServerTag_1 = require("./modules/Functionnalities/ServerTag");
const Member_1 = require("./modules/Functionnalities/Member");
const InteractionHandler_1 = require("./modules/Interaction/InteractionHandler");
const ScheduleJobs_1 = require("./modules/Functionnalities/ScheduleJobs");
let manager = null;
const mutex = new SimpleMutex_1.SimpleMutex();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, log_1.log)('INFO : ----------------------------------------------------');
        (0, log_1.log)('INFO : Starting Program');
        yield (0, checkInternetCo_1.checkInternetCo)();
        (0, log_1.log)(`INFO : Using discord.js version: ${discord_js_1.version}`);
        (0, log_1.log)('INFO : Trying to connect to Discord Servers');
        if (!(yield (0, login_1.loginBot)(client_1.client))) {
            (0, log_1.log)('INFO : Stopping program');
            process.exit();
        }
        client_1.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield mutex.lock();
                manager = new ManageModules_1.ManageModule();
                mutex.unlock();
                if (!manager) {
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to initialize the Manager Module :/"));
                    return;
                }
                const automatonIntrusion = new Intrusion_1.Intrusion();
                const galerie = new Galerie_1.Galerie();
                const counter = new Counter_1.Counter(automatonIntrusion);
                const serverTag = new ServerTag_1.ServerTag();
                const member = new Member_1.Member();
                const activeMembers = new ActiveMembers_1.ActiveMember();
                const status = new Status_1.Status();
                const interaction = new InteractionHandler_1.InteractionHandler();
                const scheduleJobs = new ScheduleJobs_1.ScheduleJobs();
                manager.addModule("Automaton Intrusion", automatonIntrusion);
                manager.addModule("Galerie", galerie);
                manager.addModule("Counter", counter);
                manager.addModule("Member", member);
                manager.addModule("Interaction", interaction);
                manager.addModule("Active Members", activeMembers);
                manager.addModule("Status", status);
                manager.addModule("Server Tag Check", serverTag);
                manager.addModule("Schedule Jobs", scheduleJobs);
                //checkAndUpdateMembers();
                AutomatonIntrusion_1.AutomatonIntrusion.cleanOldIntrusion(client_1.client);
                scheduleJobs.handleScheduleJobs();
                if (client_1.client && client_1.client.user) {
                    (0, log_1.log)(`INFO : ${client_1.client.user.username} has logged in, waiting...`);
                    yield (0, messages_1.sendMessageToInfoChannel)("Bot Started");
                    manager.enableAll();
                    ManageModules_1.ManageModule.isInitialization = false;
                    manager.syncManageModuleMessage();
                }
                (0, login_1.setRandomActivity)(client_1.client);
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
                    yield mutex.lock();
                    mutex.unlock();
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
                    yield mutex.lock();
                    mutex.unlock();
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
                    yield mutex.lock();
                    mutex.unlock();
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
                    yield mutex.lock();
                    mutex.unlock();
                }
                manager.handleMessage(message);
            }
            catch (error) {
            }
        }));
        client_1.client.on(discord_js_1.Events.MessageDelete, (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!manager) {
                    console.log("Manager not initialize");
                    yield mutex.lock();
                    mutex.unlock();
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
                    yield mutex.lock();
                    mutex.unlock();
                }
                manager.handleMessageUpdate(oldMessage, newMessage);
            }
            catch (error) {
            }
        }));
    });
}
main();
