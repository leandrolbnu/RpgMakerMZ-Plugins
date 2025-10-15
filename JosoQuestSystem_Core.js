/*:
 * @target MZ
 * @plugindesc [v1.1] Simple Quest System with visual Quest Log, manual 
 * accept/turn-in, and progress tracking | By JosoGaming
 * @author JosoGaming
 *
 * @help
 * ============================================================================
 * 🔧 JosoQuestSystem_Core – QUEST SYSTEM
 * ============================================================================
 *
 * Complete and easy-to-use Quest System for RPG Maker MZ.
 * Features manual quest offering and turn-in, progress tracking, XP/reward handling,
 * visual quest log, and integrated UI scenes. No external dependencies required.
 *
 * ----------------------------------------------------------------------------
 * 🧩 Script Calls (for use in events):
 * ----------------------------------------------------------------------------
 *
 * QuestManager.addQuest("quest_id");
 *    → Adds a quest to the active quest list.
 *
 * QuestManager.completeQuest("quest_id");
 *    → Marks the quest as completed, grants XP and rewards, plays SE.
 *
 * QuestManager.isQuestCompleted("quest_id");
 *    → Returns true if quest is completed.
 *
 * QuestManager.isQuestActive("quest_id");
 *    → Returns true if quest is active and not completed.
 *
 * QuestManager.getStatus("quest_id");
 *    → Returns: "active", "readyToTurnIn", "completed", or "none".
 *
 * QuestManager.getAllQuestIds();
 *    → Returns an array of all active and completed quest IDs.
 *
 * QuestManager.getProgress("quest_id");
 *    → Returns current progress value for the quest.
 *
 * QuestManager.addProgress("quest_id", amount);
 *    → Increases progress; status updates to "readyToTurnIn" when goal reached.
 *
 * callQuestWindow("quest_id", "offer");
 *    → Opens Quest Offer window (Accept / Decline).
 *
 * callQuestWindow("quest_id", "turnIn");
 *    → Opens Turn-In window for completed quest (Complete / Cancel).
 *
 * ----------------------------------------------------------------------------
 * 🪟 UI Scenes & Windows:
 * ----------------------------------------------------------------------------
 *
 * Scene_QuestLog:
 *    → Displays all current quests and details (title, quest list, detail panel).
 *
 * Scene_QuestOffer:
 *    → Allows manual quest accept or turn-in with full info.
 *
 * UI Components:
 *   - Window_QuestLogTitle:      Static title bar
 *   - Window_QuestList:          Scrollable quest list
 *   - Window_QuestDetails:       Shows description, progress, XP, rewards
 *   - Window_QuestOfferButtons:  Accept/Decline buttons
 *   - Window_QuestTurnInButtons: Complete/Cancel buttons
 *
 * ESC key behavior:
 *   → Closes Quest Log and Quest Offer/Turn-In scenes.
 *
 * ----------------------------------------------------------------------------
 * ⚠️ Notes & Requirements:
 * ----------------------------------------------------------------------------
 *
 * - Requires `QuestData.js` loaded **first**.
 * - Quest definitions (title, XP, description, rewards) live in QuestData.
 * - XP is evenly split across party members.
 * - Supported rewards: items, weapons, armor, gold.
 * - Completion SE optional (defined per quest via `completeSe`).
 * - Attempting to turn in incomplete quests triggers buzzer SE.
 *
 * ----------------------------------------------------------------------------
 * ✅ Recommended Flow:
 * ----------------------------------------------------------------------------
 * 1. Use `callQuestWindow("quest_id", "offer")` to present quest.
 * 2. Use `QuestManager.addProgress(...)` to track progress.
 * 3. When progress ≥ required, status switches to "readyToTurnIn".
 * 4. Use `callQuestWindow("quest_id", "turnIn")` for manual completion.
 * 5. Rewards granted, XP distributed, quest marked complete.
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

//=====================================================================
// Script call function
//=====================================================================
function callQuestWindow(questKey, mode) {
  if (!QuestData[questKey]) {
    console.error(`Quest ${questKey} não encontrada em QuestData.`);
    return;
  }

  $gameTemp.currentQuestId = questKey;
  $gameTemp.currentQuestMode = mode;
  SceneManager.push(Scene_QuestOffer);
}

Game_Party.prototype.addQuest = function(questId) {
  if (!this._activeQuests) {
    this._activeQuests = {};
  }

  if (!this._activeQuests[questId]) {
    this._activeQuests[questId] = {progress: 0, complete: false};
    QuestManager.addQuest(questId);
  }
};

Game_Party.prototype.getActiveQuests = function() {
  if (!this._activeQuests) {
    this._activeQuests = {};
  }

  return this._activeQuests;
};

var QuestManager = (function () {
  function loadData() {
    if (!$gameSystem._quests) {
      $gameSystem._quests = {};
    }

    if (!$gameSystem._questProgress) {
      $gameSystem._questProgress = {};
    }
  }

  return {
    addQuest(id) {
      loadData();
      if (!this.exists(id)) {
          return;
      }
      
      if (!$gameSystem._quests[id]) {
          $gameSystem._quests[id] = "active";
          $gameSystem._questProgress[id] = 0;
          AudioManager.playSe({ name: "Chime2", volume: 90, pitch: 100, pan: 0 });
      }
    },

    completeQuest(id) {
      loadData();
      if (this.isQuestActive(id) || this.isQuestReadyToTurnIn(id)) {
        $gameSystem._quests[id] = "completed";
        delete $gameSystem._questProgress[id];
        
        const quest = QuestData[id];
        if (!quest) {
          return;
        }

        const xp = quest.xp || 0;
        if (xp > 0) {
          $gameParty.members().forEach(actor => actor.gainExp(xp));
        }

        const rewards = quest.rewards || [];
        rewards.forEach(r => {
          switch (r.type) {
            case "item":
              $gameParty.gainItem($dataItems[r.id], r.amount || 1);
              break;
            case "weapon":
              $gameParty.gainItem($dataWeapons[r.id], r.amount || 1);
              break;
            case "armor":
              $gameParty.gainItem($dataArmors[r.id], r.amount || 1);
              break;
            case "gold":
              $gameParty.gainGold(r.amount || 0);
              break;
          }
        });

        if (quest.completeSe) {
          AudioManager.playSe({ name: quest.completeSe, volume: 90, pitch: 100, pan: 0 });
        }
      }
    },

    isQuestCompleted(id) {
      loadData();
      return $gameSystem._quests[id] === "completed";
    },

    isQuestActive(id) {
      loadData();
      return $gameSystem._quests[id] === "active";
    },

    getStatus(id) {
      loadData();
      return $gameSystem._quests[id] || "none";
    },

    isQuestReadyToTurnIn(id) {
      loadData();
      return $gameSystem._quests[id] === "readyToTurnIn";
    },

    getAllQuestIds() {
      loadData();
      return Object.keys($gameSystem._quests);
    },

    getProgress(id) {
      loadData();
      return $gameSystem._questProgress[id] || 0;
    },

    addProgress(id, value = 1) {
      loadData();
      if (!this.isQuestActive(id)) {
        return;
      }
      
      const current = this.getProgress(id);
      const max = (QuestData[id] && QuestData[id].required) || 1;
      const updated = Math.min(current + value, max);
      $gameSystem._questProgress[id] = updated;

      if (updated >= max) {
        if ($gameSystem._quests[id] !== "readyToTurnIn") {
          $gameSystem._quests[id] = "readyToTurnIn";
          AudioManager.playSe({ name: "Decision5", volume: 90, pitch: 100, pan: 0 });
        }
      }        
    },

    getQuestData(id) {
        return QuestData[id];
    },

    exists(id) {
        return !!QuestData[id];
    }
  };

})();

//=====================================================================
// Add "Quest Log" to main menu
//=====================================================================
const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function () {
  _Window_MenuCommand_addOriginalCommands.call(this);
  this.addCommand("Quest Log", "questLog", true);
};

//=====================================================================
// Quest Log Scene with 3 windows: Title, List, Details
//=====================================================================
function Scene_QuestLog() {
  Scene_MenuBase.call(this);
}

Scene_QuestLog.prototype = Object.create(Scene_MenuBase.prototype);
Scene_QuestLog.prototype.constructor = Scene_QuestLog;

Scene_QuestLog.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this);

  const titleRect = new Rectangle(0, 0, Graphics.boxWidth, 70);
  this._titleWindow = new Window_QuestLogTitle(titleRect);
  this.addWindow(this._titleWindow);

  const listRect = new Rectangle(0, 60, 300, Graphics.boxHeight - 60);
  this._listWindow = new Window_QuestList(listRect);
  this._listWindow.setHandler("ok", this.onQuestOk.bind(this));
  this._listWindow.setHandler("cancel", this.popScene.bind(this));
  this.addWindow(this._listWindow);

  const detailRect = new Rectangle(300, 60, Graphics.boxWidth - 300, Graphics.boxHeight - 60);
  this._detailWindow = new Window_QuestDetails(detailRect);
  this.addWindow(this._detailWindow);

  this._listWindow.setDetailWindow(this._detailWindow);
};

Scene_QuestLog.prototype.onQuestOk = function () {
  this._listWindow.activate();
  this._listWindow.updateHelp();
};

//=====================================================================
// Window_QuestLogTitle
//=====================================================================
function Window_QuestLogTitle() {
  this.initialize(...arguments);
}

Window_QuestLogTitle.prototype = Object.create(Window_Base.prototype);
Window_QuestLogTitle.prototype.constructor = Window_QuestLogTitle;

Window_QuestLogTitle.prototype.initialize = function (rect) {
  Window_Base.prototype.initialize.call(this, rect);
  this.refresh();
};

Window_QuestLogTitle.prototype.refresh = function () {
  this.contents.clear();
  this.contents.fontSize = 36;
  this.changeTextColor(ColorManager.systemColor());
  const text = "Quest Log";
  const textWidth = this.textWidth(text);
  const x = (this.contents.width - textWidth) / 2;
  const y = (this.contents.height - this.lineHeight()) / 2;
  this.drawText(text, x, y, textWidth, "left");
};

//=====================================================================
// Window_QuestList
//=====================================================================
function Window_QuestList() {
  this.initialize(...arguments);
}

Window_QuestList.prototype = Object.create(Window_Selectable.prototype);
Window_QuestList.prototype.constructor = Window_QuestList;

Window_QuestList.prototype.initialize = function (rect) {
  Window_Selectable.prototype.initialize.call(this, rect);
  this._data = [];
  this.refresh();
  this.select(0);
  this.activate();
};

Window_QuestList.prototype.setDetailWindow = function (window) {
  this._detailWindow = window;
  this.callUpdateHelp();
};

Window_QuestList.prototype.maxItems = function () {
  return this._data.length;
};

Window_QuestList.prototype.refresh = function () {
  this._data = QuestManager.getAllQuestIds().filter(id => {
      const status = QuestManager.getStatus(id);
      return status === "active" || status === "readyToTurnIn";
      });
  this.createContents();
  this.contents.fontSize = 20; 
  this.drawAllItems();
};

Window_QuestList.prototype.drawItem = function (index) {
  const id = this._data[index];
  const rect = this.itemRectWithPadding(index);
  const data = QuestManager.getQuestData(id);
  this.contents.fontSize = 20; 
  this.changeTextColor(ColorManager.normalColor());
  this.drawText(`${data.name}`, rect.x + 4, rect.y, rect.width - 8, "left");
};

Window_QuestList.prototype.updateHelp = function () {
  if (this._detailWindow) {
      const id = this._data[this.index()];
      this._detailWindow.setQuestId(id);
  }
};

Window_QuestList.prototype.itemHeight = function () {
  return this.lineHeight() * 1.2;
};

//=====================================================================
// Window_QuestDetails
//=====================================================================
function Window_QuestDetails() {
  this.initialize(...arguments);
}

Window_QuestDetails.prototype = Object.create(Window_Base.prototype);
Window_QuestDetails.prototype.constructor = Window_QuestDetails;

Window_QuestDetails.prototype.initialize = function (rect) {
  Window_Base.prototype.initialize.call(this, rect);
  this._questId = null;
};

Window_QuestDetails.prototype.setQuestId = function (id) {
  this._questId = id;
  this.refresh();
};

Window_QuestDetails.prototype.refresh = function () {
  this.contents.clear();
  if (!this._questId) {
    return;
  }

  const data = QuestManager.getQuestData(this._questId);
  const progress = QuestManager.getProgress(this._questId);
  const required = data.required || 1;
  const rewards = data.rewards || [];
  const lineH = this.lineHeight();

  // Reward box height
  const rewardCount = Math.max(rewards.length, 1);
  const boxH = lineH * (rewardCount + 3) + 12;
  const margemInferior = 6;
  const boxX = 0;
  const boxY = this.contents.height - boxH - margemInferior;
  const boxW = this.contents.width;
  let y = 0;

  // Title
  this.contents.fontSize = 24;
  this.changeTextColor(ColorManager.systemColor());
  this.drawText(data.name, 0, y, this.contents.width, "left");

  // Description
  y += lineH * 1.2;
  this.contents.fontSize = 20;
  this.changeTextColor(ColorManager.normalColor());
  this.drawText("Description:", 0, y, this.contents.width, "left");
  y += lineH;
  const descLines = this.drawTextWrapped(data.description, 0, y, this.contents.width);
  y += lineH * descLines;
  const progressY = boxY - lineH;
  this.contents.fontSize = 20;
  this.changeTextColor(ColorManager.normalColor());
  this.drawText(`Progress: ${progress}/${required}`, 0, progressY, this.contents.width, "left");

  // Reward box fixed on the bottom of the screen
  this.contents.paintOpacity = 180;
  this.contents.fillRect(boxX, boxY, boxW, boxH, "rgba(0, 0, 0, 0.4)");
  this.contents.paintOpacity = 255;
  let ry = boxY + 6;
  this.contents.fontSize = 20;

  // XP
  this.changeTextColor(ColorManager.textColor(3));
  this.drawText(`XP: ${data.xp}`, boxX + 10, ry, boxW - 20, "left");

  // "Rewards:"
  ry += lineH;
  this.changeTextColor(ColorManager.systemColor());
  this.drawText("Rewards:", boxX + 10, ry, boxW - 20, "left");

  // Reward List
  ry += lineH;
  this.changeTextColor(ColorManager.normalColor());

  if (rewards.length === 0) {
    this.drawText("No reward.", boxX + 10, ry, boxW - 20, "left");
  } else {
    for (const reward of rewards) {
      let iconIndex = 0;
      let name = "";
      let amount = reward.amount || 1;

      switch (reward.type) {
        case "item":
          const item = $dataItems[reward.id];
          if (item) {
            iconIndex = item.iconIndex;
            name = item.name;
          }
          break;
        case "weapon":
          const weapon = $dataWeapons[reward.id];
          if (weapon) {
            iconIndex = weapon.iconIndex;
            name = weapon.name;
          }
          break;
        case "armor":
          const armor = $dataArmors[reward.id];
          if (armor) {
            iconIndex = armor.iconIndex;
            name = armor.name;
          }
          break;
        case "gold":
          iconIndex = 313;
          name = `${amount} Gold`;
          amount = 0;
          break;
      }

      if (iconIndex > 0) {
        this.drawIcon(iconIndex, boxX + 10, ry);
        this.drawText(`${amount > 0 ? amount + "x " : ""}${name}`, boxX + 42, ry, boxW - 42, "left");
      } else {
        this.drawText(`${amount > 0 ? amount + "x " : ""}${name}`, boxX + 10, ry, boxW - 20, "left");
      }

      ry += lineH;
    }
  }
};

Window_Base.prototype.drawTextWrapped = function(text, x, y, maxWidth) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testWidth = this.textWidth(testLine);

    if (testWidth > maxWidth && i > 0) {
      this.drawText(line.trim(), x, y, maxWidth, "left");
      line = words[i] + " ";
      y += this.lineHeight();
      lineCount++;
    } else {
      line = testLine;
    }
  }

  if (line.length > 0) {
    this.drawText(line.trim(), x, y, maxWidth, "left");
    lineCount++;
  }

  return lineCount;
};

Window_QuestDetails.prototype.convertTextToLines = function (text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const width = this.textWidth(testLine);
    if (width > maxWidth - 20) { 
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

//=====================================================================
// Quest Offer Buttons
//=====================================================================
class Window_QuestOfferButtons extends Window_HorzCommand {
  constructor(rect) {
    super(rect);
    this.refresh();
  }

  makeCommandList() {
    this.clearCommandList();
    this.addCommand("Accept", "accept");
    this.addCommand("Decline", "decline");
  }

  maxCols() {
    return 2;
  }

  itemTextAlign() {
    return "center";
  }
}

//=====================================================================
// Quest Turn In Buttons
//=====================================================================
class Window_QuestTurnInButtons extends Window_HorzCommand {
  constructor(rect) {
    super(rect);
    this.refresh();
  }

  makeCommandList() {
    this.clearCommandList();
    this.addCommand("Complete", "turnIn");
    this.addCommand("Cancel", "cancel");
  }

  maxCols() {
    return 2;
  }

  itemTextAlign() {
    return "center";
  }
}

//=====================================================================
// Scene Quest Offer
//=====================================================================
class Scene_QuestOffer extends Scene_MenuBase {
  create() {
    super.create();
    const rect = new Rectangle(100, 30, 600, 490);
    this._questWindow = new Window_QuestDetails(rect);
    this.addWindow(this._questWindow);
    this._questWindow.setQuestId($gameTemp.currentQuestId);
    this.createButtonsWindow();
  }

  createButtonsWindow() {
    const rect = new Rectangle(100, 520, 600, 80);
    const mode = $gameTemp.currentQuestMode;

    if (mode === "offer") {
      this._buttonsWindow = new Window_QuestOfferButtons(rect);
      this._buttonsWindow.setHandler("accept", this.onAccept.bind(this));
      this._buttonsWindow.setHandler("decline", this.onDecline.bind(this));
      this._buttonsWindow.setHandler("cancel", this.onDecline.bind(this)); 
    } else if (mode === "turnIn") {
      this._buttonsWindow = new Window_QuestTurnInButtons(rect);
      this._buttonsWindow.setHandler("turnIn", this.onTurnIn.bind(this));
      this._buttonsWindow.setHandler("cancel", this.onCancel.bind(this));
    } else {
      console.warn("Unknown mode for buttons:", mode);
      return;
    }

    this.addWindow(this._buttonsWindow);

    this._buttonsWindow.makeCommandList();
    this._buttonsWindow.refresh();
    this._buttonsWindow.select(0);
    this._buttonsWindow.activate();
  }

  onAccept() {
    $gameParty.addQuest($gameTemp.currentQuestId);

    const scene = SceneManager._scene;
    if (scene && scene._listWindow && typeof scene._listWindow.refresh === 'function') {
      scene._listWindow.refresh();
      scene._listWindow.select(0);
      scene._listWindow.activate();
      scene._listWindow.updateHelp();
    }

    this.popScene();
  }

  onDecline() {
    this.popScene();
  }

  onTurnIn() {
    const questId = $gameTemp.currentQuestId;
    if (!questId) return;

    const questData = QuestManager.getQuestData(questId);
    if (!questData) return;

    const progress = QuestManager.getProgress(questId);
    const required = questData.required || 1;

    if (progress >= required) {
      QuestManager.completeQuest(questId);

      const scene = SceneManager._scene;
      if (scene && scene._listWindow && typeof scene._listWindow.refresh === 'function') {
        scene._listWindow.refresh();
        scene._listWindow.select(0);
        scene._listWindow.activate();
        scene._listWindow.updateHelp();
      }

      this.popScene();
    } else {
      this._buttonsWindow.deactivate(); 
      AudioManager.playSe({ name: "Buzzer1", volume: 90, pitch: 100, pan: 0 });
      setTimeout(() => {
        this._buttonsWindow.activate();
      }, 100);
    }
  }

  onCancel() {
    this.popScene();
  }
}

//=====================================================================
// Accept/Turn In Quest Window
//=====================================================================
class Window_QuestDetail extends Window_Base {
  constructor(rect, quest, mode) {
    super(rect);
    this._quest = quest;
    this._mode = mode; 
    this._selected = 0; 
    this.activate();
    this.drawContents();
  }

  drawContents() {
    this.contents.clear();
    this.drawText(this._quest.name, 0, 0, this.contents.width, 'center');
    this.drawText(this._quest.description, 0, 40, this.contents.width, 'left');
    this.drawText(`XP: ${this._quest.xp}`, 0, 80, this.contents.width, 'left');
    this.drawText(`Recompensas: ${this._quest.rewards.join(', ')}`, 0, 100, this.contents.width, 'left');
    
    if (this._mode === 'offer') {
      this.drawText('Aceitar', 0, 140, this.contents.width / 2, 'center');
      this.drawText('Recusar', this.contents.width / 2, 140, this.contents.width / 2, 'center');
    } else if (this._mode === 'turnIn') {
      this.drawText('Entregar', 0, 140, this.contents.width / 2, 'center');
      this.drawText('Cancelar', this.contents.width / 2, 140, this.contents.width / 2, 'center');
    }
  }

  update() {
    super.update();
    if (this.active) {
      if (Input.isTriggered('left') || Input.isTriggered('right')) {
        this._selected = 1 - this._selected;
        this.drawContents();
      }
      if (Input.isTriggered('ok')) {
        this.processOk();
      }
      if (Input.isTriggered('cancel')) {
        this.processCancel();
      }
    }
  }

  processOk() {
    if (this._mode === 'offer') {
      if (this._selected === 0) {
        $gameParty.addQuest(this._quest);  
        this.close();
      } else {
        this.close();
      }
    } else if (this._mode === 'turnIn') {
      if (this._selected === 0) {
        $gameParty.completeQuest(this._quest);
        this.close();
      } else {
        this.close();
      }
    }
  }

  processCancel() {
    this.close();
  }

  close() {
    this.deactivate();
    this.hide();
  }
}

//===============================
// Add handler to menu scene
//===============================
const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function () {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler("questLog", this.commandQuestLog.bind(this));
};

Scene_Menu.prototype.commandQuestLog = function () {
    SceneManager.push(Scene_QuestLog);
};
