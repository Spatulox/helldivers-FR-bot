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
const config_json_1 = __importDefault(require("../../config.json"));
const log_1 = require("../../utils/log");
function deleteCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
        try {
            (0, log_1.log)('INFO : Suppression des menu contextuels globaux...');
            const globalCommands = yield rest.get(v10_1.Routes.applicationCommands(config_json_1.default.clientId));
            for (const command of globalCommands) {
                try {
                    yield rest.delete(v10_1.Routes.applicationCommand(config_json_1.default.clientId, command.id));
                    (0, log_1.log)(`SUCCÈS : menu contextuels global "${command.name}" supprimée.`);
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR : Impossible de supprimer le menu contextuel global "${command.name}" : ${err.message}`);
                }
            }
            (0, log_1.log)('INFO : Suppression des menus contextuels spécifiques aux guildes...');
            const guildIDs = ["1111160769132896377", "1214320754578165901"]; // Liste des guildes à vérifier
            for (const guildId of guildIDs) {
                console.log(guildId);
                try {
                    const guildCommands = yield rest.get(v10_1.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId));
                    for (const command of guildCommands) {
                        try {
                            yield rest.delete(v10_1.Routes.applicationGuildCommand(config_json_1.default.clientId, guildId, command.id));
                            (0, log_1.log)(`SUCCÈS : menu contextuel "${command.name}" supprimé sur la guilde ${guildId}.`);
                        }
                        catch (err) {
                            (0, log_1.log)(`ERREUR : Impossible de supprimer du menu contextuel "${command.name}" sur la guilde ${guildId} : ${err.message}`);
                        }
                    }
                }
                catch (err) {
                    (0, log_1.log)(`ERREUR : Impossible de récupérer ou supprimer les menu contextuels pour le server ${guildId} : ${err.message}`);
                }
            }
            (0, log_1.log)('INFO : Tous les menus contextuels ont été supprimées.');
        }
        catch (err) {
            (0, log_1.log)(`ERREUR CRITIQUE : Impossible de récupérer ou supprimer les menus contextuels : ${err.message}`);
        }
    });
}
deleteCommands();
