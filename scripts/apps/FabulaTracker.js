import { SYSTEM_ID } from "../config.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * HUD overlay showing Fábula/Ultima points for all players and the GM.
 * Rendered as a persistent sidebar panel (pinned to scene controls area).
 */
export class FabulaTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id:      "fabula-tracker",
    classes: ["fabula-ultima", "fabula-tracker"],
    position: { width: 220, height: "auto", top: 80, left: 10 },
    window: { resizable: false, minimizable: true, title: "FABULA_ULTIMA.Tracker.Title" },
    actions: {
      adjustFabula: FabulaTracker._onAdjustFabula,
      adjustUltima: FabulaTracker._onAdjustUltima,
    },
  };

  static PARTS = {
    tracker: {
      template: `systems/${SYSTEM_ID}/templates/apps/fabula-tracker.hbs`,
    },
  };

  async _prepareContext(options) {
    // Collect player characters and their Fábula points
    const playerChars = game.actors
      .filter(a => a.type === "character" && a.hasPlayerOwner)
      .map(a => ({
        id:     a.id,
        name:   a.name,
        img:    a.img,
        fabula: a.system.fabula ?? 0,
        isVillain: false,
      }));

    // Collect villains (GM-owned characters with isVillain flag)
    const villains = game.actors
      .filter(a => a.type === "character" && a.system.isVillain && !a.hasPlayerOwner)
      .map(a => ({
        id:          a.id,
        name:        a.name,
        img:         a.img,
        ultimaPoints: a.system.ultimaPoints ?? 0,
        isVillain:   true,
      }));

    const isGM = game.user.isGM;
    return { playerChars, villains, isGM };
  }

  static async _onAdjustFabula(event, target) {
    const actorId = target.closest("[data-actor-id]").dataset.actorId;
    const delta   = parseInt(target.dataset.delta, 10);
    const actor   = game.actors.get(actorId);
    if (!actor) return;
    const cur = actor.system.fabula ?? 0;
    await actor.update({ "system.fabula": Math.max(0, cur + delta) });
    this.render();
  }

  static async _onAdjustUltima(event, target) {
    const actorId = target.closest("[data-actor-id]").dataset.actorId;
    const delta   = parseInt(target.dataset.delta, 10);
    const actor   = game.actors.get(actorId);
    if (!actor) return;
    const cur = actor.system.ultimaPoints ?? 0;
    await actor.update({ "system.ultimaPoints": Math.max(0, cur + delta) });
    this.render();
  }

  /** Open or focus the tracker */
  static open() {
    const existing = Object.values(ui.windows ?? {}).find(w => w.id === "fabula-tracker");
    if (existing) { existing.bringToTop(); return existing; }
    const tracker = new FabulaTracker();
    tracker.render(true);
    return tracker;
  }
}
