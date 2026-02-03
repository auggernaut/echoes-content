import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true
});

const cardContainer = document.getElementById('card-container');
const refreshBtn = document.getElementById('refresh-btn');

// Use Vite's glob import to get all markdown files from the project root
// Use ?raw to get the text content of the markdown files
const charDecks = import.meta.glob('../Character_Decks/*.md', { query: '?raw', eager: true });
const advDecks = import.meta.glob('../Adventure_Deck/*.md', { query: '?raw', eager: true });

async function loadDecks() {
    cardContainer.innerHTML = 'Loading decks...';

    let allCards = [];

    // Process Character Decks
    for (const path in charDecks) {
        try {
            const text = charDecks[path].default;
            const fileName = path.split('/').pop();
            const cards = parseCharacterCards(text, fileName.replace('.md', ''));
            allCards = allCards.concat(cards);
        } catch (e) {
            console.error(`Failed to load char deck: ${path}`, e);
        }
    }

    // Process Adventure Decks
    for (const path in advDecks) {
        try {
            const text = advDecks[path].default;
            const fileName = path.split('/').pop();
            const cards = parseAdventureCards(text, fileName);
            allCards = allCards.concat(cards);
        } catch (e) {
            console.error(`Failed to load adventure deck: ${path}`, e);
        }
    }

    renderCards(allCards);
}

function parseCharacterCards(text, archetype) {
    const cards = [];
    const sections = text.split(/\n##\s+/);
    if (sections.length < 2) return [];

    for (let i = 1; i < sections.length; i++) {
        const lines = sections[i].trim().split('\n');
        const name = lines[0].trim();

        let meta = "";
        let tags = "";
        let quote = "";
        let contentLines = [];
        let narrativeLines = [];
        let inNarrative = false;

        for (let j = 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line.startsWith('**🔵 CHARACTER')) {
                meta = line.replace('CHARACTER • ', '').replace(/\*/g, '').trim();
            } else if (line.startsWith('**Tags**:')) {
                tags = line.replace('**Tags**:', '').trim();
            } else if (line.startsWith('**Health**:')) {
                meta += `<br>${line.replace(/\*/g, '').trim()}`;
            } else if (line.startsWith('>')) {
                quote = line.replace(/^>\s+"?|"$/g, '').trim();
            } else if (line.startsWith('**Narrative Prompts**:')) {
                inNarrative = true;
            } else if (inNarrative && (line.startsWith('*') || line.startsWith('-'))) {
                if (line.startsWith('---')) { inNarrative = false; continue; }
                narrativeLines.push(line.replace(/^[\*\-\s]+/, ''));
            } else if (line) {
                if (inNarrative) inNarrative = false;
                contentLines.push(line);
            }
        }

        cards.push({
            name, meta, tags, quote,
            content: contentLines.join(' '),
            narrative: narrativeLines,
            type: 'blue',
            archetype: archetype,
            format: 'standard'
        });
    }
    return cards;
}

