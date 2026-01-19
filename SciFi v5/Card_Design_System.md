# 🎴 SciFi v5 Card Design System

## Core Concept
This card design transforms the game into a **Deck-Builder ARPG**. Players have a limited **Loadout Capacity (LP)** (e.g., 10 Points). They must build a deck of Items and Abilities whose total Cost ≤ Capacity. 

This incentivizes buying **Booster Packs** to find cards with **Lower Cost** (Efficiency) or **Better Tags** (Synergy) to optimize their build.

---

## 📐 Card layout (Text Format)

Every card in the system will follow this standardized block structure.

```text
[COST ICON] [CARD NAME]                                    [SET ICON]
---------------------------------------------------------------------
[TYPE] • [SUB-TYPE] • [RARITY]
---------------------------------------------------------------------
[TAGS]: [Tag_1], [Tag_2], [Faction]

[IMAGE / ILLUSTRATION PLACEHOLDER]

**[Effect Name]**: 
The rules text describing what the card does.
Highlights include **Keywords** and **Dice mechanics**.

---------------------------------------------------------------------
"Flavor text describing the world or character."
---------------------------------------------------------------------
[COLLECTION ID]                            [ARTIST CREDIT]
```

---

## 🔍 The Anatomy Explained

### 1. 💎 Cost (Loadout Points - LP)
*   **Location**: Top Left / Top Right.
*   **Purpose**: The primary balancing knob.
*   **Values**:
    *   **0 LP**: Basic skills (Punch, Run). Weak but free.
    *   **1-2 LP**: Standard reliable gear (Pistol, Wrench).
    *   **3-4 LP**: Strong powers (Turret, Heavy Armor).
    *   **5+ LP**: "Ultimate" moves.
*   **Sales Mechanic**: Players hunt for "Efficient" versions. A Common Pistol costs 2 LP. A **Rare Pistol** costs 1 LP but does the same damage. This frees up space for more gear.

### 2. 🏷️ Tags & Factions (Synergy)
*   **Location**: Under the Type line.
*   **Examples**: `[Void Corp]`, `[Thermal]`, `[Heavy]`, `[Cyber]`.
*   **Purpose**: Encourages collecting "Sets".
*   **Sales Mechanic**: "I need one more `[Void Corp]` card to activate my Suit's set bonus!"

### 3. ✨ Rarity (Collection Status)
*   **Location**: Next to Type.
*   **Tiers**:
    *   ⚪ **Common**: Basic, reliable, high LP cost.
    *   🟢 **Uncommon**: Specialized, niche use.
    *   🔵 **Rare**: Highly efficient (Low LP) or strong stats.
    *   🟣 **Epic**: Unique effects that break standard rules.
    *   🟠 **Legendary**: "Golden Ticket" items. Only 1 allowed per deck.

---

## 🖼️ Examples

### Example 1: The "Starter" Card (Inefficient)
```text
💎3  |  EMERGENCY OVERRIDE                                  🛠️
---------------------------------------------------------------------
DEFENSE • TECH • ⚪ COMMON
---------------------------------------------------------------------
[TAGS]: [Engineering], [Improvised]

**Bypass**: 
When a hazard causes a Strike, roll a d6. 
On a 4+, you negate the Strike.

---------------------------------------------------------------------
"I can fix it, but it's gonna be ugly."
---------------------------------------------------------------------
CORE-005
```

### Example 2: The "Chase" Card (Efficient Upgrade)
*Players buy packs to replace the card above with this one.*

```text
💎2  |  SYSTEMS BACKDOOR                                    🌌
---------------------------------------------------------------------
DEFENSE • TECH • 🔵 RARE
---------------------------------------------------------------------
[TAGS]: [Engineering], [Void Corp], [Cyber]

**Root Access**: 
When a hazard causes a Strike, roll a d6. 
On a 3+, you negate the Strike.
**Set Bonus (Void Corp)**: If you have 2 other [Void Corp] cards, 
you also heal 1 Health.

---------------------------------------------------------------------
"Standard protocols are for people who don't know the password."
---------------------------------------------------------------------
EXP1-042
```

### Example 3: The "Trash to Treasure" Component
*A common card that is useless on its own but powerful for fusion.*

```text
💎1  |  SPENT URANIUM CELL                                  ☢️
---------------------------------------------------------------------
ITEM • COMPONENT • ⚪ COMMON
---------------------------------------------------------------------
[TAGS]: [Radioactive], [Fuel]

**Unstable**: 
This card does nothing on its own.
**Refuel**: Discard this card to recharge a [Heavy Weapon] or 
power a [Reactor] ability instantly.

---------------------------------------------------------------------
"Warm to the touch. Probably not safe."
---------------------------------------------------------------------
JUN-088
```
