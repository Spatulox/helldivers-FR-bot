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
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const config_json_1 = __importDefault(require("../config.json")); // Assurez-vous que ce fichier contient les types appropriés
const log_1 = require("../utils/log");
function deleteCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
        (0, log_1.log)("---------------------");
        try {
            (0, log_1.log)('INFO : Récupération des commandes enregistrées...');
            const commands = yield rest.get(v10_1.Routes.applicationCommands(config_json_1.default.clientId));
            if (commands.length === 0) {
                (0, log_1.log)('INFO : Aucune commande à supprimer.');
                return;
            }
            (0, log_1.log)(`INFO : ${commands.length} commande(s) trouvée(s). Suppression en cours...`);
            for (const command of commands) {
                try {
                    yield rest.delete(v10_1.Routes.applicationCommand(config_json_1.default.clientId, command.id));
                    (0, log_1.log)(`SUCCÈS : Commande "${command.name}" supprimée.`);
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR : Impossible de supprimer la commande "${command.name}" : ${err.message}`);
                }
            }
            (0, log_1.log)('INFO : Toutes les commandes ont été supprimées.');
        }
        catch (err) {
            (0, log_1.log)(`ERREUR CRITIQUE : Impossible de récupérer ou supprimer les commandes : ${err.message}`);
        }
    });
}
// Lancer la suppression des commandes
deleteCommands();
