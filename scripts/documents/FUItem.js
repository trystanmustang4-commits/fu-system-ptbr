export class FUItem extends Item {
  /** Chat card when item is used / inspected from sheet */
  async use({ rollMode } = {}) {
    const { ChatCard } = await import("../rolls/ChatCard.js");
    await ChatCard.fromItem(this, { rollMode });
  }

  get isEquipped() {
    return this.system.equipped ?? false;
  }

  /** Toggle equipped state */
  async toggleEquip() {
    await this.update({ "system.equipped": !this.system.equipped });
  }
}
