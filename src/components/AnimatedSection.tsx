"use client"
import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    id?: string;
}

export default function AnimatedSection({ children, className = '', delay = 0, id }: AnimatedSectionProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // SSR and first paint: render fully visible (crawlers see real content)
    // After hydration: animate in with whileInView
    if (!hasMounted || prefersReducedMotion) {
        return (
            <div id={id} className={className}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
