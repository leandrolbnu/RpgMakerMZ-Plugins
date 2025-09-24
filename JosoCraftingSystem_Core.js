/*:
 * @target MZ
 * @plugindesc [v1.0] Simple crafting system with workbench filtering and visual interface | By JosoGaming
 * @author JosoGaming
 * 
 * ============================================================================
 * 🔧 JosoCraftingSystem_Core – CRAFTING SYSTEM ENGINE
 * ============================================================================
 *
 * This plugin provides a flexible and visual crafting system. It displays a
 * list of available recipes filtered by workbench type, shows crafting details,
 * and allows the player to craft items through a user-friendly interface.
 *
 * Designed to be lightweight and easy to customize. Use with the
 * companion plugin **JosoCraftingSystem_Recipes** to define your recipes.
 *
 * ----------------------------------------------------------------------------
 * 🔹 Basic Usage:
 * ----------------------------------------------------------------------------
 * Use these script calls in events to open the crafting menu:
 * 
 *   SceneManager.push(Scene_Crafting);
 *   Scene_Crafting.setWorkbenchType('blacksmith');
 * 
 * Replace `'blacksmith'` with your desired crafting station:
 *   - 'blacksmith' → For weapons/armor crafting
 *   - 'cooking'    → For food recipes
 *   - 'alchemy'    → For potions, magic, etc.
 *
 * ----------------------------------------------------------------------------
 * 🔸 Features:
 * ----------------------------------------------------------------------------
 * - Displays a filtered list of learned recipes by type
 * - Shows required ingredients and current quantity
 * - Blocks crafting if requirements aren't met
 * - Plays success or error sounds on crafting attempt
 * - Includes custom backgrounds and dynamic titles per workbench
 *
 * ----------------------------------------------------------------------------
 * 🧠 Integration:
 * ----------------------------------------------------------------------------
 * - Must be loaded **after** JosoCraftingSystem_Recipes
 * - Recipes must be declared using the `CraftingRecipe` class in the other plugin
 * - You can control recipe unlocking via `CraftingManager.learnRecipe(id)`
 *
 * ----------------------------------------------------------------------------
 * 🛠 Optional: Customizing Titles & Backgrounds
 * ----------------------------------------------------------------------------
 * You can customize the title text and background image shown per workbench:
 *
 * Titles:
 * - 'blacksmith' → "Forja do Josoaldo"
 * - 'cooking'    → "Cozinha do Josão"
 * - 'alchemy'    → "Alquimia do Mestre Joso"
 *
 * Backgrounds (load via /img/pictures/):
 * - "CraftingBackground_blacksmith"
 * - "CraftingBackground_alchemy"
 * - "craftingTest" (default fallback)
 *
 * ----------------------------------------------------------------------------
 * 🔗 Plugin Order:
 * ----------------------------------------------------------------------------
 * [✓] JosoCraftingSystem_Recipes
 * [✓] JosoCraftingSystem_Core
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
  //=============================================================================
  // CraftingManager - Handles learned recipes
  //=============================================================================
  const RawCraftingRecipes = window.CraftingRecipes || [];

  const CraftingManager = {
    _learnedRecipes: new Set(),

    isRecipeLearned(id) {
      const recipe = RawCraftingRecipes.find(r => r.id === id);
      if (!recipe) return false;
      return recipe.autoLearn !== false || this._learnedRecipes.has(id);
    },

    learnRecipe(id) {
      this._learnedRecipes.add(id);
    },

    forgetRecipe(id) {
      this._learnedRecipes.delete(id);
    },

    getLearnedRecipes() {
      return Array.from(this._learnedRecipes);
    }
  };

  window.CraftingManager = CraftingManager;

  //=============================================================================
  // Recipe Model
  //=============================================================================
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

    canCraft() {
      if (!CraftingManager.isRecipeLearned(this.id)) return false;
      return this.ingredients.every(ing => {
        const have = $gameParty.numItems($dataItems[ing.itemId]) || 0;
        return have >= ing.quantity;
      });
    }
  }

  //=============================================================================
  // Recipes (converted)
  //=============================================================================
  const CraftingRecipes = RawCraftingRecipes.map(r => new CraftingRecipe(
    r.id, r.name, r.type, r.description, r.ingredients, r.result, r.autoLearn ?? true
  ));

  //=============================================================================
  // Title Window
  //=============================================================================
  class Window_CraftingTitle extends Window_Base {
    constructor(rect, text = "Crafting Menu") {
      super(rect);
      this._text = text;
      this.refresh();
    }
    refresh() {
      this.contents.clear();
      this.drawText(this._text, 0, 0, this.contents.width, 'center');
    }
  }

  //=============================================================================
  // Recipe List Window
  //=============================================================================
  class Window_CraftingList extends Window_Selectable {
    constructor(rect, workbenchType) {
      super(rect);
      this._workbenchType = workbenchType;
      this._recipes = CraftingRecipes.filter(r => r.type === this._workbenchType && CraftingManager.isRecipeLearned(r.id));

      // Here we set up icons accordingly to the professions
      this._typeIcons = {
        blacksmith: 96, 
        cooking: 260,   
        alchemy: 176,   
        //  Add more types here...
      };        
 
      this.refresh();
      this.select(0);
      this.activate();
    }

    maxItems() {
      return this._recipes.length;
    }

    item() {
      return this._recipes[this.index()];
    }

    refresh() {
      this.contents.clear();
      this.contents.fontSize = 20;
      this.drawAllItems();
    }

    drawItem(index) {
      const recipe = this._recipes[index];
      const rect = this.itemRectWithPadding(index);
      this.drawItemBackground(index);

      const iconIndex = this._typeIcons[recipe.type] ?? 0; 

      this.drawIcon(iconIndex, rect.x + 4, rect.y + (rect.height - ImageManager.iconHeight) / 2);

      const textX = rect.x + 4 + ImageManager.iconWidth + 4;
      const textWidth = rect.width - (textX - rect.x);
      this.drawText(recipe.name, textX, rect.y, textWidth);      
    }

    drawItemBackground(index) {
      const rect = this.itemRect(index);
      this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(0, 0, 0, 0.2)");
    }
  }

  //=============================================================================
  // Recipe Detail List
  //=============================================================================
  class Window_CraftingDetail extends Window_Command {
    constructor(rect) {
      super(rect);
      this._recipe = null;
      this.deactivate();
    }

    makeCommandList() {
      if (this._recipe) {
        this.addCommand("Craft", "craft", this._recipe.canCraft());
      }
    }

    setRecipe(recipe) {
      this._recipe = recipe;
      this.refresh();
      this.select(0);
    }

    refresh() {
      this.clearCommandList();
      this.makeCommandList();
      super.refresh();
      this.drawRecipeDetails();
    }

    drawRecipeDetails() {
      const lineHeight = this.lineHeight();
      const commandHeight = this.fittingHeight(this.maxItems());
      let y = commandHeight + 8;

      if (!this._recipe) return;

      this.contents.clearRect(0, y, this.contents.width, this.contents.height - y);

      this.drawText(this._recipe.name, 0, y, this.contents.width, 'center');
      y += lineHeight + 4;

      this.drawText(this._recipe.description, 0, y, this.contents.width, 'left');
      y += lineHeight * 2;

      this.drawText("Ingredients:", 0, y, this.contents.width, 'left');
      y += lineHeight * 2;

      this._recipe.ingredients.forEach(ing => {
        const item = $dataItems[ing.itemId];
        const have = $gameParty.numItems(item);
        const qtyText = `${have}/${ing.quantity}`;

        const iconWidth = ImageManager.iconWidth;
        const iconMargin = 4;
        const iconBoxWidth = iconWidth + iconMargin;
        const qtyTextWidth = this.textWidth(qtyText);
        const qtyTextX = this.contents.width - qtyTextWidth;
        const itemNameX = iconBoxWidth;
        const itemNameWidth = qtyTextX - itemNameX - 8;

        const colorIndex = (have >= ing.quantity) ? 0 : 17;
        this.changeTextColor(ColorManager.textColor(colorIndex));

        this.drawIcon(item.iconIndex, 0, y);
        this.drawText(item.name, itemNameX, y, itemNameWidth, 'left');
        this.drawText(qtyText, qtyTextX, y, qtyTextWidth, 'right');
        this.resetTextColor();

        y += lineHeight;
      });

      y += lineHeight;
      this.drawText("Crafted Item:", 0, y, this.contents.width, 'left');
      y += lineHeight * 1.5;

      let result = this._recipe.result;
      let item;
      if (result.itemId) item = $dataItems[result.itemId];
      else if (result.weaponId) item = $dataWeapons[result.weaponId];
      else if (result.armorId) item = $dataArmors[result.armorId];

      if (item) {
        const iconBoxWidth = ImageManager.iconWidth + 4;
        this.drawIcon(item.iconIndex, 0, y);
        this.drawText(item.name, iconBoxWidth, y, this.contents.width - iconBoxWidth, 'left');
      }
    }
  }

  //=============================================================================
  // Crafting Scene
  //=============================================================================
  class Scene_Crafting extends Scene_MenuBase {
    constructor() {
      super();
      this.createBackground();
    }

    static setWorkbenchType(type) {
      this._workbenchType = type;
    }

    create() {
      super.create();

      const titleHeight = 70;
      const leftWidth = Graphics.boxWidth / 3;
      const rightWidth = Graphics.boxWidth - leftWidth;

      // Set up the title accordingly to the workbench
      const titleText = Scene_Crafting.getWorkbenchTitle();

      // Creates the window title dinamically
      this._titleWindow = new Window_CraftingTitle(new Rectangle(0, 0, Graphics.boxWidth, titleHeight), titleText);
      this.addWindow(this._titleWindow);

      this._listWindow = new Window_CraftingList(
        new Rectangle(0, titleHeight, leftWidth, Graphics.boxHeight - titleHeight),
        Scene_Crafting._workbenchType
      );
      this.addWindow(this._listWindow);

      this._detailWindow = new Window_CraftingDetail(
        new Rectangle(leftWidth, titleHeight, rightWidth, Graphics.boxHeight - titleHeight)
      );
      this.addWindow(this._detailWindow);

      this._listWindow.setHandler('cancel', this.popScene.bind(this));

      this._listWindow.setHandler('ok', () => {
        this.updateDetailWindow();
        this._listWindow.deactivate();
        this._detailWindow.activate();
        this._detailWindow.select(0);
      });

      this._detailWindow.setHandler('craft', this.onCraft.bind(this));
      this._detailWindow.setHandler('cancel', () => {
        this._detailWindow.deactivate();
        this._listWindow.activate();
      });

      this._listWindow.activate();
      this._listWindow.select(0);

      this.updateDetailWindow();
    }

    updateDetailWindow() {
      const recipe = this._listWindow.item();
      this._detailWindow.setRecipe(recipe);
    }

    onCraft() {
      const recipe = this._listWindow.item();
      if (!recipe || !recipe.canCraft()) {
        SoundManager.playBuzzer();
        return;
      }

      recipe.ingredients.forEach(ing => {
        const item = $dataItems[ing.itemId];
        $gameParty.loseItem(item, ing.quantity);
      });

      let resultItem;
      if (recipe.result.itemId) resultItem = $dataItems[recipe.result.itemId];
      else if (recipe.result.weaponId) resultItem = $dataWeapons[recipe.result.weaponId];
      else if (recipe.result.armorId) resultItem = $dataArmors[recipe.result.armorId];

      if (resultItem) {
        $gameParty.gainItem(resultItem, recipe.result.quantity);
        SoundManager.playOk();
      }

      this.updateDetailWindow();
      this._detailWindow.activate();
      this._detailWindow.select(0);
    }

    // Here we set up custom titles for the workbench crafting interface
    static getWorkbenchTitle() {
      switch (this._workbenchType) {
        case 'blacksmith': return "Forja do Josoaldo";
        case 'cooking': return "Cozinha do Josão";
        case 'alchemy': return "Alquimia do Mestre Joso";
        default: return "Crafting Menu";
      }
    }    

    createBackground() {
      const backgroundMap = {
        blacksmith: "CraftingBackground_blacksmith",
        cooking: "craftingTest",
        alchemy: "CraftingBackground_alchemy"
      };

      const type = Scene_Crafting._workbenchType;
      const bgName = backgroundMap[type] || "craftingTest";

      this._backgroundSprite = new Sprite(ImageManager.loadPicture(bgName));
      this.addChild(this._backgroundSprite);
    }
  }

  window.Scene_Crafting = Scene_Crafting;

})();
