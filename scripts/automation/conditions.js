import { SYSTEM_ID, FU_CONFIG } from "../config.js";

/**
 * Apply one or more conditions to an actor.
 * Respects the automationConditions setting.
 */
export async function applyCondition(actor, conditionId) {
  if (!game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.AUTO_CONDITIONS)) return;
  if (!(conditionId in FU_CONFIG.CONDITIONS)) return;

  await actor.update({ [`system.conditions.${conditionId}`]: true });
  _notifyCondition(actor, conditionId, true);
}

export async function removeCondition(actor, conditionId) {
  if (!(conditionId in FU_CONFIG.CONDITIONS)) return;
  await actor.update({ [`system.conditions.${conditionId}`]: false });
  _notifyCondition(actor, conditionId, false);
}

export async function clearAllConditions(actor) {
  const updates = {};
  for (const key of Object.keys(FU_CONFIG.CONDITIONS)) {
    updates[`system.conditions.${key}`] = false;
  }
  await actor.update(updates);
}

export function hasCondition(actor, conditionId) {
  return actor.system?.conditions?.[conditionId] === true;
}

export function getActiveConditions(actor) {
  const conds = actor.system?.conditions ?? {};
  return Object.entries(conds)
    .filter(([, v]) => v === true)
    .map(([k]) => k);
}

/** Post a chat notification when a condition is applied/removed. */
function _notifyCondition(actor, conditionId, applied) {
  const def    = FU_CONFIG.CONDITIONS[conditionId];
  const label  = game.i18n.localize(def.label);
  const verb   = applied
    ? game.i18n.localize("FABULA_ULTIMA.Conditions.Applied")
    : game.i18n.localize("FABULA_ULTIMA.Conditions.Removed");
  const content = `<p class="fu-condition-msg"><img src="${def.icon}" class="condition-icon"> <strong>${actor.name}</strong> ${verb} <em>${label}</em>.</p>`;
  ChatMessage.create({ content, speaker: ChatMessage.getSpeaker({ actor }) });
}

/**
 * Hook: when a character reaches crisis, auto-notify.
 * Called from FUActor after updating PV.
 */
export function checkCrisis(actor) {
  if (!game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.AUTO_CRISIS)) return;
  if (actor.type !== "character") return;
  const sys = actor.system;
  if (sys.pv.value <= sys.crisis && sys.pv.value > 0) {
    const msg = game.i18n.format("FABULA_ULTIMA.Crisis.Entered", { name: actor.name });
    ChatMessage.create({ content: `<p class="fu-crisis">${msg}</p>`, speaker: ChatMessage.getSpeaker({ actor }) });
  }
}
