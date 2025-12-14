"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
}

export default function Portal({ children }: PortalProps) {
    const [mounted, setMounted] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Try to find the portal-root div first, fallback to body
        const root = document.getElementById("portal-root") || document.body;
        setPortalRoot(root);
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !portalRoot) return null;

    // Wrap children in a div with pointer-events-auto to make it interactive
    return createPortal(
        <div className="pointer-events-auto">
            {children}
        </div>,
        portalRoot
    );
}
