/*:
 * @target MZ
 * @plugindesc [v1.0] Item Rarity System: changes item name color based on 
 * rarity defined in note tags | By JosoGaming
 * @author JosoGaming
 * 
 * @help
 * ============================================================================
 * 🔧 ItemRarityColor – ITEM RARITY SYSTEM
 * ============================================================================
 *
 * Define a rarity level for any item, weapon, or armor using a <rarity:TYPE> tag
 * in the note field. Item names will display in a specific color in menus based
 * on their rarity.
 *
 * ----------------------------------------------------------------------------
 * 🔹 How to Use:
 * ----------------------------------------------------------------------------
 * - Add the following tag to the note field of your item, weapon, or armor:
 *
 *     <rarity:common>      (White)
 *     <rarity:uncommon>    (Green)
 *     <rarity:rare>        (Aqua)
 *     <rarity:epic>        (Red)
 *     <rarity:legendary>   (Purple)
 *
 * - Keywords are in Portuguese by default; can be changed in script logic.
 * - Item names render in the appropriate color across all standard item windows
 *   (inventory, shop, equipment).
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
 * - Compatible with all default RPG Maker MZ item windows.
 * - Custom menus may require manual support.
 * - Uses a lightweight patch to drawItemName for color override.
 * - Does not affect item functionality or other visuals.
 *
 * ============================================================================
 * Author: JosoGaming
 * ============================================================================
 * Email: leandro.bnu@hotmail.com
 * Contact: Reach out through my email for inquiries or permission requests.
 * My Gaming YouTube channel: https://www.youtube.com/@JosoGaming
 * ============================================================================
 * LICENSE
 * ============================================================================
 * This plugin is proprietary and was developed by JosoGaming.
 * Redistribution, modification, or reuse in other projects is strictly forbidden
 * unless you have written permission.
 */

(() => {
  //=============================================================================
  // Item Rarity Color - Maps item rarities to display colors
  //=============================================================================
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

  //=============================================================================
  // Get Rarity - Extracts rarity from the item's note field
  //=============================================================================
  function getRarity(object) {
    if (!object || !object.note) {
      return "common";
    }

    const match = object.note.match(/<rarity:(.+?)>/i);
    return match ? match[1].trim().toLowerCase() : "common";
  }

  //=============================================================================
  // DataManager OnLoad - Ensures all items, weapons, and armors have a .rarity property
  //=============================================================================
  const _DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function(object) {
    _DataManager_onLoad.call(this, object);
   
    if ([ $dataItems, $dataWeapons, $dataArmors ].includes(object)) {
      for (const item of object) {
        if (item) {
          item.rarity = getRarity(item);
        }
      }
    }
  };

  //=============================================================================
  // Window_Base.drawItemName - Draws item names with color based on rarity
  //=============================================================================
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

