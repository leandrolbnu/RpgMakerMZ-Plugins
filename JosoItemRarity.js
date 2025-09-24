/*:
 * @target MZ
 * @plugindesc [v1.0] Item Rarity System: changes item name color based on rarity defined in note tags | By JosoGaming
 *
 * @help
 * ============================================================================
 * ItemRarityColor.js
 * ============================================================================
 *
 * This plugin allows you to define a rarity level for any item, weapon, or
 * armor using a <rarity:TYPE> tag in the note field. Based on the rarity,
 * the item name will be displayed in a specific color in menus.
 *
 * ----------------------------------------------------------------------------
 * 🔧 How to Use:
 * ----------------------------------------------------------------------------
 * - Add the following tag to the note field of your item, weapon, or armor:
 *
 *     <rarity:common>      (White)
 *     <rarity:uncommon>    (Green)
 *     <rarity:rare>        (Aqua)
 *     <rarity:epic>        (Red)
 *     <rarity:legendary>   (Purple)
 *
 * - These keywords are in Portuguese. You may change them in the script logic
 *   if you'd rather use English terms (e.g., "common", "rare", etc.).
 *
 * - Once defined, item names will be rendered in the appropriate color across
 *   all standard item windows (inventory, shop, equipment).
 *
 * ----------------------------------------------------------------------------
 * 🎨 Rarity Colors Used:
 * ----------------------------------------------------------------------------
 * - common     → #FFFFFF (White)
 * - uncommon   → #00FF00 (Green)
 * - rare       → #00FFFF (Aqua)
 * - epic       → #FF0000 (Red)
 * - legendary  → #800080 (Purple)
 *
 * ----------------------------------------------------------------------------
 * 📌 Notes:
 * ----------------------------------------------------------------------------
 * - Works with all default RPG Maker MZ item windows.
 * - If using custom menus, you may need to manually add support.
 * - This plugin uses a lightweight patch to drawItemName for color override.
 * - Does not affect item functionality or other visuals.
 *
 * ============================================================================
 * Author: JosoGaming
 * ============================================================================
 * YouTube: https://www.youtube.com/@JosoGaming
 * Email: leandro.bnu@hotmail.com
 * Contact: Reach out through the channel for inquiries or permission requests.
 *
 * ============================================================================
 * LICENSE
 * ============================================================================
 * This plugin is proprietary and was developed specifically for JosoGaming.
 * Redistribution, modification, or reuse in other projects is strictly forbidden
 * unless you are the original author or have written permission. 
 */

(() => {
  // Mapa de cores por raridade
  function rarityColor(rarity) {
    switch (rarity) {
      case "common": return "#FFFFFF";
      case "uncommon": return "#00FF00";
      case "rare": return "#00FFFF";
      case "epic": return "#FF0000";
      case "legendary": return "#800080";
      default: return "#FFFFFF";
    }
  }

  // Extrai raridade da nota
  function getRarity(object) {
    if (!object || !object.note) return "common";
    const match = object.note.match(/<rarity:(.+?)>/i);
    return match ? match[1].trim().toLowerCase() : "common";
  }

  // Garante que todos os dados tenham .rarity ao carregar
  const _DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function(object) {
    _DataManager_onLoad.call(this, object);
    if ([ $dataItems, $dataWeapons, $dataArmors ].includes(object)) {
      for (const item of object) {
        if (item) item.rarity = getRarity(item);
      }
    }
  };

  // Sobrescreve o desenho do nome do item
  Window_Base.prototype.drawItemName = function(item, x, y, width = 312) {
    if (item) {
      const iconBoxWidth = ImageManager.iconWidth + 4;
      this.resetTextColor();
      this.drawIcon(item.iconIndex, x, y);
      const color = item.rarity ? rarityColor(item.rarity) : this.normalColor();
      this.changeTextColor(color);
      this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
      this.resetTextColor();
    }
  };
})();
