const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField, BooleanField, ArrayField } = foundry.data.fields;

export class SpellData extends TypeDataModel {
  static defineSchema() {
    return {
      description:  new StringField({ initial: "", blank: true }),
      source:       new StringField({ initial: "" }),
      discipline:   new StringField({ initial: "" }),
      mpCost:       new NumberField({ initial: 10, min: 0, integer: true }),
      // Target: "single", "multi", "all", "self", "area"
      target:       new StringField({ initial: "single" }),
      // Duration: "instant", "scene", "sustained"
      duration:     new StringField({ initial: "instant" }),
      // Precision formula attributes (for offensive spells)
      precision:    new ArrayField(new StringField(), { initial: ["ast", "von"] }),
      damage:       new NumberField({ initial: 0, min: 0, integer: true }),
      damageType:   new StringField({ initial: "physical", blank: true }),
      isOffensive:  new BooleanField({ initial: false }),
      isRitual:     new BooleanField({ initial: false }),
      quality:      new StringField({ initial: "", blank: true }),
    };
  }
}

export class ConsumableData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "", blank: true }),
      source:      new StringField({ initial: "" }),
      cost:        new NumberField({ initial: 0, min: 0, integer: true }),
      quantity:    new NumberField({ initial: 1, min: 0, integer: true }),
      effect:      new StringField({ initial: "", blank: true }),
    };
  }
}

export class MiscData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "", blank: true }),
      source:      new StringField({ initial: "" }),
      cost:        new NumberField({ initial: 0, min: 0, integer: true }),
      quantity:    new NumberField({ initial: 1, min: 0, integer: true }),
    };
  }
}
