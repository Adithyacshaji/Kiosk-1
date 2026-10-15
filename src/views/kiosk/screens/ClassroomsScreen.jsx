import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Monitor,
  Search,
  X,
} from 'lucide-react';
import { DirectoryHeader } from '../components/DirectoryHeader';
import { TRANSLATIONS } from '../data/translations';

const parseClassroom = (cls) => {
  const name = (cls.name || cls.title || '').trim();
  const match = name.match(/\bS([1-8])\b/i) || name.match(/S([1-8])/i);
  let semester = 'Other';
  let year = 'All';

  if (match) {
    const semNum = parseInt(match[1], 10);
    semester = `S${semNum}`;
    if (semNum === 1 || semNum === 2) year = '1';
    else if (semNum === 3 || semNum === 4) year = '2';
    else if (semNum === 5 || semNum === 6) year = '3';
    else if (semNum === 7 || semNum === 8) year = '4';
  }

  const bldgLower = (cls.building || '').toLowerCase();
  const buildingName = bldgLower.includes('chavara')
    ? 'Chavara Block'
    : bldgLower.includes('mary') || bldgLower === 'stmarys'
    ? "St. Mary's Block"
    : cls.building || 'Academic Block';

  const floorVal = cls.floor;
  const floorName =
    floorVal === 'G' || floorVal === '0' || floorVal === 0
      ? 'Ground Floor'
      : floorVal === 'B1'
      ? 'Basement 1'
      : floorVal === 'B2'
      ? 'Basement 2'
      : `Floor ${floorVal || 1}`;

  return { ...cls, semester, year, buildingName, floorName, displayTitle: name, roomId: cls.id || cls.room || '' };
};

export const ClassroomsScreen = ({
  onBack,
  onGoHome,
  onSelectClassroom,
  currentTime,
  theme = 'light',
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en',
  classrooms = [],
  initialSearch = '',
}) => {
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('S1');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const parsedClassrooms = useMemo(() =>
    classrooms.map(parseClassroom).filter(
      (cls) => cls.semester !== 'Other' || cls.name?.toLowerCase()?.includes('class')
    ), [classrooms]);

  const yearChips = [
    { id: '1', label: '1st Year' },
    { id: '2', label: '2nd Year' },
    { id: '3', label: '3rd Year' },
    { id: '4', label: '4th Year' },
  ];

  const semesterChips = useMemo(() => {
    if (selectedYear === '1') return ['S1', 'S2'];
    if (selectedYear === '2') return ['S3', 'S4'];
    if (selectedYear === '3') return ['S5', 'S6'];
    if (selectedYear === '4') return ['S7', 'S8'];
    return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
  }, [selectedYear]);

  const filteredClassrooms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return parsedClassrooms.filter((cls) => {
      const matchSearch =
        !q ||
        cls.displayTitle.toLowerCase().includes(q) ||
        cls.roomId.toLowerCase().includes(q) ||
        cls.buildingName.toLowerCase().includes(q) ||
        cls.floorName.toLowerCase().includes(q) ||
        cls.semester.toLowerCase().includes(q);
      const matchYear = !q && (selectedYear === 'All' || cls.year === selectedYear);
      const matchSem = !q && (selectedSemester === 'All' || cls.semester === selectedSemester);
      return q ? matchSearch : (matchYear && matchSem);
    });
  }, [parsedClassrooms, selectedYear, selectedSemester, searchQuery]);

  const handleYearChange = (yearId) => {
    setSelectedYear(yearId);
    setSearchQuery('');
    if (yearId === '1') setSelectedSemester('S1');
    else if (yearId === '2') setSelectedSemester('S3');
    else if (yearId === '3') setSelectedSemester('S5');
    else if (yearId === '4') setSelectedSemester('S7');
  };

  return (
    <section
      id="screen-classrooms"
      className={`screen active directory-screen theme-${theme}`}
      style={{ backgroundColor: 'transparent', color: '#1A1A1A' }}
      role="region"
      aria-label="Classrooms Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
        <DirectoryHeader
          title="CLASSROOM DIRECTORY"
          onBack={onBack}
          onGoHome={onGoHome}
          currentTime={currentTime}
          weather={t.weather || '24°C'}
          theme={theme}
          onToggleTheme={onToggleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          backText="Back"
        />

        {/* ── Search + Filter Bar ── */}
        <div className="kiosk-dir-searchbar-strip">
          {/* Search Input */}
          <div className="kiosk-dir-search-wrap">
            <Search size={20} className="kiosk-dir-search-icon" />
            <input
              className="kiosk-dir-search-input"
              type="text"
              placeholder="Search classrooms, room numbers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="kiosk-dir-search-clear" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Year chips */}
          {!searchQuery && (
            <div className="kiosk-dir-chip-row">
              {yearChips.map((chip) => (
                <button
                  key={chip.id}
                  className={`kiosk-dir-chip ${selectedYear === chip.id ? 'active' : ''}`}
                  onClick={() => handleYearChange(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
              <span className="kiosk-dir-chip-divider" />
              {semesterChips.map((sem) => (
                <button
                  key={sem}
                  className={`kiosk-dir-chip kiosk-dir-chip-sm ${selectedSemester === sem ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(sem)}
                >
                  {sem}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Cards Grid ── */}
        <main
          className="directory-main-content"
          style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
        >
          <div className="classrooms-cards-grid">
            {filteredClassrooms.map((cls) => (
              <div
                key={cls.id || cls.name}
                className="cls-item-card-enhanced"
                onClick={() => onSelectClassroom(cls)}
              >
                <div className="cls-item-left">
                  <div className="cls-item-icon-badge">
                    <Monitor size={22} />
                  </div>
                  <div className="cls-item-text">
                    <h3 className="cls-item-title">{cls.displayTitle}</h3>
                    <div className="cls-item-meta">
                      <MapPin size={13} className="meta-icon" />
                      <span>{cls.buildingName}</span>
                      <span className="cls-meta-dot">·</span>
                      <span>{cls.floorName}</span>
                    </div>
                    <span className="cls-room-tag">Room {cls.roomId}</span>
                  </div>
                </div>
                <button className="btn-navigate-room cls-nav-btn">
                  <Navigation size={16} />
                  <span>Navigate</span>
                </button>
              </div>
            ))}

            {filteredClassrooms.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <Search size={40} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.4rem' }}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No classrooms found.'}
                </p>
                <p style={{ fontSize: '0.95rem', color: '#6B7280' }}>Try a different name, room number or semester.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedYear('1'); setSelectedSemester('S1'); }}
                  style={{ marginTop: '1rem', padding: '0.55rem 1.4rem', borderRadius: '30px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="kiosk-dir-footer">
          <MapPin size={15} color="#ffffff" />
          <span>Christ College of Engineering (Autonomous) · Classroom Directory</span>
        </footer>
      </div>
    </section>
  );
};

export default ClassroomsScreen;
