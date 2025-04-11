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
exports.loginBot = loginBot;
exports.setActivity = setActivity;
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config.json"));
function loginBot(client) {
    return __awaiter(this, void 0, void 0, function* () {
        let ok = false;
        let tries = 0;
        const maxTries = 3;
        if (config_json_1.default.token !== "") {
            try {
                // Tant que le bot n'est pas connecté et que le nombre de tentatives est inférieur à maxTries, tenter de se connecter.
                while (ok === false && tries < maxTries) {
                    ok = yield client.login(config_json_1.default.token)
                        .then(() => {
                        setActivity(client, 'La Démocratie', discord_js_1.ActivityType.Watching);
                        client.once('ready', () => {
                            if (client.user) {
                                console.log(`Connecté en tant que ${client.user.tag} sur ${client.guilds.cache.size} serveurs.`);
                            }
                            // Liste des serveurs sur lesquels le bot est connecté.
                            client.guilds.cache.forEach(guild => {
                                console.log(` - ${guild.name}`);
                            });
                        });
                        return true;
                    })
                        .catch((error) => __awaiter(this, void 0, void 0, function* () {
                        console.log(`${error} Nouvel essai...`);
                        yield new Promise(resolve => setTimeout(resolve, 3000));
                        tries++;
                        return false;
                    }));
                }
                // Si après maxTries tentatives le bot n'est pas connecté, gérer l'erreur.
                if (tries === maxTries) {
                    console.error('ERROR : Impossible de se connecter après plusieurs tentatives.');
                    return false;
                }
                return true;
            }
            catch (error) {
                console.error(`ERROR : Connexion impossible : ${error}`);
            }
        }
        return false;
    });
}
function setActivity(client_1) {
    return __awaiter(this, arguments, void 0, function* (client, message = "you...", type) {
        if (client && client.user) {
            client.user.setActivity({
                name: message,
                type: type
            });
        }
    });
}
