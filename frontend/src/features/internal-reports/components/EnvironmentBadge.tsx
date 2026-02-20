interface Props {
    environment?: string;
}

export function EnvironmentBadge({ environment = "PRODUCTION" }: Props) {
    const isProd = environment === "PRODUCTION";

    return (
        <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${isProd
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
        >
            {environment}
        </span>
    );
}