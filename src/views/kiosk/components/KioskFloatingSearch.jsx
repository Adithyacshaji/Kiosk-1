import { useState, useRef } from 'react';
import SearchBar from '../../mobile/components/SearchBar';
import SearchChips from '../../mobile/components/SearchChips';

/**
 * KioskFloatingSearch
 *
 * A floating search overlay for the Kiosk map. Sits on top in the gap between
 * the Home button and the Time pill. Includes Google Maps style chips underneath.
 * The virtual keyboard has been removed — the native system keyboard (or a
 * connected hardware keyboard) is used when the user taps the search field.
 */
export function KioskFloatingSearch({ currentFloor, mapMode, onSelectLocation, onSelectCategory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const clearSearchRef = useRef(null);

  const handleChipClick = (catId, catLabel) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      setSearchQuery("");
    } else {
      setActiveCategory(catId);
      const queryMap = {
        departments: "Department",
        faculty: "Faculty",
        library: "Library",
        cafeteria: "Canteen",
        labs: "Lab",
      };
      setSearchQuery(queryMap[catId] || catLabel);
    }
    onSelectCategory?.(catId);
  };

  return (
    <>
      <div className="kiosk-floating-search-wrapper no-bg">
        {/* Search Bar */}
        <div className="kiosk-fs-input-wrap">
          <SearchBar
            currentFloor={currentFloor}
            isIndoorMode={false}
            clearRef={clearSearchRef}
            externalQuery={searchQuery}
            onSelect={(loc) => {
              onSelectLocation(loc);
            }}
          />
        </div>

        {/* Search Chips (Google Maps style) directly below search bar */}
        {mapMode === "OUTDOOR" && (
          <div className="kiosk-fs-chips-wrap">
            <SearchChips 
              isKiosk={true}
              activeCategory={activeCategory} 
              onSelectCategory={handleChipClick} 
            />
          </div>
        )}
      </div>
    </>
  );
}

export default KioskFloatingSearch;
