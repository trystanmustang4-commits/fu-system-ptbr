// All basic weapons, armors, and shields from Fabula Ultima Livro Básico
// Precision formula uses attribute keys: des, vig, ast, von
// Armor DEF: fixed number or 'des'/'ast' (use character's die value)
// Martial items (martial: true) require class permission to equip

export const FU_WEAPONS = [
  // ── Armas Arcanas ──────────────────────────────────────────────
  {
    id: 'cajado',
    name: 'Cajado',
    category: 'Armas Arcanas',
    cost: 100,
    hands: 2,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['von', 'von'],
    precisionBonus: 0,
    damage: 6,
    damageType: 'físico',
    note: 'Arma arcana.',
  },
  {
    id: 'tomo',
    name: 'Tomo',
    category: 'Armas Arcanas',
    cost: 100,
    hands: 2,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['ast', 'ast'],
    precisionBonus: 0,
    damage: 6,
    damageType: 'físico',
    note: 'Arma arcana.',
  },
  // ── Arcos ───────────────────────────────────────────────────────
  {
    id: 'besta',
    name: 'Besta',
    category: 'Arcos',
    cost: 150,
    hands: 2,
    range: 'À distância',
    martial: false,
    precision: ['des', 'ast'],
    precisionBonus: 0,
    damage: 8,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'arco_curto',
    name: 'Arco Curto',
    category: 'Arcos',
    cost: 200,
    hands: 2,
    range: 'À distância',
    martial: false,
    precision: ['des', 'des'],
    precisionBonus: 0,
    damage: 8,
    damageType: 'físico',
    note: '',
  },
  // ── Luta ────────────────────────────────────────────────────────
  {
    id: 'desarmado',
    name: 'Ataque Desarmado',
    category: 'Luta',
    cost: 0,
    hands: 1,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 0,
    damageType: 'físico',
    note: 'Equipado em cada espaço de mão vazio.',
  },
  {
    id: 'improvisada',
    name: 'Improvisada',
    category: 'Luta',
    cost: 0,
    hands: 1,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 2,
    damageType: 'físico',
    note: 'Quebra após o ataque.',
  },
  {
    id: 'soqueira',
    name: 'Soqueira de Ferro',
    category: 'Luta',
    cost: 150,
    hands: 1,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 6,
    damageType: 'físico',
    note: '',
  },
  // ── Adagas ──────────────────────────────────────────────────────
  {
    id: 'adaga_aco',
    name: 'Adaga de Aço',
    category: 'Adagas',
    cost: 150,
    hands: 1,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['des', 'ast'],
    precisionBonus: 1,
    damage: 4,
    damageType: 'físico',
    note: '',
  },
  // ── Armas de Fogo ───────────────────────────────────────────────
  {
    id: 'pistola',
    name: 'Pistola',
    category: 'Armas de Fogo',
    cost: 250,
    hands: 1,
    range: 'À distância',
    martial: true,
    precision: ['des', 'ast'],
    precisionBonus: 0,
    damage: 8,
    damageType: 'físico',
    note: '',
  },
  // ── Malhos ──────────────────────────────────────────────────────
  {
    id: 'chicote_correntes',
    name: 'Chicote de Correntes',
    category: 'Malhos',
    cost: 150,
    hands: 2,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['des', 'des'],
    precisionBonus: 0,
    damage: 8,
    damageType: 'físico',
    note: '',
  },
  // ── Armas Pesadas ───────────────────────────────────────────────
  {
    id: 'martelo_ferro',
    name: 'Martelo de Ferro',
    category: 'Armas Pesadas',
    cost: 200,
    hands: 1,
    range: 'Corpo a corpo',
    martial: false,
    precision: ['vig', 'vig'],
    precisionBonus: 0,
    damage: 6,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'machado_largo',
    name: 'Machado Largo',
    category: 'Armas Pesadas',
    cost: 250,
    hands: 1,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['vig', 'vig'],
    precisionBonus: 0,
    damage: 10,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'machado_guerra',
    name: 'Machado de Guerra',
    category: 'Armas Pesadas',
    cost: 250,
    hands: 2,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['vig', 'vig'],
    precisionBonus: 0,
    damage: 14,
    damageType: 'físico',
    note: '',
  },
  // ── Lanças ──────────────────────────────────────────────────────
  {
    id: 'lanca_leve',
    name: 'Lança Leve',
    category: 'Lanças',
    cost: 200,
    hands: 1,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 8,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'lanca_pesada',
    name: 'Lança Pesada',
    category: 'Lanças',
    cost: 200,
    hands: 2,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 12,
    damageType: 'físico',
    note: '',
  },
  // ── Espadas ─────────────────────────────────────────────────────
  {
    id: 'espada_bronze',
    name: 'Espada de Bronze',
    category: 'Espadas',
    cost: 200,
    hands: 1,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'vig'],
    precisionBonus: 1,
    damage: 6,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'montante',
    name: 'Montante',
    category: 'Espadas',
    cost: 200,
    hands: 2,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'vig'],
    precisionBonus: 1,
    damage: 10,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'katana',
    name: 'Katana',
    category: 'Espadas',
    cost: 200,
    hands: 2,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'ast'],
    precisionBonus: 1,
    damage: 10,
    damageType: 'físico',
    note: '',
  },
  {
    id: 'rapieira',
    name: 'Rapieira',
    category: 'Espadas',
    cost: 200,
    hands: 1,
    range: 'Corpo a corpo',
    martial: true,
    precision: ['des', 'ast'],
    precisionBonus: 1,
    damage: 6,
    damageType: 'físico',
    note: '',
  },
  // ── Armas de Arremesso ──────────────────────────────────────────
  {
    id: 'improvisada_arremesso',
    name: 'Improvisada (Arremesso)',
    category: 'Armas de Arremesso',
    cost: 0,
    hands: 1,
    range: 'À distância',
    martial: false,
    precision: ['des', 'vig'],
    precisionBonus: 0,
    damage: 2,
    damageType: 'físico',
    note: 'Quebra após o ataque.',
  },
  {
    id: 'shuriken',
    name: 'Shuriken',
    category: 'Armas de Arremesso',
    cost: 150,
    hands: 1,
    range: 'À distância',
    martial: false,
    precision: ['des', 'ast'],
    precisionBonus: 0,
    damage: 4,
    damageType: 'físico',
    note: '',
  },
];

