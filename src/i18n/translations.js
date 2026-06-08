// Translation catalogs — pure data, no DOM and no storage. One nested object
// per supported language; keys are resolved by dot-path in ./index.js, which
// falls back to English (and then the raw key) for anything missing. `{name}`
// placeholders are interpolated at lookup time. Lists (cheers/tries) are real
// arrays. Math symbols and fraction strings are language-neutral and stay in
// code — only words live here.
//
// Languages: en (English, default), ru (Русский), ka (ქართული — Georgian).

export const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'РУ', name: 'Русский' },
  { code: 'ka', label: 'ქარ', name: 'ქართული' },
]

export const DEFAULT_LANG = 'en'

export const translations = {
  en: {
    app: {
      title: 'Fraction Friends',
      subtitle: 'Practise until fractions feel easy!',
    },
    home: {
      answered: '⭐ Answered: {n}',
      accuracy: '🎯 Accuracy: {pct}%',
      pickToStart: 'Pick a game to start!',
      smartStart: 'Smart Start',
      practise: 'Practise {skill}',
      reset: 'Reset progress',
      language: 'Language',
    },
    skill: {
      identify: { label: 'Spot the Fraction', blurb: 'Name fractions, find equal ones, and simplify.' },
      compare: { label: 'Bigger or Smaller', blurb: 'Compare and order fractions.' },
      addsub: { label: 'Add & Subtract', blurb: 'Add and subtract fractions.' },
      muldiv: { label: 'Times & Divide', blurb: 'Multiply and divide fractions. (Advanced)' },
    },
    play: {
      levelUp: '⬆️ Level up! You rock!',
      levelDown: 'Let’s try easier ones ⬇️',
      next: 'Next ▶',
      seeResults: 'See results 🎉',
      hint: '👀 Show me',
    },
    results: {
      superstar: 'Superstar!',
      great: 'Great job!',
      good: 'Good effort!',
      keep: 'Keep practising!',
      correct: 'correct',
      accuracy: 'accuracy',
      bestStreak: 'best streak',
      level: 'Level: ',
      playAgain: 'Play again ▶',
      home: 'Home 🏠',
    },
    feedback: {
      cheers: ['Nice!', 'Yes!', 'Brilliant!', 'You got it!', 'Awesome!', 'Spot on!', 'Woohoo!'],
      tries: ['Almost!', 'So close!', 'Good try!', 'Nearly!'],
      // Text shown before the bold correct answer on a wrong guess.
      wrongLead: '💡 {lead} The answer is ',
    },
    prompt: {
      whatShaded: 'What fraction is shaded?',
      equalTo: 'Which fraction is equal to {frac}?',
      simplest: 'Write {frac} in its simplest form.',
      tapBigger: 'Tap the BIGGER fraction.',
      tapSmallest: 'Tap the SMALLEST fraction.',
      simplestSuffix: ' (simplest form)',
    },
    hint: {
      view: { bars: '▭ Bars', grid: '▦ Grid' },
      compareCaption: 'Tap a bar to compare the coloured parts!',
      gridCaption: 'Same-size grids — count the coloured squares!',
    },
    rep: {
      pizza: 'Pizza',
      chocBar: 'Choc Bar',
      numberLine: 'Number Line',
      gumballs: 'Gumballs',
      juice: 'Juice',
    },
  },

  ru: {
    app: {
      title: 'Друзья-Дроби',
      subtitle: 'Тренируйся, пока дроби не станут лёгкими!',
    },
    home: {
      answered: '⭐ Ответов: {n}',
      accuracy: '🎯 Точность: {pct}%',
      pickToStart: 'Выбери игру, чтобы начать!',
      smartStart: 'Умный старт',
      practise: 'Тренируй {skill}',
      reset: 'Сбросить прогресс',
      language: 'Язык',
    },
    skill: {
      identify: { label: 'Найди дробь', blurb: 'Называй дроби, находи равные и сокращай.' },
      compare: { label: 'Больше или меньше', blurb: 'Сравнивай и упорядочивай дроби.' },
      addsub: { label: 'Сложение и вычитание', blurb: 'Складывай и вычитай дроби.' },
      muldiv: { label: 'Умножение и деление', blurb: 'Умножай и дели дроби. (Сложно)' },
    },
    play: {
      levelUp: '⬆️ Новый уровень! Ты молодец!',
      levelDown: 'Давай попробуем полегче ⬇️',
      next: 'Дальше ▶',
      seeResults: 'Посмотреть результаты 🎉',
      hint: '👀 Покажи',
    },
    results: {
      superstar: 'Суперзвезда!',
      great: 'Отлично!',
      good: 'Хорошая попытка!',
      keep: 'Тренируйся ещё!',
      correct: 'верно',
      accuracy: 'точность',
      bestStreak: 'лучшая серия',
      level: 'Уровень: ',
      playAgain: 'Играть снова ▶',
      home: 'Домой 🏠',
    },
    feedback: {
      cheers: ['Класс!', 'Да!', 'Блестяще!', 'Получилось!', 'Супер!', 'В точку!', 'Ура!'],
      tries: ['Почти!', 'Так близко!', 'Хорошая попытка!', 'Чуть-чуть!'],
      wrongLead: '💡 {lead} Правильный ответ: ',
    },
    prompt: {
      whatShaded: 'Какая дробь закрашена?',
      equalTo: 'Какая дробь равна {frac}?',
      simplest: 'Запиши {frac} в простейшем виде.',
      tapBigger: 'Нажми на БОЛЬШУЮ дробь.',
      tapSmallest: 'Нажми на самую МАЛЕНЬКУЮ дробь.',
      simplestSuffix: ' (простейший вид)',
    },
    hint: {
      view: { bars: '▭ Полоски', grid: '▦ Сетка' },
      compareCaption: 'Нажми на полоску и сравни закрашенные части!',
      gridCaption: 'Одинаковые сетки — посчитай закрашенные клетки!',
    },
    rep: {
      pizza: 'Пицца',
      chocBar: 'Шоколадка',
      numberLine: 'Числовая прямая',
      gumballs: 'Шарики',
      juice: 'Сок',
    },
  },

  ka: {
    app: {
      title: 'წილადების მეგობრები',
      subtitle: 'ივარჯიშე, სანამ წილადები ადვილი გახდება!',
    },
    home: {
      answered: '⭐ პასუხები: {n}',
      accuracy: '🎯 სიზუსტე: {pct}%',
      pickToStart: 'აირჩიე თამაში დასაწყებად!',
      smartStart: 'ჭკვიანი დაწყება',
      practise: 'ივარჯიშე: {skill}',
      reset: 'პროგრესის განულება',
      language: 'ენა',
    },
    skill: {
      identify: { label: 'იპოვე წილადი', blurb: 'დაასახელე წილადები, იპოვე ტოლები და შეამოკლე.' },
      compare: { label: 'მეტი თუ ნაკლები', blurb: 'შეადარე და დაალაგე წილადები.' },
      addsub: { label: 'შეკრება და გამოკლება', blurb: 'შეკრიბე და გამოაკელი წილადები.' },
      muldiv: { label: 'გამრავლება და გაყოფა', blurb: 'გაამრავლე და გაყავი წილადები. (რთული)' },
    },
    play: {
      levelUp: '⬆️ ახალი დონე! ბრავო!',
      levelDown: 'ვცადოთ უფრო მარტივი ⬇️',
      next: 'შემდეგი ▶',
      seeResults: 'შედეგების ნახვა 🎉',
      hint: '👀 მაჩვენე',
    },
    results: {
      superstar: 'სუპერვარსკვლავი!',
      great: 'შესანიშნავია!',
      good: 'კარგი მცდელობა!',
      keep: 'კიდევ ივარჯიშე!',
      correct: 'სწორი',
      accuracy: 'სიზუსტე',
      bestStreak: 'საუკეთესო სერია',
      level: 'დონე: ',
      playAgain: 'თავიდან თამაში ▶',
      home: 'მთავარი 🏠',
    },
    feedback: {
      cheers: ['მაგარია!', 'კი!', 'ბრწყინვალე!', 'გამოვიდა!', 'შესანიშნავი!', 'ზუსტად!', 'ვაშა!'],
      tries: ['თითქმის!', 'ცოტაც დარჩა!', 'კარგი მცდელობა!', 'კინაღამ!'],
      wrongLead: '💡 {lead} სწორი პასუხია ',
    },
    prompt: {
      whatShaded: 'რომელი წილადია შეფერადებული?',
      equalTo: 'რომელი წილადი უდრის {frac}-ს?',
      simplest: 'ჩაწერე {frac} უმარტივესი სახით.',
      tapBigger: 'შეეხე უფრო დიდ წილადს.',
      tapSmallest: 'შეეხე ყველაზე პატარა წილადს.',
      simplestSuffix: ' (უმარტივესი სახით)',
    },
    hint: {
      view: { bars: '▭ ზოლები', grid: '▦ ბადე' },
      compareCaption: 'შეეხე ზოლს და შეადარე შეფერადებული ნაწილები!',
      gridCaption: 'ერთნაირი ბადეები — დათვალე შეფერადებული უჯრები!',
    },
    rep: {
      pizza: 'პიცა',
      chocBar: 'შოკოლადი',
      numberLine: 'რიცხვითი ღერძი',
      gumballs: 'ბურთულები',
      juice: 'წვენი',
    },
  },
}
