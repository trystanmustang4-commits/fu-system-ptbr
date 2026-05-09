import { SYSTEM_ID, FU_CONFIG } from "../../config.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class FUGroupSheet extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["fabula-ultima", "actor-sheet", "group-sheet"],
    position: { width: 680, height: 600 },
    window: { resizable: true },
    actions: {},
  };

  static PARTS = {
    sheet: {
      template: `systems/${SYSTEM_ID}/templates/actor/group-sheet.hbs`,
    },
  };

  get title() {
    return `${this.document.name} — ${game.i18n.localize("FABULA_ULTIMA.Sheet.GroupTitle")}`;
  }

  async _prepareContext(options) {
    const actor  = this.document;
    const system = actor.system;
    const theme  = game.settings.get(SYSTEM_ID, FU_CONFIG.SETTINGS.THEME) ?? "livro";

    // Resolve member actors
    const members = (system.members ?? [])
      .map(id => game.actors.get(id))
      .filter(Boolean);

    const biography = await TextEditor.enrichHTML(system.biography?.value ?? "", { async: true, relativeTo: actor });
    const notes     = await TextEditor.enrichHTML(system.notes?.value      ?? "", { async: true, relativeTo: actor });

    return { actor, system, theme, members, biography, notes };
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
