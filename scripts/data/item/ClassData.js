const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField, ArrayField, SchemaField, BooleanField } = foundry.data.fields;

export class ClassData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "", blank: true }),
      source:      new StringField({ initial: "" }),
      level:       new NumberField({ initial: 1, min: 1, max: 10, integer: true }),
      // Initial benefits from first level of this class
      benefits: new SchemaField({
        pv:    new NumberField({ initial: 0, integer: true }),
        pm:    new NumberField({ initial: 0, integer: true }),
        pi:    new NumberField({ initial: 0, integer: true }),
      }),
      // Equipment permissions granted by this class
      canEquip: new ArrayField(new StringField()),
      // Ritual disciplines granted by this class
      canRitual: new ArrayField(new StringField()),
    };
  }
}

export class PowerData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "", blank: true }),
      source:      new StringField({ initial: "" }),
      classId:     new StringField({ initial: "" }),
      level:       new NumberField({ initial: 1, min: 1, max: 10, integer: true }),
      maxLevel:    new NumberField({ initial: 1, min: 1, max: 10, integer: true }),
    };
  }
}
