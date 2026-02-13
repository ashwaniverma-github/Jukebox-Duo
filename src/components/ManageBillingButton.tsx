'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ManageBillingButtonProps {
    isPremium: boolean;
}

export function ManageBillingButton({ isPremium }: ManageBillingButtonProps) {
    const [portalLoading, setPortalLoading] = useState(false);

    if (!isPremium) return null;

    return (
        <DropdownMenu.Item
            onSelect={async (e) => {
                e.preventDefault();
                setPortalLoading(true);
                try {
                    const res = await fetch('/api/dodo/customer-portal', { method: 'POST' });
                    const data = await res.json();
                    if (data.link) {
                        window.open(data.link, '_blank');
                    } else {
                        console.error('Customer portal error:', data.error);
                    }
                } catch (err) {
                    console.error('Failed to open customer portal:', err);
                } finally {
                    setPortalLoading(false);
                }
            }}
            className="w-full px-4 py-2 rounded-lg text-left hover:bg-yellow-700/30 transition-colors cursor-pointer font-medium flex items-center gap-2"
        >
            {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <ExternalLink className="w-4 h-4" />
            )}
            Manage Billing
        </DropdownMenu.Item>
    );
}
