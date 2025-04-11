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
exports.deployCommand = deployCommand;
const client_1 = require("../utils/client");
const files_1 = require("../utils/server/files");
const v10_1 = require("discord-api-types/v10");
const log_1 = require("../utils/log");
const rest_1 = require("@discordjs/rest");
const v10_2 = require("discord-api-types/v10");
const config_json_1 = __importDefault(require("../config.json"));
const promises_1 = require("timers/promises");
// Initialisation du REST après la création du client
client_1.client.rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
function deployCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        /*if (!(await loginBot(client))) {
            log("Erreur : Impossible de connecter le bot");
            return;
        }*/
        (0, log_1.log)('INFO : Déploiement des commandes slash');
        const listFile = yield (0, files_1.listJsonFile)('./commands/');
        if (!listFile)
            return;
        const commandArray = [];
        let numberCommandDeployed = 0;
        let fileLength = 0;
        if (Array.isArray(listFile)) {
            fileLength = listFile.filter(f => !f.includes("example")).length;
            for (const file of listFile.filter(f => !f.includes("example"))) {
                try {
                    const command = yield (0, files_1.readJsonFile)(`./commands/${file}`);
                    // Conversion des permissions textuelles en bits
                    if (command.defaultMemberPermissions && Array.isArray(command.defaultMemberPermissions)) {
                        command.defaultMemberPermissions = command.defaultMemberPermissions
                            .map(perm => v10_1.PermissionFlagsBits[perm])
                            .reduce((acc, val) => acc | val, BigInt(0));
                    }
                    // Déploiement pour des guildes spécifiques ou globalement
                    if (command.guildID && command.guildID.length > 0) {
                        for (const guildId of command.guildID) {
                            // Créer une copie de la commande sans le paramètre guildID
                            const { guildID } = command, commandWithoutGuildID = __rest(command, ["guildID"]);
                            try {
                                yield client_1.client.rest.put(v10_2.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId), { body: [commandWithoutGuildID] });
                                (0, log_1.log)(`SUCCÈS : Commande "${command.name}" déployée sur la guilde ${guildId}`);
                            }
                            catch (err) {
                                (0, log_1.log)(`ERREUR : Impossible de déployer la commande "${command.name}" sur la guilde ${guildId}. Raison : ${err.message}`);
                            }
                            (0, promises_1.setTimeout)(1000);
                        }
                        numberCommandDeployed++;
                    }
                    else {
                        (0, log_1.log)(`AJOUT : Commande "${command.name}" ajouté à la file d'attente`);
                        commandArray.push(command);
                        numberCommandDeployed++;
                    }
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR : Lecture du fichier ${file} : ${err.message}`);
                }
            }
        }
        else {
            (0, log_1.log)('ERREUR : listFile n\'est pas un tableau.');
        }
        // Déploiement global des commandes sans guildID
        if (commandArray.length > 0) {
            try {
                yield client_1.client.rest.put(v10_2.Routes.applicationCommands(client_1.client.user.id), { body: commandArray });
                (0, log_1.log)(`SUCCÈS : ${numberCommandDeployed}/${fileLength} commandes globales déployées`);
            }
            catch (err) {
                (0, log_1.log)(`ERREUR CRITIQUE : Déploiement des commandes globales : ${err.message}`);
            }
        }
        process.exit();
    });
}
deployCommand();
