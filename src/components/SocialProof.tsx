"use client"
import React, { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Music, Users, Radio } from "lucide-react"

interface StatItem {
    icon: React.ElementType
    value: number
    suffix: string
    label: string
}

const stats: StatItem[] = [
    { icon: Radio, value: 1328, suffix: "+", label: "Rooms Created" },
    { icon: Music, value: 5000, suffix: "+", label: "Songs Played" },
    { icon: Users, value: 2000, suffix: "+", label: "Happy Listeners" },
]

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!inView) return

        let start = 0
        const duration = 2000
        const step = Math.ceil(value / (duration / 16))

        const timer = setInterval(() => {
            start += step
            if (start >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(start)
            }
        }, 16)

        return () => clearInterval(timer)
    }, [inView, value])

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            const k = num / 1000
            return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
        }
        return num.toLocaleString()
    }

    return (
        <span>
            {formatNumber(count)}{suffix}
        </span>
    )
}

const SocialProof = () => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <section ref={ref} className="relative py-12 md:py-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    {/* Subtle glow behind */}
                    <div className="absolute inset-0 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 group-hover:bg-rose-500/15 group-hover:border-rose-500/30 transition-all">
                                    <stat.icon className="w-5 h-5 text-rose-400" />
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                                </p>
                                <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default SocialProof
