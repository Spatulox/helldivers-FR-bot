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
exports.HDFRChannelID = void 0;
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ProdHDFRChannelID = {
    ne_rien_ecrire_ici: "1437904268467376268",
    bot_brouillons: "1227056196297560105",
    retour_bot: "1405360530314494129",
    module_et_auto: "1418275658131312670",
    contact_staff: "1111355043321483327",
    major_order: "1308231599615115365",
    loadout: "1487437509553160262",
    blabla_jeu: "1111160769615245324",
    blabla_hors_sujet: "1213848682919886929",
    besoin_daide: "1441204859503247410",
    galerie: "1158908428387881051",
    mini_jeu: "1355177673554661416",
    detente: "1155492225774534696",
    chill_tryhard: "1213981643447205999",
    farm_debutant: "1304584943065890846",
    T_info: "1410994377014382602",
    T_diff_1_2_3: "1205718046191259649",
    T_diff_4_5_6: "1210198563947151411",
    T_diff_7_8_9: "1233951019008921640",
    T_diff_max: "1233953229906120744",
    T_separator: "1233957114464964700",
    A_info: "1410996732250030120",
    A_diff_1_2_3: "1209181969838247976",
    A_diff_4_5_6: "1209183762575794306",
    A_diff_7_8_9: "1233951714986561566",
    A_diff_max: "1233954400238698609",
    A_separator: "1233957008710041610",
    I_info: "1410996782246137949",
    I_diff_1_2_3: "1240056068885708810",
    I_diff_4_5_6: "1240056343025422358",
    I_diff_7_8_9: "1240056657086779492",
    I_diff_max: "1240056950666952776",
    I_separator: "1240056838654005318",
    FO_info: "1410996802391507088",
    farm_voc: "1349388528328507413",
    initiation_voc: "1305529203113988168",
    event_voc: "1340435223057268888",
    hd1_voc: "1426926821118836786",
    FO_separator: "1233956620208312320",
    compteur: "1329074144289099807",
    rapport: "1252667216139386910",
    infraction: "1115087485089882132",
    alert: "1210301307328405554",
    message_admin: "1111354760751239279",
    helldivers_bot_log: "1358156408209539122"
};
const HDFRDEBUGChannelID = {
    ne_rien_ecrire_ici: "1438800943456977036",
    bot_brouillons: "1471858445962580009",
    retour_bot: "1472900875696734350",
    module_et_auto: "1472900925273276574",
    contact_staff: "1483793388934533220",
    major_order: "1215348304083161138",
    loadout: "1498303223226961981",
    blabla_jeu: "1215348304083161138",
    blabla_hors_sujet: "1471858236079734834",
    besoin_daide: "1479130709753991299",
    galerie: "1311756042836906127",
    mini_jeu: "1471857998136610931",
    detente: "1215343151741403147",
    chill_tryhard: "1311756178560126976",
    farm_debutant: "1311756267076849764",
    T_info: "1503501676001104002",
    T_diff_1_2_3: "1503501676001104002",
    T_diff_4_5_6: "1503501761145602171",
    T_diff_7_8_9: "1503501732179738765",
    T_diff_max: "1503501791239606493",
    T_separator: "1503501676001104002",
    A_info: "1503501830431314100",
    A_diff_1_2_3: "1503501830431314100",
    A_diff_4_5_6: "1503501857564397609",
    A_diff_7_8_9: "1503501880779866243",
    A_diff_max: "1503501901361053819",
    A_separator: "1503501830431314100",
    I_info: "1503501847099474021",
    I_diff_1_2_3: "1503501847099474021",
    I_diff_4_5_6: "1503501869925011628",
    I_diff_7_8_9: "1503501890892206110",
    I_diff_max: "1503501915710033930",
    I_separator: "1503501847099474021",
    FO_info: "1504230554378440724",
    farm_voc: "1504230554378440724",
    initiation_voc: "1504230588414955691",
    event_voc: "1504230721060081717",
    hd1_voc: "1504230745969918004",
    FO_separator: "1504230554378440724",
    compteur: "1311756023639572594",
    rapport: "1475846843194937354",
    infraction: "1472901019494256833",
    alert: "1479187166327476274",
    message_admin: "1479187166327476274",
    helldivers_bot_log: "1358156408209539122"
};
class HDFRChannelID extends BasicServerConfig_1.BasicServeurConfig {
    static validateChannels(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const cfg = (guildId == "1111160769132896377" ? HDFRChannelID.prodConfig : HDFRChannelID.debugConfig);
            const entries = Object.entries(cfg);
            // Try to resolve guild: prefer explicit param, else try from Bot (adapt si besoin)
            let guild;
            if (guildId) {
                guild = (_a = yield simplediscordbot_1.GuildManager.find(guildId)) !== null && _a !== void 0 ? _a : undefined;
            }
            if (!guild) {
                console.error("Guild not found!");
                return;
            }
            for (const [key, id] of entries) {
                try {
                    // fetch channel globally from client (works even if not in the cached guild)
                    const channel = yield simplediscordbot_1.Bot.client.channels.fetch(id).catch(() => null);
                    if (channel) {
                        // Ensure we have a name (threads/channels all have .name)
                        const name = (_b = channel.name) !== null && _b !== void 0 ? _b : '—';
                        console.log(`${key} : "${name}" [OK]`);
                    }
                    else {
                        // channel not found via client.fetch, try guild fetch fallback (optional)
                        if (guild) {
                            const maybe = guild.channels.cache.get(id);
                            if (maybe) {
                                console.log(`${key} : "${(_c = maybe.name) !== null && _c !== void 0 ? _c : '—'}" [OK]`);
                                continue;
                            }
                        }
                        console.log(`${key} : "—" [NOK]`);
                    }
                }
                catch (err) {
                    console.log(`${key} : "—" [NOK]`);
                }
            }
        });
    }
    static get config() {
        return simplediscordbot_1.BotEnv.dev ? HDFRDEBUGChannelID : ProdHDFRChannelID;
    }
    static get prodConfig() {
        return ProdHDFRChannelID;
    }
    static get debugConfig() {
        return HDFRDEBUGChannelID;
    }
    static get ne_rien_ecrire_ici() {
        this.print('[HDFR] ne_rien_ecrire_ici called');
        return this.config.ne_rien_ecrire_ici;
    }
    static get bot_brouillons() {
        this.print('[HDFR] bot_brouillons called');
        return this.config.bot_brouillons;
    }
    static get retour_bot() {
        this.print('[HDFR] retour_bot called');
        return this.config.retour_bot;
    }
    static get module_et_auto() {
        this.print('[HDFR] module_et_auto called');
        return this.config.module_et_auto;
    }
    static get contact_staff() {
        this.print('[HDFR] contact_staff called');
        return this.config.contact_staff;
    }
    static get major_order() {
        this.print('[HDFR] major_order called');
        return this.config.major_order;
    }
    static get loadout() {
        this.print('[HDFR] loadout called');
        return this.config.loadout;
    }
    static get blabla_jeu() {
        this.print('[HDFR] blabla_jeu called');
        return this.config.blabla_jeu;
    }
    static get blabla_hors_sujet() {
        this.print('[HDFR] blabla_hors_sujet called');
        return this.config.blabla_hors_sujet;
    }
    static get besoin_daide() {
        this.print('[HDFR] besoin_daide called');
        return this.config.besoin_daide;
    }
    static get galerie() {
        this.print('[HDFR] galerie called');
        return this.config.galerie;
    }
    static get mini_jeu() {
        this.print('[HDFR] mini_jeu called');
        return this.config.mini_jeu;
    }
    static get detente() {
        this.print('[HDFR] detente called');
        return this.config.detente;
    }
    static get chill_tryhard() {
        this.print('[HDFR] chill_tryhard called');
        return this.config.chill_tryhard;
    }
    static get farm_debutant() {
        this.print('[HDFR] farm_debutant called');
        return this.config.farm_debutant;
    }
    static get T_info() {
        this.print('[HDFR] T_info called');
        return this.config.T_info;
    }
    static get T_diff_1_2_3() {
        this.print('[HDFR] T_diff_1_2_3 called');
        return this.config.T_diff_1_2_3;
    }
    static get T_diff_4_5_6() {
        this.print('[HDFR] T_diff_4_5_6 called');
        return this.config.T_diff_4_5_6;
    }
    static get T_diff_7_8_9() {
        this.print('[HDFR] T_diff_7_8_9 called');
        return this.config.T_diff_7_8_9;
    }
    static get T_diff_max() {
        this.print('[HDFR] T_diff_max called');
        return this.config.T_diff_max;
    }
    static get T_separator() {
        this.print('[HDFR] T_separator called');
        return this.config.T_separator;
    }
    static get A_info() {
        this.print('[HDFR] A_info called');
        return this.config.A_info;
    }
    static get A_diff_1_2_3() {
        this.print('[HDFR] A_diff_1_2_3 called');
        return this.config.A_diff_1_2_3;
    }
    static get A_diff_4_5_6() {
        this.print('[HDFR] A_diff_4_5_6 called');
        return this.config.A_diff_4_5_6;
    }
    static get A_diff_7_8_9() {
        this.print('[HDFR] A_diff_7_8_9 called');
        return this.config.A_diff_7_8_9;
    }
    static get A_diff_max() {
        this.print('[HDFR] A_diff_max called');
        return this.config.A_diff_max;
    }
    static get A_separator() {
        this.print('[HDFR] A_separator called');
        return this.config.A_separator;
    }
    static get I_info() {
        this.print('[HDFR] I_info called');
        return this.config.I_info;
    }
    static get I_diff_1_2_3() {
        this.print('[HDFR] I_diff_1_2_3 called');
        return this.config.I_diff_1_2_3;
    }
    static get I_diff_4_5_6() {
        this.print('[HDFR] I_diff_4_5_6 called');
        return this.config.I_diff_4_5_6;
    }
    static get I_diff_7_8_9() {
        this.print('[HDFR] I_diff_7_8_9 called');
        return this.config.I_diff_7_8_9;
    }
    static get I_diff_max() {
        this.print('[HDFR] I_diff_max called');
        return this.config.I_diff_max;
    }
    static get I_separator() {
        this.print('[HDFR] I_separator called');
        return this.config.I_separator;
    }
    static get FO_info() {
        this.print('[HDFR] FO_info called');
        return this.config.FO_info;
    }
    static get farm_voc() {
        this.print('[HDFR] farm_voc called');
        return this.config.farm_voc;
    }
    static get initiation_voc() {
        this.print('[HDFR] initiation_voc called');
        return this.config.initiation_voc;
    }
    static get event_voc() {
        this.print('[HDFR] event_voc called');
        return this.config.event_voc;
    }
    static get hd1() {
        this.print('[HDFR] hd1 called');
        return this.config.hd1_voc;
    }
    static get FO_separator() {
        this.print('[HDFR] FO_separator called');
        return this.config.FO_separator;
    }
    static get compteur() {
        this.print('[HDFR] compteur called');
        return this.config.compteur;
    }
    static get rapport() {
        this.print('[HDFR] rapport called');
        return this.config.rapport;
    }
    static get infraction() {
        this.print('[HDFR] infraction called');
        return this.config.infraction;
    }
    static get alert() {
        this.print('[HDFR] alert called');
        return this.config.alert;
    }
    static get message_admin() {
        this.print('[HDFR] message admin called');
        return this.config.message_admin;
    }
    static get helldivers_bot_log() {
        this.print('[HDFR] helldivers_bot_log called');
        return this.config.helldivers_bot_log;
    }
}
exports.HDFRChannelID = HDFRChannelID;
