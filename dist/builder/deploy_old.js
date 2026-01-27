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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployAllCommands = deployAllCommands;
const client_1 = require("../utils/client");
const files_1 = require("../utils/server/files");
const v10_1 = require("discord-api-types/v10");
const log_1 = require("../utils/other/log");
const login_1 = require("../utils/login");
const rest_1 = require("@discordjs/rest");
const v10_2 = require("discord-api-types/v10");
const config_json_1 = __importDefault(require("../config.json"));
const promises_1 = require("timers/promises");
const UnitTime_1 = require("../utils/times/UnitTime");
const discord_js_1 = require("discord.js");
// Initialisation du REST après la création du client
client_1.client.rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
function deployAllCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield (0, login_1.loginBot)(client_1.client))) {
            (0, log_1.log)("Erreur : Impossible de connecter le bot");
            return;
        }
        client_1.client.once(discord_js_1.Events.ClientReady, () => __awaiter(this, void 0, void 0, function* () {
            (0, log_1.log)('INFO : Déploiement des commandes slash et menus contextuels');
            // 1. Lire les commandes slash
            const slashFiles = yield (0, files_1.listJsonFile)('./commands/');
            // 2. Lire les menus contextuels
            const contextFiles = yield (0, files_1.listJsonFile)('./context-menu/');
            if (!slashFiles || !contextFiles) {
                (0, log_1.log)('ERREUR : Impossible de lire les fichiers de commandes ou de menus contextuels');
                return;
            }
            // Tableaux pour les commandes globales (sans guildID)
            const globalCommands = [];
            let totalDeployed = 0;
            let totalFiles = 0;
            // Fonction pour traiter un dossier de commandes
            function processCommands(folderPath_1) {
                return __awaiter(this, arguments, void 0, function* (folderPath, isContextMenu = false) {
                    const files = yield (0, files_1.listJsonFile)(folderPath);
                    if (!Array.isArray(files))
                        return;
                    const filteredFiles = files.filter(f => !f.includes("example"));
                    totalFiles += filteredFiles.length;
                    for (const file of filteredFiles) {
                        try {
                            const command = yield (0, files_1.readJsonFile)(`${folderPath}${file}`);
                            if (command.default_member_permissions && Array.isArray(command.default_member_permissions)) {
                                const bitfield = command.default_member_permissions
                                    .map(perm => {
                                    const flag = v10_1.PermissionFlagsBits[perm];
                                    if (flag === undefined) {
                                        throw new Error(`Permission inconnue : "${perm}". Vérifiez l'orthographe dans votre JSON (Enumeration Discord : PermissionFlagsBits.X ).`);
                                    }
                                    return flag;
                                })
                                    .reduce((acc, val) => acc | val, BigInt(0));
                                command.default_member_permissions = Number(bitfield);
                            }
                            // Déploiement pour des guildes spécifiques ou globalement
                            if (command.guildID && command.guildID.length > 0) {
                                for (const guildId of command.guildID) {
                                    // Créer une copie de la commande sans le paramètre guildID
                                    const { guildID } = command, commandWithoutGuildID = __rest(command, ["guildID"]);
                                    try {
                                        yield client_1.client.rest.put(v10_2.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId), { body: [commandWithoutGuildID] });
                                        (0, log_1.log)(`SUCCÈS : ${isContextMenu ? 'Menu contextuel' : 'Commande'} "${command.name}" déployée sur la guilde ${guildId}`);
                                        totalDeployed++;
                                    }
                                    catch (err) {
                                        (0, log_1.log)(`ERREUR : Impossible de déployer ${isContextMenu ? 'le menu contextuel' : 'la commande'} "${command.name}" sur la guilde ${guildId}. Raison : ${err.message}`);
                                    }
                                    yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds());
                                }
                            }
                            else {
                                (0, log_1.log)(`AJOUT : ${isContextMenu ? 'Menu contextuel' : 'Commande'} "${command.name}" ajouté à la file d'attente globale`);
                                globalCommands.push(command);
                                totalDeployed++;
                            }
                        }
                        catch (err) {
                            (0, log_1.log)(`ERREUR : Lecture du fichier ${file} : ${err.message}`);
                        }
                    }
                });
            }
            // Traiter les commandes slash
            yield processCommands('./commands/');
            // Traiter les menus contextuels
            yield processCommands('./context-menu/', true);
            // Déploiement global des commandes sans guildID
            if (globalCommands.length > 0) {
                try {
                    yield client_1.client.rest.put(v10_2.Routes.applicationCommands(client_1.client.user.id), { body: globalCommands });
                    (0, log_1.log)(`SUCCÈS : ${globalCommands.length}/${totalFiles} commandes/menus globaux déployés`);
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR CRITIQUE : Déploiement des commandes/menus globaux : ${err.message}`);
                }
            }
            process.exit();
        }));
    });
}
deployAllCommands();
