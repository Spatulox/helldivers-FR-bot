"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UnitTime_1 = require("../times/UnitTime");
//----------------------------------------------------------------------------//
function log(str) {
    // Déterminer le chemin du fichier globalFunct.js
    // Déterminer le chemin du dossier et du fichier log
    const logDir = path_1.default.join(__dirname.split(path_1.default.sep + 'utils')[0], 'log');
    const filePath = path_1.default.join(logDir, 'log.txt');
    // Créer le dossier log s'il n'existe pas
    try {
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir);
        }
    }
    catch (error) {
        console.error('ERROR : Impossible de créer le dossier log : ', error);
        return;
    }
    // Vérifier la taille du fichier log.txt
    try {
        const stats = fs_1.default.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInKilobytes = fileSizeInBytes / 1024;
        const fileSizeInMegabytes = fileSizeInKilobytes / 1024;
        if (fileSizeInMegabytes >= 3) {
            let fileList;
            try {
                fileList = fs_1.default.readdirSync(logDir);
            }
            catch (err) {
                console.error('ERROR : Erreur lors de la lecture du répertoire : ' + err);
                fileList = 'Error';
            }
            if (fileList !== 'Error') {
                const newFileName = `${filePath.split('.txt')[0]}${fileList.length}.txt`;
                try {
                    fs_1.default.renameSync(filePath, newFileName);
                    console.log('INFO : Fichier renommé avec succès.');
                    fs_1.default.appendFileSync(newFileName, `Fichier renommé avec succès.\nSuite du fichier au fichier log.txt ou log${fileList.length + 1}.txt`);
                }
                catch (err) {
                    console.error('ERROR : Erreur lors du renommage ou écriture dans le fichier de log : ', err);
                }
            }
        }
    }
    catch (err) {
        console.error('ERROR : Erreur lors de la récupération de la taille du fichier : ', err);
    }
    // Écrire dans le fichier log.txt
    const previousStr = `[${UnitTime_1.Time.TODAY.toLocaleDateString()} - ${UnitTime_1.Time.TODAY.toLocaleTimeString()}] `;
    UnitTime_1.Time.DAY;
    console.log(previousStr + str);
    try {
        fs_1.default.appendFileSync(filePath, previousStr + str + '\n');
    }
    catch (error) {
        console.error('ERROR : Impossible d\'écrire dans le fichier log... ', error);
    }
}
