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
exports.deployCommand = deployCommand;
const client_1 = require("../utils/client");
const files_1 = require("../utils/server/files");
const v10_1 = require("discord-api-types/v10");
const log_1 = require("../utils/log");
const login_1 = require("../utils/login");
const rest_1 = require("@discordjs/rest");
const v10_2 = require("discord-api-types/v10");
const config_json_1 = __importDefault(require("../config.json"));
// Initialisation du REST après la création du client
client_1.client.rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
function deployCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield (0, login_1.loginBot)(client_1.client))) {
            (0, log_1.log)("Erreur : Impossible de connecter le bot");
            return;
        }
        (0, log_1.log)('INFO : Déploiement des commandes slash');
        const listFile = yield (0, files_1.listJsonFile)('./commands/');
        if (!listFile)
            return;
        const commandArray = [];
        let fileLength = 0;
        if (Array.isArray(listFile)) { // Vérifie si listFile est un tableau
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
                    commandArray.push(command);
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR : Lecture du fichier ${file} : ${err.message}`);
                }
            }
        }
        else {
            (0, log_1.log)('ERREUR : listFile n\'est pas un tableau.');
        }
        try {
            // Déploiement groupé via REST
            yield client_1.client.rest.put(v10_2.Routes.applicationCommands(client_1.client.user.id), { body: commandArray });
            (0, log_1.log)(`SUCCÈS : ${commandArray.length}/${fileLength} commandes déployées`);
        }
        catch (err) {
            (0, log_1.log)(`ERREUR CRITIQUE : Déploiement des commandes : ${err.message}`);
        }
        process.exit();
    });
}
deployCommand();
