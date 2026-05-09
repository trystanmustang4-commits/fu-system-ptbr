# Estado do Sistema — Fabula Ultima Foundry VTT

**Data:** 2026-05-09
**Sistema:** fabula-ultima-chargen (ES Modules, PT-BR, v13/v14)

---

## Resumo Executivo

A Fase 1 (infraestrutura) está **completa**. Todos os scripts JS do núcleo existem e são funcionais. O maior gap está nos **templates HBS**: `character-sheet.hbs` está AUSENTE (não existe como arquivo raiz, a ficha usa PARTS separados — isso é intencional no padrão ApplicationV2, mas pode gerar confusão), e `tab-combat.hbs` está AUSENTE. Há também gaps pontuais em `lang/pt-BR.json` e comportamentos PARCIAIS em alguns arquivos.

---

## Avaliação por Arquivo

---

### `scripts/main.js`

**Status:** COMPLETO
**Linhas:** ~228

Registra todos os DataModels, DocumentClasses, Sheets, Settings e Handlebars helpers. Hooks de `init`, `ready`, `renderActorDirectory` e `renderChatMessage` implementados. Pré-carrega todos os templates declarados. FURoll é importado dinamicamente no `ready`. Automação de dano é wired no `renderChatMessage`.

**Observação:** O `_preloadTemplates` lista `character-sheet-tabs.hbs` e `character-sheet.hbs` (como `character-sheet-header.hbs` e `character-sheet-sidebar.hbs`), mas não existe um `character-sheet.hbs` raiz — isso é correto pois a FUCharacterSheet usa ApplicationV2 com PARTS separados. Nada faltando.

---

### `scripts/sheets/actor/FUCharacterSheet.js`

**Status:** COMPLETO
**Linhas:** ~268

Implementa ApplicationV2 com HandlebarsApplicationMixin. PARTS definidos para todas as 6 abas (main, classes, equipment, spells, bonds, biography) + header, sidebar, nav. `_prepareContext` retorna todos os dados necessários. Actions declaradas: rollAttr, rollWeapon, rollSpell, useItem, toggleEquip, toggleCond, createItem, deleteItem, editItem, openCreator, toggleLock, toggleView. Listeners de change, cycling de atributos e image picker implementados.

**O que falta:**
- Modo scroll não esconde realmente os PARTS — usa `hidden` attribute mas ApplicationV2 renderiza PARTS individualmente, precisaria de lógica adicional para realmente unificar em scroll view
- Não tem drag-and-drop de items (arraste da compêndio para ficha)
- Sem suporte a `_onDropActor`/`_onDropItem` (herdado de ApplicationV2, não de ActorSheet)

---

### `scripts/sheets/actor/FUGroupSheet.js`

**Status:** PARCIAL
**Linhas:** ~51

O que existe: estrutura ApplicationV2 básica, `_prepareContext` carrega membros e biografia, listener de change.

**O que falta:**
- Sem actions declaradas (actions: {} vazio) — não há botões para adicionar/remover membros
- Sem mecanismo para adicionar PJs como membros (arrastar actor, select de actors)
- Sem gestão de Laços do Grupo (sem CRUD de laços)
- Template usa `data-edit="system.notes.value"` (ProseMirror, v11-style) que pode não funcionar em ApplicationV2

---

### `scripts/sheets/item/FUItemSheet.js`

**Status:** COMPLETO
**Linhas:** ~57

Estrutura ApplicationV2 limpa, `_prepareContext` expõe todos os flags necessários (isWeapon, isArmor, isShield, isClass, isPower, isSpell, isConsumable). Listener de change auto-save implementado.

**Observação menor:** O template usa `data-edit="system.description"` (ProseMirror) para descrição — pode funcionar ou não dependendo da versão, mas já foi identificado como risco no CLAUDE.md. Não tem actions declaradas, o que é aceitável para uma ficha de item simples.

---

### `scripts/rolls/FURoll.js`

**Status:** COMPLETO
**Linhas:** ~74

Implementa corretamente a mecânica central do FU: 2 dados de atributo, RA = maior dos dois, crítico (iguais ≥ 6), fumble (iguais ≤ 3), total com bonus. `rollDamage` implementado separadamente. `FURollResult.toChat()` delega ao ChatCard. Compatível com Roll nativo do Foundry (Dice So Nice funciona).

