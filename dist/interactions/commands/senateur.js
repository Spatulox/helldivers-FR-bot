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
Object.defineProperty(exports, "__esModule", { value: true });
exports.senateur = senateur;
const messages_1 = require("../../utils/messages/messages");
const role_1 = require("../../utils/guilds/role");
const promises_1 = require("timers/promises");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const members_1 = require("../../utils/guilds/members");
const rateLimiter_1 = require("../../utils/server/rateLimiter");
const UnitTime_1 = require("../../utils/times/UnitTime");
const second_5 = 5;
const rateLimiter = new discord_js_rate_limiter_1.RateLimiter(1, second_5 * 1000);
const ROLES = {
    "senateur0+": "1358501014625587210",
    "senateur0-": "1358501027225141288",
    "senateur1+": "1350921939123965982",
    "senateur1-": "1350921942173225030",
    "senateur2+": "1350921944219779122",
    "senateur2-": "1350921959126335599",
    "senateur3+": "1350921947218710689",
    "senateur3-": "1350921965682298921",
    "senateur4+": "1350921949974364241",
    "senateur4-": "1350921966038552718",
    "senateur5+": "1350921952952582174",
    "senateur5-": "1350921968886616064",
    "senateur6+": "1350921956400173077",
    "senateur6-": "1350921971311050893",
};
const COINS = {
    "senateur0+": "+0",
    "senateur0-": "-2184",
    "senateur1+": "+1",
    "senateur1-": "-5",
    "senateur2+": "+3",
    "senateur2-": "-6",
    "senateur3+": "+8",
    "senateur3-": "-8",
    "senateur4+": "+20",
    "senateur4-": "-10",
    "senateur5+": "+45",
    "senateur5-": "-9",
    "senateur6+": "+546",
    "senateur6-": "-2184",
};
const PHRASES = [
    "place {nombre.balles} cartouche(s), tourne le barillet, et presse la détente...",
    "charge {nombre.balles} balle(s) dans le revolver, fais tourner le cylindre, et tente sa chance...",
    "glisse {nombre.balles} munition(s) dans le barillet, le fais virevolter, et joue avec le sort...",
    "introduit {nombre.balles} messager(s) de l'au-delà, fais danser le barillet, et défie la mort...",
    "charge {nombre.balles} balle(s) dans la chambre, fais tournoyer le cylindre, et presse la détente pour connaître son sort..."
];
const EMOJI = "<:MiniCredit:1358495172370894951>";
function senateur(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, rateLimiter_1.isUserRateLimited)(interaction, rateLimiter, second_5)) {
            return;
        }
        try {
            const interactionOption = interaction.options;
            const balles = interactionOption.getInteger('balles');
            const isCheating = balles < 1 || balles > 6;
            const result = yield (isCheating ? handleCheat(interaction, balles) : handleGame(interaction, balles));
            yield handleRoleAssignment(interaction, balles, result.isGonnaDie);
        }
        catch (error) {
            console.error('Erreur:', error);
            (0, messages_1.sendMessage)(`Erreur critique: ${error}`);
        }
    });
}
function handleCheat(interaction, balles) {
    return __awaiter(this, void 0, void 0, function* () {
        const isDetected = Math.random() <= 0.01;
        const coins = getCoinsAmount(balles, '+');
        if (isDetected) {
            try {
                const member = interaction.member;
                if (member && !(0, members_1.isStaffInteraction)(interaction)) {
                    yield member.timeout(60000, 'Poignardé !');
                }
                yield interaction.reply(`<@${interaction.user.id}> a tenté de tricher et s'est fait poignarder! ${coins}`);
                return { isGonnaDie: true };
            }
            catch (error) {
                console.error("Timeout error:", error);
                yield interaction.reply(`<@${interaction.user.id}> a tenté de tricher, erreur de punition. ${coins}`);
                return { isGonnaDie: false };
            }
        }
        yield interaction.reply(`<@${interaction.user.id}> a triché... mais ne s'est pas fait remarqué. ${coins}`);
        return { isGonnaDie: false };
    });
}
function handleGame(interaction, balles) {
    return __awaiter(this, void 0, void 0, function* () {
        let isGonnaDie = Math.random() < balles / 6;
        let result = isGonnaDie ? "**BANG**" : "**CLIC**";
        let coins = getCoinsAmount(balles, isGonnaDie ? '-' : '+');
        if (isGonnaDie && Math.floor(Math.random() * 100) === 0) {
            if (balles == 6) {
                (0, messages_1.sendMessageToInfoChannel)(`<@${interaction.user.id}> à survecu(e) miraculeusement avec ${balles} balle(s)!`);
            }
            isGonnaDie = false;
            result = "**CLIC**";
            coins = getCoinsAmount(balles, isGonnaDie ? '-' : '+');
            yield interaction.reply(`<@${interaction.user.id}> ${getPhrase(balles)} ${result}!\nMais rien ne se passe, la balle est restée bloquée... ${coins}`);
            return { isGonnaDie: false };
        }
        if (isGonnaDie) {
            try {
                const member = interaction.member;
                if (member && !(0, members_1.isStaffInteraction)(interaction)) {
                    yield member.timeout(60000, 'Décès au jeu');
                }
            }
            catch (error) {
                console.error("Timeout error:", error);
                (0, messages_1.sendMessageToInfoChannel)(`Timeout impossible pour ${getUsername(interaction)}`);
            }
        }
        yield interaction.reply(`<@${interaction.user.id}> ${getPhrase(balles)} ${result} ${coins}`);
        return { isGonnaDie };
    });
}
function handleRoleAssignment(interaction, balles, isGonnaDie) {
    return __awaiter(this, void 0, void 0, function* () {
        const roleId = ROLES[`senateur${balles}${isGonnaDie ? '-' : '+'}`];
        if (!roleId) {
            yield (0, messages_1.sendMessage)("Impossible de donner les récompenses :/");
            console.log(`Impossible de donner le rôle senateur${balles}${isGonnaDie ? "-" : "+"}`);
            return;
        }
        const member = interaction.member;
        if (!member) {
            yield (0, messages_1.sendMessage)("Impossible de trouver le membre pour attribuer le rôle.");
            console.log("Le membre est introuvable ou non valide.");
            return;
        }
        for (let attempt = 1; attempt <= 5; attempt++) {
            if (yield (0, role_1.addRole)(member.id, roleId)) {
                //console.log(`Rôle ajouté avec succès (tentative ${attempt})`)
                //await sendMessage(`Rôle ajouté avec succès (tentative ${attempt})`);
                return;
            }
            yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds() + UnitTime_1.Time.milisecond.MS_500.toMilliseconds());
        }
        yield (0, messages_1.sendMessage)(`Échec d'ajout du rôle après 5 tentatives`);
    });
}
// Utilitaires
function getPhrase(balles) {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    if (!phrase) {
        console.error('Aucune phrase trouvée');
        return 'Erreur';
    }
    return phrase.replace("{nombre.balles}", balles.toString());
}
function getCoinsAmount(balles, sign) {
    const key = `senateur${balles}${sign}`;
    const coins = COINS[key];
    if (!coins) {
        console.error(`Clé invalide : ${key}`);
        return 'Erreur';
    }
    return `||(${coins} ${EMOJI})||`;
}
function getUsername(interaction) {
    if (!interaction.guild) {
        return interaction.user.username;
    }
    const member = interaction.member;
    if (!member) {
        (0, messages_1.sendMessage)("Interaction ne provient pas d'une guild valide");
        return null;
    }
    const memberName = member.nickname;
    return memberName || interaction.user.globalName || interaction.user.username;
}
