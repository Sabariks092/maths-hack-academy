import Audience from './components/sections/Audience'
import Benefits from './components/sections/Benefits'
import ClosingCta from './components/sections/ClosingCta'
import DemoReasons from './components/sections/DemoReasons'
import Footer from './components/sections/Footer'
import Header from './components/sections/Header'
import Hero from './components/sections/Hero'
import Method from './components/sections/Method'
import Ticker from './components/sections/Ticker'

function App() {
  return (
    <div className="paper-grain">
      <a
        href="#method"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Method />
        <Benefits />
        <Audience />
        <DemoReasons />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  )
}

export default App
