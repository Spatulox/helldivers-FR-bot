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
const ReusableButtonsActions_1 = require("../../interactions/buttons/ReusableButtonsActions");
const HDFR_1 = require("../../utils/HDFR");
const MessageManager_1 = require("../../utils/Manager/MessageManager");
class LoadoutRandomizer extends discord_module_1.Module {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Loadout Randomizer";
        this.description = "Randomizer for a loadout";
        LoadoutRandomizer.init(0);
    }
    static init(int) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getCache();
            if (this.cacheData.message_id === "") { // undefined
                const channel = yield simplediscordbot_1.GuildManager.channel.text.find(this.cacheData.channel_id);
                if (channel) {
                    const msg = yield channel.send(this.loadoutMessage());
                    this.cacheData.message_id = msg.id;
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
            }
        });
    }
    static getCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield simplediscordbot_1.CacheManager.getOrCreateCache(this.cacheName, this.cacheData);
            if (res) {
                this.cacheData = res;
            }
        });
    }
    static setCache(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield simplediscordbot_1.CacheManager.writeCache(this.cacheName, data)) {
                this.cacheData = data;
            }
        });
    }
    static roll_loadout(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const loadout = LoadoutRandomizer.getRandomLoadout();
            let rep = simplediscordbot_1.ComponentManager.toInteraction(yield LoadoutRandomizer.formatMessage(loadout));
            rep = Object.assign(Object.assign({}, rep), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] });
            interaction.reply(rep);
        });
    }
    static loadoutMessage() {
        var _a, _b, _c;
        const botIconUrl = (_c = (_b = (_a = simplediscordbot_1.Bot.client) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL({ forceStatic: false, size: 128 })) !== null && _c !== void 0 ? _c : "";
        const container = simplediscordbot_1.ComponentManager.create({
            title: "# 🎖️ HELLDIVERS 2 LOADOUT RANDOMIZER",
            description: `> Cliquez sur __**${LoadoutRandomizer.button_string_name}**__ pour générer votre équipement aléatoire !

` +
                "## ✨ Fonctionnalités\n" +
                "> - Équipement 100% aléatoire\n" +
                "> - Factions, armes, armures, bonus\n" +
                "> - Restrictions & challenges fun\n" +
                "> - Copie directe en DM",
            color: simplediscordbot_1.SimpleColor.gold,
            thumbnailUrl: botIconUrl
        });
        container.addSeparatorComponents(new discord_js_1.SeparatorBuilder().setSpacing(discord_js_1.SeparatorSpacingSize.Small));
        // Infos du système
        const infoFields = [
            {
                name: "## 🎮 Que contient un loadout ?",
                value: "- Faction ennemie\n- Arme principale\n- Secondaire\n- Tertiaire (grenade)\n- Passif armure\n- Bonus Hellpod\n- Restriction\n- Challenge fun"
            },
            {
                name: "## ⚠️ Exemples de Restrictions",
                value: "- Pas d'ATH\n- Armure légère seulement\n- Stratagèmes bleus\n- Arme 1 main uniquement",
                separator: discord_js_1.SeparatorSpacingSize.Small
            }
        ];
        simplediscordbot_1.ComponentManager.fields(container, infoFields);
        // Bouton principal
        const buttonField = {
            name: "## 🚀 Prêt à combattre ?",
            value: "Générez votre premier loadout !",
            button: [new builders_1.ButtonBuilder()
                    .setCustomId(LoadoutRandomizer.button_name)
                    .setLabel(LoadoutRandomizer.button_string_name)
                    .setStyle(discord_js_1.ButtonStyle.Primary)]
        };
        simplediscordbot_1.ComponentManager.field(container, buttonField);
        // Footer avec règles
        const rulesField = {
            name: "📜 Règles",
            value: `**Immortalisez votre challenge** et partagez le dans <#${HDFR_1.HDFRChannelID.galerie}> !
` +
                "*La Super-Terre vous observe...*"
        };
        simplediscordbot_1.ComponentManager.field(container, rulesField);
        return simplediscordbot_1.ComponentManager.toMessage(container);
    }
    static getRandomLoadout() {
        return {
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
    static formatMessage(loadout) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const botIconUrl = (_c = (_b = (_a = simplediscordbot_1.Bot.client) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL({ forceStatic: false, size: 128 })) !== null && _c !== void 0 ? _c : "";
            const container = simplediscordbot_1.ComponentManager.create({
                title: `## Les **${loadout.faction}** vous défient !\n` +
                    `🎖️ LOADOUT #${Math.floor(Math.random() * 9999)}\n` +
                    `- **Niveau de difficulté** : ${loadout.restriction}`,
                color: simplediscordbot_1.SimpleColor.crimson, // Rouge sang pour combat !
                thumbnailUrl: botIconUrl
            });
            // Fields organisés par catégories
            const combatFields = [
                { name: "### 🔫 ARME PRINCIPALE", value: `**${loadout.main}**`, separator: discord_js_1.SeparatorSpacingSize.Small },
                { name: "### 🔫 ARME DE POING", value: `**${loadout.secondary}**` },
                { name: "### 💣 GRENADES", value: `**${loadout.tertiary}**`, separator: discord_js_1.SeparatorSpacingSize.Large }
            ];
            const survivalFields = [
                { name: "### 🛡️ PASSIF ARMURE", value: `**${loadout.armor_passive}**` },
                { name: "### 🚀 BONUS HELLPOD", value: `**${loadout.hellpod_bonus}**`, separator: discord_js_1.SeparatorSpacingSize.Large }
            ];
            const missionFields = [
                { name: "### ⚠️ RESTRICTION", value: `❗ **${loadout.restriction}**`, separator: discord_js_1.SeparatorSpacingSize.Small },
                {
                    name: "### 🎬 CHALLENGE DU JOUR",
                    value: `### 📹 ${loadout.challenge}\n\n*Enregistrez et partagez votre exploit !* 🎥`,
                    separator: discord_js_1.SeparatorSpacingSize.Large
                }
            ];
            simplediscordbot_1.ComponentManager.fields(container, combatFields);
            simplediscordbot_1.ComponentManager.fields(container, survivalFields);
            simplediscordbot_1.ComponentManager.fields(container, missionFields);
            const channel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.galerie);
            const buttons = [
                new builders_1.ButtonBuilder()
                    .setCustomId(ReusableButtonsActions_1.ReusableButtonsActions.DUPLICATE_MSG_TO_DM)
                    .setLabel("📩 Copie en DM")
                    .setStyle(discord_js_1.ButtonStyle.Primary),
                new builders_1.ButtonBuilder()
                    .setCustomId(LoadoutRandomizer.button_name)
                    .setLabel("🎲 Re-roll")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
            ];
            if (channel) {
                buttons.push(new builders_1.ButtonBuilder()
                    .setLabel("📸 Partager")
                    .setCustomId(LoadoutRandomizer.button_share_name)
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
            }
            const buttonField = {
                name: "### ⚡ ACTIONS RAPIDES",
                value: "Partagez ou régénérez votre loadout !",
                button: buttons
            };
            simplediscordbot_1.ComponentManager.field(container, buttonField);
            // Footer motivant
            const footerField = {
                name: `## ${HDFR_1.HDFREmoji.hdfr_flag} APPROUVÉ PAR LA SUPER-TERRE ${HDFR_1.HDFREmoji.hdfr_flag}`,
                value: "*Pour la Démocratie ! Pour la Liberté ! Pour la Super Terre !*\n" +
                    `*${Math.floor(Math.random() * 120 + 1)}% Approved*`
            };
            simplediscordbot_1.ComponentManager.field(container, footerField);
            return container;
        });
    }
    static share_loadout_to_channel_button(interaction) {
        const channelSelector = simplediscordbot_1.SelectMenuManager.channels(LoadoutRandomizer.selectmenu_share_name, "Choississez un channel", [discord_js_1.ChannelType.GuildText]);
        interaction.reply(simplediscordbot_1.SelectMenuManager.toInteraction(channelSelector, true));
    }
    static share_loadout_to_channel_select_menu(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parentMessageId = (_a = interaction.message.reference) === null || _a === void 0 ? void 0 : _a.messageId;
            if (parentMessageId) {
                try {
                    //interaction.deferUpdate()
                    const parentMessage = yield simplediscordbot_1.GuildManager.channel.text.message.fetchOne(interaction.channelId, parentMessageId);
                    if (!parentMessage)
                        return;
                    const web = new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, interaction.user.displayName, interaction.user.displayAvatarURL());
                    const msg = yield MessageManager_1.MessageManager.getMessageCreateOptionFromDiscordMessage(parentMessage);
                    if (msg.components && msg.components[0]) {
                        const actionRowText = msg.components[0].components[23];
                        if (!(actionRowText instanceof discord_js_1.TextDisplayComponent)) {
                            const msg = simplediscordbot_1.ComponentManager.error("LoadoutRandomizer cannot update button text label");
                            simplediscordbot_1.Bot.log.info(msg);
                            simplediscordbot_1.Bot.log.error(msg);
                            return;
                        }
                        actionRowText.data.content = `Sauvegardez le loadout de ${interaction.user.displayName} !`;
                        // Supprimer les 2 derniers boutons de l'ActionRow 25
                        const actionRow25 = msg.components[0].components[24];
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
                    simplediscordbot_1.Bot.log.error(`Wharing Loadout : ${e}`);
                }
            }
        });
    }
}
exports.LoadoutRandomizer = LoadoutRandomizer;
LoadoutRandomizer.cacheName = "loadout_randomizer";
LoadoutRandomizer.cacheData = { channel_id: HDFR_1.HDFRChannelID.loadout, message_id: "" };
LoadoutRandomizer.button_name = "roll_loadout";
LoadoutRandomizer.button_share_name = "loadout_share_channel_button";
LoadoutRandomizer.selectmenu_share_name = "loadout_share_channel_selectmenu";
LoadoutRandomizer.button_string_name = "🎲 Roll Loadout";
