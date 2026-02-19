import { useState, useMemo } from "react";
import type { University } from "../types";

interface UniversityDropdownProps {
    universities: University[] | null;
    onSelect?: (university: University | null) => void;
    label?: string;
}

export default function UniversityDropdown({
    universities,
    onSelect,
    label = "Select University",
}: UniversityDropdownProps) {
    const [selectedUniversity, setSelectedUniversity] =
        useState<University | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSelect = (university: University | null) => {
        setSelectedUniversity(university);
        setIsOpen(false);
        onSelect?.(university);
    };

    const displayName = (university: University): string => {
        return (
            university.university_name ||
            university.label ||
            university.name ||
            String(university.id)
        );
    };

    const filteredUniversities = useMemo(() => {
        if (!universities || !searchTerm.trim()) return universities;

        const searchLower = searchTerm.toLowerCase();
        return universities.filter((u) =>
            displayName(u).toLowerCase().includes(searchLower)
        );
    }, [universities, searchTerm]);

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-green-50/30"
            >
                {selectedUniversity
                    ? displayName(selectedUniversity)
                    : "Select a university..."}
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-1.5 text-sm border rounded-lg"
                        />
                    </div>

                    <button
                        onClick={() => handleSelect(null)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50"
                    >
                        All Universities
                    </button>

                    {filteredUniversities?.map((u) => (
                        <button
                            key={u.id}
                            onClick={() => handleSelect(u)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-green-50"
                        >
                            {displayName(u)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
