import os
import re
import glob

# Configuration
INPUT_DIR_CHAR = "Character_Decks"
INPUT_DIR_ADV = "Adventure_Deck"
OUTPUT_FILE = "printable_cards.html"

# CSS for Print
CSS = """
@page { size: auto; margin: 0; }
body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f0f0f0; }
.page { 
    width: 210mm; height: 297mm; /* Default to A4 for screen */
    padding: 2mm; margin: 10mm auto; 
    background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);
    display: grid; 
    grid-template-columns: repeat(3, 63.5mm); /* Standard Poker Width */
    grid-template-rows: repeat(3, 88.9mm);    /* Standard Poker Height */
    justify-content: center;
    align-content: flex-start;
    page-break-after: always;
}
.page.tarot {
    grid-template-columns: repeat(2, 95mm); 
    grid-template-rows: repeat(2, 135mm);
}
.card {
    width: 100%; height: 100%;
    border: 1px solid #ccc;
    box-sizing: border-box;
    padding: 10px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.card.blue { border: 4px solid #0056b3; }
.card.red { border: 4px solid #b30000; }

.card-header { font-weight: bold; font-size: 1.2em; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
.card-meta { font-size: 0.7em; color: #666; font-weight: bold; margin-bottom: 5px; }
.card-tags { font-size: 0.65em; font-style: italic; color: #444; margin-bottom: 10px; }
.card-content { font-size: 0.8em; flex-grow: 1; line-height: 1.3; }
.card-quote { font-style: italic; font-size: 0.7em; border-left: 2px solid #ddd; padding-left: 5px; margin: 10px 0; color: #555; }
.card-footer { font-size: 0.6em; margin-top: auto; padding-top: 5px; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
.card-archetype { font-weight: bold; color: #0056b3; text-transform: uppercase; letter-spacing: 1px; }

@media print {
    body { background: none; }
    .page { margin: 0; box-shadow: none; width: 100%; height: auto; padding: 2mm; overflow: visible; }
}
"""

def md_to_html(text):
    # Bold: **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Italics: *text*
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    return text

def strip_bullet(line):
    # Only strip the leading bullet and spaces
    return re.sub(r'^\s*[\*\-\+]\s+', '', line)

def parse_character_cards(text, archetype):
    cards = []
    # Find all ## Card Name
    sections = re.split(r'\n##\s+', text)
    if len(sections) < 2: return []
    
    for section in sections[1:]:
        lines = section.strip().split('\n')
        name = lines[0].strip()
        
        meta = ""
        tags = ""
        quote = ""
        content_lines = []
        narrative_lines = []
        
        in_narrative = False
        
        for line in lines[1:]:
            clean_line = line.strip()
            if clean_line.startswith('**🔵 CHARACTER'):
                meta = md_to_html(clean_line.replace('CHARACTER • ', '').strip('* '))
            elif clean_line.startswith('**Tags**:'):
                tags = clean_line.replace('**Tags**:', '').strip()
            elif clean_line.startswith('**Health**:'):
                meta += f" | {md_to_html(clean_line.strip())}"
            elif clean_line.startswith('>'):
                quote = md_to_html(clean_line.strip('> "'))
            elif clean_line.startswith('**Narrative Prompts**:'):
                in_narrative = True
            elif in_narrative and (clean_line.startswith('*') or clean_line.startswith('-')):
                if clean_line.startswith('---'): 
                    in_narrative = False # Horizontal rule ends the card or section
                    continue
                narrative_lines.append(md_to_html(strip_bullet(line)))
            elif clean_line:
                if in_narrative: in_narrative = False # Reset if we hit plain text after prompts
                content_lines.append(md_to_html(clean_line))
        
        cards.append({
            'name': name,
            'meta': meta,
            'tags': tags,
            'content': " ".join(content_lines),
            'quote': quote,
            'narrative': narrative_lines,
            'type': 'blue',
            'archetype': archetype
        })
    return cards

