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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadoutRandomizer = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const FactionList_1 = require("../../utils/Lists/FactionList");
const WeaponsList_1 = require("../../utils/Lists/WeaponsList");
const ArmorPassiveList_1 = require("../../utils/Lists/ArmorPassiveList");
const HellpodBonusList_1 = require("../../utils/Lists/HellpodBonusList");
const Restrictions_1 = require("../../utils/Lists/Restrictions");
const Challenges_1 = require("../../utils/Lists/Challenges");
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const ReusableButtonsActions_1 = require("../../../../share/interactions/buttons/ReusableButtonsActions");
const MessageManager_1 = require("../../../../share/managers/MessageManager");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const difficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
class LoadoutRandomizer extends discord_module_1.ModuleWithStaticCache {
    static get loadoutChannel() {
        return HDFR_1.HDFR.channel.loadout;
    }
    static get galerieChannel() {
        return HDFR_1.HDFR.channel.galerie;
    }
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Loadout Randomizer";
        this.description = "Randomizer for a loadout";
        _a.init(0);
    }
    static init(int) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadCache();
                if (this.cacheData.message_id === "") { // undefined
                    const channel = yield simplediscordbot_1.GuildManager.channel.text.find(this.cacheData.channel_id);
                    if (channel) {
                        const msg = yield channel.send(this.loadoutMessage());
                        this.cacheData.message_id = msg.id;
                        yield this.setCache(this.cacheData);
                        const opt = { name: "Retours, suggestions & bugs" };
                        const thread = yield msg.startThread(opt);
                        this.cacheData.thread_id = thread.id;
                        yield this.setCache(this.cacheData);
                    }
                }
                else { // defined
                    if (int > 0)
                        return;
                    const message = yield simplediscordbot_1.GuildManager.channel.text.message.fetchOne(this.cacheData.channel_id, this.cacheData.message_id);
                    if (!message) {
                        this.cacheData.message_id = "";
                        yield this.setCache(this.cacheData);
                        yield this.init(1);
                    }
                    else {
                        if (this.cacheData.thread_id === "") {
                            const opt = { name: "Retours, suggestions & bugs" };
                            const thread = yield message.startThread(opt);
                            this.cacheData.thread_id = thread.id;
                            yield this.setCache(this.cacheData);
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    /*private static async getCache() {
        const res = await CacheManager.getOrCreateCache(this.cacheKey, this.cacheData)
        if (res) {
            this.cacheData = res
        }
    }*/
    static setCache(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield simplediscordbot_1.CacheManager.writeCache(this.cacheKey, data)) {
                this.cacheData = data;
            }
        });
    }
    static roll_loadout(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.guildId == null) {
                yield interaction.reply("Désolé, l'intéraction ne fonctionne pas en message direct");
                return;
            }
            this.lastRoll = new Date();
            const loadout = _a.getRandomLoadout();
            let rep = simplediscordbot_1.ComponentManager.toInteraction(yield _a.formatMessage(loadout));
            rep = Object.assign(Object.assign({}, rep), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] });
            yield interaction.reply(rep);
        });
    }
    static loadoutMessage() {
        var _b, _c, _d;
        const botIconUrl = (_d = (_c = (_b = simplediscordbot_1.Bot.client) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL({ forceStatic: false, size: 128 })) !== null && _d !== void 0 ? _d : "";
        const container = simplediscordbot_1.ComponentManager.create({
            title: "# ORDRE TERTIAIRE\nSeulement les helldivers les plus téméraires peuvent s'y confronter !\n" +
                "## ✨ Fonctionnalités\n" +
                "> - Équipement 100% aléatoire\n" +
                "> - 9 critères aléatoires\n" +
                "> - Restrictions & challenges fun",
            description: "",
            color: simplediscordbot_1.SimpleColor.gold,
            thumbnailUrl: botIconUrl
        });
        container.addSeparatorComponents(new discord_js_1.SeparatorBuilder().setSpacing(discord_js_1.SeparatorSpacingSize.Small));
        const field = {
            value: `**Immortalisez votre challenge** et partagez le dans <#${this.galerieChannel}> !\n` +
                "*La Super-Terre vous observe...*"
        };
        simplediscordbot_1.ComponentManager.field(container, field);
        // Bouton principal
        const buttonField = {
            name: "## 🚀 Prêt à combattre ?",
            value: "Générez votre paquetage !",
            button: [
                new builders_1.ButtonBuilder()
                    .setCustomId(_a.roll_button_name)
                    .setLabel(_a.roll_button_string_name)
                    .setStyle(discord_js_1.ButtonStyle.Primary),
                new builders_1.ButtonBuilder()
                    .setCustomId(_a.button_info_name)
                    .setLabel(_a.button_info_string_name)
                    .setStyle(discord_js_1.ButtonStyle.Primary)
            ]
        };
        simplediscordbot_1.ComponentManager.field(container, buttonField);
        return simplediscordbot_1.ComponentManager.toMessage(container);
    }
    static getRandomLoadout() {
        var _b;
        return {
            difficulty: (_b = difficulties[Math.floor(Math.random() * difficulties.length)]) !== null && _b !== void 0 ? _b : 1,
            team: Math.random() > 0.5 ? "Team" : "Solo",
            faction: FactionList_1.FactionsList[Math.floor(Math.random() * FactionList_1.FactionsList.length)],
            main: WeaponsList_1.MainWeaponsList[Math.floor(Math.random() * WeaponsList_1.MainWeaponsList.length)],
            secondary: WeaponsList_1.SecondaryWeaponsList[Math.floor(Math.random() * WeaponsList_1.SecondaryWeaponsList.length)],
            tertiary: WeaponsList_1.TertiaryWeaponsList[Math.floor(Math.random() * WeaponsList_1.TertiaryWeaponsList.length)],
            armor_passive: ArmorPassiveList_1.ArmorsPassivesList[Math.floor(Math.random() * ArmorPassiveList_1.ArmorsPassivesList.length)],
            hellpod_bonus: HellpodBonusList_1.HellpodBonusList[Math.floor(Math.random() * HellpodBonusList_1.HellpodBonusList.length)],
            restriction: Restrictions_1.RestrictionsList[Math.floor(Math.random() * Restrictions_1.RestrictionsList.length)],
            challenge: Challenges_1.ChallengesList[Math.floor(Math.random() * Challenges_1.ChallengesList.length)]
        };
    }
    static formatInfoMessage(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const container = simplediscordbot_1.ComponentManager.create({
                title: `# LÉGENDE DES CRITÈRES\n`,
                color: simplediscordbot_1.SimpleColor.yellow
            });
            simplediscordbot_1.ComponentManager.field(container, this.getComponentManagerField());
            yield interaction.reply({
                components: [container],
                flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral]
            });
        });
    }
    static getComponentManagerField(loadout) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const legend = {
            name: "▬▬▬▬▬▬▬▬▬▬▬▬",
            value: `- 👥: ${(_b = loadout === null || loadout === void 0 ? void 0 : loadout.team) !== null && _b !== void 0 ? _b : "solo / équipe"}\n` +
                `- 👾: ${(_c = loadout === null || loadout === void 0 ? void 0 : loadout.faction) !== null && _c !== void 0 ? _c : "choix faction"}\n` +
                `- 🥇: ${(_d = loadout === null || loadout === void 0 ? void 0 : loadout.main) !== null && _d !== void 0 ? _d : "choix arme principale"}\n` +
                `- 🥈: ${(_e = loadout === null || loadout === void 0 ? void 0 : loadout.secondary) !== null && _e !== void 0 ? _e : "choix arme secondaire"}\n` +
                `- 🥉: ${(_f = loadout === null || loadout === void 0 ? void 0 : loadout.tertiary) !== null && _f !== void 0 ? _f : "choix grenade"}\n` +
                `- 🛡️: ${(_g = loadout === null || loadout === void 0 ? void 0 : loadout.armor_passive) !== null && _g !== void 0 ? _g : "choix type d'armure"}\n` +
                `- 🚀: ${(_h = loadout === null || loadout === void 0 ? void 0 : loadout.hellpod_bonus) !== null && _h !== void 0 ? _h : "choix type hellpod"}\n` +
                `- ❌: ${(_j = loadout === null || loadout === void 0 ? void 0 : loadout.restriction) !== null && _j !== void 0 ? _j : "restriction en jeu"}\n` +
                `- 📷: ${(_k = loadout === null || loadout === void 0 ? void 0 : loadout.challenge) !== null && _k !== void 0 ? _k : "scène à capturer"}\n` +
                "▬▬▬▬▬▬▬▬▬▬▬▬"
        };
        return legend;
    }
    static formatMessage(loadout) {
        return __awaiter(this, void 0, void 0, function* () {
            const container = simplediscordbot_1.ComponentManager.create({
                title: `## Les **${loadout.faction}** vous défient !\n`,
                color: simplediscordbot_1.SimpleColor.crimson
            });
            const legend = this.getComponentManagerField(loadout);
            simplediscordbot_1.ComponentManager.field(container, legend);
            const channel = yield simplediscordbot_1.GuildManager.channel.text.find(this.galerieChannel);
            const buttons = [
                new builders_1.ButtonBuilder()
                    .setCustomId(ReusableButtonsActions_1.ReusableButtonsActions.DUPLICATE_MSG_TO_DM)
                    .setLabel("📩 Copie en DM")
                    .setStyle(discord_js_1.ButtonStyle.Primary),
                new builders_1.ButtonBuilder()
                    .setCustomId(_a.roll_button_name)
                    .setLabel(_a.re_roll_button_string_name)
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
            ];
            if (channel) {
                buttons.push(new builders_1.ButtonBuilder()
                    .setLabel("📸 Partager")
                    .setCustomId(_a.button_share_name)
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
            }
            const buttonField = {
                name: "### ⚡ ACTIONS RAPIDES",
                value: "Partagez ou régénérez votre loadout !",
                button: buttons,
                separator: false
            };
            simplediscordbot_1.ComponentManager.field(container, buttonField);
            simplediscordbot_1.ComponentManager.field(container, { value: `-# *${Math.floor(Math.random() * 120 + 1)}% Approved by the Ministry of Randomness*` });
            return container;
        });
    }
    static share_loadout_to_channel_button(interaction) {
        const channelSelector = simplediscordbot_1.SelectMenuManager.channels(_a.selectmenu_share_name, "Choississez un channel", [discord_js_1.ChannelType.GuildText]);
        interaction.reply(simplediscordbot_1.SelectMenuManager.toInteraction(channelSelector, true));
    }
    static removeButtonForDM(dmContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dmContent.components && dmContent.components[0].components[1].data.content == "__**▬▬▬▬▬▬▬▬▬▬▬▬**__") {
                if (!dmContent.components[0])
                    return;
                dmContent.components[0].components.splice(4, 6);
            }
        });
    }
    static removeButton(msg, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.components && msg.components[0]) {
                const actionRowText = msg.components[0].components[5];
                if (!(actionRowText instanceof discord_js_1.TextDisplayComponent)) {
                    const msg = simplediscordbot_1.ComponentManager.error("LoadoutRandomizer cannot update buttons text label");
                    simplediscordbot_1.Bot.log.info(msg);
                    simplediscordbot_1.Bot.log.error(msg);
                    return;
                }
                actionRowText.data.content = `Sauvegardez le loadout de ${interaction.user.displayName} !`;
                // Supprimer les 2 derniers boutons de l'ActionRow 25
                const actionRow25 = msg.components[0].components[6];
                if (!(actionRow25 instanceof discord_js_1.ActionRow)) {
                    const msg = simplediscordbot_1.ComponentManager.error("LoadoutRandomizer cannot remove buttons from the ActionRow");
                    simplediscordbot_1.Bot.log.info(msg);
                    simplediscordbot_1.Bot.log.error(msg);
                    return;
                }
                if (actionRow25 && actionRow25.components && actionRow25.components.length > 1) {
                    actionRow25.components.length = 1; // Clear the 2 last for some reason
                }
            }
        });
    }
    static share_loadout_to_channel_select_menu(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _b;
            const parentMessageId = (_b = interaction.message.reference) === null || _b === void 0 ? void 0 : _b.messageId;
            if (parentMessageId) {
                try {
                    //interaction.deferUpdate()
                    const parentMessage = yield simplediscordbot_1.GuildManager.channel.text.message.fetchOne(interaction.channelId, parentMessageId);
                    if (!parentMessage)
                        return;
                    const web = new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, interaction.user.displayName, interaction.user.displayAvatarURL());
                    const msg = yield MessageManager_1.MessageManager.getMessageCreateOptionFromDiscordMessage(parentMessage);
                    yield this.removeButton(msg, interaction);
                    let string = "";
                    for (const channelId of interaction.values) {
                        web.send(channelId, msg);
                        string = string + ` <#${channelId}>`;
                    }
                    interaction.update({
                        content: `Loadout partagé avec succès dans${string} !`,
                        components: []
                    });
                }
                catch (e) {
                    simplediscordbot_1.Bot.log.error(`Sharing Loadout : ${e}`);
                }
            }
        });
    }
}
exports.LoadoutRandomizer = LoadoutRandomizer;
_a = LoadoutRandomizer;
LoadoutRandomizer.lastRoll = null;
LoadoutRandomizer.cacheKey = "loadout_randomizer";
LoadoutRandomizer.cacheData = { channel_id: _a.loadoutChannel, message_id: "", thread_id: "" };
LoadoutRandomizer.roll_button_name = "roll_loadout";
LoadoutRandomizer.button_info_name = "info_loadout";
LoadoutRandomizer.button_share_name = "loadout_share_channel_button";
LoadoutRandomizer.roll_button_string_name = "🎲 Générer un équipement";
LoadoutRandomizer.re_roll_button_string_name = "🎲 Re-générer";
LoadoutRandomizer.button_info_string_name = "❓ Informations";
LoadoutRandomizer.selectmenu_share_name = "loadout_share_channel_selectmenu";