// Armor DEF/DEF.M representation:
// defFormula: 'des' → DEF = DES die value + defBonus
// defFixed: number  → DEF = fixed value (martial armors)
// mdefFormula: 'ast' → DEF.M = AST die value + mdefBonus
export const FU_ARMORS = [
  {
    id: 'sem_armadura',
    name: 'Sem Armadura',
    cost: 0,
    martial: false,
    defFormula: 'des', defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 0,
    initiativeModifier: 0,
    note: '',
  },
  {
    id: 'camisa_seda',
    name: 'Camisa de Seda',
    cost: 100,
    martial: false,
    defFormula: 'des', defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 2,
    initiativeModifier: -1,
    note: '',
  },
  {
    id: 'traje_viagem',
    name: 'Traje de Viagem',
    cost: 100,
    martial: false,
    defFormula: 'des', defBonus: 1,
    mdefFormula: 'ast', mdefBonus: 1,
    initiativeModifier: -1,
    note: '',
  },
  {
    id: 'tunica_combate',
    name: 'Túnica de Combate',
    cost: 150,
    martial: false,
    defFormula: 'des', defBonus: 1,
    mdefFormula: 'ast', mdefBonus: 1,
    initiativeModifier: 0,
    note: '',
  },
  {
    id: 'vestes_sabio',
    name: 'Vestes de Sábio',
    cost: 200,
    martial: false,
    defFormula: 'des', defBonus: 1,
    mdefFormula: 'ast', mdefBonus: 2,
    initiativeModifier: -2,
    note: '',
  },
  {
    id: 'brigantina',
    name: 'Brigantina',
    cost: 150,
    martial: true,
    defFixed: 10, defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 0,
    initiativeModifier: -2,
    note: '',
  },
  {
    id: 'placa_bronze',
    name: 'Placa de Bronze',
    cost: 200,
    martial: true,
    defFixed: 11, defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 0,
    initiativeModifier: -3,
    note: '',
  },
  {
    id: 'placa_runica',
    name: 'Placa Rúnica',
    cost: 250,
    martial: true,
    defFixed: 11, defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 1,
    initiativeModifier: -3,
    note: '',
  },
  {
    id: 'placa_aco',
    name: 'Placa de Aço',
    cost: 300,
    martial: true,
    defFixed: 12, defBonus: 0,
    mdefFormula: 'ast', mdefBonus: 0,
    initiativeModifier: -4,
    note: '',
  },
];

export const FU_SHIELDS = [
  {
    id: 'escudo_bronze',
    name: 'Escudo de Bronze',
    cost: 100,
    martial: false,
    defBonus: 2,
    mdefBonus: 0,
    initiativeModifier: 0,
    note: '',
  },
  {
    id: 'escudo_runico',
    name: 'Escudo Rúnico',
    cost: 150,
    martial: true,
    defBonus: 2,
    mdefBonus: 2,
    initiativeModifier: 0,
    note: '',
  },
];

// Attribute die values map
export const DIE_VALUES = { 6: 'd6', 8: 'd8', 10: 'd10', 12: 'd12' };
export const ATTR_NAMES  = { des: 'Destreza', vig: 'Vigor', ast: 'Astúcia', von: 'Vontade' };

/** Calculate precision formula label from weapon data and attribute dice */
export function precisionLabel(weapon, attrs) {
  const attrLabel = (k) => `${ATTR_NAMES[k]} (${DIE_VALUES[attrs[k]]})`;
  const parts = weapon.precision.map(attrLabel);
  const bonus = weapon.precisionBonus !== 0 ? ` ${weapon.precisionBonus > 0 ? '+' : ''}${weapon.precisionBonus}` : '';
  return `(${parts.join(' + ')})${bonus}`;
}

/** Compute DEF, DEF.M, and Initiative from armor + shield + attributes */
export function calcDefenses(armor, shield, attrs) {
  const dieVal = (k) => attrs[k] ?? 8;

  let def  = armor.defFixed  ?? (dieVal('des') + (armor.defBonus ?? 0));
  let mdef = armor.defFixed  != null
    ? dieVal('ast') + (armor.mdefBonus ?? 0)
    : dieVal('ast') + (armor.mdefBonus ?? 0);

  // For non-fixed armors the formula is: dieVal('ast') + armor.mdefBonus
  if (armor.mdefFormula === 'ast') mdef = dieVal('ast') + (armor.mdefBonus ?? 0);

  if (shield) {
    def  += shield.defBonus  ?? 0;
    mdef += shield.mdefBonus ?? 0;
  }

  const initiative = (armor.initiativeModifier ?? 0) + (shield?.initiativeModifier ?? 0);
  return { def, mdef, initiative };
}
