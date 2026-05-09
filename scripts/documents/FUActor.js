import { SYSTEM_ID } from "../config.js";

export class FUActor extends Actor {
  /** Override to compute defense stats from equipped items after base data. */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "character") this._prepareCharacterData();
  }

  _prepareCharacterData() {
    const sysData = this.system;
    const attr    = sysData.attributes;

    // Resolve equipped armor and shield system data (or fallback plain objects)
    const armorSys  = this._findEquippedItemSystem("armor")  ?? this._defaultArmor();
    const shieldSys = this._findEquippedItemSystem("shield");

    // DEF
    let def;
    if (armorSys.defFixed != null) {
      def = armorSys.defFixed + (armorSys.defBonus ?? 0);
    } else {
      def = (attr[armorSys.defFormula ?? "des"] ?? 0) + (armorSys.defBonus ?? 0);
    }
    if (shieldSys) def += shieldSys.defBonus ?? 0;
    sysData.def = def;

    // DEF.M
    let mdef = (attr[armorSys.mdefFormula ?? "ast"] ?? 0) + (armorSys.mdefBonus ?? 0);
    if (shieldSys) mdef += shieldSys.mdefBonus ?? 0;
    sysData.mdef = mdef;

    // Initiative
    let initiative = armorSys.initiativeModifier ?? 0;
    if (shieldSys) initiative += shieldSys.initiativeModifier ?? 0;
    sysData.initiative = initiative;

    // Accumulate class bonuses (pv/pm/pi) from embedded Class items
    let pvBonus = 0, pmBonus = 0, piBonus = 0;
    for (const item of this.items) {
      if (item.type === "class") {
        pvBonus += item.system.benefits?.pv ?? 0;
        pmBonus += item.system.benefits?.pm ?? 0;
        piBonus += item.system.benefits?.pi ?? 0;
        // Equipment permissions — cached on actor flags for sheet use
      }
    }
    sysData.pv.bonus = pvBonus;
    sysData.pm.bonus = pmBonus;
    sysData.pi.bonus = piBonus;

    // Recalculate maxima with updated bonuses
    const level = sysData.level;
    sysData.pv.max = level + 5 * attr.vig + pvBonus;
    sysData.pm.max = level + 5 * attr.von + pmBonus;
    sysData.pi.max = 6 + piBonus;
    sysData.crisis = Math.floor(sysData.pv.max / 2);

    // Clamp current values to max
    sysData.pv.value = Math.min(sysData.pv.value, sysData.pv.max);
    sysData.pm.value = Math.min(sysData.pm.value, sysData.pm.max);
    sysData.pi.value = Math.min(sysData.pi.value, sysData.pi.max);

    // Cache equipment permissions from all class items
    this._cacheEquipPermissions();
  }

  /** Returns the system data of the first equipped item of a given type, or null. */
  _findEquippedItemSystem(type) {
    return this.items.find(i => i.type === type && i.system.equipped)?.system ?? null;
  }

  _defaultArmor() {
    return { defFormula: "des", defBonus: 0, mdefFormula: "ast", mdefBonus: 0, initiativeModifier: 0 };
  }

  _cacheEquipPermissions() {
    const perms = new Set();
    for (const item of this.items) {
      if (item.type === "class") {
        for (const p of (item.system.canEquip ?? [])) perms.add(p);
      }
    }
    // Store on the actor instance (not on the DataModel, which is schema-bound)
    this._equipPermissions = [...perms];
  }

  /** Roll a test: two attribute dice, return {total, die1, die2, ra, critical, fumble} */
  async rollTest(attr1Key, attr2Key, { flavor = "", tnTarget = null, bonus = 0, rollMode } = {}) {
    const { FURoll } = await import("../rolls/FURoll.js");
    const die1 = this.system.attributes[attr1Key] ?? 8;
    const die2 = this.system.attributes[attr2Key] ?? 8;
    const roll  = await FURoll.rollTest(die1, die2, { flavor, actor: this, tnTarget, bonus, rollMode });
    return roll;
  }

  /** Get a flat array of all equipment permission keys from equipped classes */
  get equipPermissions() {
    return this._equipPermissions ?? [];
  }

  canEquip(permissionKey) {
    return this.equipPermissions.includes(permissionKey);
  }
}
