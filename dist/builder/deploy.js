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
const v10_1 = require("discord-api-types/v10");
const rest_1 = require("@discordjs/rest");
const v10_2 = require("discord-api-types/v10");
const promises_1 = require("timers/promises");
const client_js_1 = require("../utils/client.js");
const UnitTime_js_1 = require("../utils/times/UnitTime.js");
const log_js_1 = require("../utils/other/log.js");
const files_js_1 = require("../utils/server/files.js");
const login_js_1 = require("../utils/login.js");
const config_json_1 = __importDefault(require("../config.json"));
// Initialisation du REST
client_js_1.client.rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.default.token);
function deployCommand(commandPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield (0, login_js_1.loginBot)(client_js_1.client))) {
            (0, log_js_1.log)("Erreur : Impossible de connecter le bot");
            process.exit();
        }
        client_js_1.client.once("ready", () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (0, log_js_1.log)('INFO : Déploiement des commandes slash');
            for (const path of commandPath) {
                const slashFiles = yield (0, files_js_1.listJsonFile)(`./${path}/`);
                if (!slashFiles) {
                    (0, log_js_1.log)('ERREUR : Impossible de lire les fichiers de commandes');
                    return;
                }
                console.log(`${slashFiles.length} ${path}`);
            }
            // Récupère toutes les commandes actuelles sur Discord
            const globalDiscordCmds = yield client_js_1.client.rest.get(v10_2.Routes.applicationCommands(client_js_1.client.user.id));
            const allLocalCommands = [];
            const guildDiscordCmds = {};
            for (const path of commandPath) {
                const slashFiles = yield (0, files_js_1.listJsonFile)(`./${path}/`);
                if (!slashFiles) {
                    (0, log_js_1.log)('ERREUR : Impossible de lire les fichiers de commandes');
                    return;
                }
                // Pour chaque guilde utilisée dans tes JSONs
                const allGuildIds = new Set();
                for (const filename of slashFiles) {
                    const cmdData = yield (0, files_js_1.readJsonFile)(`./${path}/${filename}`);
                    if (cmdData === null || cmdData === void 0 ? void 0 : cmdData.guildID) {
                        for (const gid of cmdData.guildID)
                            allGuildIds.add(gid);
                    }
                }
                for (const guildId of allGuildIds) {
                    try {
                        guildDiscordCmds[guildId] = (yield client_js_1.client.rest.get(v10_2.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId)));
                    }
                    catch (error) {
                        console.error();
                    }
                }
                // ---------------------- Déploiement attendue ---------------------------
                for (const file of slashFiles.filter(n => !n.includes('example'))) {
                    let updated = false;
                    const cmd = yield (0, files_js_1.readJsonFile)(`./${path}/${file}`);
                    if (!cmd)
                        continue;
                    // Traitement permissions
                    if (cmd.default_member_permissions && Array.isArray(cmd.default_member_permissions)) {
                        const bitfield = cmd.default_member_permissions
                            .map(perm => {
                            const flag = v10_1.PermissionFlagsBits[perm];
                            if (flag === undefined)
                                throw new Error(`Permission inconnue : "${perm}"`);
                            return flag;
                        })
                            .reduce((acc, val) => acc | val, BigInt(0));
                        cmd.default_member_permissions = Number(bitfield);
                    }
                    // Déploiement Guild vs Global
                    const deployToGuilds = (cmd.guildID && cmd.guildID.length > 0) ? cmd.guildID : [];
                    if (deployToGuilds.length > 0) {
                        for (const guildId of deployToGuilds) {
                            // Cherche la commande existante sur Discord
                            const found = (_a = guildDiscordCmds[guildId]) === null || _a === void 0 ? void 0 : _a.find(e => e.id === cmd.id || e.name === cmd.name);
                            const dataToSend = Object.assign({}, cmd);
                            delete dataToSend.guildID;
                            if (cmd.type === 2 || cmd.type === 3) {
                                // Les context menus ne doivent **pas** utiliser `options`
                                console.log("on delete options");
                                delete dataToSend.options;
                            }
                            try {
                                if (!cmd.id || !found) {
                                    // Pas d'ID ou pas trouvée, on crée la commande
                                    console.log("Pas d'ID ou pas trouvée, on crée la commande : " + dataToSend.name);
                                    const resp = yield client_js_1.client.rest.post(v10_2.Routes.applicationGuildCommands(config_json_1.default.clientId, guildId), { body: dataToSend });
                                    cmd.id = resp.id;
                                    updated = true;
                                    (0, log_js_1.log)(`SUCCÈS : Commande "${cmd.name}" déployée/guild ${guildId}, id = ${cmd.id}`);
                                }
                                else {
                                    // Si déjà existante, on la met à jour
                                    console.log("Si déjà existante, on la met à jour : " + dataToSend.name);
                                    yield client_js_1.client.rest.patch(v10_2.Routes.applicationGuildCommand(config_json_1.default.clientId, guildId, found.id), { body: dataToSend });
                                    cmd.id = found.id;
                                    (0, log_js_1.log)(`MAJ : Commande "${cmd.name}" mise à jour/guild ${guildId}, id = ${cmd.id}`);
                                }
                                yield (0, promises_1.setTimeout)(UnitTime_js_1.Time.second.SEC_01.toMilliseconds());
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }
                    }
                    else {
                        // Commande globale
                        const found = globalDiscordCmds.find(e => e.id === cmd.id || e.name === cmd.name);
                        const dataToSend = Object.assign({}, cmd);
                        delete dataToSend.guildID;
                        if (cmd.type === 2 || cmd.type === 3) {
                            // Les context menus ne doivent **pas** utiliser `options`
                            delete dataToSend.options;
                        }
                        try {
                            if (!cmd.id || !found) {
                                const resp = yield client_js_1.client.rest.post(v10_2.Routes.applicationCommands(client_js_1.client.user.id), { body: dataToSend });
                                cmd.id = resp.id;
                                updated = true;
                                (0, log_js_1.log)(`SUCCÈS : Commande globale "${cmd.name}" déployée, id = ${cmd.id}`);
                            }
                            else {
                                yield client_js_1.client.rest.patch(v10_2.Routes.applicationCommand(client_js_1.client.user.id, found.id), { body: dataToSend });
                                cmd.id = found.id;
                                (0, log_js_1.log)(`MAJ : Commande globale "${cmd.name}" mise à jour, id = ${cmd.id}`);
                            }
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                    //if (updated) await writeJsonFileRework(`./${path}/`, `${file}`, cmd); // Sauvegarde l'id Discord
                    if (updated) {
                        allLocalCommands.push(cmd); // Ajoute ici la version à jour de la commande
                        yield (0, files_js_1.writeJsonFileRework)(`./${path}/`, `${file}`, cmd);
                    }
                    else {
                        allLocalCommands.push(cmd); // Même si elle n’a pas été modifiée, on veut la conserver
                    }
                }
            }
            // ---------------------- SUPPRESSION COMMANDES ---------------------------
            const localNames = allLocalCommands.map(c => c.name); // Regroupe toutes les commandes locales
            // Supprime les commandes globales non déclarées
            for (const apiCmd of globalDiscordCmds) {
                try {
                    if (!localNames.includes(apiCmd.name)) {
                        yield client_js_1.client.rest.delete(v10_2.Routes.applicationCommand(client_js_1.client.user.id, apiCmd.id));
                        (0, log_js_1.log)(`SUPPR : Commande globale "${apiCmd.name}" supprimée, id = ${apiCmd.id}`);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
            // Supprime les commandes guild non déclarées
            for (const gid of Object.keys(guildDiscordCmds)) {
                const current = guildDiscordCmds[gid];
                if (!current)
                    continue;
                for (const apiCmd of current) {
                    try {
                        if (!localNames.includes(apiCmd.name)) {
                            yield client_js_1.client.rest.delete(v10_2.Routes.applicationGuildCommand(config_json_1.default.clientId, gid, apiCmd.id));
                            (0, log_js_1.log)(`SUPPR : Commande "${apiCmd.name}" supprimée de guild ${gid}`);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
            process.exit();
        }));
    });
}
//deployCommand(["context-menu_dev", "commands_dev"]);
deployCommand(["context-menu", "commands"]);
