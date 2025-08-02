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
        let automatonIntrusion = null;
        client_1.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (Math.random() < 0.01) { // 1 %
                try {
                    const guild = client_1.client.guilds.cache.get(constantes_1.TARGET_GUILD_ID);
                    if (!guild) {
                        (0, messages_1.sendMessageToInfoChannel)("Guild not found for Automaton Intrusion");
                        return;
                    }
                    const member = yield guild.members.fetch(message.author.id).catch(() => null);
                    if (member && (0, members_1.checkIfApplyMember)(member) && !automatonIntrusion) {
                        automatonIntrusion = new AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord(guild, {
                            onHackStart() {
                                return __awaiter(this, void 0, void 0, function* () {
                                    var _a;
                                    const embed = (0, embeds_1.createEmbed)();
                                    embed.title = "Automaton Intrusion";
                                    embed.description = `Une nouvelle intrusion automaton a été crée ici : ${(_a = automatonIntrusion === null || automatonIntrusion === void 0 ? void 0 : automatonIntrusion.AutomatonMessage) === null || _a === void 0 ? void 0 : _a.url}`;
                                    (0, embeds_1.sendEmbedToAdminChannel)(embed);
                                    (0, embeds_1.sendEmbedToInfoChannel)(embed);
                                });
                            },
                            onHackEnd(success) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    const embed = (0, embeds_1.createEmbed)();
                                    if (success) {
                                        embed.title = "Automaton détruit !";
                                        embed.description = `Félicitations, vous avez détruit l'automaton infiltré`;
                                    }
                                    else {
                                        embed.color = embeds_1.EmbedColor.error;
                                        embed.title = "L'Automaton est toujours là !";
                                        embed.description = `Malheureusment vous n'avez pas réussi à détruire l'automaton`;
                                    }
                                    const threadChannel = automatonIntrusion === null || automatonIntrusion === void 0 ? void 0 : automatonIntrusion.thread;
                                    if (!threadChannel) {
                                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to send the Final Embed when Automaton is defeated/still here"));
                                        return;
                                    }
                                    (0, embeds_1.sendEmbed)(embed, threadChannel);
                                    automatonIntrusion === null || automatonIntrusion === void 0 ? void 0 : automatonIntrusion.closeThread();
                                });
                            },
                            onWrongStratagemStep(message, expected) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    const embed = (0, embeds_1.createEmbed)();
                                    embed.title = ":warning:";
                                    embed.description = expected;
                                    yield message.reply((0, embeds_1.returnToSendEmbed)(embed));
                                });
                            },
                        });
                        try {
                            automatonIntrusion.triggerBreach();
                        }
                        catch (error) {
                            console.error(`${error}`);
                            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`1% proba index.ts Automaton Intrusion ${error}`));
                            automatonIntrusion.endHack(false);
                            return;
                        }
                    }
                    else if (automatonIntrusion && automatonIntrusion.isHacked && message.channelId == ((_a = automatonIntrusion.thread) === null || _a === void 0 ? void 0 : _a.id)) {
                        automatonIntrusion.handleStratagemInput(message, true);
                    }
                    else if (automatonIntrusion && automatonIntrusion.isHacked && AutomatonIntrusionDiscord_1.AutomatonIntrusionDiscord.authorizedChannels.includes(message.channelId)) {
                        const member = message.member;
                        if (member && (0, members_1.checkIfApplyMember)(member)) {
                            try {
                                yield message.react('🫵');
                                yield message.react("hdfr_clown:1401222659202879508");
                            }
                            catch (error) {
                                console.error(error);
                                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`message react : ${error}`));
                            }
                        }
                    }
                    else if (automatonIntrusion && !automatonIntrusion.isHacked) {
                        automatonIntrusion = null;
                    }
                }
                catch (error) {
                    console.error(error);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`global : ${error}`));
                }
            }
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
