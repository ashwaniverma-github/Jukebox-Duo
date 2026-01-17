'use client'

import { motion } from 'framer-motion'

// ==========================================
// MANUALLY UPDATE THESE VALUES EACH MONTH
// ==========================================
const DONATION_COUNT = 1      // Reset to 0 at start of each month
const DONATION_GOAL = 10      // Monthly goal
const CURRENT_MONTH = 'Jan'   // Update: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
// ==========================================

export function DonationMilestone() {
    const progress = Math.min((DONATION_COUNT / DONATION_GOAL) * 100, 100)
    const isComplete = DONATION_COUNT >= DONATION_GOAL

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm shadow-sm"
        >
            {/* Icon */}
            <span className="text-base sm:text-lg">{isComplete ? '🎉' : '💛'}</span>

            {/* Progress section */}
            <div className="flex-1 min-w-[80px] sm:min-w-[120px]">
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                    <span className="text-yellow-200 font-medium truncate max-w-[60px] sm:max-w-none">
                        {isComplete ? 'Complete!' : `${CURRENT_MONTH} Goal`}
                    </span>
                    <span className="text-yellow-400 font-bold ml-1">
                        {DONATION_COUNT}/{DONATION_GOAL}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 sm:h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isComplete
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            }`}
                    />
                </div>
            </div>

            {/* Milestone markers - hidden on small screens */}
            <div className="hidden md:flex items-center gap-1">
                {[...Array(5)].map((_, i) => {
                    const milestone = ((i + 1) / 5) * DONATION_GOAL
                    const reached = DONATION_COUNT >= milestone
                    return (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${reached
                                ? 'bg-yellow-400'
                                : 'bg-gray-600'
                                }`}
                            title={`${milestone} donations`}
                        />
                    )
                })}
            </div>
        </motion.div>
    )
}
