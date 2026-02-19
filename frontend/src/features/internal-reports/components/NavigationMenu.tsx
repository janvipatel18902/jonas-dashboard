import { Link, useLocation } from "react-router-dom";

export default function NavigationMenu() {
    const location = useLocation();

    const linkClasses = (path: string) => {
        const isRoot = path === "/";

        const isActive = isRoot
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

        return `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`;
    };

    return (
        <div className="flex gap-2">
            <Link to="/" className={linkClasses("/")}>
                Alfinet
            </Link>

            <Link
                to="/open-edx"
                className={linkClasses("/open-edx")}
            >
                Micro-Experiences
            </Link>

            <Link
                to="/events"
                className={linkClasses("/events")}
            >
                Events
            </Link>
        </div>
    );
}
