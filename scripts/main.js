/**
 * Fabula Ultima — Sistema Foundry VTT
 * Entry point: registers DataModels, documents, sheets, settings, and hooks.
 */

import { SYSTEM_ID, FU_CONFIG } from "./config.js";

// DataModels
import { CharacterData, GroupData }                        from "./data/actor/index.js";
import { WeaponData, ArmorData, ShieldData,
         ClassData, PowerData,
         SpellData, ConsumableData, MiscData }             from "./data/item/index.js";

// Document extensions
import { FUActor } from "./documents/FUActor.js";
import { FUItem  } from "./documents/FUItem.js";

// Sheets
import { FUCharacterSheet } from "./sheets/actor/FUCharacterSheet.js";
import { FUGroupSheet      } from "./sheets/actor/FUGroupSheet.js";
import { FUItemSheet       } from "./sheets/item/FUItemSheet.js";

// Apps
import { CharacterCreator  } from "./apps/CharacterCreator.js";
import { FabulaTracker     } from "./apps/FabulaTracker.js";

// ── INIT ──────────────────────────────────────────────────────────────────────

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Inicializando sistema Fabula Ultima`);

  // Expose system API
  game.fabula = {
    FUActor, FUItem,
    FURoll:    null,          // set after import in ready
    openCreator: () => new CharacterCreator().render(true),
    openTracker: () => FabulaTracker.open(),
    config: FU_CONFIG,
  };

  // Register document classes
  CONFIG.Actor.documentClass = FUActor;
  CONFIG.Item.documentClass  = FUItem;

  // Register DataModels
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    group:     GroupData,
  };
  CONFIG.Item.dataModels = {
    weapon:     WeaponData,
    armor:      ArmorData,
    shield:     ShieldData,
    class:      ClassData,
    power:      PowerData,
    spell:      SpellData,
    consumable: ConsumableData,
    misc:       MiscData,
  };

  // Unregister default sheets, register system sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM_ID, FUCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "FABULA_ULTIMA.Sheet.Character",
  });
  Actors.registerSheet(SYSTEM_ID, FUGroupSheet, {
    types: ["group"],
    makeDefault: true,
    label: "FABULA_ULTIMA.Sheet.Group",
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM_ID, FUItemSheet, {
    makeDefault: true,
    label: "FABULA_ULTIMA.Sheet.Item",
  });

  // Register system settings
  _registerSettings();

  // Register Handlebars helpers
  _registerHelpers();

  // Pre-load all templates
  _preloadTemplates();
});

// ── READY ─────────────────────────────────────────────────────────────────────

Hooks.once("ready", async () => {
  const { FURoll } = await import("./rolls/FURoll.js");
  game.fabula.FURoll = FURoll;

  // Apply theme CSS class to body
  const theme = game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME);
  document.body.classList.add(`fu-theme-${theme}`);

  // Auto-open Fábula tracker for GMs
  if (game.user.isGM) {
    FabulaTracker.open();
  }

  console.log(`${SYSTEM_ID} | Sistema pronto! Use game.fabula.openCreator() para criar personagens.`);
});

// ── ACTOR DIRECTORY BUTTON ────────────────────────────────────────────────────

Hooks.on("renderActorDirectory", (app, html) => {
  const footer = html.querySelector?.(".directory-footer") ?? html.find?.(".directory-footer")?.[0];
  if (!footer) return;
  const btn = document.createElement("button");
  btn.className = "fu-create-btn";
  btn.type = "button";
  btn.innerHTML = `<i class="fas fa-scroll"></i> ${game.i18n.localize("FABULA_ULTIMA.OpenCreator")}`;
  btn.addEventListener("click", () => new CharacterCreator().render(true));
  footer.prepend(btn);
});

// ── CHAT MESSAGE HOOKS ─────────────────────────────────────────────────────────

Hooks.on("renderChatMessage", (message, html) => {
  html.querySelectorAll("[data-action='applyDamage']").forEach(btn => {
    btn.addEventListener("click", async ev => {
      ev.preventDefault();
      const targetActors = [...game.user.targets].map(t => t.actor).filter(Boolean);
      const amount = parseInt(btn.dataset.amount, 10);
      const type   = btn.dataset.type;
      if (!targetActors.length) {
        ui.notifications.warn(game.i18n.localize("FABULA_ULTIMA.Combat.NoTargets"));
        return;
      }
      const { applyDamage } = await import("./automation/combat.js");
      for (const actor of targetActors) await applyDamage(actor, amount, type);
    });
  });
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────

function _registerSettings() {
  game.settings.register(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME, {
    name: "FABULA_ULTIMA.Settings.ThemeName",
    hint: "FABULA_ULTIMA.Settings.ThemeHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      livro: "FABULA_ULTIMA.Settings.ThemeLivro",
      jrpg:  "FABULA_ULTIMA.Settings.ThemeJRPG",
    },
    default: "livro",
    onChange: theme => {
      document.body.classList.remove("fu-theme-livro", "fu-theme-jrpg");
      document.body.classList.add(`fu-theme-${theme}`);
    },
  });

  const automationDefs = [
    { key: FU_CONFIG.SETTINGS.AUTO_DAMAGE },
    { key: FU_CONFIG.SETTINGS.AUTO_CONDITIONS },
    { key: FU_CONFIG.SETTINGS.AUTO_CRISIS },
    { key: FU_CONFIG.SETTINGS.AUTO_MANA },
    { key: FU_CONFIG.SETTINGS.SHOW_OPPORTUNITY },
  ];

  for (const { key } of automationDefs) {
    game.settings.register(SYSTEM_ID, key, {
      name: `FABULA_ULTIMA.Settings.${key}Name`,
      hint: `FABULA_ULTIMA.Settings.${key}Hint`,
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function _registerHelpers() {
  Handlebars.registerHelper("fu_die",         v => `d${v}`);
  Handlebars.registerHelper("fu_attr_label",  key => game.i18n.localize(FU_CONFIG.ATTRIBUTES[key] ?? key));
  Handlebars.registerHelper("fu_includes",    (arr, val) => Array.isArray(arr) && arr.includes(val));
  Handlebars.registerHelper("fu_find",        (arr, key, val) => Array.isArray(arr) ? arr.find(o => o[key] === val) : undefined);
  Handlebars.registerHelper("fu_times",       (n, opts) => { let out = ""; for (let i = 0; i < n; i++) out += opts.fn(i); return out; });
  Handlebars.registerHelper("fu_clamp",       (v, min, max) => Math.min(Math.max(Number(v), Number(min)), Number(max)));
  Handlebars.registerHelper("fu_pct",         (cur, max) => max > 0 ? Math.round((cur / max) * 100) : 0);
  Handlebars.registerHelper("fu_cond_active", (conditions, key) => conditions?.[key] === true);
  Handlebars.registerHelper("fu_is",          (a, b) => a === b);
  Handlebars.registerHelper("fu_not",         v => !v);
  Handlebars.registerHelper("fu_or",          (a, b) => a || b);
  Handlebars.registerHelper("fu_and",         (a, b) => a && b);
  Handlebars.registerHelper("fu_localize",    key => game.i18n.localize(key));
  Handlebars.registerHelper("fu_damage_label",type => game.i18n.localize(FU_CONFIG.DAMAGE_TYPES[type] ?? type));
  Handlebars.registerHelper("fu_format_sign", val => val >= 0 ? `+${val}` : `${val}`);
  Handlebars.registerHelper("fu_eq",          (a, b) => a === b);
  Handlebars.registerHelper("fu_gt",          (a, b) => a > b);
  Handlebars.registerHelper("fu_sum",         (arr, key) => Array.isArray(arr) ? arr.reduce((s, x) => s + (x[key] ?? 0), 0) : 0);
  Handlebars.registerHelper("fu_range",       n => Array.from({ length: n }, (_, i) => i));
  Handlebars.registerHelper("fu_budget_pct",  (used, total) => total > 0 ? Math.round((used / total) * 100) : 0);
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

async function _preloadTemplates() {
  const base = `systems/${SYSTEM_ID}/templates`;
  return loadTemplates([
    `${base}/actor/character-sheet-header.hbs`,
    `${base}/actor/character-sheet-tabs.hbs`,
    `${base}/actor/tabs/tab-main.hbs`,
    `${base}/actor/tabs/tab-classes.hbs`,
    `${base}/actor/tabs/tab-equipment.hbs`,
    `${base}/actor/tabs/tab-spells.hbs`,
    `${base}/actor/tabs/tab-bonds.hbs`,
    `${base}/actor/tabs/tab-biography.hbs`,
    `${base}/actor/group-sheet.hbs`,
    `${base}/item/item-sheet.hbs`,
    `${base}/chat/roll-card.hbs`,
    `${base}/chat/item-card.hbs`,
    `${base}/apps/character-creator.hbs`,
    `${base}/apps/fabula-tracker.hbs`,
    `${base}/apps/opportunity-dialog.hbs`,
  ]);
}
