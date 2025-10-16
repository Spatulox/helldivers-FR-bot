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
exports.StratagemHeroeLogic = void 0;
const discord_js_1 = require("discord.js");
const emoji_1 = require("../../utils/other/emoji");
const embeds_1 = require("../../utils/messages/embeds");
const builders_1 = require("@discordjs/builders");
const client_1 = require("../../utils/client");
const messages_1 = require("../../utils/messages/messages");
const constantes_1 = require("../../utils/constantes");
const promises_1 = require("timers/promises");
const UnitTime_1 = require("../../utils/times/UnitTime");
const StratagemHero_1 = require("../../modules/Functionnalities/mini-games/StratagemHero");
const MoneyManager_1 = require("../../modules/Functionnalities/hdfr_functionnalities/MoneyManager");
const HDFR_1 = require("../../utils/other/HDFR");
//import stratagemData from "./stratagems.json"
const stratagems_1 = require("../src/stratagems");
//type Stratagems = Record<string, [string, Record<string, string>[]]>;
var GameState;
(function (GameState) {
    GameState["Waiting"] = "waiting";
    GameState["InProgress"] = "in_progress";
    GameState["Ended"] = "ended";
})(GameState || (GameState = {}));
class StratagemHeroeLogic {
    static get games() {
        return StratagemHeroeLogic._games;
    }
    getRandomStratagem() {
        const categoryKeys = Object.keys(StratagemHeroeLogic.stratagems);
        if (categoryKeys.length === 0)
            return null;
        // Choisir une catégorie aléatoire
        const randomCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        if (!randomCategoryKey)
            return null;
        const stratagemCategory = StratagemHeroeLogic.stratagems[randomCategoryKey];
        if (!stratagemCategory)
            return null;
        // Même procédé pour les stratagèmes
        const stratKeys = Object.keys(stratagemCategory);
        if (stratKeys.length === 0)
            return null;
        const randomStratKey = stratKeys[Math.floor(Math.random() * stratKeys.length)];
        if (!randomStratKey)
            return null;
        const stratDetails = stratagemCategory[randomStratKey];
        if (!stratDetails)
            return null;
        return { key: randomStratKey, details: stratDetails };
    }
    stratagem_hero(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const choosenStratagem = this.getRandomStratagem();
                if (!choosenStratagem) {
                    (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Aucun stratagème n'a pu être récupéré."), true);
                    (0, messages_1.sendMessageToInfoChannel)("Aucun stratagème n'a pu être récupéré.");
                    return;
                }
                StratagemHero_1.StratagemHero.lastStrataCode = new Date();
                if ((_a = StratagemHero_1.StratagemHero.instance) === null || _a === void 0 ? void 0 : _a.replyDesactivated(interaction)) {
                    return;
                }
                const message = yield this.sendStratagemHero(interaction);
                if (!message) {
                    (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Une erreur est survenue lors de l'envoi du message de recherche d'une partie"), true);
                    (0, messages_1.sendMessageToInfoChannel)("Une erreur est survenue lors de l'envoi du message de recherche d'une partie");
                    return;
                }
                StratagemHeroeLogic._games[message.id] = {
                    message_id: message.id,
                    game_state: GameState.Waiting,
                    players: [interaction.user.id],
                    stratagem_key: choosenStratagem.key, // clé du stratagème
                    stratagem_details: choosenStratagem.details, // l'objet complet [url, flèches]
                    thread_id: null,
                };
                StratagemHeroeLogic.timeouts[message.id] = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const game = StratagemHeroeLogic._games[message.id];
                    if (!game || game.game_state !== GameState.Waiting) {
                        // Partie déjà démarrée ou supprimée, rien à faire
                        delete StratagemHeroeLogic.timeouts[message.id];
                        return;
                    }
                    // Timeout atteint, annuler la partie
                    try {
                        // Modifier l'état de la partie
                        game.game_state = GameState.Ended;
                        // Modifier le message pour indiquer l'annulation et désactiver les boutons
                        const embed = (0, embeds_1.createEmbed)();
                        embed.title = "Strata'Code - Partie annulée";
                        embed.description = "La partie a été annulée car personne n'a rejoint/démarré dans le temps imparti.";
                        embed.color = 0xff0000;
                        const disabledRow = new builders_1.ActionRowBuilder().addComponents(new builders_1.ButtonBuilder()
                            .setCustomId(StratagemHeroeLogic.joinStratagemHeroButton)
                            .setLabel('Rejoindre la partie')
                            .setStyle(discord_js_1.ButtonStyle.Primary)
                            .setDisabled(true), new builders_1.ButtonBuilder()
                            .setCustomId(StratagemHeroeLogic.startGameButton)
                            .setLabel('Démarrer la partie')
                            .setStyle(discord_js_1.ButtonStyle.Success)
                            .setDisabled(true));
                        const channel = interaction.channel;
                        if (!channel)
                            return;
                        const messageToEdit = yield channel.messages.fetch(game.message_id);
                        if (!messageToEdit)
                            return;
                        yield messageToEdit.edit({ embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embed)], components: [disabledRow] });
                        this.clearCache(game);
                    }
                    catch (error) {
                        console.error('Erreur lors de l\'annulation automatique de la partie:', error);
                    }
                }), StratagemHeroeLogic.TIMEOUT_MS);
            }
            catch (error) {
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`ERROR : Éxécution de la commande /stratagem_hero : ${error}`));
            }
        });
    }
    sendStratagemHero(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const embed = (0, embeds_1.createEmbed)();
                embed.title = "Strata'Code";
                embed.description = `Trouvez le bon code de stratagème avant les autres pour gagner la partie !`;
                embed.fields = [
                    { name: "Stratagème choisi", value: "La partie n'a pas encore commencée" },
                    { name: "Joueurs", value: `<@${interaction.user.id}> : **Créateur**` },
                    { name: "Informations", value: "> - La partie se passe dans un fil dédié\n> - Une fois rejoint, il est impossible de quitter une partie" }
                ];
                const joinButton = new builders_1.ButtonBuilder()
                    .setCustomId(StratagemHeroeLogic.joinStratagemHeroButton)
                    .setLabel('Rejoindre la partie')
                    .setStyle(discord_js_1.ButtonStyle.Primary);
                const row = new builders_1.ActionRowBuilder().addComponents(joinButton);
                yield interaction.reply({
                    embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embed)],
                    components: [row],
                    withResponse: true,
                });
                const message = yield interaction.fetchReply();
                if (!message) {
                    throw new Error("Le message n'a pas pu être récupéré");
                }
                return message;
            }
            catch (error) {
                console.error(`ERROR : Envoi du message Strata'Code : ${error}`);
                (0, messages_1.sendMessageToInfoChannel)(`ERROR : Envoi du message Strata'Code : ${error}`);
            }
        });
    }
    joinStratagem_hero(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageId = interaction.message.id;
                const game = StratagemHeroeLogic._games[messageId];
                if (!game) {
                    yield interaction.reply({ content: "Cette partie n'existe plus ou n'a pas été trouvée.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (game.game_state !== GameState.Waiting) {
                    yield interaction.reply({ content: "La partie a déjà commencé, plus aucune inscription possible.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (game.players.includes(interaction.user.id)) {
                    yield interaction.reply({ content: "Vous avez déjà rejoint la partie.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                game.players.push(interaction.user.id);
                // Mise à jour du message embed + boutons après ajout
                yield this.updateGameMessage(interaction, game);
                yield interaction.followUp({ content: `Vous avez rejoint la partie. Joueurs actuels: ${game.players.length}`, flags: discord_js_1.MessageFlags.Ephemeral });
            }
            catch (error) {
                console.error(`ERROR : Rejoindre la partie Strata'Code : ${error}`);
                (0, messages_1.sendMessageToInfoChannel)(`ERROR : Rejoindre la partie Strata'Code : ${error}`);
            }
        });
    }
    startGame(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messageId = interaction.message.id;
                const game = StratagemHeroeLogic._games[messageId];
                if (!game) {
                    yield interaction.reply({ content: "Cette partie n'existe plus.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (interaction.user.id !== game.players[0]) {
                    yield interaction.reply({ content: "Seul le créateur peut démarrer la partie.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (game.players.length < 2) {
                    yield interaction.reply({ content: "Il faut au moins 2 joueurs pour démarrer la partie.", flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                game.game_state = GameState.InProgress;
                // Mise à jour du message embed + boutons pour refléter le démarrage
                yield this.updateGameMessage(interaction, game, true);
                // Créer le thread
                const channel = interaction.channel;
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
                    return;
                const threadName = `${game.stratagem_key}`;
                const thread = yield channel.threads.create({
                    name: threadName,
                    autoArchiveDuration: 60, // 1h
                    type: discord_js_1.ChannelType.PrivateThread,
                    startMessage: interaction.message.id,
                });
                game.thread_id = thread.id;
                const mentions = game.players.map(id => `<@${id}>`).join(' ');
                const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.yellow);
                embed.title = "Règles du jeu";
                embed.description = `> - Le premier joueur à envoyer le code de stratagème aura gagné\n> - Vous devez envoyer le code de stratagème en une seule fois.\n`;
                yield thread.send((0, embeds_1.returnToSendEmbed)(embed));
                yield thread.send({ content: `La partie commence ! ${mentions}`, allowedMentions: { users: game.players } });
            }
            catch (error) {
                console.error(`ERROR : Démarrage de la partie Strata'Code : ${error}`);
                (0, messages_1.sendMessageToInfoChannel)(`ERROR : Démarrage de la partie Strata'Code : ${error}`);
            }
        });
    }
    updateGameMessage(interactionOrMessage_1, game_1) {
        return __awaiter(this, arguments, void 0, function* (interactionOrMessage, game, startingGame = false, endingGame = false, winnerId = "Jouer Inconnu") {
            const embed = (0, embeds_1.createEmbed)();
            embed.title = "Strata'Code";
            embed.description = `Trouvez le bon code de stratagème avant les autres pour gagner la partie !`;
            embed.fields = [
                { name: "Stratagème choisi", value: startingGame ? game.stratagem_key : endingGame ? `La partie est terminé, <@${winnerId}> à gagné ! (+4 ${emoji_1.BOTEmoji.minicredit})` : "La partie n'a pas encore commencée" },
                { name: "Joueurs", value: game.players.map((id, i) => `${i === 0 ? "**Créateur**" : `Joueur ${i}`} : <@${id}>`).join('\n') },
                { name: "Informations", value: "> - La partie se passe dans un fil dédié\n> - Une fois rejoint, il est impossible de quitter une partie" }
            ];
            if (startingGame) {
                embed.image = { url: game.stratagem_details[0] };
            }
            // Bouton rejoindre désactivé si partie en cours ou finie
            const joinDisabled = game.game_state !== GameState.Waiting;
            // Bouton démarrer activé seulement si créateur et au moins 2 joueurs, sinon désactivé
            const startDisabled = game.game_state !== GameState.Waiting || game.players.length < 2;
            const joinButton = new builders_1.ButtonBuilder()
                .setCustomId(StratagemHeroeLogic.joinStratagemHeroButton)
                .setLabel('Rejoindre la partie')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(joinDisabled);
            const startButton = new builders_1.ButtonBuilder()
                .setCustomId(StratagemHeroeLogic.startGameButton)
                .setLabel('Démarrer la partie')
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setDisabled(startDisabled);
            const row = new builders_1.ActionRowBuilder().addComponents(joinButton, startButton);
            if (!interactionOrMessage) {
                if (!game.thread_id) {
                    throw new Error("thread_id manquant");
                }
                const thread = yield client_1.client.channels.fetch(game.thread_id);
                // Vérifier que c'est bien un thread (ThreadChannel)
                if (!thread || !(thread instanceof discord_js_1.ThreadChannel)) {
                    throw new Error("Channel non trouvé ou n'est pas un thread");
                }
                // Récupérer le message qui a lancé le thread (le premier message)
                const message = yield thread.fetchStarterMessage();
                if (!message) {
                    throw new Error("Message de démarrage du thread introuvable");
                }
                // Éditer le message
                yield message.edit({
                    embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embed)],
                    components: [row]
                });
                return;
            }
            // Si on a une interaction button, on update le message de l'interaction, sinon on édite juste le message
            if ('update' in interactionOrMessage) {
                yield interactionOrMessage.update({ embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embed)], components: [row] });
            }
            else {
                const channel = interactionOrMessage.channel;
                if (!channel)
                    return;
                const message = yield channel.messages.fetch(game.message_id);
                if (!message)
                    return;
                yield message.edit({ embeds: [(0, embeds_1.customEmbedtoDiscordEmbed)(embed)], components: [row] });
            }
        });
    }
    resolveStratagem(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (message.partial) {
                    message = yield message.fetch();
                }
                const _games = StratagemHeroeLogic._games;
                const game = Object.values(_games).find(g => { var _a; return g.game_state === GameState.InProgress && message.channelId === ((_a = message.channel) === null || _a === void 0 ? void 0 : _a.id); });
                if (!game) {
                    console.log("Aucune partie en cours trouvée dans ce channel pour ce message.");
                    return;
                }
                const expectedCodeParts = game.stratagem_details[1];
                const expectedCode = expectedCodeParts.map(part => part.custom || part.unicode).join('');
                const playerCode = (message.content || "").replace(/\s/g, '');
                console.log("Code attendu    :", expectedCode);
                console.log("Code reçu       :", playerCode);
                if (playerCode === expectedCode) {
                    yield this.endStratagemHero(message.author.id, game, message.channel);
                }
                else {
                    message.react('❌').catch(console.error);
                }
            }
            catch (error) {
                console.error("Erreur lors de la résolution du stratagème :", error);
                (0, messages_1.sendMessageToInfoChannel)(`ERROR : Résolution du stratagème : ${error}`);
            }
        });
    }
    endStratagemHero(winnerId, game, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                game.game_state = GameState.Ended;
                // Embed d'annonce gagnant
                const embed = (0, embeds_1.createEmbed)(embeds_1.EmbedColor.yellow);
                embed.title = "Strata'Code - Partie terminée";
                embed.description = `🎉 <@${winnerId}> a gagné la partie avec le bon code du stratagème **${game.stratagem_key}** ! 🎉`;
                if (channel.guildId == constantes_1.TARGET_GUILD_ID) {
                    const money = new MoneyManager_1.MoneyManager();
                    money.addRole(channel.guildId, winnerId, HDFR_1.HDFRRoles.stratagem_hero.looser);
                    for (const player of game.players) {
                        if (player !== winnerId) {
                            yield (0, promises_1.setTimeout)(UnitTime_1.Time.second.SEC_01.toMilliseconds());
                            money.addRole(channel.guildId, player, HDFR_1.HDFRRoles.stratagem_hero.looser);
                        }
                    }
                }
                this.updateGameMessage(null, game, false, true, winnerId);
                yield channel.send((0, embeds_1.returnToSendEmbed)(embed));
                //await channel.setLocked(true)
                yield channel.delete();
                // Supprimer la partie pour libérer mémoire
                this.clearCache(game);
            }
            catch (error) {
                console.error("Erreur lors de la fin de partie :", error);
                (0, messages_1.sendMessageToInfoChannel)(`ERROR : Fin de partie Stratagem Hero : ${error}`);
            }
        });
    }
    clearCache(game) {
        delete StratagemHeroeLogic._games[game.message_id];
        delete StratagemHeroeLogic.timeouts[game.message_id];
    }
}
exports.StratagemHeroeLogic = StratagemHeroeLogic;
StratagemHeroeLogic.TIMEOUT_MS = 3600 * 1000;
StratagemHeroeLogic.timeouts = {};
StratagemHeroeLogic.joinStratagemHeroButton = "joinStratagemHero";
StratagemHeroeLogic.startGameButton = "startStratagemHero";
StratagemHeroeLogic._games = {}; // messageID, Game
StratagemHeroeLogic.stratagems = stratagems_1.HelldiversStratagems;