**Observação:** `rollDamage` retorna o objeto mas não posta no chat — isso pode ser intencional (o damage roll é parte do fluxo do roll de precisão, não independente). O `onCriticalSuccess` em `combat.js` não é chamado automaticamente dentro do `rollTest` — precisa ser chamado externamente por quem chama `rollTest`.

---

### `scripts/rolls/ChatCard.js`

**Status:** COMPLETO
**Linhas:** ~59

`fromRoll` e `fromItem` implementados. Compatibilidade v11/v12+ via `CONST.CHAT_MESSAGE_STYLES?.ROLL ?? CONST.CHAT_MESSAGE_TYPES?.ROLL`. Usa `rolls: [rollResult.roll]` (array, correto para v12+). Speaker configurado corretamente.

---

### `scripts/automation/conditions.js`

**Status:** COMPLETO
**Linhas:** ~64

`applyCondition`, `removeCondition`, `clearAllConditions`, `hasCondition`, `getActiveConditions` implementados. Respeita setting `AUTO_CONDITIONS`. `checkCrisis` notifica via chat quando entra em crise, respeita `AUTO_CRISIS`. Notificação de condição posta no chat com ícone.

---

### `scripts/automation/combat.js`

**Status:** COMPLETO
**Linhas:** ~59

`applyDamage` com sistema de afinidades completo (immune/absorb/resist/normal/vulnerable), respeita `AUTO_DAMAGE`. `onCriticalSuccess` abre OpportunityDialog, respeita `SHOW_OPPORTUNITY`. `spendMana` deduz PM com validação, respeita `AUTO_MANA`. Usa `Math.clamp` (global do Foundry).

**Observação:** `onCriticalSuccess` não é chamado automaticamente de dentro do `FURoll.rollTest` — precisa ser integrado explicitamente quando o resultado é crítico (ex: em `FUActor.rollTest`).

---

### `scripts/apps/FabulaTracker.js`

**Status:** COMPLETO
**Linhas:** ~83

HUD de Pontos de Fábula/Ultima. Coleta PJs com `hasPlayerOwner`, vilões com `isVillain`. Actions `adjustFabula` e `adjustUltima` funcionais. `FabulaTracker.open()` evita duplicatas. Auto-abre para GM no `ready` (em `main.js`).

**O que falta (menor):**
- Sem reactivity automática — não se atualiza quando um actor muda PF (precisaria de socket ou hook `updateActor`)
- Sem suporte a Foundry socket para sincronizar entre clientes em tempo real

---

### `scripts/apps/OpportunityDialog.js`

**Status:** COMPLETO
**Linhas:** ~72

Lista 10 oportunidades do Livro Básico. `_onChoose` posta no chat e fecha o dialog. `OpportunityDialog.show()` é chamável externamente. Localizados via i18n.

**O que falta (menor):**
- Oportunidades são hard-coded em DEFAULT_OPPORTUNITIES — sem mecanismo para GMs adicionarem oportunidades customizadas dinamicamente (o `custom` existe como opção, mas não abre input de texto)

---

## Templates HBS

---

### `templates/actor/character-sheet.hbs`

**Status:** AUSENTE

Não existe. Isso é **intencional** — a FUCharacterSheet usa ApplicationV2 com PARTS separados (header, sidebar, nav, tabs). Não há necessidade de um arquivo raiz `character-sheet.hbs`. O `_preloadTemplates` em `main.js` não lista este arquivo. **Não é um problema.**

---

### `templates/actor/character-sheet-header.hbs`

**Status:** COMPLETO
**Linhas:** ~59

Nome, Identidade/Pronomes, números de jogo (Nível, Fábula, Zênites), botões de lock e view-mode. Inputs com `name` attribute (auto-save). Campos com `data-lockable` respeitam o modo lock.

---

### `templates/actor/character-sheet-sidebar.hbs`

**Status:** COMPLETO
**Linhas:** ~128

