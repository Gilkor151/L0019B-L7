import json


def remove_strings_from_properties(data, strings_to_remove):
    for obj in data:
        for prop, strings in strings_to_remove.items():
            for string in strings:
                if prop in obj and string in obj[prop]:
                    obj[prop] = obj[prop].replace(string, '')

# Funktion för att dela upp sträng efter nyrad och lagra i en array
def split_string_into_array(data, properties_to_split):
    for obj in data:
        for prop in properties_to_split:
            if prop in obj:
                obj[prop] = obj[prop].split('\n')

# Funktion för att extrahera fotonummer från fotons namn och generera URL:er
def generate_photo_urls(data):
    for obj in data:
        photo = obj.get('photo', {})
        if isinstance(photo, str):
            continue  # Hoppa över om foto inte är ett objekt
        photo_name = photo.get('name', '')
        parts = photo_name.split(':')
        if len(parts) == 2:
            prefix = parts[0].strip()
            ranges = parts[1].split('-')
            if len(ranges) == 2:
                start_range = parse_range(ranges[0].strip())
                end_range = parse_range(ranges[1].strip())
                urls = [f"{prefix}{num:02d}" for num in range(start_range, end_range + 1)]
                photo['urls'] = urls
            elif len(ranges) == 1:
                num = parse_range(ranges[0].strip())
                photo['urls'] = [f"{prefix}{num:02d}"]

def parse_range(range_str):
    # Kontrollera om intervallet innehåller flera nummer separerade med '+' eller '-'
    if '+' in range_str:
        numbers = range_str.split('+')
    elif '-' in range_str:
        numbers = range_str.split('-')
    else:
        numbers = [range_str]

    # Tolka varje nummer och hantera icke-heltalsdelar
    parsed_numbers = []
    for num in numbers:
        num_parts = num.strip().split('a')  # Dela upp baserat på 'a'
        for part in num_parts:
            try:
                parsed_numbers.append(int(part))
            except ValueError:
                # Hantera icke-heltalsdelar genom att ignorera dem
                pass

    # Returnera summan av tolkade nummer
    return sum(parsed_numbers)


# Öppna den angivna JSON-filen
with open('output.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

strings_to_remove = {
    "description": ["_\nBeskrivning\n", "Beskrivning\n", "_\nBeskrivning "],
    "review": ["Omdöme \n", "Omdöme\n", "Omdöme\t\n", "Omdöme "],
    "action": ["Åtgärdsbehov \n", "Åtgärdsbehov\n"],
    "name": ["Stuga\n"],
    "photo": ["Foto:\n", "Nbm 1995: ", "Nbm 1995 ", "Nbm 1996: ", "Foto: "]
}

remove_strings_from_properties(data, strings_to_remove)

# Ange egenskaper att dela upp i arrayer
properties_to_split = ["description", "review", "action"]

# Dela upp strängar i arrayer för angivna egenskaper
split_string_into_array(data, properties_to_split)

for obj in data:
    # Extrahera namnsträngen
    name_str = obj.get('name', '')

    # Extrahera ID från namnsträngen
    ID = name_str[0:3] if len(name_str) >= 9 else ''

    # Dela upp namnsträngen i namn och plats
    name_parts = name_str.split('\n')
    name = name_parts[0]
    location = name_parts[1] if len(name_parts) > 1 else ''

    # Manipulera fototsträngen om det behövs
    photo_str = obj.get('photo', '')

    # Lägg till ID, namn och plats till objektet
    obj['ID'] = ID
    obj['name'] = name
    obj['location'] = location

    # Ersätt fototegenskapen med ett objekt
    obj['photo'] = {
        'name': photo_str,
        'urls': []
    }

generate_photo_urls(data)

# Skriv den modifierade datan till en ny JSON-fil
with open('modified_output.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=4, ensure_ascii=False)
