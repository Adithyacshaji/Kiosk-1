import React, { useState, useMemo, useEffect } from 'react';
import { DirectoryHeader } from '../components/DirectoryHeader';
import {
  MapPin, Navigation, User, Layers,
  Monitor, Building2, Compass, ChevronRight,
  Wrench, Landmark, Zap, Radio, GraduationCap, Briefcase,
  ArrowLeft, Search, X,
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { getFacultyPhoto } from '../../../shared/utils/facultyPhotos';
import { getDeptShortName, getDeptIconName } from '../../../shared/utils/departmentUtils';

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
  departments = [],
  initialSearch = '',
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deptSearch, setDeptSearch] = useState(initialSearch);
  const [facSearch, setFacSearch] = useState('');
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (initialSearch !== undefined) {
      setDeptSearch(initialSearch);
      setSelectedDeptId(null);
    }
  }, [initialSearch]);

  const selectedDepartment = departments.find((d) => d.id === selectedDeptId);

  const getDeptIcon = (iconName, dept) => {
    const iconKey = dept?.icon || iconName || getDeptIconName(dept);
    const iconMap = {
      Monitor: <Monitor size={24} />, Wrench: <Wrench size={24} />,
      Landmark: <Landmark size={24} />, Zap: <Zap size={24} />,
      Radio: <Radio size={24} />, GraduationCap: <GraduationCap size={24} />,
      Briefcase: <Briefcase size={24} />, Compass: <Compass size={24} />,
      Building2: <Building2 size={24} />,
    };
    return iconMap[iconKey] || iconMap[getDeptIconName(dept)] || <GraduationCap size={24} />;
  };

  const handleBack = () => {
    if (selectedDeptId) {
      setSelectedDeptId(null);
      setFacSearch('');
    } else {
      onBack();
    }
  };

  // Filtered departments list
  const filteredDepts = useMemo(() => {
    const q = deptSearch.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        getDeptShortName(d)?.toLowerCase().includes(q) ||
        d.building?.toLowerCase().includes(q) ||
        (d.faculties || []).some(
          (f) =>
            f.name?.toLowerCase().includes(q) ||
            f.designation?.toLowerCase().includes(q) ||
            f.room?.toLowerCase().includes(q)
        )
    );
  }, [departments, deptSearch]);

  // All matching faculty members across departments when searching at root level
  const allMatchingFaculties = useMemo(() => {
    const q = deptSearch.toLowerCase().trim();
    if (!q || selectedDepartment) return [];
    const list = [];
    departments.forEach((dept) => {
      (dept.faculties || []).forEach((fac) => {
        if (
          fac.name?.toLowerCase().includes(q) ||
          fac.designation?.toLowerCase().includes(q) ||
          fac.room?.toLowerCase().includes(q)
        ) {
          list.push({
            ...fac,
            deptName: dept.name,
            deptShort: getDeptShortName(dept),
          });
        }
      });
    });
    return list;
  }, [departments, selectedDepartment, deptSearch]);

  // Filtered faculty list within selected dept
  const filteredFaculties = useMemo(() => {
    if (!selectedDepartment) return [];
    const q = facSearch.toLowerCase().trim();
    if (!q) return selectedDepartment.faculties || [];
    return (selectedDepartment.faculties || []).filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.designation?.toLowerCase().includes(q) ||
        f.room?.toLowerCase().includes(q)
    );
  }, [selectedDepartment, facSearch]);

  return (
    <section
      id="screen-faculty"
      className={`screen active directory-screen theme-${theme}`}
      style={{ backgroundColor: 'transparent', color: '#1A1A1A' }}
      role="region"
      aria-label="Faculty Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
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
          backText={selectedDeptId ? 'Back to Departments' : 'Back'}
        />

        {/* ── Search bar strip ── */}
        <div className="kiosk-dir-searchbar-strip">
          <div className="kiosk-dir-search-wrap">
            <Search size={20} className="kiosk-dir-search-icon" />
            <input
              className="kiosk-dir-search-input"
              type="text"
              placeholder={
                selectedDepartment
                  ? `Search faculty in ${selectedDepartment.name}…`
                  : 'Search departments or faculty…'
              }
              value={selectedDepartment ? facSearch : deptSearch}
              onChange={(e) =>
                selectedDepartment
                  ? setFacSearch(e.target.value)
                  : setDeptSearch(e.target.value)
              }
              autoComplete="off"
            />
            {(selectedDepartment ? facSearch : deptSearch) && (
              <button
                className="kiosk-dir-search-clear"
                onClick={() => (selectedDepartment ? setFacSearch('') : setDeptSearch(''))}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {selectedDepartment && (
            <button
              className="kiosk-dir-chip active"
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => { setSelectedDeptId(null); setFacSearch(''); }}
            >
              <ArrowLeft size={14} />
              {getDeptShortName(selectedDepartment)}
            </button>
          )}
        </div>

        {/* ── Main content ── */}
        <main
          className="directory-main-content"
          style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain', overscrollBehaviorY: 'contain' }}
        >
          {/* STAGE 1: DEPARTMENT GRID & DIRECT FACULTY MATCHES */}
          {!selectedDepartment && (
            <>
              {allMatchingFaculties.length > 0 && (
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
                      Matching Faculty Members
                    </h2>
                    <span style={{ fontSize: '0.8rem', background: '#1A1A1A', color: '#fff', padding: '0.15rem 0.65rem', borderRadius: 9999, fontWeight: 700 }}>
                      {allMatchingFaculties.length}
                    </span>
                  </div>
                  <div className="faculty-grid" style={{ marginBottom: '1.8rem' }}>
                    {allMatchingFaculties.map((fac, idx) => {
                      const photoPath = fac.image_url || fac.photo || getFacultyPhoto(fac.name, fac.deptShort || fac.deptName);
                      return (
                        <div key={`match-${idx}`} className="faculty-card" onClick={() => onSelectFaculty(fac)}>
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
                              <User size={30} style={{ display: photoPath ? 'none' : 'block', color: '#9CA3AF' }} />
                            </div>
                            <div className="fac-details">
                              <h3 className="fac-name">{fac.name}</h3>
                              <p className="fac-designation">{fac.designation}</p>
                              <div className="fac-dept-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', background: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: 6 }}>
                                  {fac.deptShort || fac.deptName}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="fac-card-right">
                            <div className="fac-room-badge">
                              <span className="fac-room-label">Room / Cabin</span>
                              <span className="fac-room-number">{fac.room || 'Cabin'}</span>
                            </div>
                            <button className="btn-fac-navigate">
                              <Navigation size={16} />
                              <span>Navigate</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '1.5rem 0' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1rem' }}>
                    Departments
                  </h2>
                </div>
              )}

              <div className="department-cards-grid">
                {filteredDepts.map((dept) => (
                  <div
                    key={dept.id}
                    className="department-item-card"
                    onClick={() => { setSelectedDeptId(dept.id); setDeptSearch(''); }}
                  >
                    <div className="dept-card-header">
                      <div className="dept-icon-circle">{getDeptIcon(dept.icon, dept)}</div>
                      <span className="dept-code-pill">{getDeptShortName(dept)}</span>
                    </div>
                    <div className="dept-card-body">
                      <h3 className="dept-name">{dept.name}</h3>
                      <div className="dept-hod-row">
                        <span className="hod-label">Head of Dept:</span>
                        <span className="hod-val">
                          {dept.faculties?.find((f) => f.designation?.toLowerCase().includes('hod'))?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="dept-location-row">
                        <MapPin size={14} />
                        <span>{dept.building || 'Main Block'}</span>
                      </div>
                    </div>
                    <div className="dept-card-footer">
                      <span className="dept-count-badge">{(dept.faculties || []).length} Faculty</span>
                      <div className="dept-arrow-btn">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDepts.length === 0 && allMatchingFaculties.length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB' }}>
                    <Search size={36} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 700, color: '#1A1A1A' }}>No departments or faculty match "{deptSearch}"</p>
                    <button onClick={() => setDeptSearch('')} style={{ marginTop: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: 30, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STAGE 2: FACULTY LIST */}
          {selectedDepartment && (
            <>
              <div className="directory-heading-box" style={{ marginBottom: 0 }}>
                <div className="dir-title-text">
                  <div className="dir-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{selectedDepartment.name}</span>
                    <span style={{ fontSize: '0.75rem', background: '#1A1A1A', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: 9999, fontWeight: 800 }}>
                      {getDeptShortName(selectedDepartment)}
                    </span>
                  </div>
                  <h1 className="dir-title">Faculty Directory</h1>
                  <p className="dir-subtitle">Tap any faculty member to get navigation to their cabin.</p>
                </div>
                <div className="dept-stats-summary">
                  <div className="stat-pill"><User size={15} /> {(selectedDepartment.faculties || []).length} Members</div>
                  <div className="stat-pill"><MapPin size={15} /> {selectedDepartment.building || 'Main Block'}</div>
                </div>
              </div>

              <div className="faculty-grid">
                {filteredFaculties.map((fac, idx) => {
                  const photoPath = fac.image_url || fac.photo || getFacultyPhoto(fac.name, getDeptShortName(selectedDepartment) || selectedDepartment?.name);
                  return (
                    <div key={idx} className="faculty-card" onClick={() => onSelectFaculty(fac)}>
                      <div className="fac-card-left">
                        <div className="fac-avatar">
                          {photoPath ? (
                            <img src={photoPath} alt={fac.name} className="fac-avatar-img"
                              onError={(e) => { e.target.style.display = 'none'; const svg = e.target.parentElement.querySelector('svg'); if (svg) svg.style.display = 'block'; }} />
                          ) : null}
                          <User size={28} style={{ display: photoPath ? 'none' : 'block' }} />
                        </div>
                        <div className="fac-info">
                          <h3 className="fac-name">{fac.name}</h3>
                          <p className="fac-role">{fac.designation || 'Faculty'}</p>
                          <div className="fac-meta-group">
                            <div className="fac-meta-item">
                              <MapPin size={13} className="meta-icon" />
                              <span>{fac.room ? (String(fac.room).toLowerCase().includes('room') ? fac.room : `Room ${fac.room}`) : 'Cabin N/A'}</span>
                            </div>
                            <div className="fac-meta-item">
                              <Layers size={13} className="meta-icon" />
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
                  );
                })}
                {filteredFaculties.length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB' }}>
                    <Search size={36} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 700, color: '#1A1A1A' }}>No faculty match "{facSearch}"</p>
                    <button onClick={() => setFacSearch('')} style={{ marginTop: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: 30, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear</button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <footer className="kiosk-dir-footer">
          <MapPin size={15} color="#ffffff" />
          <span>Christ College of Engineering (Autonomous) · Faculty Directory</span>
        </footer>
      </div>
    </section>
  );
};

export default FacultyScreen;
