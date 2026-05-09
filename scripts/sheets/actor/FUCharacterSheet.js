import { SYSTEM_ID, FU_CONFIG } from "../../config.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const TABS = {
  main:       { id: "main",       group: "primary", label: "FABULA_ULTIMA.Sheet.TabMain" },
  classes:    { id: "classes",    group: "primary", label: "FABULA_ULTIMA.Sheet.TabClasses" },
  equipment:  { id: "equipment",  group: "primary", label: "FABULA_ULTIMA.Sheet.TabEquipment" },
  spells:     { id: "spells",     group: "primary", label: "FABULA_ULTIMA.Sheet.TabSpells" },
  bonds:      { id: "bonds",      group: "primary", label: "FABULA_ULTIMA.Sheet.TabBonds" },
  biography:  { id: "biography",  group: "primary", label: "FABULA_ULTIMA.Sheet.TabBio" },
};

export class FUCharacterSheet extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["fabula-ultima", "actor-sheet", "character-sheet"],
    position: { width: 780, height: 700 },
    window: { resizable: true },
    actions: {
      rollAttr:      FUCharacterSheet._onRollAttr,
      rollWeapon:    FUCharacterSheet._onRollWeapon,
      rollSpell:     FUCharacterSheet._onRollSpell,
      useItem:       FUCharacterSheet._onUseItem,
      toggleEquip:   FUCharacterSheet._onToggleEquip,
      toggleCond:    FUCharacterSheet._onToggleCond,
      createItem:    FUCharacterSheet._onCreateItem,
      deleteItem:    FUCharacterSheet._onDeleteItem,
      editItem:      FUCharacterSheet._onEditItem,
      openCreator:   FUCharacterSheet._onOpenCreator,
    },
  };

  static PARTS = {
    header: {
      template: `systems/${SYSTEM_ID}/templates/actor/character-sheet-header.hbs`,
    },
    tabs: {
      template: `systems/${SYSTEM_ID}/templates/actor/character-sheet-tabs.hbs`,
    },
    main: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-main.hbs`,
    },
    classes: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-classes.hbs`,
    },
    equipment: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-equipment.hbs`,
    },
    spells: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-spells.hbs`,
    },
    bonds: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-bonds.hbs`,
    },
    biography: {
      template: `systems/${SYSTEM_ID}/templates/actor/tabs/tab-biography.hbs`,
    },
  };

  tabGroups = { primary: "main" };

  get title() {
    return `${this.actor.name} — ${game.i18n.localize("FABULA_ULTIMA.Sheet.Title")}`;
  }

  get actor() {
    return this.document;
  }

  async _prepareContext(options) {
    const actor   = this.actor;
    const system  = actor.system;
    const isOwner = actor.isOwner;

    // Partition items by type
    const classes    = actor.items.filter(i => i.type === "class");
    const powers     = actor.items.filter(i => i.type === "power");
    const weapons    = actor.items.filter(i => i.type === "weapon");
    const armors     = actor.items.filter(i => i.type === "armor");
    const shields    = actor.items.filter(i => i.type === "shield");
    const spells     = actor.items.filter(i => i.type === "spell");
    const consumables= actor.items.filter(i => i.type === "consumable");
    const misc       = actor.items.filter(i => i.type === "misc");

    // Enrich HTML descriptions for biography/notes
    const biography  = await TextEditor.enrichHTML(system.biography?.value ?? "", { async: true, relativeTo: actor });
    const notes      = await TextEditor.enrichHTML(system.notes?.value      ?? "", { async: true, relativeTo: actor });

    // Build tab list
    const tabs = Object.fromEntries(
      Object.entries(TABS).map(([key, tab]) => [
        key,
        { ...tab, active: this.tabGroups[tab.group] === key, cssClass: this.tabGroups[tab.group] === key ? "active" : "" }
      ])
    );

    // Theme class for CSS
    const theme = game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME) ?? "livro";

    return {
      actor, system, isOwner, tabs, theme,
      classes, powers, weapons, armors, shields, spells, consumables, misc,
      biography, notes,
      config: FU_CONFIG,
      conditions: FU_CONFIG.CONDITIONS,
      attributes: FU_CONFIG.ATTRIBUTES,
      isCrisis:  system.pv.value <= system.crisis,
      isVillain: system.isVillain,
    };
  }

  async _preparePartContext(partId, ctx) {
    ctx.partId = `${this.id}-${partId}`;
    return ctx;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this._activateListeners();
  }

  _activateListeners() {
    const html = this.element;

    // Sync tab visibility (hides non-active tab bodies on every render)
    for (const [group, tab] of Object.entries(this.tabGroups)) {
      this.changeTab(tab, group, { force: true });
    }

    // Global handler: any input/select/textarea with a `name` attribute auto-saves on change
    html.addEventListener("change", ev => {
      const el = ev.target;
      if (!el.name) return;
      const value = el.type === "checkbox" ? el.checked
                  : el.type === "number"   ? Number(el.value)
                  : el.value;
      this.actor.update({ [el.name]: value });
    });

    // Legacy data-path inputs (e.g. villain fields)
    html.querySelectorAll("[data-path]").forEach(el => {
      el.addEventListener("change", ev => {
        const path = ev.currentTarget.dataset.path;
        const val  = ev.currentTarget.type === "checkbox" ? ev.currentTarget.checked
                   : ev.currentTarget.type === "number"   ? Number(ev.currentTarget.value)
                   : ev.currentTarget.value;
        this.actor.update({ [path]: val });
      });
    });

    // Tab switching
    html.querySelectorAll(".fu-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.changeTab(btn.dataset.tab, btn.dataset.group);
      });
    });

    // Actor image — open file picker
    html.querySelector(".fu-actor-img")?.addEventListener("click", () => {
      new FilePicker({
        type: "image",
        current: this.actor.img,
        callback: path => this.actor.update({ img: path }),
      }).browse();
    });

    // Attribute die cycling (click to cycle d6→d8→d10→d12)
    html.querySelectorAll(".attr-die").forEach(el => {
      el.addEventListener("click", ev => {
        const attr  = ev.currentTarget.dataset.attr;
        const cycle = [6, 8, 10, 12];
        const cur   = this.actor.system.attributes[attr] ?? 8;
        const next  = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
        this.actor.update({ [`system.attributes.${attr}`]: next });
      });
    });
  }

  // ── Static action handlers ─────────────────────────────────────

  static async _onRollAttr(event, target) {
    event.preventDefault();
    const attr1 = target.dataset.attr1;
    const attr2 = target.dataset.attr2;
    await this.actor.rollTest(attr1, attr2, { flavor: target.dataset.flavor });
  }

  static async _onRollWeapon(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (!item) return;
    const [a1, a2] = item.system.precision;
    await this.actor.rollTest(a1, a2, {
      flavor: item.name,
      bonus:  item.system.precisionBonus ?? 0,
    });
  }

  static async _onRollSpell(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (!item) return;
    const [a1, a2] = item.system.precision;
    await this.actor.rollTest(a1, a2, { flavor: item.name });
  }

  static async _onUseItem(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (item) await item.use();
  }

  static async _onToggleEquip(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (item) await item.toggleEquip();
  }

  static async _onToggleCond(event, target) {
    const cond = target.dataset.condition;
    await this.actor.update({ [`system.conditions.${cond}`]: !this.actor.system.conditions[cond] });
  }

  static async _onCreateItem(event, target) {
    const type = target.dataset.type ?? "misc";
    const name = game.i18n.format("FABULA_ULTIMA.NewItem", { type: game.i18n.localize(`TYPES.Item.${type}`) });
    await this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
  }

  static async _onDeleteItem(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (!item) return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.format("FABULA_ULTIMA.ConfirmDelete", { name: item.name }),
    });
    if (confirmed) await item.delete();
  }

  static async _onEditItem(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item   = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  static async _onOpenCreator(event, target) {
    const { CharacterCreator } = await import("../../apps/CharacterCreator.js");
    new CharacterCreator({ actor: this.actor }).render(true);
  }
}
