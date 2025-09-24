/*:
 * @target MZ
 * @plugindesc [v1.0] Recipe definitions for Joso Crafting System Core | By JosoGaming
 * @author JosoGaming
 * 
 * ============================================================================
 * 📘 USAGE INSTRUCTIONS – CRAFTING RECIPE DEFINITIONS
 * ============================================================================
 *
 * This plugin defines the database of crafting recipes used by the
 * JosoCraftingSystem_Core plugin. It contains all recipe data in
 * structured JavaScript, making it easy to customize and expand.
 * 
 * ----------------------------------------------------------------------------
 * 🔹 How to define a recipe:
 * ----------------------------------------------------------------------------
 * Use the `CraftingRecipe` class with the following parameters:
 * 
 *   new CraftingRecipe(
 *     id:           Number - Unique ID for the recipe
 *     name:         String - Name of the recipe
 *     type:         String - Crafting station type (e.g. 'blacksmith', 'cooking')
 *     description:  String - Short description shown in the crafting menu
 *     ingredients:  Array  - List of { itemId, quantity } objects
 *     result:       Object - { itemId, weaponId, or armorId, quantity }
 *     autoLearn:    Bool   - (Optional) If true, recipe is known from the start
 *   )
 * 
 * ----------------------------------------------------------------------------
 * 🔸 Example:
 * ----------------------------------------------------------------------------
 *   new CraftingRecipe(
 *     1,
 *     "Iron Sword",
 *     "blacksmith",
 *     "Basic sword forged from iron bars.",
 *     [ { itemId: 2, quantity: 4 } ],
 *     { weaponId: 3, quantity: 1 }
 *   )
 * 
 * ----------------------------------------------------------------------------
 * 🔧 Notes:
 * ----------------------------------------------------------------------------
 * - This plugin must be loaded **before** JosoCraftingSystem_Core.
 * - All recipes will be automatically registered and filtered
 *   according to crafting type in the UI.
 * - You can use `itemId`, `weaponId`, or `armorId` in the `result` object.
 * - `autoLearn` defaults to true if omitted.
 * 
 * ----------------------------------------------------------------------------
 * 🧪 Tips:
 * ----------------------------------------------------------------------------
 * - Group recipes by type (e.g. all 'cooking' first) for better organization.
 * - You can set `autoLearn: false` to require unlocking a recipe through events.
 * - Avoid duplicate recipe IDs – each must be unique.
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

  class CraftingRecipe {
    constructor(id, name, type, description, ingredients, result, autoLearn = true) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.description = description;
      this.ingredients = ingredients;
      this.result = result;
      this.autoLearn = autoLearn;
    }
  }

  window.CraftingRecipes = [
    new CraftingRecipe(
      1,
      "Iron Sword",
      "blacksmith",
      "Basic sword forged from iron bars.",
      [
        { itemId: 2, quantity: 4 },
        { itemId: 3, quantity: 2 },
        { itemId: 4, quantity: 1 }
      ],
      { weaponId: 2, quantity: 1 }
    ),

    new CraftingRecipe(
      2,
      "Healing Potion",
      "blacksmith",
      "Restores some HP.",
      [
        { itemId: 2, quantity: 4 },
        { itemId: 3, quantity: 2 },
        { itemId: 4, quantity: 1 }
      ],
      { itemId: 5, quantity: 1 },
      false
    ),

    new CraftingRecipe(
      3,
      "Cooked Meat",
      "blacksmith",
      "Grilled meat for energy.",
      [
        { itemId: 2, quantity: 4 },
        { itemId: 3, quantity: 2 },
        { itemId: 4, quantity: 1 }
      ],
      { itemId: 5, quantity: 1 }
    )

    // add more recipes here...
  ];


})();