def parse_adventure_cards(text, filename):
    cards = []
    sections = re.split(r'\n##\s+', text)
    if len(sections) < 2: return []
    
    # Fallback type from filename
    fallback_type = os.path.basename(filename).replace('.md', '').rstrip('s')
    if fallback_type == "Loot": fallback_type = "Item"
    
    for section in sections[1:]:
        lines = section.strip().split('\n')
        name = lines[0].strip()
        
        tags = ""
        front_desc = ""
        back_detail = []
        card_type = fallback_type
        
        mode = 'FRONT'
        
        for line in lines[1:]:
            clean_line = line.strip()
            if '🔴' in clean_line and '[' in clean_line and ']' in clean_line:
                match = re.search(r'\[(.*?)\]', clean_line)
                if match: card_type = match.group(1).title()
            elif clean_line.startswith('**Tags:**'):
                tags = clean_line.replace('**Tags:**', '').strip()
            elif line.startswith('* ') or line.startswith('- ') or line.startswith('    *') or line.startswith('    -') or clean_line.startswith('**Back**'):
                mode = 'BACK'
                # Count leading spaces to determine indentation level
                indent = len(line) - len(line.lstrip())
                level = indent // 4
                content = md_to_html(strip_bullet(line))
                back_detail.append({'level': level, 'content': content})
            elif clean_line:
                if clean_line.startswith('---'): continue
                if mode == 'FRONT':
                    newline = "<br><br>" if "Image:" in clean_line else "<br>"
                    front_desc += md_to_html(clean_line) + newline
                else:
                    back_detail.append({'level': 0, 'content': md_to_html(clean_line)})
                
        cards.append({
            'name': name,
            'tags': tags,
            'front': front_desc.rstrip('<br> '),
            'back': back_detail,
            'type': 'red',
            'card_type': card_type
        })
    return cards

def generate_html():
    all_standard_cards = []
    all_tarot_cards = []
    
    # Process Character Decks
    for filepath in glob.glob(os.path.join(INPUT_DIR_CHAR, "*.md")):
        archetype = os.path.basename(filepath).replace('.md', '')
        with open(filepath, 'r') as f:
            all_standard_cards.extend(parse_character_cards(f.read(), archetype))
            
    # Process Adventure Decks (Threats, Loot, Locations)
    for filepath in glob.glob(os.path.join(INPUT_DIR_ADV, "*.md")):
        with open(filepath, 'r') as f:
            all_tarot_cards.extend(parse_adventure_cards(f.read(), filepath))

    html = f"<html><head><style>{CSS}</style></head><body>"
    
    # Render Standard Cards
    for i in range(0, len(all_standard_cards), 9):
        html += '<div class="page">'
        for card in all_standard_cards[i:i+9]:
            narrative_html = "".join([f"<li>{n}</li>" for n in card['narrative']])
            html += f"""
            <div class="card {card['type']}">
                <div class="card-header">{card['name']}</div>
                <div class="card-meta">{card['meta']}</div>
                <div class="card-tags">{card['tags']}</div>
                <div class="card-content">
                    {card['content']}
                    <div class="card-quote">"{card['quote']}"</div>
                    <ul style="padding-left:15px; margin:5px 0;">{narrative_html}</ul>
                </div>
                <div class="card-footer">
                    <span>{card['archetype'][:3].upper()}-000</span>
                    <span class="card-archetype">{card['archetype']}</span>
                </div>
            </div>
            """
        html += '</div>'
        
    # Render Tarot Cards
    for i in range(0, len(all_tarot_cards), 4):
        html += '<div class="page tarot">'
        for card in all_tarot_cards[i:i+4]:
            back_html = ""
            if card['back']:
                min_level = min([b['level'] for b in card['back']])
                current_ptr_level = min_level
                back_html += '<ul style="padding-left:15px; margin:5px 0;">'
                active_levels = 1
                
                for item in card['back']:
                    level = item['level']
                    while current_ptr_level < level:
                        back_html += '<ul style="padding-left:15px; margin:2px 0;">'
                        current_ptr_level += 1
                        active_levels += 1
                    while current_ptr_level > level:
                        back_html += '</ul>'
                        current_ptr_level -= 1
                        active_levels -= 1
                    
                    if item['content'] == "<b>Back</b>":
                        # Render as a header without a bullet
                        back_html += f"<div style='margin: 8px 0 4px -15px; border-bottom: 1px solid #eee; padding-bottom: 2px;'>{item['content']}</div>"
                    else:
                        back_html += f"<li>{item['content']}</li>"
                
                while active_levels > 0:
                    back_html += '</ul>'
                    active_levels -= 1

            html += f"""
            <div class="card {card['type']}">
                <div class="card-header">{card['name']}</div>
                <div class="card-tags">{card['tags']}</div>
                <div class="card-content">
                    {card['front']}<br><br>
                    {back_html}
                </div>
                <div class="card-footer" style="border-top: 1px solid #ffcccc;">
                    <span style="color: #b30000;">ADV-000</span>
                    <span class="card-archetype" style="color: #b30000;">{card['card_type']}</span>
                </div>
            </div>
            """
        html += '</div>'
        
    html += "</body></html>"
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write(html)
    print(f"Generated {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_html()
