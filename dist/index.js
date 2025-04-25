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
const counter_1 = require("./utils/counter");
const config_json_1 = __importDefault(require("./config.json"));
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
            //loadScheduledJobs()
            //checkAndUpdateMembers();
            //(0, counter_1.initializeCounter)();
            if (client_1.client && client_1.client.user) {
                (0, log_1.log)(`INFO : ${client_1.client.user.username} has logged in, waiting...`);
            }
            (0, login_1.setRandomActivity)(client_1.client);
        }));
        client_1.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            try {
                executeSelectmenu_1.executeSelectMenu;
                if (interaction.isCommand()) {
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
                else {
                    console.warn(`WARN : Type d'interaction non pris en charge (${interaction.type})`);
                }
            }
            catch (error) {
                console.error(`ERROR : Une erreur s'est produite lors du traitement de l'interaction`, error);
            }
        }));
        /*client_1.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.channel.id !== config_json_1.default.counterChannel)
                return;
            if (message.author.bot)
                return;
            (0, counter_1.incrementCounter)(message);
        }));*/
        /*client.on('guildMemberUpdate', async (oldMember, newMember) => {
            if (newMember.guild.id === TARGET_GUILD_ID) {
    
                if(DO_NOT_AFFECT_THIS_USERS.includes(newMember.user.id) || newMember.user.bot){
                    console.log(`Skipping user: ${newMember.user.username} (ID: ${newMember.user.id})`);
                    return;
                }
                
                await handleMemberUpdate(oldMember, newMember);
            }
        });
    
        client.on('guildMemberAdd', async (member) => {
            if (member.guild.id === TARGET_GUILD_ID) {
    
                if(DO_NOT_AFFECT_THIS_USERS.includes(member.user.id) || member.user.bot){
                    console.log(`Skipping user: ${member.user.username} (ID: ${member.user.id})`);
                    return;
                }
    
                await handleNewMember(member);
            }
        });*/
    });
}
main();
