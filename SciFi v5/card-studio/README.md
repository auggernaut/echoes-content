# 🎴 SciFi Card Design Studio

The **Card Design Studio** is a real-time, hot-reloading development environment for designing and prototyping physical cards for the Echoes system. It replaces the legacy static script with a faster, interactive workflow.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Physical Installation
Navigate to the `card-studio` directory and install the necessary dependencies:
```bash
cd card-studio
npm install
```

### 3. Run the Studio
Start the development server:
```bash
npm run dev
```
Once started, open your browser to the URL provided in the terminal (usually `http://localhost:5173/`).

## 🛠️ Usage

### Instant Feedback
The studio is configured to watch your Markdown files. Any changes you make to the following directories will reflect **instantly** in the browser:
- `../Character_Decks/*.md` (Standard Poker Cards)
- `../Adventure_Deck/*.md` (Tarot Scale Cards)

### Card Formats

| Format | Physical Size | Cards Per Page | Content |
| :--- | :--- | :--- | :--- |
| **Standard** | 66mm x 91mm | 9 | Character abilities, prompts, and archetypes. |
| **Tarot** | 100mm x 135mm | 4 | Locations, NPCs, Loot, and Threats. |

### Printing to PDF
The studio is optimized for physical production:
1. Open the studio in your browser.
2. Use `Cmd+P` (Mac) or `Ctrl+P` (Windows) to open the Print dialog.
3. Ensure **Margins** are set to "None" or "Minimum" for best results.
4. Set the destination to **Save as PDF**.
5. The layout uses **zero-gap shared cutting lines** for easier physical trimming.

## 📁 Project Structure

- `main.js`: Core logic for parsing Markdown and rendering the HTML layout.
- `style.css`: Professional print-optimized CSS with shared cutting borders.
- `vite.config.js`: Configuration for the real-time glob-import engine.

## ✨ Features
- **Markdown Support**: Supports **bold**, *italics*, and structured lists.
- **Auto-Tagging**: NPC and Location tags are automatically styled and positioned.
- **Section Headers**: Clean, formatted headers for "Front", "Back", and "GM Detail".
- **Echoes Branding**: Consistent visual language across all card types.