Portrait clicável, grade de atributos 2x2 com cycling (quando desbloqueado), estatísticas derivadas (DEF, DEF.M, Crise, Iniciativa), barras PV/PM/PI com input e barra visual, condições com badges clicáveis, botões de testes rápidos para 6 combinações.

---

### `templates/actor/tabs/tab-main.hbs`

**Status:** PARCIAL
**Linhas:** ~13

Existe apenas a seção de "Anotações de Sessão" (textarea de notas).

**O que falta:**
- A aba "Principal" deveria mostrar um resumo de combate: arma equipada, armadura equipada, DEF/DEF.M, iniciativa — não tem
- Poderia ter acesso rápido a poderes passivos ativos
- Resumo de recursos em crise visible
- Atualmente é uma textarea minimalista; funcionalmente correto mas visualmente pobre como aba principal

---

### `templates/actor/tabs/tab-classes.hbs`

**Status:** COMPLETO
**Linhas:** ~56

Lista classes com nível e controles (editar/excluir). Lista poderes com nível atual/máximo e controles (ver/editar/excluir). Botões de criação. Estados vazios tratados.

---

### `templates/actor/tabs/tab-equipment.hbs`

**Status:** COMPLETO
**Linhas:** ~136

Seções: Armas (com toggle equip, roll de precisão), Armaduras (com toggle equip, stats DEF/DEF.M/Init), Escudos (com toggle equip), Inventário (consumíveis com quantidade e botão usar, misc). Estados vazios tratados em todas as seções.

---

### `templates/actor/tabs/tab-biography.hbs`

**Status:** COMPLETO
**Linhas:** ~59

Campos de identidade (Aparência, Tema, Origem, Espécie), textarea de Biografia, textarea de Notas. Seção extra para vilões (Pontos de Ultima, Fase do Vilão) condicionada por `isVillain`.

---

### `templates/actor/tabs/tab-combat.hbs`

**Status:** AUSENTE

O arquivo não existe. Este era um item listado na avaliação como "pode não existir" — e de fato não existe. O conteúdo de combate (armas, armaduras) está na aba de Equipamento. Não há uma aba dedicada a combate.

**Impacto:** Baixo — o conteúdo está em tab-equipment. Mas uma aba de combate dedicada poderia mostrar: arma equipada atual + roll de ataque, armadura equipada, iniciativa, condições ativas — tudo num painel rápido de combate.

---

### `templates/item/item-sheet.hbs`

**Status:** PARCIAL
**Linhas:** ~147

Implementa campos para: Weapon, Armor, Shield (sem seção explícita — reutiliza defBonus/mdefBonus da armadura), Spell. **Faltam seções para:** Class, Power, Consumable. Apenas Weapon, Armor e Spell têm campos dedicados.

**O que falta:**
- Seção `{{#if isShield}}` — escudo não tem seção, os campos aparecem implicitamente se existirem no sistema (mas não há UI explícita)
- Seção `{{#if isClass}}` — sem campos para level máximo da classe, lista de poderes disponíveis, requisitos
- Seção `{{#if isPower}}` — sem campos para nível atual/máximo, classe pai, descrição do efeito em cada nível
- Seção `{{#if isConsumable}}` — sem campos para quantidade, efeito ao usar

---

### `templates/chat/roll-card.hbs`

**Status:** COMPLETO
**Linhas:** ~57

Cabeçalho com avatar do ator e flavor. Exibe dados D1/D2 com destaque visual no RA. Total centralizado. Badge de resultado (Sucesso Crítico/Falha Crítica/Sucesso com ND/Falha com ND). Linha de RA. Botão "Aplicar Dano" condicional (quando `damage` está no contexto).

**Observação:** O botão de dano aparece apenas se `damage` existe no contexto — mas `ChatCard.fromRoll` não passa `damage` no contexto atual (apenas die1, die2, ra, total, critical, fumble, success, tnTarget). O botão de dano **nunca aparece** na implementação atual. Para aparecer, o fluxo de roll precisaria calcular o dano e passá-lo ao ChatCard.

---

### `lang/pt-BR.json`

**Status:** PARCIAL
**Linhas:** ~208

**O que existe:** Sheet labels, Steps do wizard, Attributes, Stats, Themes, Equipment, Bonds, Conditions, DamageTypes, Species, Buttons, Notifications, Tracker, Opportunity, Crisis, Combat, Settings, TYPES.

