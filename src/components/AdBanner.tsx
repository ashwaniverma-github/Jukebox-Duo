'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
    slot?: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    style?: React.CSSProperties;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, format = 'auto', className = '', style }) => {
    useEffect(() => {
        try {
            // @ts-expect-error - adsbygoogle is not defined on window in typical TS environments
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`ad-container my-8 flex justify-center w-full min-h-[100px] overflow-hidden ${className}`}>
            {/* Google AdSense Placeholder */}
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-6660595040751061"
                data-ad-slot={slot || '1234567890'} // User should replace this with their actual slot ID
                data-ad-format={format}
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};

export default AdBanner;
