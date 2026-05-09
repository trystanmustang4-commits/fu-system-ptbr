const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField, BooleanField } = foundry.data.fields;

export class ArmorData extends TypeDataModel {
  static defineSchema() {
    return {
      description:        new StringField({ initial: "", blank: true }),
      source:             new StringField({ initial: "" }),
      cost:               new NumberField({ initial: 0, min: 0, integer: true }),
      martial:            new BooleanField({ initial: false }),
      // DEF: either a fixed number or derived from attribute die
      defFixed:           new NumberField({ initial: null, nullable: true, integer: true }),
      defFormula:         new StringField({ initial: "des", blank: true }),
      defBonus:           new NumberField({ initial: 0, integer: true }),
      mdefFormula:        new StringField({ initial: "ast" }),
      mdefBonus:          new NumberField({ initial: 0, integer: true }),
      initiativeModifier: new NumberField({ initial: 0, integer: true }),
      quality:            new StringField({ initial: "", blank: true }),
      equipped:           new BooleanField({ initial: false }),
    };
  }
}

export class ShieldData extends TypeDataModel {
  static defineSchema() {
    return {
      description:        new StringField({ initial: "", blank: true }),
      source:             new StringField({ initial: "" }),
      cost:               new NumberField({ initial: 0, min: 0, integer: true }),
      martial:            new BooleanField({ initial: false }),
      defBonus:           new NumberField({ initial: 0, integer: true }),
      mdefBonus:          new NumberField({ initial: 0, integer: true }),
      initiativeModifier: new NumberField({ initial: 0, integer: true }),
      quality:            new StringField({ initial: "", blank: true }),
      equipped:           new BooleanField({ initial: false }),
    };
  }
}
