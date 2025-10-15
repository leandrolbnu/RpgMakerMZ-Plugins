/*:
 * @target MZ
 * @plugindesc [v1.3] Dynamic lighting system with per-map darkness, colored 
 * lights, optional flicker and battle support | By JosoGaming
 * @author JosoGaming
 *
 * @help
 * ============================================================================
 * 🔧 DynamicLightingSystem – DYNAMIC LIGHTING SYSTEM
 * ============================================================================
 *
 * Adds a darkness overlay and dynamic lights to maps.
 * Darkness is configured per map, and lights are created using comments
 * in event pages. Supports custom colors and optional flicker effect.
 *
 * ----------------------------------------------------------------------------
 * 🔹 How to enable darkness on a map:
 * ----------------------------------------------------------------------------
 * In the map's **Note** field, add the following tag:
 *
 *     <darknessLevel:0.6>
 *
 * Where "0.6" defines darkness intensity (range: 0 to 1).
 * Use 0 for no darkness; higher values increase darkness.
 *
 * ----------------------------------------------------------------------------
 * 🔸 How to create lights on events:
 * ----------------------------------------------------------------------------
 * On the **active page** of the event, add Comment lines with the tags:
 *
 *     <lightRadius:100>         ← Sets the size of the light
 *     <lightColor:#ffaa00>      ← (Optional) Hex color of the light
 *     <lightFlicker:true>       ← (Optional) Enables flicker effect
 *
 * Lights appear only on active event pages.
 *
 * ----------------------------------------------------------------------------
 * 💡 Examples:
 * ----------------------------------------------------------------------------
 *     <lightRadius:120>
 *     <lightColor:#ffcc99>
 *     <lightFlicker:true>
 *
 * ----------------------------------------------------------------------------
 * 🎨 Suggested Light Colors (Hex Codes):
 * ----------------------------------------------------------------------------
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
 * 🧪 Tips:
 * ----------------------------------------------------------------------------
 * - Use invisible events for fixed-position lights.
 * - Flickering works well for torches, fireplaces, or crystals.
 * - Warm colors (#ff9900) for fire, cool tones (#88ccff) for magic effects.
 * - Lights automatically follow moving events.
 *
 * ----------------------------------------------------------------------------
 * 🔧 Compatibility:
 * ----------------------------------------------------------------------------
 * Standalone plugin with no external dependencies.
 * Can be combined with systems like weather or time of day by
 * dynamically changing <darknessLevel> or switching maps.
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
  // Map Darkness Setup - Reads map note for darkness level and stores it
  //=============================================================================
  const _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup.call(this, mapId);
    const note = $dataMap.note;
    const match = note && note.match(/<darknessLevel:(\d*\.?\d+)>/i);
    this._darknessLevel = match ? parseFloat(match[1]).clamp(0, 1) : 0;
  };
  Game_Map.prototype.darknessLevel = function() {
    return this._darknessLevel || 0;
  };

  //=============================================================================
  // Spriteset_Map.createLowerLayer - Adds darkness overlay and event lights container
  //=============================================================================
  const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
  Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_createLowerLayer.call(this);

    this._darknessSprite = new ScreenSprite();
    this._darknessSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this._darknessSprite.bitmap.fillAll("black");
    this._darknessSprite.opacity = 0;
    this.addChild(this._darknessSprite);

    this._eventLights = [];
    this._eventLightsInitialized = false;
  };

  //=============================================================================
  // Spriteset_Map.update - Updates darkness opacity and positions event lights
  //=============================================================================
  const _Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_update.call(this);
    const darkness = $gameMap ? $gameMap.darknessLevel() * 255 : 0;
   
    if (this._darknessSprite) {
      this._darknessSprite.opacity = darkness;
    }

    if (!this._eventLightsInitialized && $gameMap) {
      this._eventLights = [];
      for (const event of $gameMap.events()) {
        if (!event) {
          continue; 
        }

        const radius = getEventLightRadius(event);
       
        if (radius > 0) {
          const color = getEventLightColor(event) || "#ffffff";
          const flicker = getEventLightFlicker(event);
          const light = createLightSprite(radius, color);
          light._flicker = flicker;
          this._eventLights.push({ event, light });
          this.addChild(light);
          console.log(`Luz criada para evento ${event.eventId()} – raio: ${radius}, cor: ${color}, flicker: ${flicker}`);
        }
      }
      this._eventLightsInitialized = true;
    }

    // Updates light's positions to catch up with events and apply flickering if needs
    if (this._eventLights) {
      for (const { event, light } of this._eventLights) {
        if (event && light) {
          light.x = event.screenX();
          light.y = event.screenY() - ($gameMap.tileHeight() / 2);

          if (light._flicker) {
            const flickerSpeed = 0.15; // Higher values = Faster effect
            const flickerAmount = 0.15; // Intensity variation

            // Generates a pseudo-random value using sine + temporal noise to vary rapidly and irregularly of the flickering.
            const t = performance.now() * flickerSpeed;
            const flickerValue = (Math.sin(t * 10) + Math.sin(t * 7 + 1) + Math.sin(t * 13 + 2)) / 3;

            const scale = 1 + flickerValue * flickerAmount;
            light.scale.x = scale;
            light.scale.y = scale;

            light.alpha = 0.75 + flickerValue * 0.25;
          } else {
            light.scale.x = 1;
            light.scale.y = 1;
            light.alpha = 1;
          }
        }
      }
    }
  };

  //=============================================================================
  // Event Light Helpers - Reads radius, color, and flicker from event comments
  //=============================================================================
  function getEventLightRadius(event) {
    if (!event) {
      return 0;
    }

    const page = event.page();
    if (!page) {
      return 0;
    }
    
    const comments = page.list.filter(cmd => cmd.code === 108 || cmd.code === 408)
      .map(cmd => cmd.parameters[0]);
    
    for (const line of comments) {
      const match = line.match(/<lightRadius:(\d+)>/i);
      if (match) {
        return Number(match[1]);
      }
    }

    return 0;
  }

  // Reads the light color from the event's comment
  function getEventLightColor(event) {
    if (!event) {
      return null;
    }
  
    const page = event.page();
    if (!page) {
      return null;
    }
  
    const comments = page.list.filter(cmd => cmd.code === 108 || cmd.code === 408)
      .map(cmd => cmd.parameters[0]);
  
    for (const line of comments) {
      const match = line.match(/<lightColor:(#[0-9a-fA-F]{6})>/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Check if the event must have flickering
  function getEventLightFlicker(event) {
    if (!event) {
      return false;
    }

    const page = event.page();
    if (!page) {
      return false;
    }

    const comments = page.list.filter(cmd => cmd.code === 108 || cmd.code === 408)
      .map(cmd => cmd.parameters[0]);
    
    for (const line of comments) {
      if (line.match(/<lightFlicker:true>/i)) {
        return true;
      }
    }

    return false;
  }

  //=============================================================================
  // Create Light Sprite - Generates a circular gradient light for events
  //=============================================================================
  function createLightSprite(radius, colorHex = "#ffffff") {
    const sprite = new Sprite();
    const diameter = radius * 2;
    const bitmap = new Bitmap(diameter, diameter);
    const ctx = bitmap._context;

    const rgb = hexToRgb(colorHex) || { r: 255, g: 255, b: 255 };
    const grd = ctx.createRadialGradient(radius, radius, radius * 0.3, radius, radius, radius);
    grd.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`);
    grd.addColorStop(0.7, `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`);
    grd.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, diameter, diameter);
    bitmap._context = ctx;
    bitmap._baseTexture.update();

    sprite.bitmap = bitmap;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.blendMode = PIXI.BLEND_MODES.ADD;

    return sprite;
  }

  //=============================================================================
  // HEX to RGB - Converts hexadecimal color strings to RGB objects
  //=============================================================================
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map(h => h + h).join("");
    }

    const bigint = parseInt(hex, 16);
   
    if (isNaN(bigint)) {
      return null;
    }
   
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

})();
