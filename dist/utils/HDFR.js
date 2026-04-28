"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDFRRoles = exports.HDFREmoji = exports.HDFRChannelID = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ProdHDFRChannelID = {
    guildID: "1111160769132896377",
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
    compteur: "1329074144289099807",
    rapport: "1252667216139386910",
    infraction: "1115087485089882132",
    alert: "1210301307328405554",
    message_admin: "1111354760751239279",
    helldivers_bot_log: "1358156408209539122"
};
const HDFRDEBUGChannelID = {
    guildID: "1214320754578165901",
    ne_rien_ecrire_ici: "1438800943456977036",
    bot_brouillons: "1472900807773917224",
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
    compteur: "1311756023639572594",
    rapport: "1475846843194937354",
    infraction: "1472901019494256833",
    alert: "1479187166327476274",
    message_admin: "1479187166327476274",
    helldivers_bot_log: "1358156408209539122"
};
class HDFRChannelID {
    static get config() {
        return simplediscordbot_1.BotEnv.dev ? HDFRDEBUGChannelID : ProdHDFRChannelID;
    }
    static print(_str) {
        //console.log(`Loading : ${BotEnv.dev ? "DEV" : "PROD"} : ${str}`);
    }
    static get guildID() {
        this.print('[HDFR] guildID called');
        return this.config.guildID;
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
// TODO("Should implement .id and .name, and .toString()")
exports.HDFREmoji = {
    love: "<:hdfr_love:1238621674954428498>",
    bonhelldivers: "<a:hdfr_bonhelldivers:1236794040070963323>",
    xd: "<:hdfr_xd:1238620802585333791>",
    hitass: "<a:hdfr_HITASS:1350113011163201607>",
    minicredit: "<:hdfr_minicredit:1350908146356322337>",
    left: "<:hdfr_gauche:1221201626816053408>",
    right: "<:hdfr_droite:1221201658151960667>",
    up: "<:hdfr_haut:1221201670479024188>",
    down: "<:hdfr_bas:1221201613226512505>",
    maraudeur: "<:hdfr_marauder:1402086718894768220>",
    hdfr_flag: "<:hdfr_flag:1215294649284034611>"
};
exports.HDFRRoles = {
    senateur: {
        "0+": "1358501014625587210",
        "0-": "1358501027225141288",
        "1+": "1350921939123965982",
        "1-": "1350921942173225030",
        "2+": "1350921944219779122",
        "2-": "1350921959126335599",
        "3+": "1350921947218710689",
        "3-": "1350921965682298921",
        "4+": "1350921949974364241",
        "4-": "1350921966038552718",
        "5+": "1350921952952582174",
        "5-": "1350921968886616064",
        "6+": "1350921956400173077",
        "6-": "1350921971311050893",
    },
    staff: "1194776721229090826",
    superviseur: "1111163258401984552",
    moderator: "1206072446340300871",
    technicien: "1303398589812183060",
    technicien_debug: "1414949968502067350",
    diplomate: "1337407242730737754"
};
