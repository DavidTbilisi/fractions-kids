import './style.css'
import { mount } from './ui/dom.js'
import { loadProgress } from './state/progress.js'
import { initLang } from './i18n/apply.js'
import { mountDecor } from './ui/components/decor.js'
import { HomeScreen } from './ui/screens/home.js'
import { PlayScreen } from './ui/screens/play.js'
import { ResultsScreen } from './ui/screens/results.js'

const root = document.getElementById('app')
const progress = loadProgress() // single in-memory copy; screens persist via recordSession

initLang() // restore saved language and sync <html lang> / document title

mountDecor() // drifting background stickers, mounted once behind everything

// Tiny screen router. Each screen is a function returning a DOM node.
const nav = {
  home: () => mount(root, HomeScreen({ nav, progress })),
  play: (skillId) => mount(root, PlayScreen({ nav, progress }, skillId)),
  results: (summary) => mount(root, ResultsScreen({ nav, progress }, summary)),
}

nav.home()
