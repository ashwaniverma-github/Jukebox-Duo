import React from 'react';
import { CONFIG } from '@/lib/config';

const MaintenanceBanner: React.FC = () => {
    if (!CONFIG.MAINTENANCE_MODE) return null;

    return (
        <div className="bg-zinc-950/80 backdrop-blur-md border-b border-white/10 text-zinc-300 h-10 flex items-center justify-center px-4 text-center text-[10px] sm:text-xs font-medium sticky top-0 z-[100] selection:bg-rose-500/30">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </span>
                </div>
                <p className="truncate">
                    <span>Ongoing maintenance : </span>
                    Send feedback if you face any issues.
                </p>
            </div>
        </div>
    );
};

export default MaintenanceBanner;
