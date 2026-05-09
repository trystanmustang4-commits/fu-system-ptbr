import { SYSTEM_ID } from "../config.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

// Default opportunities from Livro Básico — can be extended by GMs
const DEFAULT_OPPORTUNITIES = [
  { id: "recover_pv",     label: "FABULA_ULTIMA.Opportunity.RecoverPV" },
  { id: "recover_pm",     label: "FABULA_ULTIMA.Opportunity.RecoverPM" },
  { id: "full_recovery",  label: "FABULA_ULTIMA.Opportunity.FullRecovery" },
  { id: "extra_action",   label: "FABULA_ULTIMA.Opportunity.ExtraAction" },
  { id: "remove_cond",    label: "FABULA_ULTIMA.Opportunity.RemoveCondition" },
  { id: "apply_cond",     label: "FABULA_ULTIMA.Opportunity.ApplyCondition" },
  { id: "boost_next",     label: "FABULA_ULTIMA.Opportunity.BoostNext" },
  { id: "damage_bonus",   label: "FABULA_ULTIMA.Opportunity.DamageBonus" },
  { id: "ignore_def",     label: "FABULA_ULTIMA.Opportunity.IgnoreDEF" },
  { id: "custom",         label: "FABULA_ULTIMA.Opportunity.Custom" },
];

export class OpportunityDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id:      "opportunity-dialog",
    classes: ["fabula-ultima", "opportunity-dialog"],
    position: { width: 380, height: "auto" },
    window: { resizable: false, title: "FABULA_ULTIMA.Opportunity.Title" },
    actions: {
      chooseOpportunity: OpportunityDialog._onChoose,
    },
  };

  static PARTS = {
    dialog: {
      template: `systems/${SYSTEM_ID}/templates/apps/opportunity-dialog.hbs`,
    },
  };

  constructor({ actor, rollResult } = {}) {
    super();
    this.actor      = actor;
    this.rollResult = rollResult;
  }

  async _prepareContext(options) {
    return {
      opportunities: DEFAULT_OPPORTUNITIES.map(o => ({
        ...o,
        label: game.i18n.localize(o.label),
      })),
      actor:      this.actor,
      rollResult: this.rollResult,
    };
  }

  static async _onChoose(event, target) {
    const oppId = target.dataset.id;
    const opp   = DEFAULT_OPPORTUNITIES.find(o => o.id === oppId);
    if (!opp) return;

    // Post to chat
    const msg = game.i18n.format("FABULA_ULTIMA.Opportunity.Used", {
      name:  this.actor?.name ?? game.user.name,
      label: game.i18n.localize(opp.label),
    });
    ChatMessage.create({ content: `<p class="fu-opportunity">${msg}</p>`, speaker: ChatMessage.getSpeaker({ actor: this.actor }) });
    this.close();
  }

  /** Show the dialog, usually triggered by a critical success. */
  static show(actor, rollResult) {
    new OpportunityDialog({ actor, rollResult }).render(true);
  }
}
