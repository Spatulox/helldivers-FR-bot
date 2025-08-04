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
//Librairies
const discord_js_1 = require("discord.js");
// functions
const log_1 = require("./utils/log");
const checkInternetCo_1 = require("./utils/server/checkInternetCo");
const executeCommand_1 = require("./commands/executeCommand");
const executeModalSubmit_1 = require("./form/executeModalSubmit");
const executeSelectmenu_1 = require("./selectmenu/executeSelectmenu");
const login_1 = require("./utils/login");
const client_1 = require("./utils/client");
const jobs_1 = require("./jobs/jobs");
const members_1 = require("./utils/guilds/members");
const constantes_1 = require("./utils/constantes");
const counter_1 = require("./utils/counter");
const config_json_1 = __importDefault(require("./config.json"));
const messages_1 = require("./utils/messages/messages");
const executeContextMenu_1 = require("./context-menu/executeContextMenu");
const galerie_1 = require("./utils/galerie");
const embeds_1 = require("./utils/messages/embeds");
const SimpleMutex_1 = require("./utils/SimpleMutex");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const UnitTime_1 = require("./utils/times/UnitTime");
const AutomatonIntrusionDiscord_1 = require("./sub_games/AutomatonIntrusion/AutomatonIntrusionDiscord");
const AutomatonIntrusion_1 = require("./sub_games/AutomatonIntrusion/AutomatonIntrusion");
const mutex = new SimpleMutex_1.SimpleMutex();
const limiter = new discord_js_rate_limiter_1.RateLimiter(1, UnitTime_1.Time.hour.HOUR_01.toMilliseconds());
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, log_1.log)('INFO : ----------------------------------------------------');
        (0, log_1.log)('INFO : Starting Program');
        yield (0, checkInternetCo_1.checkInternetCo)();
        (0, log_1.log)(`INFO : Using discord.js version: ${discord_js_1.version}`);
        (0, log_1.log)('INFO : Trying to connect to Discord Servers');
        if (!(0, login_1.loginBot)(client_1.client)) {
            (0, log_1.log)('INFO : Stopping program');
            process.exit();
        }
        client_1.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            (0, jobs_1.loadScheduledJobs)();
            //checkAndUpdateMembers();
            AutomatonIntrusion_1.AutomatonIntrusion.cleanOldIntrusion(client_1.client);
            (0, counter_1.initializeCounter)();
            if (client_1.client && client_1.client.user) {
                (0, log_1.log)(`INFO : ${client_1.client.user.username} has logged in, waiting...`);
                (0, messages_1.sendMessageToInfoChannel)("Bot Started");
            }
            (0, login_1.setRandomActivity)(client_1.client);
        }));
        client_1.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            /*console.log({
                type: interaction.type,
                isChatInputCommand: interaction.isChatInputCommand(),
                isModalSubmit: interaction.isModalSubmit(),
                isStringSelectMenu: interaction.isStringSelectMenu(),
                isContextMenuCommand: interaction.isContextMenuCommand(),
                commandType: interaction.isContextMenuCommand() ? interaction.commandType : null,
                commandName: "commandName" in interaction ? interaction.commandName : "Unknown",
                commandId: "commandId" in interaction ? interaction.commandId : "No ID"
            });*/
            try {
                if (interaction.isChatInputCommand()) {
                    // Si l'interaction est une commande slash
                    (0, executeCommand_1.executeSlashCommand)(interaction);
                }
                else if (interaction.isModalSubmit()) {
                    // Si l'interaction est un modal submit
                    (0, executeModalSubmit_1.executeModalSubmit)(interaction);
                }
                else if (interaction.isStringSelectMenu()) {
                    // Si l'interaction est un selectMenu
                    (0, executeSelectmenu_1.executeSelectMenu)(interaction);
                }
                else if (interaction.isContextMenuCommand()) {
                    // Si l'interaction est un context menu
                    (0, executeContextMenu_1.executeContextMenu)(interaction);
                }
                else {
                    console.warn(`WARN : Type d'interaction non pris en charge (${interaction.type})`);
                }
            }
            catch (error) {
                console.error(`ERROR : Une erreur s'est produite lors du traitement de l'interaction`, error);
            }
        }));
        client_1.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            (0, AutomatonIntrusionDiscord_1.handleAutomatonIntrusion)(message, client_1.client);
            if (message.channel.id == config_json_1.default.galerieChannel && !message.author.bot) {
                yield (0, galerie_1.galerie)(message);
                return;
            }
            if (message.channel.id !== config_json_1.default.counterChannel)
                return;
            (0, counter_1.incrementCounter)(message);
        }));
        client_1.client.on('guildMemberUpdate', (oldMember, newMember) => __awaiter(this, void 0, void 0, function* () {
            if (newMember.guild.id === constantes_1.TARGET_GUILD_ID) {
                oldMember;
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(newMember.user.id) || newMember.user.bot) {
                    console.log(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                    return;
                }
                yield (0, members_1.handleMemberUpdate)(newMember);
            }
        }));
        client_1.client.ws.on(discord_js_1.GatewayDispatchEvents.GuildMemberUpdate, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield mutex.lock();
            try {
                if (data.guild_id != constantes_1.TARGET_GUILD_ID)
                    return;
                const unAllowedClanTag = ["DÆSH", "GAZA", "SEX", "PH", "OF", "DW"];
                const userClan = (_a = data.user) === null || _a === void 0 ? void 0 : _a.primary_guild;
                if (!userClan)
                    return;
                if (unAllowedClanTag.includes(userClan.tag) && !limiter.take(data.user.id)) {
                    const embed = (0, embeds_1.createSimpleEmbed)(`<@${data.user.id}> (${data.nick || data.user.global_name || data.user.username}) a un tag de clan interdit : ${userClan.tag}`);
                    (0, embeds_1.sendEmbedToAdminChannel)(embed);
                    (0, embeds_1.sendEmbedToInfoChannel)(embed);
                }
            }
            catch (error) {
                console.error(error);
            }
            mutex.unlock();
        }));
        client_1.client.on('guildMemberAdd', (member) => __awaiter(this, void 0, void 0, function* () {
            if (member.guild.id === constantes_1.TARGET_GUILD_ID) {
                if (constantes_1.DO_NOT_AFFECT_THIS_USERS.includes(member.user.id) || member.user.bot) {
                    console.log(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                    return;
                }
                yield (0, members_1.handleNewMember)(member);
            }
        }));
    });
}
main();
