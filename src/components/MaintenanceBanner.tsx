import React from 'react';
import { CONFIG } from '@/lib/config';

const MaintenanceBanner: React.FC = () => {
    if (!CONFIG.MAINTENANCE_MODE) return null;

    return (
        <div className="bg-neutral-900 border-b border-white/5 text-neutral-300 h-10 flex items-center justify-center px-4 text-center text-xs font-medium sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto w-full">
                <p>
                    Scheduled maintenance: Send feedback if you face any issue.
                </p>
            </div>
        </div>
    );
};

export default MaintenanceBanner;
