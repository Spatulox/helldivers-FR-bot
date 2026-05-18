import requests
from bs4 import BeautifulSoup
import json
import re
from stratagems_translation import stratagems_translation


# Exemple d'URL à scraper (à adapter selon votre besoin)
url = 'https://helldivers.wiki.gg/wiki/Stratagems'

arrow_map = {
    'Up Arrow.png': 'ArrowEmojis.up',
    'Right Arrow.png': 'ArrowEmojis.right',
    'Down Arrow.png': 'ArrowEmojis.down',
    'Left Arrow.png': 'ArrowEmojis.left'
}

def scrape_stratagems(section_name):
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, 'html.parser')
    results = {}

    th_elements = soup.find_all('th', rowspan=True)
    for th in th_elements:

        th_text = th.get_text(strip=True)
        a_titles = [a['title'] for a in th.find_all('a', title=True)]

        if (th_text == section_name or section_name in a_titles) and int(th['rowspan']) >= 2:
            parent_table = th.find_parent('table')
            trs = parent_table.find_all('tr')

            for idx, tr in enumerate(trs):
                if th in tr.contents:
                    start_idx = idx
                    break

            for tr in trs[start_idx : start_idx + int(th['rowspan'])]:
                tds = tr.find_all('td')
                if not tds:
                    continue

                img_tag = tds[0].find('a', class_='image').find('img')
                img_src = img_tag['src']
                filename = img_src.split('/')[-1].split('?')[0]  # Extrait "50px-Orbital_Gatling_Barrage_Stratagem_Icon.png?..."
                if 'px-' in filename:
                    img_name = filename.split('px-')[1]
                else:
                    img_name = filename
                img_url = f'https://helldivers.wiki.gg/images/{img_name}'

                name_a = tds[1].find('a', title=True)
                strat_name_en = name_a.get_text(strip=True)
                strat_name_fr = stratagems_translation.get(strat_name_en.upper())

                if strat_name_fr is None:
                    print(f"[INFO] Pas de traduction FR pour le stratagème : {strat_name_en}")
                    strat_name_fr = strat_name_en
                
                code_imgs = tds[2].find_all('img', alt=True)
                codes = []
                for img in code_imgs:
                    alt_text = img['alt']
                    # Mapper le alt_text en ArrowEmojis
                    if alt_text in arrow_map:
                        codes.append(arrow_map[alt_text])
                    else:
                        codes.append(f'UnknownArrow("{alt_text}")')

                key_name = strat_name_fr.upper()
                results[key_name] = [img_url, codes]

    return results

section = ["Patriotic Administration Center", "Orbital Cannons", "Hangar", "Bridge", "Engineering Bay", "Robotics Workshop", "Warbonds", "Common", "Objectives"]
all_stratagems = {}

for string in section:
    all_stratagems[string] = scrape_stratagems(string)


json_str = json.dumps(all_stratagems, indent=4, ensure_ascii=False)
json_str = re.sub(r'"(ArrowEmojis\.\w+)"', r'\1', json_str)
import_statement = '''import { ArrowEmojis, ArrowEmojiKey } from "../../utils/other/emoji";

export type Stratagems = typeof HelldiversStratagems
export type StratagemCategory = Stratagems[keyof Stratagems];
export type StratagemDetails = readonly [string, readonly ArrowEmojiKey[]];

'''
ts_content = f"{import_statement}export const HelldiversStratagems = {json_str} as const;\n"
with open('src/sub_games/src/HelldiversStratagems.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)
