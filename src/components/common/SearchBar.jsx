import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { Search, X, User, DoorOpen, MapPin, Building2, Mic, QrCode } from "lucide-react";
import ImageModal from "./ImageModal";
import { normalizeName, FACULTY_PHOTOS } from "./BottomSheet";
// Alias dictionary for intelligent acronym & term matching
const ALIASES = {
  cse: ["computer science", "computer science and engineering", "cs"],
  cs: ["computer science", "cse"],
  ece: ["electronics and communication", "electrical and communication", "ee"],
  eee: ["electrical and electronics"],
  me: ["mechanical engineering", "mechanical"],
  mech: ["mechanical engineering"],
  ce: ["civil engineering", "civil"],
  bsh: ["basic science and humanities"],
  mca: ["master of computer applications"],
  mba: ["master of business administration"],
  hod: ["head of department", "department head"],
  prof: ["professor", "faculty"],
  teacher: ["professor", "faculty", "staff"],
  toilet: ["washroom", "restroom", "bathroom", "wc"],
  washroom: ["toilet", "restroom", "bathroom", "wc"],
};

// Levenshtein distance for typo tolerance
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Keywords that trigger smart floor filtering for toilets
const TOILET_QUERY_TERMS = new Set(["toilet", "toilets", "washroom", "restroom", "bathroom", "wc"]);
const TOILET_NAME_TERMS = ["toilet", "washroom", "restroom", "bathroom", "girl", "boy"];

function isToiletItem(item) {
  const name = (item.name || "").toLowerCase();
  return TOILET_NAME_TERMS.some((t) => name.includes(t));
}

// Converts raw floor keys to readable labels
function formatFloor(floor) {
  if (!floor) return "Ground Floor";
  const f = String(floor).toUpperCase().trim();
  if (f === "G" || f === "0" || f === "GROUND") return "Ground Floor";
  if (f === "B1") return "Basement 1";
  if (f === "B2") return "Basement 2";
  const n = parseInt(f, 10);
  if (!isNaN(n)) {
    const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
    return `${n}${suffix} Floor`;
  }
  return `${f} Floor`;
}

function formatBuilding(building) {
  if (!building) return "";
  const b = String(building).toLowerCase().trim();
  if (b.includes("chavara")) return "St Chavara Block";
  if (b.includes("stmary") || b.includes("st-mary") || b.includes("st_mary")) return "St Mary's Block";
  return building;
}

const DEFAULT_SUGGESTIONS = [
  { name: "Executive Director", type: "room", id: "SM311", building: "stmarys", floor: "G" },
  { name: "Principal's Office", type: "room", id: "SM314", building: "stmarys", floor: "G" },
  { name: "Office", type: "room", id: "SM319", building: "stmarys", floor: "G" },
  { name: "Placement Cell", type: "room", id: "SM106", building: "stmarys", floor: "B2" },
  { name: "Main Canteen", type: "location", id: "canteen" },
];

/**
 * @param {object} props
 * @param {(item: object) => void} props.onSelect
 * @param {string}  [props.currentFloor]  – active floor key; used for toilet smart filter
 * @param {boolean} [props.isIndoorMode]  – true when the app is in indoor map mode
 */
