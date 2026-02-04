const snapshotContainer = document.getElementById('snapshot-container');

async function loadSnapshots() {
    try {
        const response = await fetch('/api/snapshots');
        const snapshots = await response.json();

        if (snapshots.length === 0) {
            snapshotContainer.innerHTML = '<div style="padding: 20px; color: #888;">No snapshots found. Export some cards from the studio first!</div>';
            return;
        }

        snapshotContainer.innerHTML = '';
        snapshots.forEach(filename => {
            const dateStr = filename.replace('scifi-cards-snapshot-', '').replace('.html', '');
            const readableDate = new Date(dateStr.replace(/-/g, ':').replace(/T(\d+)-(\d+)-(\d+)-(\d+)/, 'T$1:$2:$3.$4Z')).toLocaleString();

            const card = document.createElement('div');
            card.className = 'snapshot-card';
            card.onclick = () => window.open(`/exports/${filename}`, '_blank');

            card.innerHTML = `
                <div class="snapshot-card-iframe-container" style="height: 400px; overflow: hidden; background: #1a1a1a;">
                    <iframe class="snapshot-preview" src="/exports/${filename}"></iframe>
                </div>
                <div class="snapshot-info">
                    <div class="snapshot-name">${filename}</div>
                    <div class="snapshot-date">${readableDate}</div>
                </div>
            `;
            snapshotContainer.appendChild(card);
        });
    } catch (err) {
        console.error('Failed to load snapshots:', err);
        snapshotContainer.innerHTML = `<div style="padding: 20px; color: #ff5555;">Error loading snapshots: ${err.message}</div>`;
    }
}

loadSnapshots();
