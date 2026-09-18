"""
Régénère HelldiversStratagems.ts depuis helldivers.wiki.gg.

À lancer depuis la racine du dépôt :

    python3 src/hdfr/src/sub_games/src/stratagems/scrap_stratagem.py

Les données viennent de l'export Cargo de la table `Stratagems` du wiki (données
structurées), et non plus du parsing du HTML de la page : la page transclut désormais
ses tableaux via {{Stratagem Table|<type>}}, il n'y a plus rien à scraper.

Le script est idempotent : relancé sans changement côté wiki, il réécrit le fichier
à l'identique.

Deux informations ne viennent PAS du wiki et sont reprises telles quelles dans le
fichier existant :

- le **nom français**, fourni par stratagems_translation.py ;
- l'**URL d'icône**, qui pointe vers le CDN emoji Discord. Les icônes du wiki sont
  en SVG, que Discord n'affiche pas dans un embed ; les URLs déjà en place sont donc
  conservées, et un nouveau stratagème repart de l'icône du wiki en attendant qu'un
  emoji lui soit créé (cf. tools/wiki/).
"""

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from stratagems_translation import stratagems_translation

CARGO_URL = (
    "https://helldivers.wiki.gg/index.php?title=Special:CargoExport"
    "&tables=Stratagems"
    "&fields=title%3Dtitle%2Cstratagem_type%3Dtype%2Cstratagem_code%3Dcode%2Cimage%3Dimage"
    "&limit=500&format=json"
)

OUTPUT = Path("src/hdfr/src/sub_games/src/stratagems/HelldiversStratagems.ts")

# Le wiki classe par type ; le bot classe avec les mêmes libellés que
# src/hdfr/wikiContents/Stratagèmes/, en séparant sentinelles et emplacements.
TYPE_TO_CATEGORY = {
    "Orbital": "Orbital",
    "Eagle": "Aigle",
    "Support Weapon": "Soutien",
    "Backpack": "Sac à dos",
    "Vehicle": "Véhicules",
    "Sentry": "Sentinelles",
    "Emplacement": "Emplacements",
    "Ship": "Mission",
    "Objective": "Mission",
    "Other": "Mission",
}

CATEGORY_ORDER = [
    "Orbital",
    "Aigle",
    "Soutien",
    "Sac à dos",
    "Véhicules",
    "Sentinelles",
    "Emplacements",
    "Mission",
]

ARROWS = {"Up": "up", "Down": "down", "Left": "left", "Right": "right"}

HEADER = '''import {ArrowEmojiKey, ArrowEmojis} from "../../../utils/emoji";


export type Stratagems = typeof HelldiversStratagems
export type StratagemCategory = Stratagems[keyof Stratagems];
export type StratagemDetails = readonly [string, readonly ArrowEmojiKey[]];

'''


def fetch_stratagems():
    """Renvoie [(catégorie, nom_fr, url_icone_wiki, [flèches]), ...] dans l'ordre du wiki."""
    request = urllib.request.Request(CARGO_URL, headers={"User-Agent": "hdfr-bot/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        rows = json.load(response)

    def arrows_of(row):
        return tuple(
            ARROWS[a]
            for a in re.findall(r"Stratagem Arrow (Up|Down|Left|Right)\.svg", row["code"] or "")
        )

    # Le wiki liste quelques stratagèmes deux fois sous des noms différents
    # (« Link Hellpods to Destroyer » = « Upload Data ») : le code de flèches fait foi.
    # Quand deux titres partagent un code, on garde celui que la table de traduction
    # connaît, pour ne pas renommer une entrée existante au gré de l'ordre du wiki.
    translated = {
        arrows_of(row)
        for row in rows
        if stratagems_translation.get(row["title"].upper()) is not None
    }

    seen = set()
    result = []
    for row in rows:
        category = TYPE_TO_CATEGORY.get(row.get("type") or "")
        if category is None:
            # Lignes sans type : ce sont des doublons des fiches d'objectif.
            continue

        name_en = row["title"]
        arrows = arrows_of(row)
        name_fr = stratagems_translation.get(name_en.upper())

        if arrows in seen or (name_fr is None and arrows in translated):
            continue
        seen.add(arrows)

        if name_fr is None:
            print(f"[INFO] Pas de traduction FR pour le stratagème : {name_en}")
            name_fr = name_en.upper()

        image = (row.get("image") or "").replace(" ", "_")
        url = "https://helldivers.wiki.gg/images/" + urllib.parse.quote(image) if image else ""

        result.append((category, name_fr, url, list(arrows)))
    return result


def read_existing():
    """Relit le fichier en place : URLs d'icônes déjà curées, et ordre des entrées.

    Les icônes du CDN Discord ne sont pas déductibles du wiki, et conserver l'ordre
    existant garde les diffs lisibles d'une régénération à l'autre.
    """
    if not OUTPUT.exists():
        return {}, []
    content = OUTPUT.read_text(encoding="utf-8")
    pattern = r'"((?:[^"\\]|\\.)+)": \[\n            "([^"]*)",'
    found = [(m.group(1), m.group(2)) for m in re.finditer(pattern, content)]
    return dict(found), [name for name, _ in found]


def render(stratagems, icons, order):
    rank = {name: index for index, name in enumerate(order)}
    groups = {category: [] for category in CATEGORY_ORDER}
    for category, name_fr, url, arrows in stratagems:
        groups[category].append((name_fr, icons.get(name_fr, url), arrows))
    # Entrées déjà connues dans leur ordre actuel, nouveautés à la suite.
    for entries in groups.values():
        entries.sort(key=lambda e: rank.get(e[0], len(rank)))

    lines = [HEADER, "export const HelldiversStratagems = {\n"]
    for category_index, category in enumerate(CATEGORY_ORDER):
        entries = groups[category]
        lines.append(f'    "{category}": {{\n')
        for entry_index, (name_fr, url, arrows) in enumerate(entries):
            lines.append(f'        "{name_fr}": [\n')
            lines.append(f'            "{url}",\n')
            lines.append("            [\n")
            lines.append(",\n".join(f"                ArrowEmojis.{a}" for a in arrows))
            lines.append("\n            ]\n")
            lines.append("        ]%s\n" % ("," if entry_index < len(entries) - 1 else ""))
        lines.append("    }%s\n" % ("," if category_index < len(CATEGORY_ORDER) - 1 else ""))
    lines.append("} as const;\n")
    return "".join(lines)


if __name__ == "__main__":
    icons, order = read_existing()
    stratagems = fetch_stratagems()
    OUTPUT.write_text(render(stratagems, icons, order), encoding="utf-8")
    print(f"{len(stratagems)} stratagèmes écrits dans {OUTPUT}")
