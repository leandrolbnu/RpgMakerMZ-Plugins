/*:
 * @target MZ
 * @plugindesc [v1.3] 14-Slot Equipment System: Adds 14 customizable equip 
 * slots using standard etypeId | By JosoGaming
 * @author JosoGaming
 *
 * @help
 * ============================================================================
 * 🔧 JosoCustomEquipSlots – 14-SLOT EQUIPMENT SYSTEM
 * ============================================================================
 *
 * Redefines the equipment slots for actors, allowing for **14 different equip types**
 * using the standard RPG Maker MZ etypeId system.
 *
 * Supports all default features: optimize, clear, equip, unequip.
 *
 * ----------------------------------------------------------------------------
 * 🔹 How to Use:
 * ----------------------------------------------------------------------------
 * 1. Go to your database → Types → Equipment Types.
 * 2. Define etypeIds (in this order):
 *
 *     1  → Weapon
 *     2  → Shield (optional)
 *     3  → Head
 *     4  → Necklace
 *     5  → Shoulderpads
 *     6  → Cloak
 *     7  → Chest
 *     8  → Bracelet
 *     9  → Gloves
 *     10 → Belt
 *     11 → Legs
 *     12 → Boots
 *     13 → Ring
 *     14 → Relic
 *
 * 3. Assign weapons/armors to the appropriate etypeId.
 * 4. Actors will automatically use all 14 slots in order.
 *
 * ----------------------------------------------------------------------------
 * 🧩 Slot Order:
 * ----------------------------------------------------------------------------
 * - Weapon 1           → etypeId 1
 * - Weapon 2 / Shield  → etypeId 1
 * - Head               → etypeId 3
 * - Necklace           → etypeId 4
 * - Shoulderpads       → etypeId 5
 * - Cloak              → etypeId 6
 * - Chest              → etypeId 7
 * - Bracelet           → etypeId 8
 * - Gloves             → etypeId 9
 * - Belt               → etypeId 10
 * - Legs               → etypeId 11
 * - Boots              → etypeId 12
 * - Ring               → etypeId 13
 * - Relic              → etypeId 14
 *
 * ----------------------------------------------------------------------------
 * 📌 Notes:
 * ----------------------------------------------------------------------------
 * - Fully compatible with default RPG Maker MZ equipment scenes.
 * - Uses native etypeId system, no special tags needed.
 * - Second weapon slot uses etypeId 1, allowing dual wielding.
 * - No new UI windows added — only affects slot structure.
 * - Visual separation (colors, etc.) can be combined with other plugins.
 *
 * ----------------------------------------------------------------------------
 * 🚫 Plugin Commands:
 * ----------------------------------------------------------------------------
 * This plugin does not use plugin commands.
 *
 * ============================================================================
 * Author: JosoGaming
 * ============================================================================
 * Email: leandro.bnu@hotmail.com
 * Contact: Reach out through the my email for inquiries or permission requests.
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
  // Custom Equip Slots - Defines and manages extended equipment slot system
  //=============================================================================

  const CUSTOM_EQUIP_SLOTS = [
      1,  // Weapon 1 
      1,  // Weapon 2 / Shield 
      3,  // Head
      4,  // Necklace
      5,  // Shoulderpads
      6,  // Cloak
      7,  // Chest
      8,  // Bracelet
      9,  // Gloves
      10, // Belt
      11, // Legs
      12, // Boots
      13, // Ring
      14  // Relic
  ];
  
  //=============================================================================
  // Game_Actor - Overrides equipment slot behavior for custom slot configuration
  //=============================================================================
  Game_Actor.prototype.equipSlots = function() {
      return CUSTOM_EQUIP_SLOTS.slice();
  };

  //=============================================================================
  // Slot Names - Provides readable names for each equipment slot
  //=============================================================================
  const SLOT_NAMES = [
      "Weapon 1",
      "Weapon 2 / Shield",
      "Head",
      "Necklace",
      "Shoulderpads",
      "Cloak",
      "Chest",
      "Bracelet",
      "Gloves",
      "Belt",
      "Legs",
      "Boots",
      "Ring",
      "Relic"
  ];

  //=============================================================================
  // Window_EquipSlot - Displays custom slot names in equipment menu
  //=============================================================================
  Window_EquipSlot.prototype.slotName = function(index) {
      return SLOT_NAMES[index] || "Unknown";
  };
  
  Game_Actor.prototype.maxSlots = function() {
      return SLOT_SYMBOLS.length;
  };

  //=============================================================================
  // Game_Actor.canEquip - Validates if an item can be equipped by the actor
  //=============================================================================
  const _Game_Actor_canEquip = Game_Actor.prototype.canEquip;
  Game_Actor.prototype.canEquip = function(item) {
      if (!item) {
        return true;
      }

      return _Game_Actor_canEquip.call(this, item);
  };

  //=============================================================================
  // Game_Actor.isEquipChangeOk - Checks if an item fits the intended slot
  //=============================================================================
  Game_Actor.prototype.isEquipChangeOk = function(slotId, item) {
      if (!item) {
        return true;
      }
      
      const slotSymbol = this.equipSlots()[slotId];
      const etypeIdMap = {
          'weapon': 1,
          'shield': 2,
          'head': 3,
          'body': 4,
          'accessory': 5
      };
      
      const slotEtypeId = etypeIdMap[slotSymbol] || 5;
      return item.etypeId === slotEtypeId;
  };

  //=============================================================================
  // Game_Actor.optimizeEquip - Automatically equips best available items
  //=============================================================================
  Game_Actor.prototype.optimizeEquip = function() {
      const slots = this.equipSlots();
      for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          const best = this.bestEquipItem(slot);
          this.changeEquip(i, best);
      }
  };

  //=============================================================================
  // Game_Actor.evalEquipItem - Evaluates item stats for optimization
  //=============================================================================
  Game_Actor.prototype.evalEquipItem = function(item) {
      let value = 0;
      
      if (!item) {
        return value;
      }
      
      for (let i = 0; i < 8; i++) {
          value += item.params[i] || 0;
      }

      return value;
  };

  //=============================================================================
  // Game_Actor.bestEquipItem - Finds the best item for a given slot
  //=============================================================================
  Game_Actor.prototype.bestEquipItem = function(slotId) {
      const etypeId = this.equipSlots()[slotId];
      const items = this.equippableItems().filter(item => item.etypeId === etypeId);

      if (items.length === 0) {
        return null;
      }
      
      let best = items[0];
      let bestValue = this.evalEquipItem(best);
     
      for (let i = 1; i < items.length; i++) {
          const value = this.evalEquipItem(items[i]);
          if (value > bestValue) {
              best = items[i];
              bestValue = value;
          }
      }
      return best;
  };

  //=============================================================================
  // Game_Actor.equippableItems - Returns all items the actor can equip
  //=============================================================================
  Game_Actor.prototype.equippableItems = function() {
      const items = [];
     
      $gameParty.weapons().forEach(item => {
          if (this.canEquip(item)) {
            items.push(item);
          }
      });
      
      $gameParty.armors().forEach(item => {
          if (this.canEquip(item)) {
            items.push(item);
          }
      });

      return items;
  };

  //=============================================================================
  // Game_Actor.clearEquip - Unequips all items from every slot
  //=============================================================================
  Game_Actor.prototype.clearEquip = function() {
      const slots = this.equipSlots();
    
      for (let i = 0; i < slots.length; i++) {
          this.changeEquip(i, null);
      }
  };

})();
