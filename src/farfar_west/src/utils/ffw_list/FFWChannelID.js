"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FFWChannelID = void 0;
const BasicServerConfig_1 = require("../../../../share/BasicServerConfig");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ProdFFWChannelID = {
    bot_brouillons: "1500921148643475498",
    alert: "1459953098016690361",
    retour_bot: "1505014091058778312",
    module_et_auto: "1505014045697376278",
    rapport: "1459982455221125251",
    avertissement: "1458878936778801395",
    galerie: "1458898971060863048",
    message_admin: "1458874333559652416",
    prime_facile: "1459007436127211769",
    prime_normal: "1459014280753053807",
    prime_hard: "1459016230143791268",
    prime_tres_hard: "1459016725423984721",
    prime_cauchemar: "1459017273934352437",
    farm_et_defis: "1498500205379584145",
    separator: "1459017540876369940",
    ne_rien_ecrire_ici: "1458957559086977057",
    farfar_west_bot_log: "1504980749328056410"
};
const FFWDEBUGChannelID = {
    bot_brouillons: "1472900807773917224",
    alert: "1479187166327476274",
    retour_bot: "1472900875696734350",
    module_et_auto: "1472900925273276574",
    rapport: "1475846843194937354",
    avertissement: "1472901019494256833",
    galerie: "1311756042836906127",
    message_admin: "1479187166327476274",
    prime_facile: "",
    prime_normal: "",
    prime_hard: "",
    prime_tres_hard: "",
    prime_cauchemar: "",
    farm_et_defis: "",
    separator: "",
    ne_rien_ecrire_ici: "1438800943456977036",
    farfar_west_bot_log: "1504980749328056410"
};
class FFWChannelID extends BasicServerConfig_1.BasicServeurConfig {
    static get config() {
        return simplediscordbot_1.BotEnv.dev ? FFWDEBUGChannelID : ProdFFWChannelID;
    }
    static get prodConfig() {
        return ProdFFWChannelID;
    }
    static get debugConfig() {
        return FFWDEBUGChannelID;
    }
    static get bot_brouillons() {
        this.print('[FFW] bot_brouillons called');
        return this.config.bot_brouillons;
    }
    static get alert() {
        this.print('[FFW] alert called');
        return this.config.alert;
    }
    static get retour_bot() {
        this.print('[FFW] retour_bot called');
        return this.config.retour_bot;
    }
    static get module_et_auto() {
        this.print('[FFW] module_et_auto called');
        return this.config.module_et_auto;
    }
    static get rapport() {
        this.print('[FFW] rapport called');
        return this.config.rapport;
    }
    static get avertissement() {
        this.print('[FFW] avertissement called');
        return this.config.avertissement;
    }
    static get galerie() {
        this.print('[FFW] galerie called');
        return this.config.galerie;
    }
    static get message_admin() {
        this.print('[FFW] message_admin called');
        return this.config.message_admin;
    }
    static get prime_facile() {
        this.print('[FFW] prime_facile called');
        return this.config.prime_facile;
    }
    static get prime_normal() {
        this.print('[FFW] prime_normal called');
        return this.config.prime_normal;
    }
    static get prime_hard() {
        this.print('[FFW] prime_hard called');
        return this.config.prime_hard;
    }
    static get prime_tres_hard() {
        this.print('[FFW] prime_tres_hard called');
        return this.config.prime_tres_hard;
    }
    static get prime_cauchemar() {
        this.print('[FFW] prime_cauchemar called');
        return this.config.prime_cauchemar;
    }
    static get farm_et_defis() {
        this.print('[FFW] farm_et_defis called');
        return this.config.farm_et_defis;
    }
    static get separator() {
        this.print('[FFW] separator called');
        return this.config.separator;
    }
    static get ne_rien_ecrire_ici() {
        this.print('[FFW] ne_rien_ecrire_ici called');
        return this.config.ne_rien_ecrire_ici;
    }
    static get farfar_west_bot_log() {
        this.print('[FFW] farfar_west_bot_log called');
        return this.config.farfar_west_bot_log;
    }
}
exports.FFWChannelID = FFWChannelID;
