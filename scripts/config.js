export const SYSTEM_ID = "fabula-ultima";

export const FU_CONFIG = {
  // Die values for attributes
  DIE_VALUES: [6, 8, 10, 12],

  // Attribute keys and their die-face labels
  ATTRIBUTES: {
    des: "FABULA_ULTIMA.Attributes.des",
    vig: "FABULA_ULTIMA.Attributes.vig",
    ast: "FABULA_ULTIMA.Attributes.ast",
    von: "FABULA_ULTIMA.Attributes.von",
  },

  // Attribute short labels (for display in dice selectors)
  ATTRIBUTE_ABBR: {
    des: "DES",
    vig: "VIG",
    ast: "AST",
    von: "VON",
  },

  // The 6 core conditions from Livro Básico
  CONDITIONS: {
    shaken:      { id: "shaken",      label: "FABULA_ULTIMA.Conditions.shaken",      icon: "icons/svg/daze.svg" },
    stunned:     { id: "stunned",     label: "FABULA_ULTIMA.Conditions.stunned",      icon: "icons/svg/stoned.svg" },
    weak:        { id: "weak",        label: "FABULA_ULTIMA.Conditions.weak",         icon: "icons/svg/downgrade.svg" },
    slow:        { id: "slow",        label: "FABULA_ULTIMA.Conditions.slow",         icon: "icons/svg/falling.svg" },
    poisoned:    { id: "poisoned",    label: "FABULA_ULTIMA.Conditions.poisoned",     icon: "icons/svg/poison.svg" },
    unconscious: { id: "unconscious", label: "FABULA_ULTIMA.Conditions.unconscious",  icon: "icons/svg/unconscious.svg" },
  },

  // Item types
  ITEM_TYPES: ["weapon", "armor", "shield", "class", "power", "spell", "consumable", "misc"],

  // Actor types
  ACTOR_TYPES: ["character", "group"],

  // Damage types
  DAMAGE_TYPES: {
    physical:  "FABULA_ULTIMA.DamageTypes.physical",
    air:       "FABULA_ULTIMA.DamageTypes.air",
    bolt:      "FABULA_ULTIMA.DamageTypes.bolt",
    dark:      "FABULA_ULTIMA.DamageTypes.dark",
    earth:     "FABULA_ULTIMA.DamageTypes.earth",
    fire:      "FABULA_ULTIMA.DamageTypes.fire",
    ice:       "FABULA_ULTIMA.DamageTypes.ice",
    light:     "FABULA_ULTIMA.DamageTypes.light",
    poison:    "FABULA_ULTIMA.DamageTypes.poison",
  },

  // Weapon categories
  WEAPON_CATEGORIES: {
    melee:  "FABULA_ULTIMA.Equipment.melee",
    ranged: "FABULA_ULTIMA.Equipment.ranged",
  },

  // Species (raças) from all books
  SPECIES: {
    human:     "FABULA_ULTIMA.Species.human",
    beast:     "FABULA_ULTIMA.Species.beast",
    construct: "FABULA_ULTIMA.Species.construct",
    demon:     "FABULA_ULTIMA.Species.demon",
    elemental: "FABULA_ULTIMA.Species.elemental",
    fairy:     "FABULA_ULTIMA.Species.fairy",
    monster:   "FABULA_ULTIMA.Species.monster",
    plant:     "FABULA_ULTIMA.Species.plant",
    undead:    "FABULA_ULTIMA.Species.undead",
  },

  // Default stat values for a new character at level 5
  DEFAULTS: {
    level:  5,
    fabula: 3,
    zeni:   0,
    exp:    0,
  },

  // Settings keys
  SETTINGS: {
    THEME:             "theme",
    AUTO_DAMAGE:       "automationDamage",
    AUTO_CONDITIONS:   "automationConditions",
    AUTO_CRISIS:       "automationCrisis",
    AUTO_MANA:         "automationMana",
    SHOW_OPPORTUNITY:  "showOpportunity",
  },

  // Template paths prefix
  TEMPLATE_PATH: `systems/${SYSTEM_ID}/templates`,
};

/**
 * Helper: converts a die-face number to a Foundry Roll formula token.
 * e.g. 10 → "d10"
 */
export function dieLabel(faces) {
  return `d${faces}`;
}

/**
 * Helper: returns the numeric value of an attribute die key from system data.
 * Accepts values like "d8", 8, or "8".
 */
export function parseDie(value) {
  if (typeof value === "number") return value;
  return parseInt(String(value).replace("d", ""), 10) || 6;
}
