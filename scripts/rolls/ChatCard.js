import { SYSTEM_ID, FU_CONFIG } from "../config.js";

const ROLL_CARD_TEMPLATE = `systems/${SYSTEM_ID}/templates/chat/roll-card.hbs`;
const ITEM_CARD_TEMPLATE = `systems/${SYSTEM_ID}/templates/chat/item-card.hbs`;

export class ChatCard {
  /**
   * Render a FURollResult as a themed chat message.
   */
  static async fromRoll(rollResult, { rollMode } = {}) {
    const html = await renderTemplate(ROLL_CARD_TEMPLATE, {
      flavor:   rollResult.flavor,
      die1:     rollResult.die1,
      die2:     rollResult.die2,
      ra:       rollResult.ra,
      total:    rollResult.total,
      critical: rollResult.critical,
      fumble:   rollResult.fumble,
      success:  rollResult.success,
      tnTarget: rollResult.tnTarget,
      actor:    rollResult.actor,
    });

    // CHAT_MESSAGE_STYLES (v12+) replaced CHAT_MESSAGE_TYPES (v11)
    const ROLL_STYLE = CONST.CHAT_MESSAGE_STYLES?.ROLL ?? CONST.CHAT_MESSAGE_TYPES?.ROLL ?? 5;
    const messageData = {
      type:    ROLL_STYLE,
      rolls:   [rollResult.roll],
      content: html,
      speaker: rollResult.actor
        ? ChatMessage.getSpeaker({ actor: rollResult.actor })
        : ChatMessage.getSpeaker(),
      rollMode: rollMode ?? game.settings.get("core", "rollMode"),
      flags: { [SYSTEM_ID]: { type: "roll" } },
    };

    return ChatMessage.create(messageData);
  }

  /**
   * Render an item description card (no roll).
   */
  static async fromItem(item, { rollMode } = {}) {
    const html = await renderTemplate(ITEM_CARD_TEMPLATE, { item, system: item.system });

    const OTHER_STYLE = CONST.CHAT_MESSAGE_STYLES?.OTHER ?? CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0;
    const messageData = {
      type:    OTHER_STYLE,
      content: html,
      speaker: item.actor
        ? ChatMessage.getSpeaker({ actor: item.actor })
        : ChatMessage.getSpeaker(),
      rollMode: rollMode ?? game.settings.get("core", "rollMode"),
      flags: { [SYSTEM_ID]: { type: "item", itemId: item.id } },
    };

    return ChatMessage.create(messageData);
  }
}
