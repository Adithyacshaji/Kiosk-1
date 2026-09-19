/**
 * YDCard.jsx
 *
 * Unified "Your Location / Destination" card used in two modes:
 *
 *  • OUTDOOR mode  – "Your Location" is a read-only GPS label; "Destination"
 *    is a full search input that queries the same SEARCH_ITEMS pool as
 *    SearchBar.jsx (with toilet-floor filtering applied).
 *
 *  • INDOOR mode   – Both rows are searchable dropdowns backed by the
 *    active indoor node list (same buildOptions logic as IndoorRoutingCard).
 *    The card is always shown as soon as the user enters indoor mode.
 *
 * Props
 * ─────
 *  mode            "outdoor" | "indoor"
 *  currentFloor    string — active floor key ("G", "B1", "1", …)
 *  gpsLocationLabel string — read-only label for the GPS origin row (outdoor)
 *
 *  // Outdoor-specific
 *  onOutdoorSelect  (item) => void  — called when user picks a destination
 *
 *  // Indoor-specific
 *  activeIndoorNodes  object  — the normalised indoor node map
 *  initialSource      object  — pre-filled source node {name, nearestNode, floor}
 *  initialDestination object  — pre-filled destination
 *  onRoute            (source, dest) => void
 *  onSourceSelect     (item) => void
 *  onOutdoorNavigation () => void  — exit indoor mode button
 *  hintMessage        string
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, Navigation2, DoorOpen, User, Building2, Search, X, ArrowUpRight } from "lucide-react";
import { useDatabase } from "../../context/DatabaseContext";
import ImageModal from "./ImageModal";
import { normalizeName, FACULTY_PHOTOS } from "./BottomSheet";
import "./YDCard.css";

// ─── Alias dictionary (mirrors SearchBar.jsx) ─────────────────────────────────
const ALIASES = {
  cse: ["computer science", "computer science and engineering", "cs"],
  cs: ["computer science", "cse"],
  ece: ["electronics and communication"],
  eee: ["electrical and electronics"],
  me: ["mechanical engineering"],
  mech: ["mechanical engineering"],
  ce: ["civil engineering"],
  mca: ["master of computer applications"],
  mba: ["master of business administration"],
  hod: ["head of department"],
  toilet: ["washroom", "restroom", "bathroom", "wc"],
  washroom: ["toilet", "restroom", "bathroom", "wc"],
};

const TOILET_TERMS = new Set(["toilet", "washroom", "restroom", "bathroom", "wc"]);
const TOILET_NAMES = ["toilet", "washroom", "restroom", "bathroom", "wc", "girl", "boy"];

function isToiletItem(item) {
  const name = (item.name || "").toLowerCase();
  return TOILET_NAMES.some((t) => name.includes(t));
}

const DEFAULT_SUGGESTIONS = [
  { name: "Executive Director", type: "room", id: "SM311", building: "stmarys", floor: "G" },
  { name: "Principal's Office", type: "room", id: "SM314", building: "stmarys", floor: "G" },
  { name: "Office", type: "room", id: "SM319", building: "stmarys", floor: "G" },
  { name: "Placement Cell", type: "room", id: "SM106", building: "stmarys", floor: "B2" },
  { name: "Main Canteen", type: "location", id: "canteen" },
];

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

function getSearchTokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeSpaceless(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

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

// ─── Search logic (mirrors SearchBar optimizations) ───────────────────────────
function buildOptimizedItems(items) {
  return items.map((item) => {
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
}

function scoreOptimizedItem(meta, qTrimmed, qSpaceless, finalQTokens, currentFloor, applyToiletFilter) {
  if (applyToiletFilter && meta.isToilet) {
    if (meta.item.floor && String(meta.item.floor) !== String(currentFloor)) return 0;
  }

  let score = 0;
  if (meta.nameLower === qTrimmed || meta.itemId === qTrimmed || meta.itemIdSpaceless === qSpaceless) score += 1000;
  else if (meta.nameLower.startsWith(qTrimmed) || meta.itemIdSpaceless.startsWith(qSpaceless) || meta.indoorNodeSpaceless.startsWith(qSpaceless)) score += 800;
  else if (meta.nameWords.some((w) => w.startsWith(qTrimmed))) score += 750;
  else if (qSpaceless && (meta.nameSpaceless.startsWith(qSpaceless) || meta.nameSpaceless.includes(qSpaceless))) score += 600;
  else if (meta.nameLower.includes(qTrimmed)) score += 450;
  else if (meta.dept.startsWith(qTrimmed) || meta.dept.includes(" " + qTrimmed)) score += 300;
  else if (meta.desig.startsWith(qTrimmed)) score += 250;

  let matchedTokens = 0;
  for (const qTok of finalQTokens) {
    if (meta.itemTokens.some((iTok) => iTok.startsWith(qTok) || iTok.includes(qTok))) matchedTokens++;
  }
  if (matchedTokens > 0) {
    score += matchedTokens * 30;
    if (matchedTokens === finalQTokens.length) score += 40;
  }

  if (score === 0 && qTrimmed.length > 3) {
    for (const word of meta.nameWords) {
      if (Math.abs(word.length - qTrimmed.length) <= 2) {
        const distance = getEditDistance(word, qTrimmed);
        if (distance <= 2) {
          score += 100 - (distance * 10);
          break;
        }
      }
    }
    if (score === 0 && Math.abs(meta.nameSpaceless.length - qSpaceless.length) <= 2) {
      const distance = getEditDistance(meta.nameSpaceless, qSpaceless);
      if (distance <= 2) {
        score += 80 - (distance * 10);
      }
    }
  }

  return score;
}

// ─── Indoor option builder ────────────────────────────────────────────────────
// Only rooms from the `rooms` table appear in search.
// Indoor node labels are for map display only and are intentionally excluded.
function buildIndoorOptions(activeIndoorNodes, searchItems) {
  const searchOptions = searchItems.map((item) => {
    const indoorNodeId = item.indoorNode || item.id;
    const indoorNode = activeIndoorNodes[indoorNodeId];
    const isInCurrentBuilding = Boolean(indoorNode);
    return {
      ...item,
      // Keep original id (room_id) as the item's identity for dedup —
      // two rooms with the same indoor_node must remain distinct entries.
      // Store the resolved node id separately for routing.
      resolvedNodeId: isInCurrentBuilding ? indoorNodeId : null,
      floor: indoorNode?.floor || item.floor,
      routeNode: item.routeNode || item.id,
      outdoor: !isInCurrentBuilding,
    };
  });

  // Deduplicate by name — distinct room names always produce distinct entries
  return searchOptions
    .filter((item, index, all) => all.findIndex((o) => o.name === item.name) === index)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function findIndoorOption(value, options) {
  if (!value) return null;
  const id = value.nearestNode || value.indoorNode || value.id;
  return (
    options.find((item) => item.name === value.name) ||
    options.find((item) => item.id === id) ||
    (id ? { id, name: value.name || id, floor: value.floor } : null)
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ItemIcon({ item }) {
  if (item.type === "faculty") return <User size={18} />;
  if (item.type === "room") return <DoorOpen size={18} />;
  if (item.building || item.type === "building") return <Building2 size={18} />;
  return <MapPin size={18} />;
}

function getItemIconWrapperClass(item, isActive) {
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
}

function formatBuilding(building) {
  if (!building) return "";
  const b = String(building).toLowerCase().trim();
  if (b.includes("chavara")) return "St Chavara Block";
  if (b.includes("stmary") || b.includes("st-mary") || b.includes("st_mary")) return "St Mary's Block";
  return building;
}

function itemMeta(item) {
  if (item.type === "faculty") {
    const bName = formatBuilding(item.building || item.routeNode);
    return `${item.designation || "Faculty"} · ${item.department || ""} (${bName})`;
  }
  if (item.type === "room") {
    const bName = formatBuilding(item.building || item.routeNode);
    const roomPart = item.roomNumber || item.id || "";
    return `${bName} · ${roomPart ? roomPart + " · " : ""}${formatFloor(item.floor)}`;
  }
  if (item.department) {
    const bName = formatBuilding(item.building || item.routeNode);
    return `${item.department}${bName ? ` · ${bName}` : ""}${item.floor ? ` · ${formatFloor(item.floor)}` : ""}`;
  }
  if (item.building) {
    const bName = formatBuilding(item.building);
    return `${bName}${item.floor ? ` · ${formatFloor(item.floor)}` : ""}`;
  }
  return item.kind || "Campus Location";
}

// ─── Single editable field with dropdown ─────────────────────────────────────
function SearchField({ id, label, value, onChange, onSelect, results, isReadOnly, placeholder, onImageClick }) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (!focused || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) => (p < results.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) => (p > 0 ? p - 1 : results.length - 1));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      onSelect(activeIndex >= 0 ? results[activeIndex] : results[0]);
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  if (isReadOnly) {
    return (
      <div className="yd-field">
        <div className="yd-field-inner yd-field-inner--readonly">
          <span className="yd-field-icon"><MapPin size={16} /></span>
          <span className="yd-field-readonly-text">{value || placeholder}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="yd-field">
      <div className={`yd-field-inner${focused ? " yd-field-inner--focused" : ""}`}>
        <span className="yd-field-icon">
          {id === "origin" ? <MapPin size={16} /> : <Search size={16} />}
        </span>
        <input
          ref={inputRef}
          className="yd-field-input"
          type="text"
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => { onChange(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {value && (
          <button
            className="yd-clear-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            aria-label={`Clear ${label}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {focused && value.trim() && results.length > 0 && (
        <div className="yd-dropdown !p-0 !py-2">
          {results.map((item, idx) => {
            const isFaculty = item.type === "faculty";
            const normalizedName = isFaculty ? normalizeName(item.name) : "";
            const photoPath = isFaculty ? FACULTY_PHOTOS[normalizedName] : null;

            return (
            <button
              key={`${item.id}-${idx}`}
              className={`w-full text-left px-5 py-3 flex items-center gap-4 transition-colors ${idx === activeIndex ? "bg-blue-50/80" : "hover:bg-gray-50"}`}
              type="button"
              onMouseDown={() => onSelect(item)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 overflow-hidden ${photoPath ? 'cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 border border-gray-200' : getItemIconWrapperClass(item, idx === activeIndex)}`}
                onMouseDown={(e) => {
                  if (photoPath) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onImageClick) onImageClick({ url: photoPath, alt: item.name });
                  }
                }}
              >
                {photoPath ? (
                  <img src={photoPath} alt={item.name} className="w-full h-full object-cover object-center" />
                ) : (
                  <ItemIcon item={item} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-gray-900 truncate">{item.name}</span>
                <span className="text-[13px] text-gray-500 truncate">{itemMeta(item)}</span>
              </div>
            </button>
          )})}
        </div>
      )}
      {focused && value.trim() && results.length === 0 && (
        <div className="yd-dropdown">
          <div className="yd-dropdown-empty">No locations found</div>
        </div>
      )}
    </div>
  );
}

// ─── Main YDCard component ────────────────────────────────────────────────────
export default function YDCard({
  mode = "outdoor",
  currentFloor = "G",
  gpsLocationLabel = "Your Location",

  // Outdoor
  onOutdoorSelect,
  outdoorDestinationName = "",

  // Indoor
  activeIndoorNodes,
  initialSource,
  initialDestination,
  onRoute,
  onSourceSelect,
  onOutdoorNavigation,
  hintMessage = "Enter your current location",
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const { searchItems: SEARCH_ITEMS } = useDatabase();

  // ── Outdoor destination search state ────────────────────────────────────────
  const [destQuery, setDestQuery] = useState(outdoorDestinationName || "");

  // Sync the pre-filled destination name when the prop changes
  // (e.g. user navigates from SearchBar result → YD Card appears)
  useEffect(() => {
    if (outdoorDestinationName) {
      setDestQuery(outdoorDestinationName);
    }
  }, [outdoorDestinationName]);

  const optimizedOutdoorItems = useMemo(() => buildOptimizedItems(SEARCH_ITEMS), [SEARCH_ITEMS]);

  const outdoorResults = useMemo(() => {
    if (mode !== "outdoor") return [];
    const qTrimmed = destQuery.trim().toLowerCase();
    if (!qTrimmed) return DEFAULT_SUGGESTIONS;

    const qTokens = getSearchTokens(qTrimmed);
    const qSpaceless = normalizeSpaceless(qTrimmed);
    const expandedQTokens = new Set(qTokens);
    qTokens.forEach((t) => {
      if (ALIASES[t]) {
        ALIASES[t].forEach((alias) => getSearchTokens(alias).forEach((at) => expandedQTokens.add(at)));
      }
    });
    const finalQTokens = Array.from(expandedQTokens);

    const isToiletQuery = qTokens.some((t) => TOILET_TERMS.has(t));
    const applyToiletFilter = isToiletQuery && Boolean(currentFloor);

    return optimizedOutdoorItems
      .map((meta) => ({ item: meta.item, score: scoreOptimizedItem(meta, qTrimmed, qSpaceless, finalQTokens, currentFloor, applyToiletFilter) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.item.name.length - b.item.name.length)
      .slice(0, 10)
      .map((r) => r.item);
  }, [destQuery, mode, optimizedOutdoorItems, currentFloor]);

  // ── Indoor route state ───────────────────────────────────────────────────────
  const indoorOptions = useMemo(() => {
    if (mode !== "indoor" || !activeIndoorNodes) return [];
    return buildIndoorOptions(activeIndoorNodes, SEARCH_ITEMS);
  }, [mode, activeIndoorNodes, SEARCH_ITEMS]);

  const sourceOptions = useMemo(() => indoorOptions.filter((i) => !i.outdoor), [indoorOptions]);

  const sourceFromProps = useMemo(() => findIndoorOption(initialSource, indoorOptions), [initialSource, indoorOptions]);
  const destFromProps   = useMemo(() => findIndoorOption(initialDestination, indoorOptions), [initialDestination, indoorOptions]);

  const [sourceText, setSourceText] = useState(sourceFromProps?.name || "");
  const [destText, setDestText]     = useState(destFromProps?.name || "");
  const [source, setSource]         = useState(sourceFromProps || null);
  const [dest, setDest]             = useState(destFromProps || null);

  // Sync props → state
  useEffect(() => {
    if (initialSource) {
      const p = findIndoorOption(initialSource, indoorOptions);
      if (p) { setSource(p); setSourceText(p.name); }
    } else {
      setSource(null); setSourceText("");
    }
  }, [initialSource, indoorOptions]);

  useEffect(() => {
    if (initialDestination) {
      const p = findIndoorOption(initialDestination, indoorOptions);
      if (p) { setDest(p); setDestText(p.name); }
    } else {
      setDest(null); setDestText("");
    }
  }, [initialDestination, indoorOptions]);

  // Indoor filtered results
  const optimizedSourceOptions = useMemo(() => buildOptimizedItems(sourceOptions), [sourceOptions]);
  const indoorSourceResults = useMemo(() => {
    const qTrimmed = sourceText.trim().toLowerCase();
    if (!qTrimmed) return DEFAULT_SUGGESTIONS;

    const qTokens = getSearchTokens(qTrimmed);
    const qSpaceless = normalizeSpaceless(qTrimmed);
    const expandedQTokens = new Set(qTokens);
    qTokens.forEach((t) => {
      if (ALIASES[t]) {
        ALIASES[t].forEach((alias) => getSearchTokens(alias).forEach((at) => expandedQTokens.add(at)));
      }
    });
    const finalQTokens = Array.from(expandedQTokens);

    return optimizedSourceOptions
      .map((meta) => ({ item: meta.item, score: scoreOptimizedItem(meta, qTrimmed, qSpaceless, finalQTokens, currentFloor, false) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.item.name.length - b.item.name.length)
      .slice(0, 10)
      .map((r) => r.item);
  }, [sourceText, sourceOptions, optimizedSourceOptions, currentFloor]);

  const optimizedIndoorOptions = useMemo(() => buildOptimizedItems(indoorOptions), [indoorOptions]);
  const indoorDestResults = useMemo(() => {
    const qTrimmed = destText.trim().toLowerCase();
    if (!qTrimmed) return DEFAULT_SUGGESTIONS;

    const qTokens = getSearchTokens(qTrimmed);
    const qSpaceless = normalizeSpaceless(qTrimmed);
    const expandedQTokens = new Set(qTokens);
    qTokens.forEach((t) => {
      if (ALIASES[t]) {
        ALIASES[t].forEach((alias) => getSearchTokens(alias).forEach((at) => expandedQTokens.add(at)));
      }
    });
    const finalQTokens = Array.from(expandedQTokens);

    const isToiletQuery = qTokens.some((t) => TOILET_TERMS.has(t));
    const applyToiletFilter = isToiletQuery && Boolean(currentFloor);

    return optimizedIndoorOptions
      .map((meta) => ({ item: meta.item, score: scoreOptimizedItem(meta, qTrimmed, qSpaceless, finalQTokens, currentFloor, applyToiletFilter) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.item.name.length - b.item.name.length)
      .slice(0, 10)
      .map((r) => r.item);
  }, [destText, indoorOptions, optimizedIndoorOptions, currentFloor]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOutdoorDestSelect = useCallback((item) => {
    setDestQuery(item.name);
    if (onOutdoorSelect) onOutdoorSelect(item);
  }, [onOutdoorSelect]);

  const handleIndoorRoute = useCallback(() => {
    if (source && dest && onRoute) onRoute(source, dest);
  }, [source, dest, onRoute]);

  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "outdoor") {
    return (
      <div className="yd-card-wrapper">
        <div className="yd-card">
          <div className="yd-fields">
            <div className="yd-connector">
              <div className="yd-dot yd-dot--origin" />
              <div className="yd-line" />
              <div className="yd-dot yd-dot--dest" />
            </div>
            <div className="yd-inputs">
              {/* Origin — read-only GPS label */}
              <SearchField
                id="origin"
                label="Your Location"
                value={gpsLocationLabel}
                isReadOnly
                placeholder="Your Location"
              />
              <div className="yd-divider" />
              {/* Destination — full search */}
              <SearchField
                id="dest"
                label="Destination"
                value={destQuery}
                onChange={setDestQuery}
                onSelect={handleOutdoorDestSelect}
                results={outdoorResults}
                placeholder="Search destination…"
                onImageClick={setSelectedImage}
              />
            </div>
          </div>
        </div>
        <ImageModal 
          imageUrl={selectedImage?.url} 
          altText={selectedImage?.alt} 
          onClose={() => setSelectedImage(null)} 
        />
      </div>
    );
  }

  // Indoor mode
  return (
    <div className="yd-card-wrapper">
      <div className="yd-card">
        <div className="yd-fields">
          <div className="yd-connector">
            <div className="yd-dot yd-dot--origin" />
            <div className="yd-line" />
            <div className="yd-dot yd-dot--dest" />
          </div>
          <div className="yd-inputs">
            <SearchField
              id="origin"
              label="Your Location"
              value={sourceText}
              onChange={(v) => { setSourceText(v); setSource(null); }}
              onSelect={(item) => {
                setSource(item);
                setSourceText(item.name);
                if (onSourceSelect) onSourceSelect(item);
              }}
              results={indoorSourceResults}
              placeholder={hintMessage}
              onImageClick={setSelectedImage}
            />
            {mode === "indoor" && !source && (
              <div className="text-[11px] font-bold text-amber-600 px-2 mt-0.5 animate-pulse flex items-center gap-1">
                <span>⚠️</span> Please select your starting room
              </div>
            )}
            <div className="yd-divider" />
            <SearchField
              id="dest"
              label="Destination"
              value={destText}
              onChange={(v) => { setDestText(v); setDest(null); }}
              onSelect={(item) => { setDest(item); setDestText(item.name); }}
              results={indoorDestResults}
              placeholder="Search room or faculty…"
              onImageClick={setSelectedImage}
            />
          </div>

        </div>

      </div>

      {/* Destination Info & Start Navigation Button - Rendered at bottom of page via Portal */}
      {dest && typeof document !== "undefined" && createPortal(
        <div className="navigation-card pointer-events-auto shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
          <p className="text-[14.5px] text-gray-700 leading-snug mb-3">
            <strong>{dest.name}</strong> is on the <strong>
              {formatFloor(dest.floor)}
            </strong> of <strong>{(dest.building || "").toLowerCase().includes("chavara") ? "St Chavara Block" : "St Mary's Block"}</strong>.
          </p>
          <button
            className="w-full h-11.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-full transition-all shadow-[0_4px_12px_rgb(37,99,235,0.2)] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-[15px]"
            type="button"
            disabled={!source || !dest}
            onClick={handleIndoorRoute}
          >
            Start navigation
          </button>
        </div>,
        document.getElementById("root") || document.body
      )}
      <ImageModal 
        imageUrl={selectedImage?.url} 
        altText={selectedImage?.alt} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
