import React, { useState } from 'react';
import { DirectoryHeader } from './DirectoryHeader';
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
  ChevronRight,
  Sparkles,
  Wrench,
  Landmark,
  Zap,
  Radio,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { KIOSK_CONFIG } from '../../data/kiosk/kioskData';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import { getFacultyPhoto } from '../../utils/facultyPhotos';
import { getDeptShortName, getDeptIconName } from '../../utils/departmentUtils';


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

  const getDeptIcon = (iconName, dept) => {
    const iconKey = dept?.icon || iconName || getDeptIconName(dept);
    switch (iconKey) {
      case 'Monitor': return <Monitor size={24} />;
      case 'Wrench': return <Wrench size={24} />;
      case 'Landmark': return <Landmark size={24} />;
      case 'Zap': return <Zap size={24} />;
      case 'Radio': return <Radio size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Briefcase': return <Briefcase size={24} />;
      case 'Compass': return <Compass size={24} />;
      case 'Building2': return <Building2 size={24} />;
      default: {
        const fallbackKey = getDeptIconName(dept);
        switch (fallbackKey) {
          case 'Monitor': return <Monitor size={24} />;
          case 'Wrench': return <Wrench size={24} />;
          case 'Landmark': return <Landmark size={24} />;
          case 'Zap': return <Zap size={24} />;
          case 'Radio': return <Radio size={24} />;
          case 'GraduationCap': return <GraduationCap size={24} />;
          case 'Briefcase': return <Briefcase size={24} />;
          default: return <GraduationCap size={24} />;
        }
      }
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
      className={`screen active directory-screen theme-${theme}`} 
      style={{ backgroundColor: 'transparent', color: '#1A1A1A' }}
      role="region" 
      aria-label="Faculty Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Top Welcome/Navigation Bar for Faculty */}
      <DirectoryHeader 
        title="FACULTY DIRECTORY"
        onBack={handleBack}
        onGoHome={onGoHome}
        currentTime={currentTime}
        weather={t.weather}
        theme={theme}
        onToggleTheme={onToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        backText={selectedDeptId ? "Back to Departments" : "Back"}
      />

      {/* Main Content Area */}
      <main className="directory-main-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 1.5rem', WebkitOverflowScrolling: 'touch' }}>
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
                      {getDeptIcon(dept.icon, dept)}
                    </div>
                    <span className="dept-code-pill">{getDeptShortName(dept)}</span>
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
                <div className="dir-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{selectedDepartment.name}</span>
                  <span style={{ fontSize: '0.8rem', background: '#1A1A1A', color: '#ffffff', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 800 }}>
                    {getDeptShortName(selectedDepartment)}
                  </span>
                </div>
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
              {(selectedDepartment.faculties || []).map((fac, idx) => {
                const photoPath = fac.image_url || fac.photo || getFacultyPhoto(fac.name, getDeptShortName(selectedDepartment) || selectedDepartment?.code || selectedDepartment?.name);

                return (
                  <div key={idx} className="faculty-card" onClick={() => onSelectFaculty(fac)}>
                    <div className="fac-card-left">
                      <div className="fac-avatar">
                        {photoPath ? (
                          <img 
                            src={photoPath} 
                            alt={fac.name} 
                            className="fac-avatar-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const svg = e.target.parentElement.querySelector('svg');
                              if (svg) svg.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <User size={28} style={{ display: photoPath ? 'none' : 'block' }} />
                      </div>
                      <div className="fac-info">
                        <h3 className="fac-name">{fac.name}</h3>
                        <p className="fac-role">{fac.designation || 'Faculty'}</p>
                        
                        <div className="fac-meta-group">
                          <div className="fac-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <MapPin size={14} className="meta-icon" style={{ flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word', flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                              {fac.room ? (String(fac.room).toLowerCase().includes('room') || String(fac.room).toLowerCase().includes('floor') ? fac.room : `Room ${fac.room}`) : 'Cabin Location N/A'}
                            </span>
                          </div>
                          <div className="fac-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <Layers size={14} className="meta-icon" style={{ flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word', flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                              {fac.floor === 'G' || fac.floor === '0' || fac.floor === 0 ? 'Ground Floor' : (String(fac.floor).toLowerCase().includes('floor') ? fac.floor : `Floor ${fac.floor || 1}`)}
                            </span>
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
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Directory Footer */}
      <footer style={{ background: '#1A1A1A', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.8rem', flexShrink: 0, textAlign: 'center', flexWrap: 'wrap' }}>
        <MapPin size={16} color="#ffffff" />
        <span>Christ College of Engineering (Autonomous) | Faculty Directory</span>
      </footer>
      </div>
    </section>
  );
};

export default FacultyScreen;

