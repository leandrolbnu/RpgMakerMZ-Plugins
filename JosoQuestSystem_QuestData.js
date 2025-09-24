/*:
 * @target MZ
 * @plugindesc [v1.0] Quest Data Storage – Defines quests, descriptions, rewards, XP, and sound effects | By JosoGaming
 * @author JosoGaming
 *
 * @help
 * ============================================================================
 * JosoQuestSystem_Data
 * ============================================================================
 *
 * This plugin defines all quests used in the Simple Quest System.
 * It must be loaded **before** the main Quest System plugin.
 *
 * ----------------------------------------------------------------------------
 * 🧩 How to Define Quests:
 * ----------------------------------------------------------------------------
 * Use the global `QuestData` object to store your quests.
 * Each entry should follow this structure:
 *
 * "quest_id": {
 *   name: "Quest Title",                     // Title shown in the Quest Log
 *   description: "Quest description text.",  // Full description
 *   required: 5,                             // Amount of progress required
 *   xp: 100,                                 // XP awarded upon completion
 *   rewards: [                               // Array of rewards (see below)
 *     { type: "item", id: 1, amount: 3 },
 *     { type: "gold", amount: 200 }
 *   ],
 *   completeSe: "Chime2"                     // (Optional) SE played on turn-in
 * }
 *
 * ----------------------------------------------------------------------------
 * 🎁 Reward Types:
 * ----------------------------------------------------------------------------
 * Each reward is an object with:
 *
 * - `type`: One of "item", "weapon", "armor", or "gold"
 * - `id`: Database ID (not required for "gold")
 * - `amount`: Quantity (defaults to 1 if omitted)
 *
 * ----------------------------------------------------------------------------
 * 🔊 Sound Effect on Completion:
 * ----------------------------------------------------------------------------
 * - Use the `completeSe` property to specify a SE (sound effect) to play
 *   when the player completes the quest.
 * - The sound must exist in your `/audio/se/` folder.
 * - This property is optional.
 *
 * ----------------------------------------------------------------------------
 * 🧪 Example:
 * ----------------------------------------------------------------------------
 * QuestData = {
 *   "gather_apples": {
 *     name: "Gather Apples",
 *     description: "Collect 5 apples from the forest floor.",
 *     required: 5,
 *     xp: 100,
 *     rewards: [
 *       { type: "item", id: 7, amount: 1 },
 *       { type: "gold", amount: 200 }
 *     ],
 *     completeSe: "Chime2"
 *   },
 *
 *   "slay_slimes": {
 *     name: "Slay the Slimes",
 *     description: "Eliminate 3 slimes near the town entrance.",
 *     required: 3,
 *     xp: 150,
 *     rewards: [
 *       { type: "weapon", id: 2 },
 *       { type: "armor", id: 3 }
 *     ],
 *     completeSe: "Chime2"
 *   }
 * };
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

var QuestData = {
    gather_apples: {
        name: "Gather Apples",
        description: "Aqui vai um texto descritivo de teste",
        xp: 100,
        rewards: [
            { type: "item", id: 7, amount: 1 }, 
            { type: "gold", amount: 200 }
        ],
        required: 5,
        completeSe: "Chime2"
    },
    slay_slimes: {
        name: "Slay the Slimes",
        description: "Eliminate 3 slimes near the town entrance.",
        xp: 150,
        rewards: [
            { type: "weapon", id: 2, amount: 1 },
            { type: "armor", id: 3, amount: 1 }
        ],
        required: 3,
        completeSe: "Chime2"
    }
};