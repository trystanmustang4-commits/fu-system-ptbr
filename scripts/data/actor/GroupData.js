const { TypeDataModel } = foundry.abstract;
const { StringField, ArrayField, SchemaField, NumberField } = foundry.data.fields;

export class GroupData extends TypeDataModel {
  static defineSchema() {
    return {
      // ── Group resources ─────────────────────────────────────────
      zeni:   new NumberField({ initial: 0, min: 0, integer: true }),
      fabula: new NumberField({ initial: 0, min: 0, integer: true }),

      // ── Members (Actor UUIDs) ────────────────────────────────────
      members: new ArrayField(new StringField({ initial: "" })),

      // ── Group bonds (cross-PJ Laços) ────────────────────────────
      bonds: new ArrayField(new SchemaField({
        from:     new StringField({ initial: "" }),
        to:       new StringField({ initial: "" }),
        emotion1: new StringField({ initial: "" }),
        emotion2: new StringField({ initial: "" }),
        strength: new NumberField({ initial: 0, min: 0, max: 3, integer: true }),
      })),

      // ── Shared notes ─────────────────────────────────────────────
      notes: new SchemaField({
        value: new StringField({ initial: "" }),
      }),
      biography: new SchemaField({
        value: new StringField({ initial: "" }),
      }),
    };
  }
}
