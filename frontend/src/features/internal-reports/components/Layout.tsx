import type { ReactNode } from "react";
import NavigationMenu from "./NavigationMenu";
import LogoutButton from "./LogoutButton";

export type EnvironmentType = "PRODUCTION" | "DEVELOPMENT" | "UNKNOWN";

interface LayoutProps {
    title: ReactNode; // ✅ changed from string → ReactNode
    children: ReactNode;
    environment?: EnvironmentType | null;
}

export default function Layout({
    title,
    children,
    environment,
}: LayoutProps) {
    const getEnvironmentStyles = () => {
        switch (environment) {
            case "PRODUCTION":
                return "bg-green-100 text-green-700";
            case "DEVELOPMENT":
                return "bg-yellow-100 text-yellow-700";
            case "UNKNOWN":
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <main className="p-6 space-y-6 bg-white min-h-screen">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                    </h1>

                    {environment && (
                        <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getEnvironmentStyles()}`}
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

            {children}
        </main>
    );
}