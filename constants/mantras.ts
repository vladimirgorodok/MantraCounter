// Built-in mantra library

export interface Mantra {
  id: string;
  name: string;
  text: string;
  translation: string;
  tradition: string;
  keywords: string[]; // words to detect in speech
  defaultCount: number;
}

export const BUILTIN_MANTRAS: Mantra[] = [
  {
    id: 'om',
    name: 'Ом',
    text: 'ОМ',
    translation: 'Первозвук вселенной',
    tradition: 'Индуизм / Буддизм',
    keywords: ['ом', 'om', 'aum', 'аум'],
    defaultCount: 108,
  },
  {
    id: 'om_mani',
    name: 'Ом Мани Падме Хум',
    text: 'ОМ МАНИ ПАДМЕ ХУМ',
    translation: 'О, жемчужина в лотосе',
    tradition: 'Тибетский буддизм',
    keywords: ['мани', 'падме', 'хум', 'mani', 'padme', 'hum'],
    defaultCount: 108,
  },
  {
    id: 'gayatri',
    name: 'Гаятри-мантра',
    text: 'ОМ БХУР БХУВАХА СВАХА',
    translation: 'Мы медитируем на свет Солнца',
    tradition: 'Индуизм',
    keywords: ['гаятри', 'бхур', 'бхуваха', 'сваха', 'gayatri'],
    defaultCount: 108,
  },
  {
    id: 'soham',
    name: 'Со Хам',
    text: 'СО ХАМ',
    translation: 'Я есть То',
    tradition: 'Йога',
    keywords: ['со хам', 'со', 'хам', 'soham', 'so ham'],
    defaultCount: 108,
  },
  {
    id: 'lokah',
    name: 'Локах Самастах',
    text: 'ЛОКАХ САМАСТАХ СУКХИНО БХАВАНТУ',
    translation: 'Пусть все существа будут счастливы',
    tradition: 'Индуизм',
    keywords: ['локах', 'самастах', 'сукхино', 'lokah'],
    defaultCount: 108,
  },
  {
    id: 'hare_krishna',
    name: 'Харе Кришна',
    text: 'ХАРЕ КРИШНА ХАРЕ КРИШНА КРИШНА КРИШНА ХАРЕ ХАРЕ',
    translation: 'О, Кришна, о, Рама',
    tradition: 'Вайшнавизм',
    keywords: ['харе', 'кришна', 'рама', 'hare', 'krishna', 'rama'],
    defaultCount: 108,
  },
  {
    id: 'shanti',
    name: 'Ом Шанти',
    text: 'ОМ ШАНТИ ШАНТИ ШАНТИ',
    translation: 'Мир, мир, мир',
    tradition: 'Индуизм',
    keywords: ['шанти', 'shanti', 'мир'],
    defaultCount: 108,
  },
];
