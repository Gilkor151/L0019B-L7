import json

with open('input.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Dela upp texten i segment baserat på den första separatorlinjen
segments = text.split("________________________________________________________________________")

# Initiera en lista för att lagra JSON-objekt
data = []

# Bearbeta varje segment
for segment in segments:
    # Dela upp segmentet i delar baserat på den andra separatorlinjen
    parts = segment.split("---------------")

    # Extrahera egenskaperna
    description = parts[0].strip()
    review = parts[1].strip()
    action = parts[2].strip()
    name = parts[3].strip()
    photo = parts[4].strip()

    # Skapa ett dictionary för segmentet
    segment_data = {
        "description": description,
        "review": review,
        "action": action,
        "name": name,
        "photo": photo
    }

    # Lägg till dictionaryn i listan
    data.append(segment_data)

# Skriv JSON-datan till en fil
with open('output.json', 'w', encoding='utf-8') as json_file:
    json.dump(data, json_file, ensure_ascii=False, indent=4)
