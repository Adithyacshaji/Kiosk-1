import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  SunMedium, 
  MapPin, 
  Navigation,
  Monitor
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { DirectoryHeader } from './DirectoryHeader';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import collegeBg from '../../assets/kiosk/college.png';

// Helper to filter and parse classroom details (S1 - S8)
const parseClassroom = (cls) => {
  const name = (cls.name || cls.title || '').trim();
  const match = name.match(/\bS([1-8])\b/i) || name.match(/S([1-8])/i);
  let semester = 'Other';
  let year = 'All';

  if (match) {
    const semNum = parseInt(match[1], 10);
    semester = `S${semNum}`;
    if (semNum === 1 || semNum === 2) {
      year = '1';
    } else if (semNum === 3 || semNum === 4) {
      year = '2';
    } else if (semNum === 5 || semNum === 6) {
      year = '3';
    } else if (semNum === 7 || semNum === 8) {
      year = '4';
    }
  }

  const bldgLower = (cls.building || '').toLowerCase();
  const buildingName = bldgLower.includes('chavara') 
    ? 'Chavara Block' 
    : (bldgLower.includes('mary') || bldgLower === 'stmarys' ? "St. Mary's Block" : (cls.building || 'Academic Block'));
  
  const floorVal = cls.floor;
  const floorName = (floorVal === 'G' || floorVal === '0' || floorVal === 0) 
    ? 'Ground Floor' 
    : (floorVal === 'B1' ? 'Basement 1' : (floorVal === 'B2' ? 'Basement 2' : `Floor ${floorVal || 1}`));

  const roomId = cls.id || cls.room || '';

  return {
    ...cls,
    semester,
    year,
    buildingName,
    floorName,
    displayTitle: name,
    roomId
  };
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
  classrooms = []
}) => {
  const [selectedYear, setSelectedYear] = useState('1'); // '1' | '2' | '3' | '4'
  const [selectedSemester, setSelectedSemester] = useState('S1'); // 'S1' | 'S2' ... | 'S8'
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Filter only valid classrooms matching S1-S8 or classroom designations
  const parsedClassrooms = useMemo(() => {
    return classrooms
      .map(parseClassroom)
      .filter(cls => cls.semester !== 'Other' || cls.name?.toLowerCase()?.includes('class'));
  }, [classrooms]);

  const yearChips = [
    { id: '1', label: '1st Year (S1/S2)' },
    { id: '2', label: '2nd Year (S3/S4)' },
    { id: '3', label: '3rd Year (S5/S6)' },
    { id: '4', label: '4th Year (S7/S8)' }
  ];

  // Available semesters for the selected year
  const semesterChips = useMemo(() => {
    if (selectedYear === '1') return ['S1', 'S2'];
    if (selectedYear === '2') return ['S3', 'S4'];
    if (selectedYear === '3') return ['S5', 'S6'];
    if (selectedYear === '4') return ['S7', 'S8'];
    return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
  }, [selectedYear]);

  // Filter classrooms by selected year and semester
  const filteredClassrooms = useMemo(() => {
    return parsedClassrooms.filter(cls => {
      const matchYear = selectedYear === 'All' || cls.year === selectedYear;
      const matchSem = selectedSemester === 'All' || cls.semester === selectedSemester;
      return matchYear && matchSem;
    });
  }, [parsedClassrooms, selectedYear, selectedSemester]);

  const handleYearChange = (yearId) => {
    setSelectedYear(yearId);
    if (yearId === '1') setSelectedSemester('S1');
    else if (yearId === '2') setSelectedSemester('S3');
    else if (yearId === '3') setSelectedSemester('S5');
    else if (yearId === '4') setSelectedSemester('S7');
  };

  return (
    <section 
      id="screen-classrooms" 
      className={`screen active directory-screen theme-${theme}`} 
      style={{ backgroundColor: '#F9FAFB', color: '#1A1A1A' }}
      role="region" 
      aria-label="Classrooms Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
        {/* Top Navigation Bar */}
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

        {/* Main Content Area */}
        <main className="directory-main-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 1.5rem', WebkitOverflowScrolling: 'touch' }}>
          {/* Header Title & Small Year / Semester Chips */}
          {/* Header Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
              Find Your Classroom
            </h1>

            {/* Small Year Chips directly below Find Classroom */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {yearChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleYearChange(chip.id)}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: selectedYear === chip.id ? '#1A1A1A' : '#ffffff',
                    color: selectedYear === chip.id ? '#ffffff' : '#1A1A1A',
                    border: selectedYear === chip.id ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: selectedYear === chip.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Small Semester Chips for faster filtering */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', marginRight: '0.2rem' }}>Sem:</span>
              {semesterChips.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  style={{
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: selectedSemester === sem ? '#1A1A1A' : '#ffffff',
                    color: selectedSemester === sem ? '#ffffff' : '#1A1A1A',
                    border: selectedSemester === sem ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: selectedSemester === sem ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {sem === 'All' ? 'All' : sem}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Classroom Cards Grid - Only Classroom Names on Clean Clickable Cards */}
            <div 
              className="classrooms-cards-grid" 
              style={{ 
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', 
                gap: '1.25rem',
                marginTop: '0.4rem' 
              }}
            >
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
              <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1A1A1A' }}>No classrooms found matching this filter.</p>
                <button 
                  onClick={() => { setSelectedYear('1'); setSelectedSemester('S1'); }}
                  style={{ marginTop: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: '30px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Directory Footer */}
        <footer style={{ background: '#1A1A1A', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.8rem', flexShrink: 0, textAlign: 'center', flexWrap: 'wrap' }}>
          <MapPin size={16} color="#ffffff" />
          <span>Christ College of Engineering (Autonomous) | Classroom Directory</span>
        </footer>
      </div>
    </section>
  );
};

export default ClassroomsScreen;
