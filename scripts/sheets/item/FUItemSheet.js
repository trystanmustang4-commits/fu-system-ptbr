import { SYSTEM_ID, FU_CONFIG } from "../../config.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class FUItemSheet extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["fabula-ultima", "item-sheet"],
    position: { width: 500, height: 450 },
    window: { resizable: true },
    actions: {},
  };

  static PARTS = {
    sheet: {
      template: `systems/${SYSTEM_ID}/templates/item/item-sheet.hbs`,
    },
  };

  get title() {
    return `${this.document.name} — ${game.i18n.localize(`TYPES.Item.${this.document.type}`)}`;
  }

  async _prepareContext(options) {
    const item     = this.document;
    const system   = item.system;
    const isOwner  = item.isOwner;
    const theme    = game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME) ?? "livro";

    const description = await TextEditor.enrichHTML(system.description ?? "", { async: true, relativeTo: item });

    return {
      item, system, isOwner, theme, description,
      config: FU_CONFIG,
      attributes: FU_CONFIG.ATTRIBUTES,
      damageTypes: FU_CONFIG.DAMAGE_TYPES,
      isWeapon:     item.type === "weapon",
      isArmor:      item.type === "armor",
      isShield:     item.type === "shield",
      isClass:      item.type === "class",
      isPower:      item.type === "power",
      isSpell:      item.type === "spell",
      isConsumable: item.type === "consumable",
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this.element.addEventListener("change", ev => {
      const el = ev.target;
      if (!el.name) return;
      const value = el.type === "checkbox" ? el.checked
                  : el.type === "number"   ? Number(el.value)
                  : el.value;
      this.document.update({ [el.name]: value });
    });
    this.element.querySelector(".fu-clickable-img")?.addEventListener("click", () => {
      if (!this.document.isOwner) return;
      new FilePicker({ type: "image", current: this.document.img, callback: path => this.document.update({ img: path }) }).browse();
    });
  }
}
