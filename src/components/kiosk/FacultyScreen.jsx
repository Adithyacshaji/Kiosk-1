import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  SunMedium, 
  MapPin, 
  Navigation, 
  User, 
  Mail, 
  Phone, 
  Layers, 
  Monitor, 
  Building2, 
  Compass, 
  GraduationCap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { KIOSK_CONFIG } from '../../data/kiosk/kioskData';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';

import collegeBg from '../../assets/kiosk/college.png';

export const FacultyScreen = ({
  onBack,
  onGoHome,
  onSelectFaculty,
  currentTime,
  theme = 'light',
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en',
  departments = []
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const selectedDepartment = departments.find(d => d.id === selectedDeptId);

  const getDeptIcon = (iconName) => {
    switch (iconName) {
      case 'Monitor': return <Monitor size={28} />;
      case 'Compass': return <Compass size={28} />;
      case 'Building2': return <Building2 size={28} />;
      case 'GraduationCap': return <GraduationCap size={28} />;
      default: return <User size={28} />;
    }
  };

  const handleBack = () => {
    if (selectedDeptId) {
      setSelectedDeptId(null);
    } else {
      onBack();
    }
  };

  return (
    <section 
      id="screen-faculty" 
      className={`screen active directory-screen glass-dashboard-screen theme-${theme}`} 
      style={{ backgroundImage: `url(${collegeBg})`, color: 'white' }}
      role="region" 
      aria-label="Faculty Directory"
    >
      <div className="glass-main-wrapper directory-glass-wrapper">
      {/* Top Welcome/Navigation Bar for Faculty */}
      <header className="directory-top-bar">
        <div className="dir-bar-left">
          <button className="btn-dir-back" onClick={handleBack} title={selectedDeptId ? "Back to Departments" : "Back to Services"}>
            <ArrowLeft size={20} />
            <span>{selectedDeptId ? "Back to Departments" : "Back to Services"}</span>
          </button>
          <div className="dir-brand-badge" onClick={onGoHome}>
            <img src={logoImg} alt="Logo" className="dir-logo-mini" />
            <div className="dir-brand-text">
              <span className="dir-brand-name">Campus Compass</span>
              <span className="dir-brand-tag">FACULTY DIRECTORY</span>
            </div>
          </div>
        </div>

        <div className="dir-bar-right">
          <div className="landing-weather-pill">
            <SunMedium size={16} className="pill-icon-weather" />
            <span>{t.weather}</span>
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
      <main className="directory-main-content">
        {/* STAGE 1: DEPARTMENT SELECTION GRID */}
        {!selectedDepartment && (
          <>
            <div className="directory-heading-box">
              <div className="dir-title-text">
                <div className="dir-eyebrow">ACADEMIC DEPARTMENTS</div>
                <h1 className="dir-title">Select a Department</h1>
                <p className="dir-subtitle">Choose an engineering or science department to view its professors, HODs, and faculty cabin locations.</p>
              </div>
            </div>

            <div className="department-cards-grid">
              {departments.map((dept) => (
                <div 
                  key={dept.id} 
                  className="department-item-card"
                  onClick={() => setSelectedDeptId(dept.id)}
                >
                  <div className="dept-card-header">
                    <div className="dept-icon-circle">
                      {getDeptIcon(dept.icon || 'GraduationCap')}
                    </div>
                    <span className="dept-code-pill">{dept.name.substring(0, 4).toUpperCase()}</span>
                  </div>

                  <div className="dept-card-body">
                    <h3 className="dept-name">{dept.name}</h3>
                    <div className="dept-hod-row">
                      <span className="hod-label">Head of Dept:</span>
                      <span className="hod-val">{dept.faculties?.find(f => f.designation?.toLowerCase().includes('hod'))?.name || 'N/A'}</span>
                    </div>
                    <div className="dept-location-row">
                      <MapPin size={14} />
                      <span>{dept.building || 'Main Block'}</span>
                    </div>
                  </div>

                  <div className="dept-card-footer">
                    <span className="dept-count-badge">{(dept.faculties || []).length} Faculty Members</span>
                    <div className="dept-arrow-btn">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STAGE 2: FACULTY MEMBERS LIST FOR SELECTED DEPARTMENT */}
        {selectedDepartment && (
          <>
            <div className="directory-heading-box">
              <div className="dir-title-text">
                <div className="dir-eyebrow">{selectedDepartment.name}</div>
                <h1 className="dir-title">Faculty Directory</h1>
                <p className="dir-subtitle">Select a faculty member below to get turn-by-turn navigation to their cabin.</p>
              </div>
              <div className="dept-stats-summary">
                <div className="stat-pill"><User size={16}/> {(selectedDepartment.faculties || []).length} Members</div>
                <div className="stat-pill"><MapPin size={16}/> {selectedDepartment.building || 'Main Block'}</div>
              </div>
              <button className="btn-switch-dept" onClick={() => setSelectedDeptId(null)}>
                <ArrowLeft size={16} />
                <span>Change Department</span>
              </button>
            </div>

            <div className="faculty-grid">
              {(selectedDepartment.faculties || []).map((fac, idx) => (
                <div key={idx} className="faculty-card" onClick={() => onSelectFaculty(fac)}>
                  <div className="fac-card-left">
                    <div className="fac-avatar">
                      <User size={28} />
                    </div>
                    <div className="fac-info">
                      <h3 className="fac-name">{fac.name}</h3>
                      <p className="fac-role">{fac.designation || 'Faculty'}</p>
                      
                      <div className="fac-meta-group">
                        <div className="fac-meta-item">
                          <MapPin size={14} className="meta-icon" />
                          <span>{fac.room ? `Room ${fac.room}` : 'Cabin Location N/A'}</span>
                        </div>
                        <div className="fac-meta-item">
                          <Layers size={14} className="meta-icon" />
                          <span>{fac.floor === 'G' || fac.floor === '0' || fac.floor === 0 ? 'Ground Floor' : `Floor ${fac.floor || 1}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fac-card-right">
                    <button className="btn-fac-navigate" onClick={(e) => { e.stopPropagation(); onSelectFaculty(fac); }}>
                      <Navigation size={18} />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Directory Footer */}
      <footer className="campus-bottom-footer">
        <div className="footer-left-info">
          <MapPin size={16} color="var(--c-sage-mid)" />
          <span>Christ College of Engineering (Autonomous) | Faculty Directory</span>
        </div>
        <div className="footer-right-motto">
          <span>"Smarter campus. A better you."</span>
        </div>
      </footer>
      </div>
    </section>
  );
};

export default FacultyScreen;

