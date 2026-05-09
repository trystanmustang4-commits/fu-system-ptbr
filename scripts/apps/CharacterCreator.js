import { SYSTEM_ID, FU_CONFIG } from '../config.js';
import { FU_CLASSES }        from '../static/classes.js';
import { FU_WEAPONS, FU_ARMORS, FU_SHIELDS, calcDefenses } from '../static/equipment.js';
import { FU_THEMES, FU_BOND_EMOTIONS, FU_ATTR_PROFILES }   from '../static/themes.js';

const STARTING_BUDGET = 500;

// Valid die combinations sorted descending (profile enforcement)
const VALID_PROFILES = FU_ATTR_PROFILES.map(p => [...p.dice].sort((a, b) => b - a));

export class CharacterCreator extends Application {

  constructor({ actor } = {}) {
    super();
    this._step  = 0;
    this._char  = CharacterCreator._blankCharacter();
    this._actor = actor ?? null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:       'fu-character-creator',
      title:    game.i18n.localize('FABULA_ULTIMA.OpenCreator'),
      template: `systems/${SYSTEM_ID}/templates/apps/character-creator.hbs`,
      width:    880,
      height:   680,
      resizable: true,
      classes:  ['fu-chargen', `fu-theme-${game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME) ?? 'livro'}`],
    });
  }

  // ── Blank character skeleton ───────────────────────────────────

  static _blankCharacter() {
    return {
      name:        '',
      pronouns:    '',
      appearance:  '',
      identity:    '',
      theme:       '',
      themeCustom: '',
      origin:      '',
      level:       5,    // configurable starting level
      classes:     [],   // [{ id, levels, powers:[] }]
      attributes:  { des: 8, vig: 8, ast: 8, von: 8 },
      attrProfile: 'mediano',
      equipment: {
        weapons:  [],
        armorId:  'sem_armadura',
        shieldId: null,
      },
      bonds: [],   // [{ target, emotions:{pair1:null,pair2:null,pair3:null} }]
    };
  }

  static get STEPS() {
    return [
      { key: 'identidade',  label: 'Identidade'  },
      { key: 'classes',     label: 'Classes'     },
      { key: 'atributos',   label: 'Atributos'   },
      { key: 'equipamento', label: 'Equipamento' },
      { key: 'lacos',       label: 'Laços'       },
      { key: 'revisao',     label: 'Revisão'     },
    ];
  }

  // ── Derived stats calculator ──────────────────────────────────

  _calcStats() {
    const c    = this._char;
    const attr = c.attributes;
    const lvl  = c.level ?? 5;

    let pvBonus  = 0;
    let pmBonus  = 0;
    let piBonus  = 0;
    let canEquip = new Set();

    for (const cc of c.classes) {
      const cls = FU_CLASSES.find(f => f.id === cc.id);
      if (!cls) continue;
      pvBonus += cls.initialBenefits.pv  ?? 0;
      pmBonus += cls.initialBenefits.pm  ?? 0;
      piBonus += cls.initialBenefits.pi  ?? 0;
      for (const e of cls.initialBenefits.canEquip ?? []) canEquip.add(e);
    }

    const pvMax  = lvl + (5 * attr.vig) + pvBonus;
    const pmMax  = lvl + (5 * attr.von) + pmBonus;
    const piMax  = 6 + piBonus;
    const crisis = Math.floor(pvMax / 2);

    const armor  = FU_ARMORS.find(a  => a.id  === c.equipment.armorId)  ?? FU_ARMORS[0];
    const shield = c.equipment.shieldId ? FU_SHIELDS.find(s => s.id === c.equipment.shieldId) : null;
    const { def, mdef, initiative } = calcDefenses(armor, shield, attr);

    const weaponCost = c.equipment.weapons.reduce((sum, wid) => {
      const w = FU_WEAPONS.find(x => x.id === wid);
      return sum + (w?.cost ?? 0);
    }, 0);
    const spent  = weaponCost + (armor?.cost ?? 0) + (shield?.cost ?? 0);
    const budget = STARTING_BUDGET - spent;

    return { pvMax, crisis, pmMax, piMax, def, mdef, initiative, canEquip, spent, budget, totalLevel: lvl };
  }

  // ── Handlebars data ───────────────────────────────────────────

  getData() {
    const c     = this._char;
    const stats = this._calcStats();
    const startingLevel = c.level ?? 5;

    const bondsForTemplate = c.bonds.map((b, i) => ({
      ...b,
      bondIdx:  i,
      strength: Object.values(b.emotions).filter(Boolean).length,
    }));

    const bondEmotionsForTemplate = FU_BOND_EMOTIONS.map((ep, i) => ({
      ...ep,
      pairKey: `pair${i + 1}`,
    }));

    // Fix: spread def first, then override levels; keep def.powers as-is;
    // put selected power IDs under a different key to avoid collision.
    const selectedClasses = c.classes.map(cc => {
      const def = FU_CLASSES.find(f => f.id === cc.id);
      return {
        ...def,
        levels:          cc.levels,
        selectedPowerIds: cc.powers,  // selected power IDs; def.powers stays intact
      };
    });

    const totalClassLevels = c.classes.reduce((s, cc) => s + cc.levels, 0);
    const levelsLeft       = startingLevel - totalClassLevels;
    const canAddClass      = selectedClasses.length < 3 && levelsLeft > 0;

    return {
      step:     this._step,
      steps:    CharacterCreator.STEPS,
      char:     { ...c, bonds: bondsForTemplate },
      stats,
      startingLevel,
      startingBudget: STARTING_BUDGET,
      themes:         FU_THEMES,
      profiles:       FU_ATTR_PROFILES,
      bondEmotions:   bondEmotionsForTemplate,
      allClasses:     FU_CLASSES,
      allWeapons:     FU_WEAPONS,
      allArmors:      FU_ARMORS,
      allShields:     FU_SHIELDS,
      selectedClasses,
      totalClassLevels,
      levelsLeft,
      canAddClass,
      isFirst:   this._step === 0,
      isLast:    this._step === CharacterCreator.STEPS.length - 1,
      canPrev:   this._step > 0,
      canNext:   this._step < CharacterCreator.STEPS.length - 1,
      canCreate: this._canCreate(),
    };
  }

  _canCreate() {
    const c      = this._char;
    const lvl    = c.level ?? 5;
    if (!c.name?.trim())     return false;
    if (!c.identity?.trim()) return false;
    const levels = c.classes.reduce((s, cc) => s + cc.levels, 0);
    if (levels !== lvl)                          return false;
    if (c.classes.length < 2 || c.classes.length > 3) return false;
    return true;
  }

  // ── Listeners ────────────────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.fu-btn-next').on('click', () => this._navigate(1));
    html.find('.fu-btn-prev').on('click', () => this._navigate(-1));
    html.find('.fu-step-tab').on('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.step);
      if (!isNaN(idx)) { this._step = idx; this.render(); }
    });

    // Generic field inputs
    html.find('.fu-field').on('change input', (e) => {
      const field = e.currentTarget.dataset.field;
      if (!field) return;
      let val = e.currentTarget.value;
      if (e.currentTarget.type === 'number') val = parseInt(val) || 0;
      foundry.utils.setProperty(this._char, field, val);
      this._refreshStats(html);
    });

    // Level stepper (+/- buttons for character level)
    html.find('.fu-level-inc').on('click', () => {
      this._char.level = Math.min(50, (this._char.level ?? 5) + 1);
      this.render();
    });
    html.find('.fu-level-dec').on('click', () => {
      const min = Math.max(1, this._char.classes.reduce((s, c) => s + c.levels, 0));
      this._char.level = Math.max(min, (this._char.level ?? 5) - 1);
      this.render();
    });

    // Class level stepper (+/- buttons per class)
    html.find('.fu-class-inc').on('click', (e) => {
      const id  = e.currentTarget.dataset.classId;
      const cc  = this._char.classes.find(c => c.id === id);
      if (!cc) return;
      const used = this._char.classes.reduce((s, c) => s + c.levels, 0);
      const lvl  = this._char.level ?? 5;
      if (used >= lvl) return ui.notifications.warn(`Já distribuiu todos os ${lvl} níveis.`);
      cc.levels = Math.min(10, cc.levels + 1);
      this._refreshStats(html);
      this.render();
    });
    html.find('.fu-class-dec').on('click', (e) => {
      const id = e.currentTarget.dataset.classId;
      const cc = this._char.classes.find(c => c.id === id);
      if (!cc) return;
      if (cc.levels <= 1) return;
      cc.levels = cc.levels - 1;
      cc.powers = cc.powers.slice(0, cc.levels);
      this._refreshStats(html);
      this.render();
    });

    html.find('.fu-add-class').on('click', (e) => {
      const id = e.currentTarget.dataset.classId;
      if (!id || this._char.classes.find(c => c.id === id)) return;
      if (this._char.classes.length >= 3) return ui.notifications.warn('Máximo de 3 classes.');
      const used = this._char.classes.reduce((s, c) => s + c.levels, 0);
      const lvl  = this._char.level ?? 5;
      if (used >= lvl) return ui.notifications.warn(`Todos os ${lvl} níveis já foram distribuídos.`);
      this._char.classes.push({ id, levels: 1, powers: [] });
      this.render();
    });

    html.find('.fu-remove-class').on('click', (e) => {
      const id = e.currentTarget.dataset.classId;
      this._char.classes = this._char.classes.filter(c => c.id !== id);
      this.render();
    });

    html.find('.fu-power-checkbox').on('change', (e) => {
      const classId = e.currentTarget.dataset.classId;
      const powerId = e.currentTarget.dataset.powerId;
      const cc      = this._char.classes.find(c => c.id === classId);
      if (!cc) return;
      if (e.currentTarget.checked) {
        if (cc.powers.length < cc.levels) cc.powers.push(powerId);
        else {
          e.currentTarget.checked = false;
          ui.notifications.warn('Limite de poderes atingido para os níveis nessa classe.');
        }
      } else {
        cc.powers = cc.powers.filter(p => p !== powerId);
      }
    });

    html.find('.fu-profile-btn').on('click', (e) => {
      const profileId = e.currentTarget.dataset.profile;
      const profile   = FU_ATTR_PROFILES.find(p => p.id === profileId);
      if (!profile) return;
      this._char.attrProfile = profileId;
      // Assign dice in canonical order: des, vig, ast, von — sorted desc
      const sorted = [...profile.dice].sort((a, b) => b - a);
      this._char.attributes = { des: sorted[0], vig: sorted[1], ast: sorted[2], von: sorted[3] };
      this.render();
    });

    html.find('.fu-attr-die').on('change', (e) => {
      const attr = e.currentTarget.dataset.attr;
      const val  = parseInt(e.currentTarget.value);
      if (attr && !isNaN(val)) this._char.attributes[attr] = val;
      this._refreshStats(html);
    });

    html.find('.fu-weapon-checkbox').on('change', (e) => {
      const id     = e.currentTarget.dataset.weaponId;
      const weapon = FU_WEAPONS.find(w => w.id === id);
      if (!weapon) return;
      const stats  = this._calcStats();
      if (e.currentTarget.checked) {
        if (weapon.martial && !stats.canEquip.has(weapon.range === 'Corpo a corpo' ? 'melee_martial' : 'ranged_martial')) {
          e.currentTarget.checked = false;
          return ui.notifications.warn(`Você precisa de uma classe que permita equipar essa arma marcial.`);
        }
        if (stats.budget < weapon.cost) {
          e.currentTarget.checked = false;
          return ui.notifications.warn(`Orçamento insuficiente. Faltam ${weapon.cost - stats.budget} z.`);
        }
        this._char.equipment.weapons.push(id);
      } else {
        this._char.equipment.weapons = this._char.equipment.weapons.filter(w => w !== id);
      }
      this._refreshStats(html);
    });

    html.find('.fu-armor-select').on('change', (e) => {
      const id    = e.currentTarget.value;
      const armor = FU_ARMORS.find(a => a.id === id);
      const stats = this._calcStats();
      if (armor?.martial && !stats.canEquip.has('armor_martial')) {
        e.currentTarget.value = this._char.equipment.armorId;
        return ui.notifications.warn('Você precisa de uma classe que permita armaduras marciais.');
      }
      const oldArmor = FU_ARMORS.find(a => a.id === this._char.equipment.armorId);
      const freeSlot = stats.budget + (oldArmor?.cost ?? 0);
      if (armor && freeSlot < armor.cost) {
        e.currentTarget.value = this._char.equipment.armorId;
        return ui.notifications.warn('Orçamento insuficiente para esta armadura.');
      }
      this._char.equipment.armorId = id;
      this._refreshStats(html);
    });

    html.find('.fu-shield-select').on('change', (e) => {
      const id     = e.currentTarget.value || null;
      const shield = id ? FU_SHIELDS.find(s => s.id === id) : null;
      const stats  = this._calcStats();
      if (shield?.martial && !stats.canEquip.has('shield_martial')) {
        e.currentTarget.value = this._char.equipment.shieldId ?? '';
        return ui.notifications.warn('Você precisa de uma classe que permita escudos marciais.');
      }
      const oldShield = this._char.equipment.shieldId ? FU_SHIELDS.find(s => s.id === this._char.equipment.shieldId) : null;
      const freeSlot  = stats.budget + (oldShield?.cost ?? 0);
      if (shield && freeSlot < shield.cost) {
        e.currentTarget.value = this._char.equipment.shieldId ?? '';
        return ui.notifications.warn('Orçamento insuficiente para este escudo.');
      }
      this._char.equipment.shieldId = id;
      this._refreshStats(html);
    });

    html.find('.fu-add-bond').on('click', () => {
      if (this._char.bonds.length >= 6) return ui.notifications.warn('Máximo de 6 Laços atingido.');
      this._char.bonds.push({ target: '', emotions: { pair1: null, pair2: null, pair3: null } });
      this.render();
    });

    html.find('.fu-remove-bond').on('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.bondIdx);
      this._char.bonds.splice(idx, 1);
      this.render();
    });

    html.find('.fu-bond-target').on('change input', (e) => {
      const idx = parseInt(e.currentTarget.dataset.bondIdx);
      if (this._char.bonds[idx]) this._char.bonds[idx].target = e.currentTarget.value;
    });

    html.find('.fu-bond-emotion').on('change', (e) => {
      const idx  = parseInt(e.currentTarget.dataset.bondIdx);
      const pair = e.currentTarget.dataset.pair;
      const bond = this._char.bonds[idx];
      if (!bond) return;
      bond.emotions[pair] = e.currentTarget.checked ? e.currentTarget.value : null;
      this._refreshBondStrength(html, idx);
    });

    html.find('.fu-btn-create').on('click', () => this._onCreate());
  }

  _refreshStats(html) {
    const stats = this._calcStats();
    html.find('.fu-stat-pv').text(stats.pvMax);
    html.find('.fu-stat-pm').text(stats.pmMax);
    html.find('.fu-stat-pi').text(stats.piMax);
    html.find('.fu-stat-crisis').text(stats.crisis);
    html.find('.fu-stat-def').text(stats.def);
    html.find('.fu-stat-mdef').text(stats.mdef);
    html.find('.fu-stat-init').text(stats.initiative >= 0 ? `+${stats.initiative}` : `${stats.initiative}`);
    html.find('.fu-stat-budget').text(stats.budget);
    html.find('.fu-budget-bar').css('width', `${Math.max(0, Math.min(100, (stats.budget / STARTING_BUDGET) * 100))}%`);
    html.find('.fu-stat-levels').text(this._char.classes.reduce((s, c) => s + c.levels, 0));
  }

  _refreshBondStrength(html, idx) {
    const bond = this._char.bonds[idx];
    if (!bond) return;
    const strength = Object.values(bond.emotions).filter(Boolean).length;
    html.find(`.fu-bond-strength[data-bond-idx="${idx}"]`).text(strength);
  }

  _navigate(dir) {
    const next = this._step + dir;
    if (next < 0 || next >= CharacterCreator.STEPS.length) return;
    if (dir > 0 && !this._validateStep(this._step)) return;
    this._step = next;
    this.render();
  }

  _validateStep(step) {
    const c   = this._char;
    const lvl = c.level ?? 5;
    switch (step) {
      case 0:
        if (!c.name?.trim())     { ui.notifications.warn('Insira o nome do personagem.'); return false; }
        if (!c.identity?.trim()) { ui.notifications.warn('Insira a Identidade do personagem.'); return false; }
        return true;
      case 1: {
        const levels = c.classes.reduce((s, cc) => s + cc.levels, 0);
        if (c.classes.length < 2)   { ui.notifications.warn('Escolha pelo menos 2 classes.'); return false; }
        if (levels !== lvl)          { ui.notifications.warn(`Distribua exatamente ${lvl} níveis (atual: ${levels}).`); return false; }
        for (const cc of c.classes) {
          if (cc.powers.length !== cc.levels) {
            ui.notifications.warn(`Escolha ${cc.levels} poder(es) para ${FU_CLASSES.find(f => f.id === cc.id)?.name}.`);
            return false;
          }
        }
        return true;
      }
      case 2: {
        const vals = Object.values(c.attributes).sort((a, b) => b - a);
        if (vals.some(v => !v || v === 0)) { ui.notifications.warn('Atribua o dado de cada Atributo.'); return false; }
        const matchesProfile = VALID_PROFILES.some(p => p.every((d, i) => d === vals[i]));
        if (!matchesProfile) {
          ui.notifications.warn('Os dados não formam um perfil válido. Use: Especializado (d10,d10,d6,d6), Mediano (d10,d8,d8,d6) ou Pau pra Toda Obra (d8,d8,d8,d8).');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }

  // ── Actor creation ────────────────────────────────────────────

  async _onCreate() {
    if (!this._canCreate()) {
      return ui.notifications.warn('Complete todos os passos obrigatórios antes de criar o personagem.');
    }

    const c     = this._char;
    const stats = this._calcStats();
    const lvl   = c.level ?? 5;

    const systemData = {
      identity:   c.identity.trim(),
      pronouns:   c.pronouns,
      appearance: c.appearance,
      theme:      c.theme || c.themeCustom,
      origin:     c.origin,
      attributes: { ...c.attributes },
      level:      lvl,
      fabula:     3,
      zeni:       STARTING_BUDGET - stats.spent,
      pv:  { value: stats.pvMax,  max: stats.pvMax,  bonus: 0 },
      pm:  { value: stats.pmMax,  max: stats.pmMax,  bonus: 0 },
      pi:  { value: stats.piMax,  max: stats.piMax,  bonus: 0 },
      bonds: c.bonds.map(b => ({
        name:     b.target,
        emotion1: b.emotions.pair1 ?? '',
        emotion2: b.emotions.pair2 ?? '',
        emotion3: b.emotions.pair3 ?? '',
        strength: Object.values(b.emotions).filter(Boolean).length,
      })),
      biography: { value: this._buildBio(c, stats) },
    };

    const actor = await Actor.create({
      name:   c.name.trim(),
      type:   'character',
      system: systemData,
      prototypeToken: {
        name:        c.name.trim(),
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      },
    });

    if (!actor) return;

    // Create class items
    const classItems = c.classes.map(cc => {
      const def = FU_CLASSES.find(f => f.id === cc.id);
      if (!def) return null;
      return {
        name: def.name, type: 'class',
        system: {
          description: def.description,
          level:   cc.levels,
          benefits: { pv: def.initialBenefits.pv ?? 0, pm: def.initialBenefits.pm ?? 0, pi: def.initialBenefits.pi ?? 0 },
          canEquip:  def.initialBenefits.canEquip  ?? [],
          canRitual: def.initialBenefits.canRitual ?? [],
        },
      };
    }).filter(Boolean);
    if (classItems.length) await actor.createEmbeddedDocuments('Item', classItems);

    // Create power items
    const powerItems = [];
    for (const cc of c.classes) {
      const def = FU_CLASSES.find(f => f.id === cc.id);
      if (!def) continue;
      for (const powerId of cc.powers) {
        const p = def.powers.find(x => x.id === powerId);
        if (!p) continue;
        powerItems.push({ name: p.name, type: 'power', system: { description: p.description, classId: cc.id, maxLevel: p.maxLevel, level: 1 } });
      }
    }
    if (powerItems.length) await actor.createEmbeddedDocuments('Item', powerItems);

    // Create weapon items
    const weaponItems = c.equipment.weapons.map(wid => {
      const w = FU_WEAPONS.find(x => x.id === wid);
      if (!w) return null;
      return {
        name: w.name, type: 'weapon',
        system: {
          category: w.category, cost: w.cost, hands: w.hands,
          range: w.range === 'Corpo a corpo' ? 'melee' : 'ranged',
          martial: w.martial, precision: w.precision, precisionBonus: w.precisionBonus,
          damage: w.damage, damageType: 'physical', equipped: true,
        },
      };
    }).filter(Boolean);
    if (weaponItems.length) await actor.createEmbeddedDocuments('Item', weaponItems);

    // Create armor / shield items
    const equipItems = [];
    const armor = FU_ARMORS.find(a => a.id === c.equipment.armorId);
    if (armor && armor.id !== 'sem_armadura') {
      equipItems.push({
        name: armor.name, type: 'armor',
        system: {
          cost: armor.cost, martial: armor.martial,
          defFixed: armor.defFixed ?? null, defFormula: armor.defFormula ?? 'des', defBonus: armor.defBonus ?? 0,
          mdefFormula: armor.mdefFormula ?? 'ast', mdefBonus: armor.mdefBonus ?? 0,
          initiativeModifier: armor.initiativeModifier ?? 0, equipped: true,
        },
      });
    }
    const shield = c.equipment.shieldId ? FU_SHIELDS.find(s => s.id === c.equipment.shieldId) : null;
    if (shield) {
      equipItems.push({
        name: shield.name, type: 'shield',
        system: {
          cost: shield.cost, martial: shield.martial,
          defBonus: shield.defBonus ?? 0, mdefBonus: shield.mdefBonus ?? 0,
          initiativeModifier: shield.initiativeModifier ?? 0, equipped: true,
        },
      });
    }
    if (equipItems.length) await actor.createEmbeddedDocuments('Item', equipItems);

    ui.notifications.info(`Personagem "${actor.name}" criado com sucesso!`);
    // Close wizard first, then open the sheet
    this.close();
    actor.sheet.render(true);
  }

  _buildBio(c, stats) {
    const attr   = c.attributes;
    const dieStr = v => `d${v}`;
    const classLines = c.classes.map(cc => {
      const def    = FU_CLASSES.find(f => f.id === cc.id);
      const powers = cc.powers.map(pid => def?.powers.find(p => p.id === pid)?.name ?? pid).join(', ');
      return `${def?.name} (${cc.levels} nível${cc.levels > 1 ? 'is' : ''}): ${powers}`;
    }).join('\n');
    const bondLines = c.bonds.map(b => {
      const emos     = Object.values(b.emotions).filter(Boolean).join(', ');
      const strength = Object.values(b.emotions).filter(Boolean).length;
      return `${b.target} [Força ${strength}] – ${emos}`;
    }).join('\n');

    return `== Identidade ==
${c.identity}

Tema: ${c.theme || c.themeCustom}
Origem: ${c.origin}
Pronomes: ${c.pronouns}

== Atributos ==
DES ${dieStr(attr.des)}  VIG ${dieStr(attr.vig)}  AST ${dieStr(attr.ast)}  VON ${dieStr(attr.von)}

== Estatísticas (Nível ${stats.totalLevel}) ==
PV: ${stats.pvMax} (Crise: ${stats.crisis})
PM: ${stats.pmMax}  PI: ${stats.piMax}
DEF: ${stats.def}  DEF.M: ${stats.mdef}
Iniciativa: ${stats.initiative >= 0 ? '+' + stats.initiative : stats.initiative}
Pontos de Fábula: 3

== Classes e Poderes ==
${classLines}

== Laços ==
${bondLines || '(nenhum)'}

== Aparência ==
${c.appearance || '(não descrita)'}`;
  }
}
