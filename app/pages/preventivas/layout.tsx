import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Preventivas - NanoService',
    description: 'Sistema de gestão de manutenção preventiva',
};

export default function PreventivasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}