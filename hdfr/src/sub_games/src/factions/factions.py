import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://helldivers.wiki.gg"
PAGE_URL = BASE_URL + "/wiki/Factions"

'''HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Referer': 'https://helldivers.wiki.gg'
}'''

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://helldivers.wiki.gg'
})


def extract_enemies_from_table(table):
    enemies = []
    rows = table.find_all("tr")[1:]  # Ignorer l'en-tête
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 4:
            continue
        
        img_href = cols[1].find("a")["href"] if cols[1].find("a") else ""
        img_name = img_href.split(":")[-1] if ":" in img_href else img_href
        
        enemy_a_tag = cols[2].find("a")
        enemy_name = enemy_a_tag.get_text(strip=True) if enemy_a_tag else cols[2].get_text(strip=True)
        enemy_link = BASE_URL + enemy_a_tag["href"] if enemy_a_tag and "href" in enemy_a_tag.attrs else ""

        enemy_desc = cols[3].get_text(strip=True)
        
        enemies.append({
            "name": enemy_name,
            "description": enemy_desc,
            "image": f"{BASE_URL}/images/{img_name}",
            "link": enemy_link
        })
    return enemies

def scrape_enemy_details(enemy_url):
    """Récupère Health, Damage Type, Minimum Difficulty et tableau Parts depuis la page de l'ennemi."""
    try:
        resp = session.get(enemy_url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Santé (Health)
        health_div = soup.find("div", {"data-source": "health"})
        health = health_div.find("div", class_="pi-data-value").get_text(strip=True) if health_div else ""

        # Damage Type
        damage_type_div = soup.find("div", {"data-source": "damage_type"})
        damage_type = damage_type_div.find("div", class_="pi-data-value").get_text(strip=True) if damage_type_div else ""

        # Minimum Difficulty
        min_diff_div = soup.find("div", {"data-source": "min_difficulty"})
        min_difficulty = ""
        if min_diff_div:
            span = min_diff_div.find("span")
            if span:
                min_difficulty = span.get_text(strip=True)
            else:
                min_difficulty = min_diff_div.get_text(strip=True)

        # Tableau des Parts
        parts_table = soup.find("tbody")
        parts_list = []
        if parts_table:
            # Trouver toutes les lignes de parts (après l'en-tête)
            rows = parts_table.find_all("tr")
            if len(rows) > 1:
                header_cols = [th.get_text(strip=True) for th in rows[0].find_all("th")]
                # Cols d’intérêt : Part Name, Health, AV (en supposant que c'est les noms exacts)
                for row in rows[1:]:
                    cols = row.find_all(["td", "th"])
                    if len(cols) < len(header_cols):
                        continue
                    part_info = {}
                    for i, col in enumerate(cols):
                        col_name = header_cols[i]
                        # Pour AV on peut récupérer le texte ou lien si nécessaire
                        value = col.get_text(strip=True)
                        part_info[col_name] = value
                    # Ne garder que les clés demandées
                    part_filtered = {k: part_info[k] for k in ["Part Name", "Health", "AV"] if k in part_info}
                    parts_list.append(part_filtered)

        enemy_details = {
            "health": health,
            "damage_type": damage_type,
            "minimum_difficulty": min_difficulty,
            "parts": parts_list
        }
        return enemy_details

    except Exception as e:
        print(f"Erreur lors du scraping du détail de {enemy_url}: {e}")
        return {}

def parse_factions(soup):
    data = []
    headers = soup.find_all(["h2", "h3"])

    main_faction = None
    sub_factions = {}

    for header in headers:
        tag_name = header.name
        title = header.get_text(strip=True)
        desc_tag = header.find_previous_sibling("p")
        description = desc_tag.get_text(strip=True) if desc_tag else ""

        table = header.find_next_sibling("table")
        if not table:
            continue

        enemies = extract_enemies_from_table(table)

        if tag_name == "h2":
            if main_faction:
                main_faction.update(sub_factions)
                data.append(main_faction)
            main_faction = {
                "name": title,
                "description": description,
                "principal": enemies
            }
            sub_factions = {}
        elif tag_name == "h3" and main_faction is not None:
            sub_factions[title] = enemies

    if main_faction:
        main_faction.update(sub_factions)
        data.append(main_faction)

    return data

def enrich_enemies_with_details(factions_data):
    """Pour chaque ennemi, charge les détails supplémentaires depuis sa page."""
    for faction in factions_data:
        for key in faction:
            if key == "name" or key == "description":
                continue
            enemies_list = faction[key]
            for enemy in enemies_list:
                if enemy.get("link"):
                    details = scrape_enemy_details(enemy["link"])
                    enemy.update(details)
                    time.sleep(1)  # Pour limiter la charge sur le serveur
    return factions_data

def main():
    response = session.get(PAGE_URL)##, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    factions_data = parse_factions(soup)
    factions_data = enrich_enemies_with_details(factions_data)

    with open("helldivers_factions_full_details.json", "w", encoding="utf-8") as f:
        json.dump(factions_data, f, ensure_ascii=False, indent=4)

    print("Scraping complet avec détails ennemis terminé. Fichier: helldivers_factions_full_details.json")

if __name__ == "__main__":
    main()