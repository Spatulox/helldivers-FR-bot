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
exports.AutoBanScamFFW = void 0;
const discord_js_1 = require("discord.js");
const AutoBanScam_1 = require("../../../../share/modules/AutoBanScam");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const FFW_1 = require("../../utils/ffw_list/FFW");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const node_fs_1 = require("node:fs");
const MiscStatistics_1 = require("../statistics/MiscStatistics");
class AutoBanScamFFW extends AutoBanScam_1.AutoBanScam {
    createMessage() {
        const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.yellow);
        embed.setTitle("PROTECTION ANTI-SCAM");
        embed.setDescription(`▬▬▬▬▬▬▬▬▬▬▬▬\n\n- ⚠️ __**message = ban**__ ⚠️\n- Canal factice de détection\n- Merci de ne rien écrire ici\n- Pas même pour la blague\n- Ni même pour "tester"\n- Réaction immédiate\n- ⚠️ __**message = ban**__ ⚠️\n\n▬▬▬▬▬▬▬▬▬▬▬▬`);
        const fromageBuffer = (0, node_fs_1.readFileSync)("./src/farfar_west/img/fromage.webp");
        const attentionBuffer = (0, node_fs_1.readFileSync)("./src/farfar_west/img/attention.png");
        const attachmentFromage = new discord_js_1.AttachmentBuilder(fromageBuffer, { name: 'fromage.png' });
        const attachmentAttention = new discord_js_1.AttachmentBuilder(attentionBuffer, { name: 'attention.png' });
        embed.setThumbnail("attachment://fromage.png");
        embed.setImage("attachment://attention.png");
        embed.setFooter({
            text: `Rongeurs attrapés : ${MiscStatistics_1.MiscStatistics.cacheData.auto_kill_count}`
        });
        return {
            embeds: [embed],
            files: [attachmentFromage, attachmentAttention],
        };
    }
    buildMessage() {
        return this.createMessage();
    }
    editMessage() {
        return this.createMessage();
    }
    constructor() {
        super();
        this.cacheKey = "auto_ban_scam";
        this.setup();
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCache();
            this.initMessageSendEach24H();
        });
    }
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    get alertChannel() {
        return FFW_1.FFW.channel.alert;
    }
    get rapportChannel() {
        return FFW_1.FFW.channel.rapport;
    }
    get infractionChannel() {
        return FFW_1.FFW.channel.avertissement;
    }
    get botBrouillonChannel() {
        return FFW_1.FFW.channel.bot_brouillons;
    }
    get neRienEcrireIciChannel() {
        return FFW_1.FFW.channel.ne_rien_ecrire_ici;
    }
    isStaff(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isStaff(member);
    }
    isTechnician(member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isBricoleur(member);
    }
    neRienEcrireIci(message) {
        const _super = Object.create(null, {
            neRienEcrireIci: { get: () => super.neRienEcrireIci }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (message.channelId != this.neRienEcrireIciChannel) {
                return;
            }
            if (!message.author.bot)
                yield MiscStatistics_1.MiscStatistics.incrementAutoBanScam();
            yield _super.neRienEcrireIci.call(this, message);
        });
    }
}
exports.AutoBanScamFFW = AutoBanScamFFW;
