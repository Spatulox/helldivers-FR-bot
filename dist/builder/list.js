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
exports.analyzeRegisteredCommands = analyzeRegisteredCommands;
const v10_1 = require("discord-api-types/v10");
const client_js_1 = require("../utils/client.js");
const log_js_1 = require("../utils/other/log.js");
const login_js_1 = require("../utils/login.js");
const config_json_1 = __importDefault(require("../config.json"));
const discord_js_1 = require("discord.js");
function analyzeRegisteredCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield (0, login_js_1.loginBot)(client_js_1.client))) {
            (0, log_js_1.log)("Erreur : Impossible de connecter le bot");
            process.exit();
        }
        const allRegisteredCommands = [];
        client_js_1.client.once(discord_js_1.Events.ClientReady, () => __awaiter(this, void 0, void 0, function* () {
            (0, log_js_1.log)('INFO : Analyse des commandes enregistrées sur Discord');
            // 1. Récupérer TOUTES les commandes Discord du bot
            const globalDiscordCmds = yield client_js_1.client.rest.get(v10_1.Routes.applicationCommands(client_js_1.client.user.id));
            // 2. Récupérer les commandes de TOUS les serveurs où le bot est présent
            const botGuilds = client_js_1.client.guilds.cache.map(guild => guild.id);
            const guildDiscordCmds = {};
            (0, log_js_1.log)(`Analyse des ${botGuilds.length} serveurs où le bot est présent...`);
            for (const guildId of botGuilds) {
                try {
                    const guildCmds = yield client_js_1.client.rest.get(v10_1.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId));
                    guildDiscordCmds[guildId] = guildCmds;
                    (0, log_js_1.log)(`Serveur ${guildId}: ${guildCmds.length} commandes guild`);
                }
                catch (error) {
                    // Le bot n'a peut-être pas les permissions ou n'est pas dans ce serveur
                    guildDiscordCmds[guildId] = [];
                }
            }
            // 3. Classer les commandes par nom et type
            const commandMap = new Map();
            // Commandes globales
            for (const cmd of globalDiscordCmds) {
                const key = `${cmd.name}_${cmd.type}`;
                if (!commandMap.has(key)) {
                    commandMap.set(key, {
                        name: cmd.name,
                        description: cmd.description || '',
                        type: cmd.type,
                        id: cmd.id,
                        deployedGuilds: ['GLOBAL'],
                        discordData: cmd
                    });
                }
                else {
                    const existing = commandMap.get(key);
                    existing.deployedGuilds.push('GLOBAL');
                }
            }
            // Commandes par serveur
            for (const [guildId, guildCmds] of Object.entries(guildDiscordCmds)) {
                for (const cmd of guildCmds) {
                    const key = `${cmd.name}_${cmd.type}`;
                    if (!commandMap.has(key)) {
                        commandMap.set(key, {
                            name: cmd.name,
                            description: cmd.description || '',
                            type: cmd.type,
                            id: cmd.id,
                            deployedGuilds: [guildId],
                            discordData: cmd
                        });
                    }
                    else {
                        const existing = commandMap.get(key);
                        if (!existing.deployedGuilds.includes(guildId)) {
                            existing.deployedGuilds.push(guildId);
                        }
                    }
                }
            } // ← Fermeture de la boucle for guildId
            // 4. Conversion en tableau et tri  ← ✅ DÉPLACÉ ICI (CORRIGÉ)
            for (const [_key, cmd] of commandMap) {
                allRegisteredCommands.push(cmd);
            }
            allRegisteredCommands.sort((a, b) => {
                if (a.deployedGuilds.includes('GLOBAL') && !b.deployedGuilds.includes('GLOBAL'))
                    return -1;
                if (!a.deployedGuilds.includes('GLOBAL') && b.deployedGuilds.includes('GLOBAL'))
                    return 1;
                return a.name.localeCompare(b.name);
            });
            // 5. Affichage du classement
            console.log('\n' + '='.repeat(80));
            console.log('📋 CLASSEMENT DES COMMANDES ENREGISTRÉES SUR DISCORD');
            console.log('='.repeat(80));
            const globalCmds = allRegisteredCommands.filter(cmd => cmd.deployedGuilds.includes('GLOBAL'));
            const guildOnlyCmds = allRegisteredCommands.filter(cmd => !cmd.deployedGuilds.includes('GLOBAL'));
            console.log(`🌍 ${globalCmds.length} commandes GLOBALES`);
            console.log(`🏛️  ${guildOnlyCmds.length} commandes SERVEUR-SEUL`);
            // Tableau récapitulatif
            console.table(allRegisteredCommands.map(cmd => {
                var _a;
                return ({
                    Nom: cmd.name,
                    Type: cmd.type === 1 ? 'Slash' : cmd.type === 2 ? 'User Context' : 'Message Context',
                    Serveurs: cmd.deployedGuilds.length > 3
                        ? `${cmd.deployedGuilds.slice(0, 3).join(', ')}... (+${cmd.deployedGuilds.length - 3})`
                        : cmd.deployedGuilds.join(', '),
                    ID: ((_a = cmd.id) === null || _a === void 0 ? void 0 : _a.slice(-8)) || 'N/A'
                });
            }));
            // Détails par catégorie
            if (globalCmds.length > 0) {
                console.log('\n🌍 COMMANDES GLOBALES:');
                globalCmds.forEach(cmd => {
                    var _a;
                    console.log(`  • ${cmd.name} (ID: ${(_a = cmd.id) === null || _a === void 0 ? void 0 : _a.slice(-8)}) - ${cmd.description}`);
                });
            }
            if (guildOnlyCmds.length > 0) {
                console.log('\n🏛️  COMMANDES SERVEUR-SEULEMENT:');
                const groupedByGuild = guildOnlyCmds.reduce((acc, cmd) => {
                    for (const guildId of cmd.deployedGuilds) {
                        if (!acc[guildId])
                            acc[guildId] = [];
                        acc[guildId].push(cmd.name);
                    }
                    return acc;
                }, {});
                for (const [guildId, cmds] of Object.entries(groupedByGuild)) {
                    console.log(`  📂 Serveur ${guildId.slice(-8)}: ${cmds.join(', ')}`);
                }
            }
            console.log('\n✅ Analyse terminée!');
            process.exit();
        }));
        return allRegisteredCommands;
    });
}
// Utilisation
analyzeRegisteredCommands();