function parseAdventureCards(text, filename) {
    const cards = [];
    const sections = text.split(/\n##\s+/);
    if (sections.length < 2) return [];

    let fallbackType = filename.replace('.md', '').replace(/s$/, '');
    if (fallbackType === 'Loot') fallbackType = 'Item';

    for (let i = 1; i < sections.length; i++) {
        const lines = sections[i].trim().split('\n');
        const name = lines[0].trim();

        let tags = "";
        let frontDesc = "";
        let backDetail = [];
        let cardType = fallbackType;
        let mode = 'FRONT';

        for (let j = 1; j < lines.length; j++) {
            const line = lines[j].trim();
            const rawLine = lines[j];

            if (line.includes('🔴') && line.includes('[') && line.includes(']')) {
                const match = line.match(/\[(.*?)\]/);
                if (match) cardType = match[1];
            } else if (line.startsWith('**Tags:**')) {
                tags = line.replace('**Tags:**', '').trim();
            } else if (line.startsWith('**Front**')) {
                // Skip - let renderer handle header
                continue;
            } else if (line.startsWith('**Back**')) {
                mode = 'BACK';
                backDetail.push({ level: 0, content: 'Back' });
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                mode = 'BACK';
                const indent = rawLine.length - rawLine.trimStart().length;
                const level = Math.floor(indent / 4);
                backDetail.push({ level, content: line.replace(/^[\*\-\s]+?\s*/, '') });
            } else if (line && !line.startsWith('---')) {
                if (mode === 'FRONT') {
                    frontDesc += md.renderInline(line) + "<br>";
                } else {
                    const indent = rawLine.length - rawLine.trimStart().length;
                    const level = Math.floor(indent / 4);
                    backDetail.push({ level, content: line });
                }
            }
        }

        cards.push({
            name, tags,
            front: frontDesc.replace(/(<br>)+$/, ''),
            back: backDetail,
            type: 'red',
            cardType,
            format: 'tarot'
        });
    }
    return cards;
}

function renderCards(cards) {
    cardContainer.innerHTML = '';

    // Group into pages
    const standardCards = cards.filter(c => c.format === 'standard');
    const tarotCards = cards.filter(c => c.format === 'tarot');

    // Render Standard Pages
    for (let i = 0; i < standardCards.length; i += 9) {
        const page = document.createElement('div');
        page.className = 'page';
        const chunk = standardCards.slice(i, i + 9);

        chunk.forEach(card => {
            const div = document.createElement('div');
            div.className = `card ${card.type}`;
            div.innerHTML = `
                <div class="card-header">${card.name}</div>
                <div class="card-meta">${card.meta}</div>
                <div class="card-tags">${card.tags}</div>
                <div class="card-content">
                    ${md.renderInline(card.content)}
                    <div class="card-quote">"${card.quote}"</div>
                    <ul style="padding-left:15px; margin:5px 0;">
                        ${card.narrative.map(n => `<li>${md.renderInline(n)}</li>`).join('')}
                    </ul>
                </div>
                <div class="card-footer">
                    <span>${card.archetype.substring(0, 3).toUpperCase()}-000</span>
                    <span class="card-archetype">${card.archetype}</span>
                </div>
            `;
            page.appendChild(div);
        });
        cardContainer.appendChild(page);
    }

    // Render Tarot Pages
    for (let i = 0; i < tarotCards.length; i += 4) {
        const page = document.createElement('div');
        page.className = 'page tarot';
        const chunk = tarotCards.slice(i, i + 4);

        chunk.forEach(card => {
            const div = document.createElement('div');
            div.className = `card ${card.type} tarot`;

            let backHtml = '<ul style="padding-left:15px; margin:5px 0;">';
            let currentLevel = 0;

            card.back.forEach(item => {
                while (currentLevel < item.level) {
                    backHtml += '<ul style="padding-left:15px; margin:2px 0;">';
                    currentLevel++;
                }
                while (currentLevel > item.level) {
                    backHtml += '</ul>';
                    currentLevel--;
                }

                const cleanContent = item.content.trim().replace(/^\*\*|\*\*$/g, '').replace(/:$/, '');
                if (cleanContent === "Back" || cleanContent === "GM Detail") {
                    backHtml += `<div style="margin: 12px 0 4px -15px; border-bottom: 1px solid #eee; padding-bottom: 2px;"><b>Back</b></div>`;
                } else if (item.content.startsWith('**') && item.content.endsWith('**:')) {
                    // It's a header like **Sensory:** or **Features:**
                    backHtml += `<div style="margin: 8px 0 4px -15px; font-size: 0.9em; border-bottom: 1px solid #f9f9f9;"><b>${cleanContent}</b></div>`;
                } else {
                    backHtml += `<li>${md.renderInline(item.content)}</li>`;
                }
            });
            while (currentLevel > 0) { backHtml += '</ul>'; currentLevel--; }
            backHtml += '</ul>';

            div.innerHTML = `
                <div class="card-header">${card.name}</div>
                <div class="card-tags">${card.tags}</div>
                <div class="card-content">
                    <div style="margin-bottom:4px;"><b>Front</b></div>
                    <hr style="border:0; border-top:1px solid #eee; margin:0 0 10px 0;">
                    ${card.front}<br><br>
                    ${backHtml}
                </div>
                <div class="card-footer" style="border-top: 1px solid #ffcccc;">
                    <span style="color: #b30000;">ADV-000</span>
                    <span class="card-archetype" style="color: #b30000;">${card.cardType}</span>
                </div>
            `;
            page.appendChild(div);
        });
        cardContainer.appendChild(page);
    }
}

refreshBtn.addEventListener('click', () => window.location.reload());
loadDecks();
