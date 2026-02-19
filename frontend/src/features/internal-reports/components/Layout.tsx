import type { ReactNode } from "react";
import NavigationMenu from "./NavigationMenu";
import LogoutButton from "./LogoutButton";

interface LayoutProps {
    title: string;
    environment?: string | null;
    children: ReactNode;
}

export default function Layout({
    title,
    environment,
    children,
}: LayoutProps) {
    return (
        <main className="p-6 space-y-6 bg-white min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                    </h1>

                    {environment && (
                        <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${environment === "PRODUCTION"
                                ? "bg-green-100 text-green-700"
                                : environment === "PRODUCTION"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {environment}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <NavigationMenu />
                    <LogoutButton />
                </div>
            </div>

            {/* Page Content */}
            {children}
        </main>
    );
}
