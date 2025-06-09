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
exports.setRandomActivity = setRandomActivity;
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
                            const numberOfGuild = client.guilds.cache.size;
                            console.log(`Bot connecté sur ${numberOfGuild} serveurs`);
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
function setRandomActivity(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const activities = [
            // Playing
            { type: discord_js_1.ActivityType.Playing, message: "exterminer des Terminides pour la démocratie" },
            { type: discord_js_1.ActivityType.Playing, message: "lancer des stratagèmes aléatoire pour survivre" },
            { type: discord_js_1.ActivityType.Playing, message: "repousser les invasions extraterrestres" },
            { type: discord_js_1.ActivityType.Playing, message: "lancer des frappes orbitales sur les ennemis de la Super-Terre" },
            { type: discord_js_1.ActivityType.Playing, message: "Mario Kart sur le dos d'un Titan Corosif" },
            // Watching
            { type: discord_js_1.ActivityType.Watching, message: "les escouades se battre pour la liberté" },
            { type: discord_js_1.ActivityType.Watching, message: "les Automatons envahir la galaxie" },
            { type: discord_js_1.ActivityType.Watching, message: "les bombardements orbitaux éclairer le champ de bataille" },
            { type: discord_js_1.ActivityType.Watching, message: "les Helldivers tomber héroïquement au combat" },
            { type: discord_js_1.ActivityType.Watching, message: "les Helldivers se bruler les fesses avec le lance flamme" },
            { type: discord_js_1.ActivityType.Watching, message: "les Terminides se regrouper pour une contre-attaque" },
            { type: discord_js_1.ActivityType.Watching, message: "les Illuministes laver les esprits de habitants de la Super-Terre" },
            { type: discord_js_1.ActivityType.Watching, message: "un reportage sur la création de l'E710" },
            { type: discord_js_1.ActivityType.Watching, message: "une arrestation de dissidents" },
            { type: discord_js_1.ActivityType.Watching, message: "les Helldivers découvrir un nouveau stratagème" },
            { type: discord_js_1.ActivityType.Watching, message: "une jambe perdue, appartenant probablement à un Helldivers retraité" },
            // Listening
            { type: discord_js_1.ActivityType.Listening, message: "les ordres de Super-Terre" },
            { type: discord_js_1.ActivityType.Listening, message: "les cris des soldats sur le champ de bataille" },
            { type: discord_js_1.ActivityType.Listening, message: "les appels désespérés des Helldivers" },
            { type: discord_js_1.ActivityType.Listening, message: "le bruit des tourelles automatiques en action" },
            { type: discord_js_1.ActivityType.Listening, message: "le discours motivants du Président de la Super-Terre" },
            { type: discord_js_1.ActivityType.Listening, message: "les cris d'agonie des Helldivers" },
            // Competing
            { type: discord_js_1.ActivityType.Competing, message: "une mission suicide sur une planète hostile" },
            { type: discord_js_1.ActivityType.Competing, message: "gagner du temps pour sauver une colonie en détresse" },
            { type: discord_js_1.ActivityType.Competing, message: "une défense de planète" },
        ];
        // Change l'activité toutes les heures
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * activities.length);
            const randomActivity = activities[randomIndex];
            setActivity(client, randomActivity.message, randomActivity === null || randomActivity === void 0 ? void 0 : randomActivity.type);
        }, 1 * 1000 * 60 * 60); // Intervalle de 1 heure
        const randomIndex = Math.floor(Math.random() * activities.length);
        const randomActivity = activities[randomIndex];
        setActivity(client, randomActivity.message, randomActivity === null || randomActivity === void 0 ? void 0 : randomActivity.type);
    });
}
