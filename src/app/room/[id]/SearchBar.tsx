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

interface ErrorState {
  message: string
  isQuotaExceeded?: boolean
  estimatedResetHours?: number
}

export default function SearchBar({ roomId, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)

  useEffect(() => {
    if (!query) {
      setResults([])
      setError(null)
      return
    }
    
    const id = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        
        if (!res.ok) {
          // Handle API error response
          if (res.status === 503 && json.quotaExceeded) {
            setError({
              message: json.error,
              isQuotaExceeded: true,
              estimatedResetHours: json.estimatedResetHours
            })
          } else if (res.status === 429) {
            setError({
              message: 'Too many requests. Please wait a moment before searching again.'
            })
          } else {
            setError({
              message: json.error || 'Search failed. Please try again.'
            })
          }
          setResults([])
        } else {
          // Success - json is Result[]
          setResults(json)
        }
      } catch (err) {
        console.error('Search error:', err)
        setError({
          message: 'Network error. Please check your connection and try again.'
        })
        setResults([])
      }
      
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
          >Searching...</motion.p>
        )}
        {error && !loading && (
          <motion.div
            className={`mt-2 p-3 rounded-lg ${
              error.isQuotaExceeded 
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className={`text-sm font-medium ${
              error.isQuotaExceeded 
                ? 'text-amber-800 dark:text-amber-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {error.isQuotaExceeded ? '⚠️ Search Temporarily Unavailable' : '❌ Search Error'}
            </p>
            <p className={`text-xs mt-1 ${
              error.isQuotaExceeded 
                ? 'text-amber-600 dark:text-amber-300' 
                : 'text-red-600 dark:text-red-300'
            }`}>
              {error.message}
            </p>
            {error.isQuotaExceeded && error.estimatedResetHours && (
              <p className="text-xs mt-2 text-amber-600 dark:text-amber-300">
                💡 Tip: Try again in {error.estimatedResetHours} hour{error.estimatedResetHours !== 1 ? 's' : ''}, or use cached results if available.
              </p>
            )}
          </motion.div>
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
