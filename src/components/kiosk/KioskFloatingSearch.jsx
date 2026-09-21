import { useState, useRef, useEffect } from 'react';
import SearchBar from '../common/SearchBar';
import SearchChips from '../common/SearchChips';
import { Keyboard, X } from 'lucide-react';

/**
 * KioskFloatingSearch
 *
 * A floating search overlay for the Kiosk map. Sits on top in the gap between
 * the Home button and the Time pill. Includes Google Maps style chips underneath,
 * and a bottom-docked virtual keyboard for touchscreen use.
 */
export function KioskFloatingSearch({ currentFloor, mapMode, onSelectLocation, onSelectCategory }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const clearSearchRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setKeyboardOpen(true);
    const input = document.querySelector('.kiosk-floating-search-wrapper input');
    if (input) {
      input.addEventListener('focus', handleOpen);
      input.addEventListener('click', handleOpen);
    }
    return () => {
      if (input) {
        input.removeEventListener('focus', handleOpen);
        input.removeEventListener('click', handleOpen);
      }
    };
  }, []);

  // ── Virtual keyboard rows ────────────────────────────────────────────────────
  const KB_ROWS = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M','⌫'],
    ['CLEAR', 'SPACE', 'DONE'],
  ];

  const handleKeyPress = (key) => {
    const input = document.querySelector('.kiosk-floating-search-wrapper input') || document.querySelector('.kiosk-floating-search input');
    if (!input) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (key === '⌫') {
      const nextVal = input.value.slice(0, -1);
      nativeInputValueSetter.call(input, nextVal);
      setSearchQuery(nextVal);
    } else if (key === 'CLEAR') {
      nativeInputValueSetter.call(input, '');
      setSearchQuery('');
    } else if (key === 'SPACE') {
      const nextVal = input.value + ' ';
      nativeInputValueSetter.call(input, nextVal);
      setSearchQuery(nextVal);
    } else if (key === 'DONE') {
      setKeyboardOpen(false);
      input.blur();
      return;
    } else {
      const nextVal = input.value + key;
      nativeInputValueSetter.call(input, nextVal);
      setSearchQuery(nextVal);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

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
        {/* Search Bar on top in the gap between Home and Time */}
        <div className="kiosk-fs-input-wrap">
          <SearchBar
            currentFloor={currentFloor}
            isIndoorMode={false}
            clearRef={clearSearchRef}
            externalQuery={searchQuery}
            onSelect={(loc) => {
              setKeyboardOpen(false);
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

      {/* Virtual Keyboard — Docks at the BOTTOM of the screen */}
      {keyboardOpen && (
        <div className="kiosk-vkb-bottom-dock">
          <div className="kiosk-vkb-header">
            <div className="kiosk-vkb-header-title">
              <Keyboard size={18} className="text-blue-600" />
              <span>Touch Keyboard</span>
            </div>
            <button 
              className="kiosk-vkb-close-btn"
              onClick={() => setKeyboardOpen(false)}
              title="Close Keyboard"
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>

          <div className="kiosk-vkb-keys-grid">
            {KB_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="kiosk-vkb-row">
                {row.map((key) => {
                  let cls = 'kiosk-vkb-key';
                  if (key === 'SPACE') cls += ' kiosk-vkb-space';
                  if (key === 'DONE') cls += ' kiosk-vkb-done';
                  if (key === 'CLEAR') cls += ' kiosk-vkb-clear';
                  if (key === '⌫') cls += ' kiosk-vkb-backspace';
                  return (
                    <button 
                      key={key} 
                      className={cls} 
                      onPointerDown={(e) => { 
                        e.preventDefault(); 
                        handleKeyPress(key); 
                      }}
                    >
                      {key === 'SPACE' ? 'Space' : key === 'DONE' ? '✓ Done' : key === 'CLEAR' ? 'Clear' : key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default KioskFloatingSearch;
