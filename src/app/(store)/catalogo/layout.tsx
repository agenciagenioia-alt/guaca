import FloatingGarments from '@/components/FloatingGarments'

export default function CatalogoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <FloatingGarments />
            {children}
        </>
    )
}
