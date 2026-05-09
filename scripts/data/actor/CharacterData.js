const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField, BooleanField, SchemaField, ArrayField, ObjectField } = foundry.data.fields;

export class CharacterData extends TypeDataModel {
  static defineSchema() {
    return {
      // ── Identity ────────────────────────────────────────────────
      identity:   new StringField({ initial: "" }),
      pronouns:   new StringField({ initial: "" }),
      appearance: new StringField({ initial: "" }),
      theme:      new StringField({ initial: "" }),
      origin:     new StringField({ initial: "" }),
      species:    new StringField({ initial: "human" }),

      // ── Attributes (die faces: 6, 8, 10, 12) ────────────────────
      attributes: new SchemaField({
        des: new NumberField({ initial: 8, min: 6, max: 12, integer: true }),
        vig: new NumberField({ initial: 8, min: 6, max: 12, integer: true }),
        ast: new NumberField({ initial: 8, min: 6, max: 12, integer: true }),
        von: new NumberField({ initial: 8, min: 6, max: 12, integer: true }),
      }),

      // ── Progression ─────────────────────────────────────────────
      level:  new NumberField({ initial: 5,  min: 1, max: 50, integer: true }),
      exp:    new NumberField({ initial: 0,  min: 0, integer: true }),

      // ── Resources (current / max) ────────────────────────────────
      pv: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max:   new NumberField({ initial: 0, min: 0, integer: true }),
        bonus: new NumberField({ initial: 0, integer: true }),
      }),
      pm: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max:   new NumberField({ initial: 0, min: 0, integer: true }),
        bonus: new NumberField({ initial: 0, integer: true }),
      }),
      pi: new SchemaField({
        value: new NumberField({ initial: 6, min: 0, integer: true }),
        max:   new NumberField({ initial: 6, min: 0, integer: true }),
        bonus: new NumberField({ initial: 0, integer: true }),
      }),

      // ── Currency & Meta ─────────────────────────────────────────
      zeni:   new NumberField({ initial: 0, min: 0, integer: true }),
      fabula: new NumberField({ initial: 3, min: 0, integer: true }),

      // ── Villain-only fields ──────────────────────────────────────
      isVillain:     new BooleanField({ initial: false }),
      ultimaPoints:  new NumberField({ initial: 0, min: 0, integer: true }),
      villainPhase:  new NumberField({ initial: 1, min: 1, max: 5, integer: true }),

      // ── Bonds (Laços) ────────────────────────────────────────────
      bonds: new ArrayField(new SchemaField({
        name:     new StringField({ initial: "" }),
        emotion1: new StringField({ initial: "" }),
        emotion2: new StringField({ initial: "" }),
        emotion3: new StringField({ initial: "" }),
        strength: new NumberField({ initial: 0, min: 0, max: 3, integer: true }),
      })),

      // ── Damage affinities ────────────────────────────────────────
      // Values: "normal" | "resist" | "immune" | "absorb" | "vulnerable"
      affinities: new SchemaField(
        Object.fromEntries(
          ["physical","air","bolt","dark","earth","fire","ice","light","poison"].map(t => [
            t, new StringField({ initial: "normal", blank: false }),
          ])
        )
      ),

      // ── Conditions (booleans) ────────────────────────────────────
      conditions: new SchemaField({
        shaken:      new BooleanField({ initial: false }),
        stunned:     new BooleanField({ initial: false }),
        weak:        new BooleanField({ initial: false }),
        slow:        new BooleanField({ initial: false }),
        poisoned:    new BooleanField({ initial: false }),
        unconscious: new BooleanField({ initial: false }),
      }),

      // ── Equipment slots ─────────────────────────────────────────
      // These store Item UUIDs or ids; actual stats are read from embedded Items
      equippedWeapon1: new StringField({ initial: "" }),
      equippedWeapon2: new StringField({ initial: "" }),
      equippedArmor:   new StringField({ initial: "" }),
      equippedShield:  new StringField({ initial: "" }),

      // ── Notes ───────────────────────────────────────────────────
      notes: new SchemaField({
        value: new StringField({ initial: "" }),
      }),
      biography: new SchemaField({
        value: new StringField({ initial: "" }),
      }),
    };
  }

  /** Called after base data is prepared; compute derived stats from raw values. */
  prepareDerivedData() {
    const attr  = this.attributes;
    const level = this.level;

    // Die face → numeric value (already stored as numbers)
    const dv = (k) => attr[k] ?? 8;

    // PV max = level + 5 × VIG_die + class bonus (bonus stored separately)
    this.pv.max = level + 5 * dv('vig') + (this.pv.bonus ?? 0);

    // PM max = level + 5 × VON_die + class bonus
    this.pm.max = level + 5 * dv('von') + (this.pm.bonus ?? 0);

    // PI max = 6 + class bonus
    this.pi.max = 6 + (this.pi.bonus ?? 0);

    // Crisis threshold = floor(PV max / 2)
    this.crisis = Math.floor(this.pv.max / 2);

    // DEF and DEF.M are computed in FUActor after reading equipped items
    // (stored here for display; updated in prepareData on the Actor)
    this.def  = this.def  ?? dv('des');
    this.mdef = this.mdef ?? dv('ast');
    this.initiative = this.initiative ?? 0;
  }
}