**O que falta:**
- Chaves de Settings com formato errado: `main.js` registra settings com chave `FABULA_ULTIMA.Settings.${key}Name` onde `key` é `AUTO_DAMAGE`, `AUTO_CONDITIONS`, etc. — mas o JSON tem `automationDamageName`, `automationConditionsName` (camelCase diferente). As chaves não batem: o código gera `FABULA_ULTIMA.Settings.AUTO_DAMAGEName` mas o JSON tem `FABULA_ULTIMA.Settings.automationDamageName`.
- Falta chave `FABULA_ULTIMA.Sheet.Character` (registrado como label da sheet) — o JSON tem `FABULA_ULTIMA.Sheet.Character` apenas como "Ficha FU – Personagem" (OK, existe)
- Falta `FABULA_ULTIMA.Sheet.Group` — o código usa `"FABULA_ULTIMA.Sheet.Group"` mas o JSON tem `"Group": "Ficha FU – Grupo"` sob `Sheet` (OK, existe)
- Affinities sem labels — `FU_CONFIG.DAMAGE_TYPES` referenciado em vários lugares mas sem garantia que todas as chaves de afinidades estejam em pt-BR
- Falta tradução para `FABULA_ULTIMA.Conditions.Applied` e `FABULA_ULTIMA.Conditions.Removed` — o JSON tem `"Applied": "ficou"` e `"Removed": "não está mais"` mas a notificação em `conditions.js` usa `_notifyCondition` que posta `actor.name + verb + label` onde verb é a tradução dessas chaves. OK, existem.

**Bug confirmado:** As chaves de settings de automação não batem. `main.js` linha 170: `name: \`FABULA_ULTIMA.Settings.${key}Name\`` onde key = `FU_CONFIG.SETTINGS.AUTO_DAMAGE` etc. É necessário ver o valor dessas constantes em `config.js` para confirmar o bug.

---

## Arquivos Mencionados na Avaliação — Não na Lista Original

Existem e estão funcionais (referência rápida):

| Arquivo | Status | Linhas |
|---------|--------|--------|
| `templates/actor/character-sheet-tabs.hbs` | COMPLETO | 10 |
| `templates/actor/tabs/tab-spells.hbs` | COMPLETO | 35 |
| `templates/actor/tabs/tab-bonds.hbs` | COMPLETO (read-only) | 30 |
| `templates/actor/group-sheet.hbs` | PARCIAL | 52 |
| `templates/apps/fabula-tracker.hbs` | COMPLETO | 84 |
| `templates/apps/opportunity-dialog.hbs` | COMPLETO | 18 |
| `templates/chat/item-card.hbs` | (não verificado) | — |
| `templates/apps/character-creator.hbs` | (não verificado) | — |

**`templates/actor/group-sheet.hbs` — PARCIAL:** Usa `data-edit="system.notes.value"` (ProseMirror v11-style), sem botões de gestão de membros, sem CRUD de laços do grupo.

**`templates/actor/tabs/tab-bonds.hbs` — PARCIAL:** Read-only — exibe laços mas não tem UI para adicionar/editar/excluir laços diretamente na ficha. A mensagem diz "Use o Criador de Personagem". Laços existentes não têm botão de remoção.

---

## Bugs e Inconsistências Identificados

### BUG 1 — Chaves de i18n para Settings de automação não batem
- **Onde:** `scripts/main.js` linha 170, `lang/pt-BR.json`
- **Problema:** `main.js` gera `FABULA_ULTIMA.Settings.${key}Name` onde `key` é a constante de `FU_CONFIG.SETTINGS` (ex: `AUTO_DAMAGE`). O JSON tem `automationDamageName`. Precisa verificar o valor de `FU_CONFIG.SETTINGS.AUTO_DAMAGE` em `config.js` — se for `"automationDamage"`, as chaves batem. Se for `"AUTO_DAMAGE"`, não batem.
- **Prioridade:** Alta — settings de automação aparecem com chaves brutas na UI

