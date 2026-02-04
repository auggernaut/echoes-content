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
            // Correctly parse the timestamp 2026-02-04T15-33-08-588Z -> 2026-02-04T15:33:08.588Z
            const dateParts = dateStr.split('T');
            const hms = dateParts[1].replace(/-/g, ':').replace(/:([^:]+)$/, '.$1');
            const readableDate = new Date(`${dateParts[0]}T${hms}`).toLocaleString();

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
