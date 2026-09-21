import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  SunMedium, 
  MapPin, 
  Navigation
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';
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
      className={`screen active directory-screen glass-dashboard-screen theme-${theme}`} 
      style={{ backgroundImage: `url(${collegeBg})`, color: 'white' }}
      role="region" 
      aria-label="Classrooms Directory"
    >
      <div className="glass-main-wrapper directory-glass-wrapper">
        {/* Top Navigation Bar */}
        <header className="directory-top-bar">
          <div className="dir-bar-left">
            <button className="btn-dir-back" onClick={onBack} title="Back">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="dir-brand-badge" onClick={onGoHome}>
              <img src={logoImg} alt="Logo" className="dir-logo-mini" />
              <div className="dir-brand-text">
                <span className="dir-brand-name">Campus Compass</span>
                <span className="dir-brand-tag">CLASSROOM DIRECTORY</span>
              </div>
            </div>
          </div>

          <div className="dir-bar-right">
            <div className="landing-weather-pill">
              <SunMedium size={16} className="pill-icon-weather" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill">
              <Clock size={16} className="pill-icon-time" />
              <span className="time-clock">{currentTime}</span>
            </div>
            <ThemeToggle 
              theme={theme}
              onToggleTheme={onToggleTheme}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
            />
            <button className="btn-campus-home" onClick={onGoHome} title={t.home}>
              <Home size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="directory-main-content" style={{ gap: '1.25rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          {/* Header Title & Small Year / Semester Chips */}
          {/* Header Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
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
                    background: selectedYear === chip.id ? 'rgba(144, 187, 172, 0.45)' : 'rgba(255, 255, 255, 0.14)',
                    color: '#ffffff',
                    border: selectedYear === chip.id ? '1.5px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: selectedYear === chip.id ? '0 0 14px rgba(144, 187, 172, 0.35)' : 'none'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Small Semester Chips for faster filtering */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginRight: '0.2rem' }}>Sem:</span>
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
                    background: selectedSemester === sem ? 'rgba(93, 133, 155, 0.55)' : 'rgba(255, 255, 255, 0.10)',
                    color: '#ffffff',
                    border: selectedSemester === sem ? '1.5px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.22)',
                    boxShadow: selectedSemester === sem ? '0 0 10px rgba(93, 133, 155, 0.35)' : 'none'
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.25rem',
              marginTop: '0.4rem' 
            }}
          >
            {filteredClassrooms.map((cls) => (
              <div 
                key={cls.id || cls.name} 
                className="classroom-item-card"
                onClick={() => onSelectClassroom(cls)}
                style={{
                  padding: '1.3rem 1.6rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  minHeight: 'auto',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'black', margin: 0, lineHeight: 1.2 }}>
                    {cls.displayTitle}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(0, 0, 0, 0.7)', fontWeight: 600 }}>
                    {cls.buildingName} • Room {cls.roomId} ({cls.floorName})
                  </span>
                </div>
                
                <div 
                  className="glass-card-arrow" 
                  style={{ 
                    width: '42px', 
                    height: '42px', 
                    flexShrink: 0,
                    background: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: 'black'
                  }}
                >
                  <Navigation size={18} color="black" />
                </div>
              </div>
            ))}

            {filteredClassrooms.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '20px' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>No classrooms found matching this filter.</p>
                <button 
                  onClick={() => { setSelectedYear('1'); setSelectedSemester('S1'); }}
                  style={{ marginTop: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: '30px', background: 'rgba(144,187,172,0.4)', color: '#fff', border: '1px solid #fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Directory Footer */}
        <footer className="campus-bottom-footer">
          <div className="footer-left-info">
            <MapPin size={16} color="#90bbac" />
            <span>Christ College of Engineering (Autonomous) | Classroom Directory</span>
          </div>
          <div className="footer-right-motto">
            <span>"Smarter campus. A better you."</span>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default ClassroomsScreen;
