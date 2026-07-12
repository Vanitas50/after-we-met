// Memory data — photos replace abstract 3D dioramas
// Photo URLs: swap in your own images here if desired
const MEMORIES = [
  {
    label:   'Hacker School',
    caption: '"Good thing you stopped pretending."',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Jugend_hackt_Hamburg_2019_-JHHH_-JugendHackt_-JHHH19_%2848715764043%29.jpg/960px-Jugend_hackt_Hamburg_2019_-JHHH_-JugendHackt_-JHHH19_%2848715764043%29.jpg',
    color:   '#0a0f2e',
    icon:    '🤖',
  },
  {
    label:   'Wilhelmsburg',
    caption: 'Der Rückweg, der nie weit genug war.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Wilhelmsburg%2C_Hamburg%2C_Germany_%28Unsplash%29.jpg/960px-Wilhelmsburg%2C_Hamburg%2C_Germany_%28Unsplash%29.jpg',
    color:   '#1a100a',
    icon:    '🚆',
  },
  {
    label:   'Flottbek',
    caption: 'Alles andere war weit weg.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Jenischpark_27Apr2020_03.jpg/960px-Jenischpark_27Apr2020_03.jpg',
    color:   '#0a1a0a',
    icon:    '🌳',
  },
  {
    label:   'Alsterbank',
    caption: 'Unsere Bank.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sonnenuntergang_auf_Binnenalster_-_Hamburg.jpg/960px-Sonnenuntergang_auf_Binnenalster_-_Hamburg.jpg',
    color:   '#0a1020',
    icon:    '🌊',
  },
  {
    label:   'Regen',
    caption: 'Es hat geregnet. Dir war es egal.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Frankfurt_-_49830061946.jpg/960px-Frankfurt_-_49830061946.jpg',
    color:   '#0d0d18',
    icon:    '🌧️',
  },
  {
    label:   'Café',
    caption: 'Zwei Tassen. Keine Uhr.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Caf%C3%A9_Paris_%28Hamburg%29_%28165454837%29.jpg/960px-Caf%C3%A9_Paris_%28Hamburg%29_%28165454837%29.jpg',
    color:   '#1a0e08',
    icon:    '☕',
  },
  {
    label:   'Kunsthalle',
    caption: 'Du hättest ewig erklärt. Ich hätte ewig zugehört.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Hamburg_Kunsthalle_01.jpg/960px-Hamburg_Kunsthalle_01.jpg',
    color:   '#12100e',
    icon:    '🖼️',
  },
  {
    label:   'Erster Kuss',
    caption: '.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Sunset_beach_couple_%28Unsplash%29.jpg/960px-Sunset_beach_couple_%28Unsplash%29.jpg',
    color:   '#18080e',
    icon:    '✨',
  },
];

export function createMemories(_scene) {
  // No 3D dioramas — memories are shown as HTML polaroid cards
  return {
    count:      MEMORIES.length,
    getLabel:   i => MEMORIES[i]?.label   ?? '',
    getCaption: i => MEMORIES[i]?.caption ?? '',
    getPhoto:   i => MEMORIES[i]?.photo   ?? '',
    getColor:   i => MEMORIES[i]?.color   ?? '#111',
    getIcon:    i => MEMORIES[i]?.icon    ?? '',
    showMemory: () => {},
    hideAll:    () => {},
    update:     () => {},
  };
}
