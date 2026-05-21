"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activities = void 0;
const discord_js_1 = require("discord.js");
exports.activities = [
    // Playing
    { type: discord_js_1.ActivityType.Playing, message: "des chasseurs de primes au Far West maudit" },
    { type: discord_js_1.ActivityType.Playing, message: "des contrats dangereux pour le shérif" },
    { type: discord_js_1.ActivityType.Playing, message: "le Far West, où les cowboys sont des robots" },
    // Watching
    { type: discord_js_1.ActivityType.Watching, message: "les mines hantées du Far Far West" },
    { type: discord_js_1.ActivityType.Watching, message: "le train fantôme traverser le désert" },
    { type: discord_js_1.ActivityType.Watching, message: "les équipes traquer les primes les plus dangereuses" },
    // Listening
    { type: discord_js_1.ActivityType.Listening, message: "les sermons du shérif entre deux contrats" },
    { type: discord_js_1.ActivityType.Listening, message: "les cris de bataille dans le saloon" },
    { type: discord_js_1.ActivityType.Listening, message: "les rumeurs locales sur les monstres à l’ouest" },
    // Competing
    { type: discord_js_1.ActivityType.Competing, message: "qui survivra le plus longtemps aux contrats" },
    { type: discord_js_1.ActivityType.Competing, message: "les meilleurs chasseurs de primes du serveur" },
];
