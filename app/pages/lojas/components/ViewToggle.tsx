// app/pages/lojas/components/ViewToggle.tsx
import { Button } from "react-bootstrap";
import { useRouter, usePathname } from "next/navigation";

export function ViewToggle() {
    const router = useRouter();
    const pathname = usePathname();

    const isSimplified = pathname?.includes('/simplified');

    const toggleView = () => {
        if (isSimplified) {
            // Go to advanced view
            router.push('/pages/lojas');
        } else {
            // Go to simplified view
            router.push('/pages/lojas/simplified');
        }
    };

    return (
        <div className="d-flex justify-content-end mb-3">
            <Button
                variant="outline-primary"
                size="sm"
                onClick={toggleView}
            >
                <i className={`bi bi-${isSimplified ? 'grid' : 'list'} me-1`}></i>
                {isSimplified ? "Visualização Avançada" : "Visualização Simplificada"}
            </Button>
        </div>
    );
}