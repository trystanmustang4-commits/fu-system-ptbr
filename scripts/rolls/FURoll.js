import { SYSTEM_ID, FU_CONFIG } from "../config.js";

/**
 * Core Fabula Ultima roll mechanic:
 * - Always rolls exactly 2 attribute dice
 * - RA = highest of the two
 * - Critical success: both dice show the same number ≥ 6
 * - Critical failure (fumble): both dice show the same number ≤ 3
 * - Total = die1 + die2 + modifiers
 */
export class FURoll {
  /**
   * Roll a FU precision test.
   * @param {number}  die1      Faces of attribute die 1 (e.g. 8 for d8)
   * @param {number}  die2      Faces of attribute die 2
   * @param {object}  [opts]
   * @param {string}  [opts.flavor]
   * @param {Actor}   [opts.actor]
   * @param {number}  [opts.tnTarget]    Target number (optional, for display)
   * @param {number}  [opts.bonus]       Flat modifier to add
   * @param {string}  [opts.rollMode]
   * @returns {Promise<FURollResult>}
   */
  static async rollTest(die1, die2, { flavor = "", actor = null, tnTarget = null, bonus = 0, rollMode } = {}) {
    const formula = `d${die1} + d${die2}${bonus ? ` + ${bonus}` : ""}`;
    const roll    = new Roll(formula);
    await roll.evaluate();

    const [r1, r2]  = roll.dice.map(d => d.total);
    const ra        = Math.max(r1, r2);
    const total     = roll.total;
    const critical  = r1 === r2 && r1 >= 6;
    const fumble    = r1 === r2 && r1 <= 3;
    const success   = tnTarget != null ? total >= tnTarget : null;

    const result = new FURollResult({ roll, die1: r1, die2: r2, ra, total, critical, fumble, success, tnTarget, flavor, actor, bonus });
    await result.toChat({ rollMode });

    if (critical && actor) {
      const showOpp = game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.SHOW_OPPORTUNITY) ?? true;
      if (showOpp) {
        const { OpportunityDialog } = await import("../apps/OpportunityDialog.js");
        OpportunityDialog.show(actor, result);
      }
    }

    return result;
  }

  /**
   * Damage roll: single die equal to RA, plus flat bonus.
   */
  static async rollDamage(raFaces, bonus = 0, { damageType = "physical", flavor = "", actor = null, rollMode } = {}) {
    const formula = `d${raFaces}${bonus ? ` + ${bonus}` : ""}`;
    const roll    = new Roll(formula);
    await roll.evaluate();
    return { roll, total: roll.total, damageType, raFaces };
  }
}

export class FURollResult {
  constructor({ roll, die1, die2, ra, total, critical, fumble, success, tnTarget, flavor, actor, bonus }) {
    this.roll     = roll;
    this.die1     = die1;
    this.die2     = die2;
    this.ra       = ra;
    this.total    = total;
    this.critical = critical;
    this.fumble   = fumble;
    this.success  = success;
    this.tnTarget = tnTarget;
    this.flavor   = flavor;
    this.actor    = actor;
    this.bonus    = bonus;
  }

  /** Send this result to chat as a themed card. */
  async toChat({ rollMode } = {}) {
    const { ChatCard } = await import("./ChatCard.js");
    await ChatCard.fromRoll(this, { rollMode });
  }
}
