// Memory data — photos replace abstract 3D dioramas
// Photo URLs: swap in your own images here if desired
const MEMORIES = [
  {
    label: 'Hacker School',
    caption: '"Good thing you stopped pretending."',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Simple_diagram.png/1px-Simple_diagram.png', // placeholder – updated below
    color: '#0a0f2e',
    icon: '🤖',
  },
  {
    label: 'Wilhelmsburg',
    caption: 'Der Rückweg, der nie weit genug war.',
    photo: '',
    color: '#1a100a',
    icon: '🚆',
  },
  {
    label: 'Flottbek',
    caption: 'Alles andere war weit weg.',
    photo: '',
    color: '#0a1a0a',
    icon: '🌳',
  },
  {
    label: 'Alsterbank',
    caption: 'Unsere Bank.',
    photo: '',
    color: '#0a1020',
    icon: '🌊',
  },
  {
    label: 'Regen',
    caption: 'Es hat geregnet. Dir war es egal.',
    photo: '',
    color: '#0d0d18',
    icon: '🌧️',
  },
  {
    label: 'Café',
    caption: 'Zwei Tassen. Keine Uhr.',
    photo: '',
    color: '#1a0e08',
    icon: '☕',
  },
  {
    label: 'Kunsthalle',
    caption: 'Du hättest ewig erklärt. Ich hätte ewig zugehört.',
    photo: '',
    color: '#12100e',
    icon: '🖼️',
  },
  {
    label: 'Erster Kuss',
    caption: '.',
    photo: '',
    color: '#18080e',
    icon: '✨',
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
