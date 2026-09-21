import { useState, useEffect } from "react";
import { Layers, ChevronDown, Check, MapPin } from "lucide-react";
import "./FloorSelector.css";

export default function FloorSelector({
  currentFloor,
  setCurrentFloor,
  mapMode,
  destination,
  activeFloorImages = {},
}) {
  const [expanded, setExpanded] = useState(false);
  const floors = Object.keys(activeFloorImages).reverse();

  useEffect(() => {
    if (mapMode !== "INDOOR") return;

    setExpanded(true);

    const timer = setTimeout(() => {
      setExpanded(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [mapMode]);

  if (mapMode !== "INDOOR") return null;

  function normalizeFloor(floor) {
    if (!floor) return "G";
    const match = floor.toString().match(/^(\d+)/);
    if (match) return match[1];
    if (floor.toString().toUpperCase().startsWith("G")) return "G";
    return floor;
  }

  function getFloorLabel(floorKey) {
    const f = String(floorKey).toUpperCase().trim();
    if (f === "G" || f === "0") return "Ground";
    if (f === "B1") return "Basement 1";
    if (f === "B2") return "Basement 2";
    const n = parseInt(f, 10);
    if (!isNaN(n)) return `Level ${n}`;
    return `Floor ${f}`;
  }

  const isDestFloor = (floor) => normalizeFloor(destination?.floor) === floor;

  return (
    <div className={`floor-picker ${expanded ? "expanded" : ""}`}>
      {/* Header / Active Floor Toggle Button */}
      <button
        className="floor-current"
        onClick={() => setExpanded(!expanded)}
        title="Toggle Floor Level"
        aria-label={`Current Floor: ${currentFloor}`}
      >
        <div className="floor-current-icon-wrap">
          <Layers size={18} className="floor-icon" />
        </div>
        <div className="floor-current-text">
          <span className="floor-current-key">{currentFloor}</span>
          <span className="floor-current-sub">{getFloorLabel(currentFloor)}</span>
        </div>
        <ChevronDown size={16} className={`arrow ${expanded ? "rotate" : ""}`} />
      </button>

      {/* Expanded Vertical Floor List */}
      <div className="floor-list">
        <div className="floor-list-header">
          <span>SELECT FLOOR</span>
        </div>
        {floors.map((floor) => {
          const active = currentFloor === floor;
          const dest = isDestFloor(floor);
          return (
            <button
              key={floor}
              className={`floor-item ${active ? "active" : ""} ${dest ? "destination" : ""}`}
              onClick={() => {
                setCurrentFloor(floor);
                setExpanded(false);
              }}
            >
              <div className="floor-item-key-wrap">
                <span className="floor-item-key">{floor}</span>
              </div>
              <div className="floor-item-label-wrap">
                <span className="floor-item-label">{getFloorLabel(floor)}</span>
                {dest && !active && (
                  <span className="floor-dest-tag">
                    <MapPin size={10} /> Target
                  </span>
                )}
              </div>
              {active && (
                <div className="floor-active-check">
                  <Check size={14} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}