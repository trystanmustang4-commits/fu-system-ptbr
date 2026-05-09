// Suggested themes, bond emotions, attribute profiles, and preset characters
// from Fabula Ultima Livro Básico

export const FU_THEMES = [
  { id: 'ambicao',      name: 'Ambição',      description: 'Você busca provar seu valor para si e/ou para os outros.' },
  { id: 'raiva',        name: 'Raiva',         description: 'Você é uma bomba-relógio prestes a explodir de raiva.' },
  { id: 'pertencimento',name: 'Pertencimento', description: 'Você teme ficar só, ser esquecido ou abandonado.' },
  { id: 'duvida',       name: 'Dúvida',        description: 'Você precisa encontrar a resposta para uma pergunta instigante.' },
  { id: 'dever',        name: 'Dever',         description: 'Você vive para cumprir uma promessa ou obedecer a uma ordem.' },
  { id: 'culpa',        name: 'Culpa',         description: 'Você deseja a absolvição de seus erros passados.' },
  { id: 'esperanca',    name: 'Esperança',     description: 'Você quer melhorar o mundo para si e/ou para os outros.' },
  { id: 'justica',      name: 'Justiça',       description: 'Você sempre fica do lado dos fracos e indefesos.' },
  { id: 'piedade',      name: 'Piedade',       description: 'Você quer ajudar as pessoas, não importando os erros delas.' },
  { id: 'vinganca',     name: 'Vingança',      description: 'Você quer se vingar de alguém ou de algo.' },
];

export const FU_BOND_EMOTIONS = [
  { pair: 'admiracao_inferioridade', emotions: ['Admiração', 'Inferioridade'] },
  { pair: 'lealdade_desconfianca',   emotions: ['Lealdade', 'Desconfiança'] },
  { pair: 'afeto_odio',              emotions: ['Afeto', 'Ódio'] },
];

export const FU_EXAMPLE_IDENTITIES = [
  'Cavaleiro real',
  'Rainha dos ladrões do deserto',
  'Sacerdotisa de batalha da Fé Antiga',
  'Princesa guerreira do povo da lua',
  'Feiticeiro amnésico idoso',
  'Ex-estrategista imperial',
  'Lutador guerrilheiro',
  'Cientista tecnomágico',
  'Veterana atormentada',
  'Samurai de um olho só',
];

export const FU_ATTR_PROFILES = [
  {
    id: 'especializado',
    name: 'Especializado',
    description: 'Dois Atributos de excelência, dois fracos.',
    dice: [10, 10, 6, 6],
  },
  {
    id: 'mediano',
    name: 'Mediano',
    description: 'Um Atributo forte, dois medianos e um fraco.',
    dice: [10, 8, 8, 6],
  },
  {
    id: 'pau_para_toda_obra',
    name: 'Pau pra Toda Obra',
    description: 'Todos os Atributos iguais — nenhum ponto fraco.',
    dice: [8, 8, 8, 8],
  },
];

export const FU_PRESET_CHARACTERS = [
  {
    name: 'Alquimista',
    attributes: { des: 8, vig: 6, ast: 10, von: 8 },
    classes: [
      { id: 'andarilho',  levels: 2, powers: ['papo_taverna', 'pratico'] },
      { id: 'inventor',   levels: 3, powers: ['chuva_pocoes', 'engenhocas', 'formula_secreta'] },
    ],
  },
  {
    name: 'Apostador',
    attributes: { des: 10, vig: 6, ast: 8, von: 8 },
    classes: [
      { id: 'entropista',   levels: 2, powers: ['magia_entropica', 'sete_sorte'] },
      { id: 'ladino',       levels: 2, powers: ['alta_velocidade', 'esquiva'] },
      { id: 'mestre_armas', levels: 1, powers: ['maestria_melee'] },
    ],
  },
  {
    name: 'Cavaleiro Negro',
    attributes: { des: 8, vig: 10, ast: 6, von: 8 },
    classes: [
      { id: 'entropista',       levels: 1, powers: ['magia_entropica'] },
      { id: 'guerreiro_sombrio',levels: 2, powers: ['golpe_sombras', 'golpe_sombras'] },
      { id: 'mestre_armas',     levels: 2, powers: ['chuva_laminas', 'maestria_melee'] },
    ],
  },
  {
    name: 'Curandeiro',
    attributes: { des: 6, vig: 8, ast: 8, von: 10 },
    classes: [
      { id: 'espiritualista', levels: 3, powers: ['magia_espiritual', 'magia_espiritual', 'magia_espiritual'] },
      { id: 'orador',         levels: 2, powers: ['confio_voce', 'encorajar'] },
    ],
  },
  {
    name: 'Duelista Mágico',
    attributes: { des: 10, vig: 6, ast: 8, von: 8 },
    classes: [
      { id: 'elementalista', levels: 2, powers: ['magia_elemental', 'magia_elemental'] },
      { id: 'espiritualista', levels: 1, powers: ['magia_espiritual'] },
      { id: 'mestre_armas',   levels: 2, powers: ['contra_ataque', 'chuva_laminas'] },
    ],
  },
  {
    name: 'Ladrão',
    attributes: { des: 10, vig: 6, ast: 8, von: 8 },
    classes: [
      { id: 'ladino',       levels: 3, powers: ['alta_velocidade', 'golpe_baixo', 'roubo_alma'] },
      { id: 'mestre_armas', levels: 2, powers: ['quebra_ossos', 'quebra_ossos'] },
    ],
  },
  {
    name: 'Ninja',
    attributes: { des: 10, vig: 6, ast: 8, von: 8 },
    classes: [
      { id: 'atirador',     levels: 1, powers: ['tiro_aviso'] },
      { id: 'ladino',       levels: 3, powers: ['esquiva', 'esquiva', 'golpe_baixo'] },
      { id: 'mestre_armas', levels: 1, powers: ['quebra_ossos'] },
    ],
  },
];