function SearchBar({ onSelect, currentFloor = "G", isIndoorMode = false, clearRef }) {
  const { searchItems: SEARCH_ITEMS } = useDatabase();
  const [selectedImage, setSelectedImage] = useState(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Animated placeholder state
  const placeholders = useMemo(() => [
    "Search for a room...",
    "Search for restrooms...",
    "Search for St Chavara Block...",
    "Search for faculty..."
  ], []);

  // Use refs for animation state to bypass React renders and guarantee 60fps smoothness
  const placeholderIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef(null);
  const pushedHistoryRef = useRef(false);

  // Expose clear() + _hasContent() to the parent so back-button logic
  // can imperatively clear the bar when query or dropdown is open.
  useEffect(() => {
    if (!clearRef) return;
    const clearFn = () => {
      setQuery("");
      setShowResults(false);
      setActiveIndex(-1);
      if (inputRef.current) inputRef.current.blur();
    };
    clearFn._hasContent = () => !!(query || showResults);
    clearRef.current = clearFn;
  }); // runs every render so _hasContent closure is always fresh

  // Hardware Back Button Intercept for Mobile
  useEffect(() => {
    window.__SEARCH_OPEN = showResults;

    const handlePopState = () => {
      if (showResults) {
        pushedHistoryRef.current = false;
        setShowResults(false);
        if (inputRef.current) inputRef.current.blur();
      }
    };

    if (showResults) {
      if (!pushedHistoryRef.current) {
        window.history.pushState({ searchOpen: true }, "");
        pushedHistoryRef.current = true;
      }
      window.addEventListener("popstate", handlePopState);
    } else {
      if (pushedHistoryRef.current) {
        window.__POPPING_SEARCH = true;
        window.history.back();
        setTimeout(() => { window.__POPPING_SEARCH = false; }, 50);
        pushedHistoryRef.current = false;
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showResults]);

  useEffect(() => {
    // If user is interacting, freeze the animation and set a static placeholder
    if (showResults || query) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inputRef.current) inputRef.current.placeholder = "Search Departments, Classrooms...";
      return;
    }

    const typeLoop = () => {
      if (!inputRef.current) return;

      const currentString = placeholders[placeholderIndexRef.current];
      const isDeleting = isDeletingRef.current;
      const charIndex = charIndexRef.current;
      const typingSpeed = isDeleting ? 25 : 65; // Slightly faster for smoother feel

      let nextCharIndex = charIndex;
      let nextIsDeleting = isDeleting;
      let delay = typingSpeed;

      if (!isDeleting && charIndex < currentString.length) {
        nextCharIndex = charIndex + 1;
      } else if (isDeleting && charIndex > 0) {
        nextCharIndex = charIndex - 1;
      } else if (!isDeleting && charIndex === currentString.length) {
        nextIsDeleting = true;
        delay = 2000; // Pause at the end of the string
      } else if (isDeleting && charIndex === 0) {
        nextIsDeleting = false;
        placeholderIndexRef.current = (placeholderIndexRef.current + 1) % placeholders.length;
      }

      // Natively update DOM element to avoid triggering a React re-render!
      inputRef.current.placeholder = currentString.substring(0, nextCharIndex) + (isDeleting ? "" : "|");

      charIndexRef.current = nextCharIndex;
      isDeletingRef.current = nextIsDeleting;

      timerRef.current = setTimeout(typeLoop, delay);
    };

    // Kick off animation loop
    timerRef.current = setTimeout(typeLoop, 70);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [placeholders, showResults, query]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const getSearchTokens = (text) =>
    (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const normalizeSpaceless = (text) =>
    (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Pre-compute searchable metadata once to dramatically speed up keystroke filtering
  const optimizedSearchItems = useMemo(() => {
    return SEARCH_ITEMS.map(item => {
      const name = item.name || "";
      const nameLower = name.toLowerCase();
      const dept = (item.department || "").toLowerCase();
      const desig = (item.designation || "").toLowerCase();
      const bldg = (item.building || "").toLowerCase();
      const floor = (item.floor || "").toString().toLowerCase();
      const room = (item.room || "").toString().toLowerCase();
      const type = (item.type || "").toLowerCase();

      const fullText = [nameLower, dept, desig, bldg, floor, room, type].join(" ");

      return {
        item,
        nameLower,
        nameSpaceless: normalizeSpaceless(nameLower),
        itemId: (item.id || "").toString().toLowerCase(),
        itemIdSpaceless: normalizeSpaceless((item.id || "").toString()),
        indoorNodeSpaceless: normalizeSpaceless((item.indoorNode || "").toString()),
        dept,
        desig,
        nameWords: getSearchTokens(nameLower),
        itemTokens: getSearchTokens(fullText),
        isToilet: isToiletItem(item)
      };
    });
  }, [SEARCH_ITEMS]);

  const results = useMemo(() => {
    const qTrimmed = deferredQuery.trim().toLowerCase();
    if (!qTrimmed) return DEFAULT_SUGGESTIONS;

    const qTokens = getSearchTokens(qTrimmed);
    const qSpaceless = normalizeSpaceless(qTrimmed);

    // Expand query tokens with aliases
    const expandedQTokens = new Set(qTokens);
    qTokens.forEach((t) => {
      if (ALIASES[t]) {
        ALIASES[t].forEach((alias) => {
          getSearchTokens(alias).forEach((at) => expandedQTokens.add(at));
        });
      }
    });
    const finalQTokens = Array.from(expandedQTokens);

    // Smart toilet floor filter: when user is indoors, only show toilets from the current active floor.
    const isToiletQuery = qTokens.some((t) => TOILET_QUERY_TERMS.has(t));

    const scored = optimizedSearchItems.map((meta) => {
      // Hard-suppress toilets from other floors when indoors
      if (isIndoorMode && meta.isToilet) {
        if (meta.item.floor && meta.item.floor !== currentFloor) return { item: meta.item, score: -1 };
      }

      let score = 0;

      // --- TIER 1: EXACT MATCHES ON NAME OR ROOM/NODE ID ---
      if (meta.nameLower === qTrimmed || meta.itemId === qTrimmed || meta.itemIdSpaceless === qSpaceless) {
        score += 1000;
      }
      // --- TIER 2: DIRECT PREFIX MATCHES ON NAME OR ROOM/NODE ID ---
      else if (meta.nameLower.startsWith(qTrimmed) || meta.itemIdSpaceless.startsWith(qSpaceless) || meta.indoorNodeSpaceless.startsWith(qSpaceless)) {
        score += 800;
      }
      // Word prefix in item name (e.g. typing "soor" matching "Dr. SOORAJ T R")
      else if (meta.nameWords.some((w) => w.startsWith(qTrimmed))) {
        score += 750;
      }
      // Spaceless room/item match (e.g. typing "501" matching "F501" or "CSE Faculty Room")
      else if (qSpaceless && (meta.nameSpaceless.startsWith(qSpaceless) || meta.nameSpaceless.includes(qSpaceless))) {
        score += 600;
      }

      // --- TIER 3: CONTAINS MATCH ON NAME ---
      else if (meta.nameLower.includes(qTrimmed)) {
        score += 450;
      }

      // --- TIER 4: DEPARTMENT / DESIGNATION DIRECT MATCH ---
      else if (meta.dept.startsWith(qTrimmed) || meta.dept.includes(" " + qTrimmed)) {
        score += 300;
      } else if (meta.desig.startsWith(qTrimmed)) {
        score += 250;
      }

      // --- TIER 5: TOKEN & ALIAS MATCHING ---
      let matchedTokens = 0;
      for (const qTok of finalQTokens) {
        if (meta.itemTokens.some((iTok) => iTok.startsWith(qTok) || iTok.includes(qTok))) {
          matchedTokens++;
        }
      }

      if (matchedTokens > 0) {
        score += matchedTokens * 30;
        if (matchedTokens === finalQTokens.length) {
          score += 40;
        }
      }

      // --- TIER 6: FUZZY MATCHING (TYPO TOLERANCE) ---
      // If we still have no solid score, and the query is reasonably long, check for typos
      if (score === 0 && qTrimmed.length > 3) {
        // 1. Check if query is a typo of a specific word (e.g. "soorja" for "sooraj")
        for (const word of meta.nameWords) {
          if (Math.abs(word.length - qTrimmed.length) <= 2) {
            const distance = getEditDistance(word, qTrimmed);
            if (distance <= 2) {
              score += 100 - (distance * 10);
              break;
            }
          }
        }

        // 2. Check if the spaceless query is a typo of the spaceless name (e.g. "sanjaysntosh")
        if (score === 0 && Math.abs(meta.nameSpaceless.length - qSpaceless.length) <= 2) {
          const distance = getEditDistance(meta.nameSpaceless, qSpaceless);
          if (distance <= 2) {
            score += 80 - (distance * 10);
          }
        }
      }

      return { item: meta.item, score };
    }).filter((res) => res.score > 0);

    return scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Prefer shorter item names for closer query match (e.g. "Canteen" before longer phrases)
        if (a.item.name.length !== b.item.name.length) {
          return a.item.name.length - b.item.name.length;
        }
        return a.item.name.localeCompare(b.item.name);
      })
      .slice(0, 10)
      .map((res) => res.item);
  }, [deferredQuery, optimizedSearchItems, currentFloor, isIndoorMode]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeEl = resultsRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleSelect = (location) => {
    if (!location) return;
    onSelect(location);
    setQuery(location.name);
    setShowResults(false);
    setActiveIndex(-1);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        setShowResults(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = activeIndex >= 0 ? results[activeIndex] : results[0];
      handleSelect(targetItem);
    } else if (e.key === "Escape") {
      setShowResults(false);
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const getItemIcon = (item) => {
    if (item.type === "faculty") return <User size={18} />;
    if (item.type === "room") return <DoorOpen size={18} />;
    if (item.building || item.type === "building") return <Building2 size={18} />;
    return <MapPin size={18} />;
  };

  const getItemIconWrapperClass = (item, isActive) => {
    if (item.type === "faculty") {
      return isActive ? "bg-sky-200 text-sky-700" : "bg-sky-100 text-sky-600";
    }
    if (item.type === "room") {
      return isActive ? "bg-emerald-200 text-emerald-700" : "bg-emerald-100 text-emerald-600";
    }
    if (item.building || item.type === "building") {
      return isActive ? "bg-amber-200 text-amber-700" : "bg-amber-100 text-amber-600";
    }
    return isActive ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-600";
  };

  const getItemMeta = (item) => {
    if (item.type === "faculty") {
      const bName = formatBuilding(item.building || item.routeNode);
      return `${item.designation || "Faculty"} · ${item.department || ""} (${bName})`;
    }
    if (item.type === "room") {
      const bName = formatBuilding(item.building || item.routeNode);
      const roomCode = item.id && item.id !== item.name ? ` · ${item.id}` : "";
      return `${bName}${roomCode} · ${formatFloor(item.floor)}`;
    }
    if (item.department) {
      const bName = formatBuilding(item.building || item.routeNode);
      return `${item.department}${bName ? ` · ${bName}` : ""}${item.floor ? ` · ${formatFloor(item.floor)}` : ""}`;
    }
    if (item.building) {
      const bName = formatBuilding(item.building);
      return `${bName}${item.floor ? ` · ${formatFloor(item.floor)}` : ""}`;
    }
    return "Campus Location";
  };

  return (
    <div className="w-full mx-auto relative px-4 pointer-events-auto" ref={containerRef}>
      <div className="flex items-center gap-2 h-12.5 rounded-[30px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 pl-5 pr-2 transition-all duration-300 focus-within:shadow-[0_8px_40px_rgb(37,99,235,0.15)] focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="text-gray-400 shrink-0" size={22} />
        <input
          ref={inputRef}
          className="search-input flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 min-w-0 font-medium"
          type="text"
          placeholder="Search..."
          value={query}
          onFocus={() => {
            setShowResults(true);
          }}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            setShowResults(true);
          }}
          onKeyDown={handleKeyDown}
        />

        {query ? (
          <button
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
            title="Clear search"
            onClick={() => {
              setQuery("");
              // Keep results open to show default suggestions
              setActiveIndex(-1);
              if (inputRef.current) inputRef.current.focus();
            }}
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      {showResults && (
        <div className="absolute top-18 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.15)] border border-gray-100 overflow-hidden z-2000" ref={resultsRef}>
          {results.length > 0 ? (
            <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {results.map((location, index) => {
                const isFaculty = location.type === "faculty";
                const normalizedName = isFaculty ? normalizeName(location.name) : "";
                const photoPath = isFaculty ? FACULTY_PHOTOS[normalizedName] : null;

                return (
                  <button
                    className={`w-full text-left px-5 py-3 flex items-center gap-4 transition-colors ${index === activeIndex ? "bg-blue-50/80" : "hover:bg-gray-50"}`}
                    key={`${location.id}-${index}`}
                    onClick={() => handleSelect(location)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 overflow-hidden ${photoPath ? 'cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 border border-gray-200' : getItemIconWrapperClass(location, index === activeIndex)}`}
                      onClick={(e) => {
                        if (photoPath) {
                          e.stopPropagation();
                          setSelectedImage({ url: photoPath, alt: location.name });
                        }
                      }}
                    >
                      {photoPath ? (
                        <img src={photoPath} alt={location.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        getItemIcon(location)
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-semibold text-gray-900 truncate">{location.name}</span>
                      <span className="text-[13px] text-gray-500 truncate">{getItemMeta(location)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
              <Search size={32} className="mb-3 opacity-50" />
              <span className="text-[15px] font-medium text-gray-500">No matching locations found</span>
            </div>
          )}
        </div>
      )}
      <ImageModal
        imageUrl={selectedImage?.url}
        altText={selectedImage?.alt}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default SearchBar;
