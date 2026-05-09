import { SYSTEM_ID, FU_CONFIG } from "../config.js";
import { checkCrisis } from "./conditions.js";
import { OpportunityDialog } from "../apps/OpportunityDialog.js";

/**
 * Apply damage to an actor (respects AUTO_DAMAGE setting).
 * Affinity system: "immune" | "absorb" | "resist" | "normal" | "vulnerable"
 */
export async function applyDamage(actor, amount, damageType = "physical") {
  if (!game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.AUTO_DAMAGE)) return;

  const affinity  = actor.system.affinities?.[damageType] ?? "normal";
  let   effective = amount;

  if      (affinity === "immune")    effective = 0;
  else if (affinity === "absorb")    effective = -amount;     // heals
  else if (affinity === "resist")    effective = Math.floor(amount / 2);
  else if (affinity === "vulnerable") effective = amount * 2;

  const curPV = actor.system.pv.value;
  const newPV = Math.clamp(curPV - effective, 0, actor.system.pv.max);

  await actor.update({ "system.pv.value": newPV });

  checkCrisis(actor);

  // Post damage card
  const msg = game.i18n.format("FABULA_ULTIMA.Combat.DamageApplied", {
    name:   actor.name,
    amount: effective,
    type:   game.i18n.localize(FU_CONFIG.DAMAGE_TYPES[damageType] ?? damageType),
  });
  ChatMessage.create({ content: `<p class="fu-damage-msg">${msg}</p>`, speaker: ChatMessage.getSpeaker({ actor }) });
}

/**
 * Hook: called when a FURollResult is critical.
 * Shows opportunity dialog if setting is on.
 */
export function onCriticalSuccess(rollResult, actor) {
  if (!game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.SHOW_OPPORTUNITY)) return;
  if (!game.user.isGM && !actor?.isOwner) return;
  OpportunityDialog.show(actor, rollResult);
}

/**
 * Hook: deduct mana when a spell is used (AUTO_MANA setting).
 */
export async function spendMana(actor, mpCost) {
  if (!game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.AUTO_MANA)) return;
  const curPM = actor.system.pm.value;
  if (curPM < mpCost) {
    ui.notifications.warn(game.i18n.format("FABULA_ULTIMA.Combat.InsufficientMP", { name: actor.name }));
    return false;
  }
  await actor.update({ "system.pm.value": curPM - mpCost });
  return true;
}
