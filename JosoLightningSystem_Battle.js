/*:
 * @target MZ
 * @plugindesc [v1.0] Simple Battle Lighting: darkens the battle screen based on map note and adds light spots to battlers | By JosoGaming
 *
 * @help
 * ============================================================================
 * SimpleBattleLighting.js
 * ============================================================================
 *
 * This plugin adds simple ambient lighting to battles in RPG Maker MZ.
 * It darkens the screen and places dynamic light spots on actors and enemies.
 *
 * ----------------------------------------------------------------------------
 * 🔧 How to Use:
 * ----------------------------------------------------------------------------
 * - Add the following tag to your map's note field to control the darkness:
 *     <darkness:150>      // Value from 0 (no darkness) to 255 (fully black)
 *
 * - When a battle begins, the screen will be darkened using that value.
 * - Each battler (actor or enemy) will be illuminated with a white light.
 *
 * ----------------------------------------------------------------------------
 * 🎨 Suggested Light Colors (for customization):
 * ----------------------------------------------------------------------------
 * This version uses a fixed white light. If you modify the script to allow
 * colored lights, here are some suggested hex values:
 *
 * Warm Light     → #ffcc99   (soft orange, cozy)
 * Cold Light     → #aaccff   (pale blue, icy)
 * Fire Light     → #ff6600   (vivid flame orange)
 * Candle Light   → #ffddaa   (dim yellowish warm)
 * Torch Light    → #ff9933   (slightly deeper orange)
 * Purple Light   → #cc66ff   (mystic or arcane)
 * Red Light      → #ff4444   (warning, danger)
 * Green Light    → #44ff44   (toxic, magic, nature)
 * Yellow Light   → #ffff66   (bright, cheerful)
 * Blue Light     → #6699ff   (cool or electric)
 * White Light    → #ffffff   (neutral, default)
 *
 * ----------------------------------------------------------------------------
 * 📌 Notes:
 * ----------------------------------------------------------------------------
 * - The light effects are dynamically created and follow battler positions.
 * - Lights are visible only while the battler sprite is loaded and visible.
 * - Can be freely modified to support flickering, color, size, or animations.
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
  const getDarknessOpacity = () => {
    if (!$gameMap) return 0;
    const note = $dataMap?.note || '';
    const match = note.match(/<darkness:(\d+)>/i);
    return match ? Math.min(Math.max(Number(match[1]), 0), 255) : 0;
  };

  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function() {
    _Scene_Battle_createAllWindows.call(this);

    // Camada escura
    this._darknessLayer = new Sprite();
    this._darknessLayer.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this._darknessLayer.bitmap.fillAll('black');
    this._darknessLayer.opacity = getDarknessOpacity();
    this.addChild(this._darknessLayer);

    // Container de luzes
    this._lightContainer = new Sprite();
    this.addChild(this._lightContainer);
    this._lights = [];

    const createLight = () => {
      const size = 128;
      const bitmap = new Bitmap(size, size);
      const ctx = bitmap._context;

      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
      );
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      const light = new Sprite(bitmap);
      light.anchor.set(0.5, 0.5);
      light.blendMode = PIXI.BLEND_MODES.ADD;
      light.opacity = 180;
      return light;
    };

    this._createLightsLater = () => {
      const spriteset = this._spriteset;
      if (!spriteset || !spriteset._actorSprites) return;

      [...spriteset._actorSprites, ...spriteset._enemySprites].forEach(sprite => {
        const light = createLight();
        this._lightContainer.addChild(light);
        this._lights.push({ light, sprite });
      });

      this._createLightsLater = null;
    };
  };

  const _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    _Scene_Battle_update.call(this);

    if (this._createLightsLater) this._createLightsLater();

    if (this._darknessLayer) {
      this._darknessLayer.opacity = getDarknessOpacity();
    }

    if (this._lights) {
      this._lights.forEach(({ light, sprite }) => {
        if (sprite && sprite.visible && sprite.bitmap) {
          light.visible = true;
          light.x = sprite.x;
          light.y = sprite.y - sprite.height / 2;
        } else {
          light.visible = false;
        }
      });
    }
  };
})();
