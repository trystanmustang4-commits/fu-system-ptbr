const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField, BooleanField, ArrayField } = foundry.data.fields;

export class WeaponData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "", blank: true }),
      source:      new StringField({ initial: "" }),
      category:    new StringField({ initial: "" }),
      cost:        new NumberField({ initial: 0, min: 0, integer: true }),
      hands:       new NumberField({ initial: 1, min: 1, max: 2, integer: true }),
      range:       new StringField({ initial: "melee", choices: ["melee", "ranged"] }),
      martial:     new BooleanField({ initial: false }),
      // precision: array of two attribute keys, e.g. ["des", "vig"]
      precision:      new ArrayField(new StringField(), { initial: ["des", "vig"] }),
      precisionBonus: new NumberField({ initial: 0, integer: true }),
      damage:         new NumberField({ initial: 0, min: 0, integer: true }),
      damageBonus:    new NumberField({ initial: 0, integer: true }),
      damageType:     new StringField({ initial: "physical" }),
      quality:        new StringField({ initial: "", blank: true }),
      equipped:       new BooleanField({ initial: false }),
    };
  }

  get precisionFormula() {
    return `(@attr.${this.precision[0]} + @attr.${this.precision[1]})${
      this.precisionBonus ? ` + ${this.precisionBonus}` : ""
    }`;
  }
}