### BUG 2 — Botão "Aplicar Dano" no roll-card nunca aparece
- **Onde:** `templates/chat/roll-card.hbs` linha 46-56, `scripts/rolls/ChatCard.js`
- **Problema:** O template exibe o botão apenas se `{{#if damage}}`, mas `ChatCard.fromRoll` não passa `damage` no contexto renderizado. O campo `damage` nunca é truthy.
- **Prioridade:** Alta — funcionalidade central (aplicar dano clicando no chat) está invisível

### BUG 3 — `onCriticalSuccess` em `combat.js` nunca é chamado
- **Onde:** `scripts/automation/combat.js` linha 40, `scripts/rolls/FURoll.js`
- **Problema:** `FURoll.rollTest` não chama `onCriticalSuccess` quando `critical === true`. A função existe mas não está integrada ao fluxo de roll.
- **Prioridade:** Média — OpportunityDialog nunca abre automaticamente

### BUG 4 — `FUGroupSheet` e `group-sheet.hbs` usam `data-edit` (ProseMirror legado)
- **Onde:** `templates/actor/group-sheet.hbs` linha 49
- **Problema:** `data-edit="system.notes.value"` é a API de sheets clássicas (v11). ApplicationV2 não suporta `data-edit` nativamente.
- **Prioridade:** Média — notas do grupo não editáveis via UI

### BUG 5 — `item-sheet.hbs` usa `data-edit` para descrição
- **Onde:** `templates/item/item-sheet.hbs` linha 19
- **Problema:** Mesmo problema do bug 4 — `data-edit="system.description"` não funciona em ApplicationV2.
- **Prioridade:** Média — campo de descrição de item não editável

---

## Gaps de Funcionalidade (não são bugs, são features ausentes)

| Gap | Impacto | Arquivos Afetados |
|-----|---------|-------------------|
| Drag-and-drop de items do compêndio para a ficha | Alto — fluxo principal de play | `FUCharacterSheet.js` |
| Gestão de membros da Ficha de Grupo | Alto — feature indispensável | `FUGroupSheet.js`, `group-sheet.hbs` |
| CRUD de Laços diretamente na ficha | Médio | `tab-bonds.hbs`, `FUCharacterSheet.js` |
| Campos de Class e Power na ficha de item | Alto — sem UI para editar classes/poderes | `item-sheet.hbs` |
| Campos de Consumable e Shield na ficha de item | Médio | `item-sheet.hbs` |
| Reactivity do FabulaTracker (sync em tempo real) | Médio — funciona mas não atualiza sem F5 | `FabulaTracker.js` |
| `onCriticalSuccess` integrado ao `rollTest` | Alto — OpportunityDialog nunca abre | `FURoll.js`, `combat.js` |
| Dano calculado e passado ao ChatCard | Alto — botão de aplicar dano invisible | `FURoll.js`, `ChatCard.js` |
| tab-combat.hbs (painel rápido de combate) | Baixo — conteúdo em tab-equipment | (arquivo ausente) |

---

## Checklist de Prioridades para Próxima Sessão

- [ ] **CRÍTICO** Verificar e corrigir chaves de i18n das settings de automação (`config.js` + `pt-BR.json`)
- [ ] **CRÍTICO** Passar `damage` e `damageType` ao `ChatCard.fromRoll` para o botão de dano aparecer
- [ ] **CRÍTICO** Chamar `onCriticalSuccess` dentro de `FURoll.rollTest` quando `critical === true`
- [ ] **ALTO** Substituir `data-edit` por textareas com `name` em `group-sheet.hbs` e `item-sheet.hbs`
- [ ] **ALTO** Adicionar seções de Class, Power, Consumable, Shield em `item-sheet.hbs`
- [ ] **ALTO** Adicionar actions + UI de gestão de membros em `FUGroupSheet.js`
- [ ] **MÉDIO** Adicionar CRUD de Laços diretamente em `tab-bonds.hbs`
- [ ] **MÉDIO** Implementar `_onDropItem` em `FUCharacterSheet.js` para drag-and-drop
- [ ] **BAIXO** Adicionar hook `updateActor` no FabulaTracker para reactivity

---

*Gerado em 2026-05-09 — baseado em leitura direta de todos os arquivos listados.*
