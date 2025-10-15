/*:
 * @target MZ
 * @plugindesc [v1.0] Simple Battle Lighting: darkens the battle screen based 
 * on map note and adds light spots to battlers | By JosoGaming
 * @author JosoGaming
 * 
 * @help
 * ============================================================================
 * 🔧 SimpleBattleLighting – BATTLE LIGHTING SYSTEM
 * ============================================================================
 *
 * Adds simple ambient lighting to battles in RPG Maker MZ.
 * Darkens the screen and places dynamic light spots on actors and enemies.
 *
 * ----------------------------------------------------------------------------
 * 🔹 How to Use:
 * ----------------------------------------------------------------------------
 * - Add the following tag to your map's note field to control darkness:
 *     <darkness:150>      // Value from 0 (no darkness) to 255 (fully black)
 *
 * - When a battle begins, the screen will darken using that value.
 * - Each battler (actor or enemy) will be illuminated with a white light.
 *
 * ----------------------------------------------------------------------------
 * 🎨 Suggested Light Colors (for customization):
 * ----------------------------------------------------------------------------
 * This version uses fixed white light. If modified to allow colors, suggested hex values:
 *
 * Warm Light     → #ffcc99
 * Cold Light     → #aaccff
 * Fire Light     → #ff6600
 * Candle Light   → #ffddaa
 * Torch Light    → #ff9933
 * Purple Light   → #cc66ff
 * Red Light      → #ff4444
 * Green Light    → #44ff44
 * Yellow Light   → #ffff66
 * Blue Light     → #6699ff
 * White Light    → #ffffff
 *
 * ----------------------------------------------------------------------------
 * 📌 Notes:
 * ----------------------------------------------------------------------------
 * - Light effects follow battler positions dynamically.
 * - Visible only while the battler sprite is loaded and visible.
 * - Can be modified to support flickering, color, size, or animations.
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
  // Battle Darkness Layer - Applies configurable darkness overlay on battle maps
  //=============================================================================
  const getDarknessOpacity = () => {
    if (!$gameMap) {
      return 0;
    }

    const note = $dataMap?.note || '';
    const match = note.match(/<darkness:(\d+)>/i);
    return match ? Math.min(Math.max(Number(match[1]), 0), 255) : 0;
  };

  //=============================================================================
  // Scene_Battle.createAllWindows - Adds darkness layer and light container
  //=============================================================================  
  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function() {
    _Scene_Battle_createAllWindows.call(this);

    this._darknessLayer = new Sprite();
    this._darknessLayer.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this._darknessLayer.bitmap.fillAll('black');
    this._darknessLayer.opacity = getDarknessOpacity();
    this.addChild(this._darknessLayer);

    this._lightContainer = new Sprite();
    this.addChild(this._lightContainer);
    this._lights = [];

    //=============================================================================
    // Create individual light sprite with radial gradient
    //=============================================================================    
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

    //=============================================================================
    // Deferred light creation for actors and enemies after spriteset is ready
    //=============================================================================    
    this._createLightsLater = () => {
      const spriteset = this._spriteset;
      if (!spriteset || !spriteset._actorSprites) {
        return;
      }

      [...spriteset._actorSprites, ...spriteset._enemySprites].forEach(sprite => {
        const light = createLight();
        this._lightContainer.addChild(light);
        this._lights.push({ light, sprite });
      });

      this._createLightsLater = null;
    };
  };


  //=============================================================================
  // Scene_Battle.update - Updates darkness opacity and positions lights
  //=============================================================================  
  const _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    _Scene_Battle_update.call(this);

    if (this._createLightsLater) {
      this._createLightsLater();
    }

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
