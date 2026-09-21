import { Landmark, Users, BookOpen, Coffee, TestTube } from "lucide-react";

const CATEGORIES = [
  { id: "departments", label: "Department", icon: Landmark },
  { id: "faculty", label: "Faculty", icon: Users },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "cafeteria", label: "Cafeteria", icon: Coffee },
  { id: "labs", label: "Labs", icon: TestTube },
];

function SearchChips({ onSelectCategory, activeCategory = "all", isKiosk = false }) {
  return (
    <div className="w-full mx-auto overflow-x-auto custom-scrollbar pointer-events-auto mt-2 pb-2 -mb-2 hide-scrollbar">
      <div className="flex items-center gap-3.5 px-2 pb-1 justify-start">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.id, cat.label)}
              className={`flex items-center gap-2.5 shrink-0 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-[16px] sm:text-[17px] font-medium transition-all duration-200 border whitespace-nowrap cursor-pointer select-none
                ${isActive 
                  ? "bg-blue-600 border-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] scale-[1.02]" 
                  : "bg-white border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95"
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-gray-600"} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SearchChips;
