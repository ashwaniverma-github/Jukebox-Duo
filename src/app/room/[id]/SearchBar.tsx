'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface Result {
  videoId: string
  title: string
  thumbnail: string
}

interface Props {
  roomId: string
  onAdd: () => void
}

export default function SearchBar({ roomId, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!query) return setResults([])
    const id = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(query)}`)
      const json: Result[] = await res.json()
      setResults(json)
      setLoading(false)
    }, 300)
    return () => clearTimeout(id)
  }, [query, roomId])

  const handleAddToQueue = async (item: Result) => {
    try {
      await fetch(`/api/rooms/${roomId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      onAdd()
      setQuery('')
      setResults([])
    } catch (error) {
      console.error('Failed to add to queue:', error)
    }
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-black/70 shadow-lg p-4 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 transition-all ${focused ? 'border-pink-400 shadow-lg' : 'border-gray-200 dark:border-gray-700'}`}
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search YouTube"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
        />
      </div>
      <AnimatePresence>
        {loading && (
          <motion.p
            className="text-sm text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >Searching 6 6</motion.p>
        )}
      </AnimatePresence>
      <ul className="space-y-2 max-h-60 overflow-y-auto mt-2">
        <AnimatePresence>
          {results.map((r) => (
            <motion.li
              key={r.videoId}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex items-center space-x-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 p-2 rounded-lg cursor-pointer"
            >
              <img src={r.thumbnail} width={64} height={48} alt="" className="rounded shadow" />
              <span className="flex-1 text-sm font-medium truncate">{r.title}</span>
              <button
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs shadow hover:scale-105 transition-transform"
                onClick={() => handleAddToQueue(r)}
              >
                <PlusCircleIcon className="w-4 h-4" /> Add
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
