/*:
 * @target MZ
 * @plugindesc [v1.2] Armazenamento visual lado a lado apenas para itens | by JosoGaming
 * @author JosoGaming
 *
 * @command OpenStorage
 * @text Abrir Armazenamento
 * @desc Abre o menu de armazenamento com interface aprimorada lado a lado.
 *
 * @help
 * Sistema simples de armazenamento de itens.
 * Use o comando de plugin "OpenStorage" para acessar.
 */

(() => {
window.$simpleItemStorage = null;

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this);
    $simpleItemStorage = new Game_SimpleItemStorage();
};

const _DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _DataManager_makeSaveContents.call(this);
    contents.simpleItemStorage = $simpleItemStorage;
    return contents;
};

const _DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);
    if (contents.simpleItemStorage) {
        $simpleItemStorage = new Game_SimpleItemStorage();
        Object.assign($simpleItemStorage, contents.simpleItemStorage);
    } else {
        $simpleItemStorage = new Game_SimpleItemStorage();
    }
};

class Game_SimpleItemStorage {
    constructor() {
        this._items = {};
    }

    gainItem(item, amount) {
        if (!item) return;
        const id = item.id;
        this._items[id] = (this._items[id] || 0) + amount;
        if (this._items[id] <= 0) delete this._items[id];
    }

    numItems(item) {
        return this._items[item.id] || 0;
    }

    allItems() {
        return Object.entries(this._items).map(([id, qty]) => {
            const item = $dataItems[+id];
            return item ? { item, qty } : null;
        }).filter(e => e);
    }
}

class Scene_SimpleStorage extends Scene_MenuBase {
    create() {
        super.create();
        this.createTitleWindow();
        this.createCommandWindow();
        this.createInventoryWindow();
        this.createStorageWindow();
        this.createInventoryTitle();
        this.createStorageTitle();
    }

    createTitleWindow() {
        const rect = new Rectangle(0, 0, Graphics.boxWidth, this.calcWindowHeight(1, false));
        const win = new Window_Base(rect);
        win.drawText("My Storage", 0, 0, Graphics.boxWidth, "center");
        this.addWindow(win);
    }

    createCommandWindow() {
        const y = this.calcWindowHeight(1, false);
        const h = this.calcWindowHeight(2, true);
        const rect = new Rectangle(0, y, Graphics.boxWidth, h);
        const win = new Window_StorageCommand(rect);
        win.setHandler("deposit", this.onDeposit.bind(this));
        win.setHandler("withdraw", this.onWithdraw.bind(this));
        win.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(win);
        this._commandWindow = win;
    }

    createInventoryWindow() {
        const y = this.calcWindowHeight(2, false) +90;
        const w = Graphics.boxWidth / 2;
        const h = Graphics.boxHeight - y -10;
        const rect = new Rectangle(0, y, w, h);
        const win = new Window_ItemList(rect);
        win.setCategory("item");
        win.setHandler("ok", this.onItemDeposit.bind(this));
        win.setHandler("cancel", this.onCancelItem.bind(this));
        this.addWindow(win);
        this._inventoryWindow = win;
    }

    createStorageWindow() {
        const y = this.calcWindowHeight(2, false) +90;
        const w = Graphics.boxWidth / 2;
        const h = Graphics.boxHeight - y -10;
        const rect = new Rectangle(w, y, w, h);
        const win = new Window_StorageItemList(rect);
        win.setHandler("ok", this.onItemWithdraw.bind(this));
        win.setHandler("cancel", this.onCancelItem.bind(this));
        this.addWindow(win);
        this._storageWindow = win;
    }

    createInventoryTitle() {
        const titleHeight = this.calcWindowHeight(1, false);
        const y = this.calcWindowHeight(2, false) + 90 - titleHeight;
        const w = Graphics.boxWidth / 2;
        const rect = new Rectangle(0, y, w, titleHeight);
        const win = new Window_Base(rect);
        win.drawText("Inventory", 0, 0, w, "center");
        this.addWindow(win);
        this._inventoryTitleWindow = win;
    }

    createStorageTitle() {
        const titleHeight = this.calcWindowHeight(1, false);
        const y = this.calcWindowHeight(2, false) + 90 - titleHeight; 
        const w = Graphics.boxWidth / 2;
        const rect = new Rectangle(w, y, w, titleHeight);
        const win = new Window_Base(rect);
        win.drawText("Storage", 0, 0, w, "center");
        this.addWindow(win);
        this._storageTitleWindow = win;
    }

    onDeposit() {
        this._commandWindow.deactivate();
        this._inventoryWindow.refresh();
        this._inventoryWindow.select(0);
        this._inventoryWindow.activate();
    }

    onWithdraw() {
        this._commandWindow.deactivate();
        this._storageWindow.refresh();

        if (this._storageWindow.maxItems() > 0) {
            this._storageWindow.select(0);
            this._storageWindow.activate();
        } else {
            this._commandWindow.activate();
            SoundManager.playBuzzer();
        }
    }

    onCancelItem() {
        this._inventoryWindow.deselect();
        this._storageWindow.deselect();
        this._commandWindow.activate();
    }

    onItemDeposit() {
        const item = this._inventoryWindow.item();
        if (!item || $gameParty.numItems(item) <= 0) return;
        $gameParty.loseItem(item, 1);
        $simpleItemStorage.gainItem(item, 1);
        this._inventoryWindow.refresh();
        this._storageWindow.refresh();
        this._inventoryWindow.activate();
    }

    onItemWithdraw() {
        const entry = this._storageWindow.entry();
        if (!entry || entry.qty <= 0) {
            SoundManager.playBuzzer();
            return;
        }
        $simpleItemStorage.gainItem(entry.item, -1);
        $gameParty.gainItem(entry.item, 1);
        this._storageWindow.refresh();
        this._inventoryWindow.refresh();

        if (this._storageWindow.maxItems() > 0) {
            this._storageWindow.activate();
        } else {
            this._commandWindow.activate();
        }
    }

}

class Window_StorageItemList extends Window_ItemList {
    initialize(rect) {
        super.initialize(rect);
        this._data = [];
        this.setCategory("item");
        this.refresh();
    }

    includes(item) {
        return $simpleItemStorage.numItems(item) > 0;
    }

    isEnabled(item) {
        return $simpleItemStorage.numItems(item) > 0;
    }

    makeItemList() {
        this._data = $simpleItemStorage.allItems();
    }

    entry() {
        return this._data[this.index()] || null;
    }


    item() {
        const entry = this._data[this.index()];
        return entry ? entry.item : null;
    }

    drawItem(index) {
        const entry = this._data[index];
        if (!entry) return;
        const item = entry.item;
        const numberWidth = this.textWidth("000");
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(true);
        this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
        this.drawText(":" + entry.qty, rect.x, rect.y, rect.width, "right");
        this.changePaintOpacity(true);
    }

    maxItems() {
        return this._data ? this._data.length : 0;
    }
}

class Window_StorageCommand extends Window_HorzCommand {
    makeCommandList() {
        this.addCommand("Deposit", "deposit");
        this.addCommand("Withdraw", "withdraw");
    }

    maxCols() {
        return 2;
    }

    spacing() {
        return 24;
    }
}

PluginManager.registerCommand("JosoBankStorageSystem", "OpenStorage", () => {
    SceneManager.push(Scene_SimpleStorage);
});

})();
