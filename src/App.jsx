import { useState } from "react"
import WebcamFeed from "./components/WebcamFeed"
import SuggestionPanel from "./components/SuggestionPanel"

export default function App() {
  const [bodyType, setBodyType] = useState(null)
  const [occasion, setOccasion] = useState("casual")
  const [season, setSeason] = useState("summer")
  const [gender, setGender] = useState("neutral")

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-8 border-b border-gray-800 flex items-center gap-3">
        <span className="text-2xl">👗</span>
        <h1 className="text-xl font-bold tracking-wide">StyleSense AI</h1>
        <span className="ml-auto text-sm text-gray-400">Real-time Fashion Advisor</span>
      </header>

      {/* Main */}
      <main className="flex flex-1 gap-6 p-6">
        {/* Left — Webcam */}
        <div className="flex-1 flex flex-col gap-4">
          <WebcamFeed onBodyTypeDetected={setBodyType} />
          
          {/* Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Occasion</label>
              <select
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="party">Party</option>
                <option value="work">Work</option>
                <option value="date">Date Night</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Season</label>
              <select
                value={season}
                onChange={e => setSeason(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
                <option value="winter">Winter</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Style</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="neutral">Neutral</option>
                <option value="feminine">Feminine</option>
                <option value="masculine">Masculine</option>
                <option value="streetwear">Streetwear</option>
                <option value="minimalist">Minimalist</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right — Suggestions */}
        <div className="w-96">
          <SuggestionPanel
            bodyType={bodyType}
            occasion={occasion}
            season={season}
            gender={gender}
          />
        </div>
      </main>
    </div>
  )
}