/*:
 * @target MZ
 * @plugindesc [v1.0] Blocks player movement over specific Region IDs on the map. | By JosoGaming
 * @author JosoGaming
 *
 * @param Blocked Region IDs
 * @type number[]
 * @default [1]
 * @desc List of Region IDs that should be impassable for the player.
 *
 * @help
 * =====================================================================
 * RegionBlocker Plugin
 * =====================================================================
 * 
 * This plugin prevents the player from walking over tiles marked with
 * certain Region IDs. It is useful for custom collision logic on the map.
 *
 * ---------------------------------------------------------------------
 * How to Use:
 * ---------------------------------------------------------------------
 * 1. Open your map in the editor.
 * 2. Use the "Region" layer (shortcut: R) to paint region IDs on tiles.
 * 3. Set which Region IDs should be blocked using the plugin parameter:
 *    → Blocked Region IDs: e.g., [1, 5, 7]
 *
 * Example:
 *   - Region 1: Blocks movement on water.
 *   - Region 5: Blocks cliffs or restricted zones.
 * 
 * ---------------------------------------------------------------------
 * Notes:
 * ---------------------------------------------------------------------
 * - Only the player is affected; events and followers are not blocked.
 * - No scripting or additional setup is needed.
 * - Use in combination with visual map tools for precise control.
 *
 * ---------------------------------------------------------------------
 * Compatibility:
 * ---------------------------------------------------------------------
 * - Designed for RPG Maker MZ.
 * - Does not override default tile passability unless a blocked Region ID is found.
 *
 * ============================================================================
 * Author: JosoGaming
 * ============================================================================
 * YouTube: https://www.youtube.com/@JosoGaming
 * Email: leandro.bnu@hotmail.com
 * Contact: Reach out through the channel for inquiries or permission requests.
 * ============================================================================
 *
 * ============================================================================
 * LICENSE
 * ============================================================================
 * This plugin is proprietary and was developed specifically for JosoGaming.
 * Redistribution, modification, or reuse in other projects is strictly forbidden
 * unless you are the original author or have written permission. 
 */

(() => {
    const params = PluginManager.parameters('JosoRegionBlocker');
    const blockedRegions = JSON.parse(params["Blocked Region IDs"] || "[]").map(Number);

    const _Game_Player_canPass = Game_Player.prototype.canPass;
    Game_Player.prototype.canPass = function(x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        const regionId = $gameMap.regionId(x2, y2);
        if (blockedRegions.includes(regionId)) return false;
        return Game_Character.prototype.canPass.call(this, x, y, d);
    };
})();
