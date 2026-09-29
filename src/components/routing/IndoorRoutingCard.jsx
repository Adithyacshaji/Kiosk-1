import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, X, Navigation2 } from "lucide-react";
import { useDatabase } from "../../context/DatabaseContext";

const buildOptions = (activeIndoorNodes, searchItemsToUse = []) => {
  // Only rooms from the `rooms` table appear in search.
  // Indoor node labels are for map display only and are intentionally excluded.
  const searchOptions = searchItemsToUse.map((item) => {
    const indoorNodeId = item.indoorNode || item.id;
    const indoorNode = activeIndoorNodes[indoorNodeId];
    const isInCurrentBuilding = Boolean(indoorNode);
    const isRoom = item.type === "room";

    return {
      id: isInCurrentBuilding ? indoorNodeId : item.id,
      name: item.name,
      roomNumber: item.room || (isRoom ? item.id : null),
      floor: indoorNode?.floor || item.floor,
      kind: item.type === "faculty" ? item.department || "Faculty" : isRoom ? "Room" : "Campus location",
      routeNode: item.routeNode || item.id,
      building: item.building,
      outdoor: !isInCurrentBuilding,
    };
  });

  return searchOptions
    .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const findOption = (value, options) => {
  if (!value) return null;
  const id = value.nearestNode || value.indoorNode || value.id;
  return options.find((item) => item.name === value.name) || options.find((item) => item.id === id) || (id ? { id, name: value.name || id, floor: value.floor } : null);
};

function RouteField({ label, value, onChange, onSelect, options, showHint = false, onHintDismiss }) {
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return options.filter((item) => !query || `${item.name} ${item.roomNumber || item.id} ${item.floor}`.toLowerCase().includes(query));
  }, [value, options]);

  const handleFocus = () => {
    setFocused(true);
    if (onHintDismiss) onHintDismiss();
  };

  return (
    <label className="relative flex flex-col">
      <div className={`flex items-center gap-2 h-10 px-3 rounded-full border bg-gray-50 transition-all ${focused ? "border-black bg-white shadow-sm ring-2 ring-gray-200" : "border-gray-200"}`}>
        <MapPin size={16} className={`shrink-0 ${value ? "text-black" : "text-gray-400"}`} aria-hidden="true" />
        <input
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-900 font-medium placeholder-gray-400 min-w-0"
          value={value}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        />
        {value && (
          <button
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors flex items-center justify-center"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => { onChange(""); setFocused(true); }}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {showHint && !focused && !value && (
        <div className="absolute top-[44px] left-2 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-[#1A1A1A] rounded-full text-[12px] font-semibold animate-[slideUp_0.3s_ease-out] z-10 border border-gray-200 shadow-sm" aria-live="polite">
          <span>📍</span>
          <span>{showHint}</span>
        </div>
      )}
      {focused && (
        <ul className="absolute top-[48px] left-0 right-0 max-h-[220px] overflow-y-auto bg-white border border-gray-100 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[3000] py-2 custom-scrollbar" role="listbox">
          {matches.length
            ? matches.map((item) => (
                <li key={`${label}-${item.id}-${item.name}`}>
                  <button type="button" className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex flex-col" onMouseDown={() => onSelect(item)}>
                    <strong className="text-[14px] font-semibold text-gray-900">{item.name}</strong>
                    <small className="text-[12px] text-gray-500 font-medium">
                      {item.roomNumber ? `Room ${item.roomNumber}` : item.id}
                      {item.floor ? ` · Floor ${item.floor}` : ""}
                      {item.kind ? ` · ${item.kind}` : ""}
                    </small>
                  </button>
                </li>
              ))
            : <li className="px-4 py-3 text-center text-gray-500 text-[13px]">No locations match this search.</li>
          }
        </ul>
      )}
    </label>
  );
}

export default function IndoorRoutingCard({ onRoute, onOutdoorNavigation, initialSource, initialDestination, activeIndoorNodes, onSourceSelect, hintMessage = "Tap here to set your start location" }) {
  const { searchItems, indoorNodes: fallbackIndoorNodes } = useDatabase();
  const nodesToUse = activeIndoorNodes || fallbackIndoorNodes;
  const options = useMemo(() => buildOptions(nodesToUse, searchItems), [nodesToUse, searchItems]);
  const sourceOptions = useMemo(() => options.filter((item) => !item.outdoor), [options]);
  const sourceFromProps = findOption(initialSource, options);
  const destinationFromProps = findOption(initialDestination, options);
  const [sourceText, setSourceText] = useState(sourceFromProps?.name || "");
  const [destinationText, setDestinationText] = useState(destinationFromProps?.name || "");
  const [source, setSource] = useState(sourceFromProps);
  const [destination, setDestination] = useState(destinationFromProps);
  const [hintVisible, setHintVisible] = useState(true);

  // Sync state with props — always apply when prop changes
  useEffect(() => {
    if (initialSource) {
      const parsed = findOption(initialSource, options);
      if (parsed) {
        setSource(parsed);
        setSourceText(parsed.name);
        setHintVisible(false);
      }
    } else {
      setSource(null);
      setSourceText("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSource, options]);

  useEffect(() => {
    if (initialDestination) {
      const parsed = findOption(initialDestination, options);
      if (parsed) {
        setDestination(parsed);
        setDestinationText(parsed.name);
      }
    } else {
      setDestination(null);
      setDestinationText("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDestination, options]);

  const updateSource = (text) => { setSourceText(text); setSource(null); };
  const updateDestination = (text) => { setDestinationText(text); setDestination(null); };

  return (
    <section className="absolute top-0 left-0 right-0 z-2000 pointer-events-none p-3" aria-label="Indoor route planner">
      <div className="relative bg-white/95 backdrop-blur-xl rounded-[32px] shadow-md border border-gray-100 p-3 pointer-events-auto max-w-[520px] mx-auto animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 flex flex-col gap-2">
            <RouteField
              label="Your Location"
              value={sourceText}
              onChange={updateSource}
              onSelect={(item) => { 
                setSource(item); 
                setSourceText(item.name); 
                setHintVisible(false); 
                if (onSourceSelect) onSourceSelect(item);
              }}
              options={sourceOptions}
              showHint={hintVisible && !source ? hintMessage : false}
              onHintDismiss={() => setHintVisible(false)}
            />
            <div className="absolute left-[18px] top-[32px] bottom-[22px] w-0.5 bg-gray-200 z-0"></div>
            <RouteField
              label="Destination"
              value={destinationText}
              onChange={updateDestination}
              onSelect={(item) => { setDestination(item); setDestinationText(item.name); }}
              options={options}
            />
          </div>

          <div className="flex shrink-0">
            <button
              className="w-12 h-12 bg-[#1A1A1A] hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none text-white rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer"
              type="button"
              onClick={() => source && destination && onRoute(source, destination)}
              disabled={!source || !destination}
              aria-label="Show Route"
              title="Show Route"
            >
              <Navigation2 size={20} className={!source || !destination ? "opacity-50" : ""} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
