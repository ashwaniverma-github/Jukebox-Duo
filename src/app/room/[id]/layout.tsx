import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Room - Jukebox Duo',
    robots: {
        index: false,
        follow: false,
    },
};

export default function RoomLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
