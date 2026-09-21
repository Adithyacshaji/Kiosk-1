import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, QrCode, Sparkles, Check, Copy, ExternalLink, Settings, Wifi, Globe, Link2 } from 'lucide-react';
import logoImg from '../../assets/kiosk/logo.png';

/**
 * KioskQRCode
 *
 * Renders a dynamic, scannable QR code encoding the searched destination's ID
 * and metadata into the application URL (?start=stmarys_entrance&dest=<id>&name=<name>&building=<bldg>&floor=<fl>).
 * Works across all mobile networks (Cellular 4G/5G and local Wi-Fi) with configurable base origin.
 */
export function KioskQRCode({ destination }) {
  const [copied, setCopied] = useState(false);
  const [activeNetworkMode, setActiveNetworkMode] = useState(() => {
    return localStorage.getItem('kiosk_mobile_net_mode') || 'public'; // 'public' | 'local' | 'custom'
  });
  const [customOrigin, setCustomOrigin] = useState(() => {
    return localStorage.getItem('kiosk_custom_mobile_origin') || '';
  });
  const [showConfig, setShowConfig] = useState(false);
  const [tempOrigin, setTempOrigin] = useState('');

  if (!destination) return null;

  const destId = destination.indoorNode || destination.id || destination.room || destination.name || '';
  const building = destination.building || '';
  const floor = destination.floor !== undefined && destination.floor !== null ? destination.floor : '';
  const type = destination.type || '';
  const name = destination.name || destination.room || destId;

  // Live public URL works across ALL mobile networks (4G/5G cellular data & Wi-Fi)
  const publicDefaultUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_MOBILE_URL || 'https://campus-routex-jsqa.vercel.app';
  
  // Local network origin fallback (e.g. https://192.168.1.5:5174 or window.location.origin)
  const localOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';

  // Determine active origin based on network mode
  let baseOrigin = publicDefaultUrl;
  if (activeNetworkMode === 'local') {
    baseOrigin = localOrigin;
  } else if (activeNetworkMode === 'custom' && customOrigin) {
    baseOrigin = customOrigin;
  } else {
    baseOrigin = customOrigin || publicDefaultUrl;
  }

  // Construct complete dynamic navigation URL
  const queryParams = new URLSearchParams();
  queryParams.set('start', 'stmarys_entrance');
  queryParams.set('startNode', 'g');
  if (destId) queryParams.set('dest', destId);
  if (name) queryParams.set('name', name);
  if (building) queryParams.set('building', building);
  if (floor !== '') queryParams.set('floor', String(floor));
  if (type) queryParams.set('type', type);

  const qrUrl = `${baseOrigin}/?${queryParams.toString()}`;

  const buildingRaw = (destination.building || '').toLowerCase();
  const isChavara = buildingRaw.includes('chavara');
  const accentColor = isChavara ? '#8b5cf6' : '#2563eb';
  const accentBg = isChavara ? 'rgba(139, 92, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)';

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(qrUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => { });
    }
  };

  const handleModeChange = (mode) => {
    setActiveNetworkMode(mode);
    localStorage.setItem('kiosk_mobile_net_mode', mode);
  };

  const handleSaveCustomOrigin = (e) => {
    e.preventDefault();
    const trimmed = tempOrigin.trim().replace(/\/+$/, '');
    if (trimmed) {
      localStorage.setItem('kiosk_custom_mobile_origin', trimmed);
      setCustomOrigin(trimmed);
      setActiveNetworkMode('custom');
      localStorage.setItem('kiosk_mobile_net_mode', 'custom');
    } else {
      localStorage.removeItem('kiosk_custom_mobile_origin');
      setCustomOrigin('');
      setActiveNetworkMode('public');
      localStorage.setItem('kiosk_mobile_net_mode', 'public');
    }
    setShowConfig(false);
  };

  return (
    <div className="kiosk-qr-wrapper">
      {/* Header Banner */}
      <div className="kiosk-qr-header">
        <div className="kiosk-qr-icon-badge" style={{ background: accentBg, border: `1.5px solid ${accentColor}40` }}>
          <Smartphone size={22} color={accentColor} />
        </div>
        <div className="kiosk-qr-header-text">
          <div className="kiosk-qr-title">
            <span>Scan to Navigate</span>
            <span className="kiosk-qr-live-badge">
              <span className="kiosk-qr-live-dot" />
              ALL NETWORKS
            </span>
          </div>
          <div className="kiosk-qr-sub">Opens turn-by-turn mobile walking directions</div>
        </div>
      </div>

      {/* QR Code Container with High-Tech Frame & Laser Scanner Animation */}
      <div className="kiosk-qr-canvas-box">
        <div className="kiosk-qr-inner-frame">
          <QRCodeSVG
            value={qrUrl}
            size={230}
            level="Q"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#09131e"
            imageSettings={{
              src: logoImg,
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
          {/* Subtle animated scanning laser line */}
          <div className="kiosk-qr-laser-line" />
        </div>

        {/* High-Tech Corner Decorators */}
        <span className="qr-corner qr-corner-tl" style={{ borderColor: accentColor }} />
        <span className="qr-corner qr-corner-tr" style={{ borderColor: accentColor }} />
        <span className="qr-corner qr-corner-bl" style={{ borderColor: accentColor }} />
        <span className="qr-corner qr-corner-br" style={{ borderColor: accentColor }} />
      </div>

      {/* Route Endpoints: Start Location + Destination */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Start Point */}
        <div style={{
          width: '100%',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Starting Point</span>
          </div>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#14532d', whiteSpace: 'nowrap' }}>
            St Mary's Entrance (Kiosk)
          </span>
        </div>

        {/* Destination */}
        <div style={{
          width: '100%',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Destination</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {destination.name || destId} {floor !== '' ? `(Floor ${floor})` : ''}
          </span>
        </div>
      </div>

      {/* Direct Link Display & Quick Action Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="kiosk-qr-link-bar" style={{ padding: '6px 10px', background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
            <Link2 size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <span className="kiosk-qr-url-text" style={{ fontSize: 11, color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={qrUrl}>
              {qrUrl.replace(/^https?:\/\//, '')}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              className={`kiosk-qr-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title="Copy navigation link"
              style={{ padding: '5px 10px', fontSize: 11 }}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open mobile view in new tab"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px 8px',
                background: '#e2e8f0',
                borderRadius: 6,
                color: '#1e293b',
                textDecoration: 'none',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Network Mode Switcher (4G/5G Live vs Wi-Fi vs Tunnel) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => handleModeChange('public')}
              style={{
                background: activeNetworkMode === 'public' ? '#2563eb' : 'transparent',
                color: activeNetworkMode === 'public' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: 6,
                padding: '3px 8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Globe size={11} />
              <span>Public Live (4G/5G)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('local')}
              style={{
                background: activeNetworkMode === 'local' ? '#2563eb' : 'transparent',
                color: activeNetworkMode === 'local' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: 6,
                padding: '3px 8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Wifi size={11} />
              <span>Local Wi-Fi</span>
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setTempOrigin(customOrigin || '');
              setShowConfig((v) => !v);
            }}
            title="Custom Domain / Tunnel URL"
            style={{
              background: activeNetworkMode === 'custom' ? '#dcfce7' : 'transparent',
              color: activeNetworkMode === 'custom' ? '#16a34a' : '#64748b',
              border: 'none',
              borderRadius: 6,
              padding: '3px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Settings size={12} />
          </button>
        </div>

        {/* Custom Origin Settings Drawer */}
        {showConfig && (
          <form onSubmit={handleSaveCustomOrigin} style={{ display: 'flex', gap: 6, width: '100%', marginTop: 2 }}>
            <input
              type="text"
              placeholder="e.g. https://my-tunnel.ngrok-free.app"
              value={tempOrigin}
              onChange={(e) => setTempOrigin(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 11,
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Set URL
            </button>
            {customOrigin && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('kiosk_custom_mobile_origin');
                  setCustomOrigin('');
                  handleModeChange('public');
                  setShowConfig(false);
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </form>
        )}
      </div>

      {/* Step-by-Step Flow Cards */}
      <div className="kiosk-qr-steps-flow" style={{ marginTop: 2 }}>
        <div className="kiosk-qr-step-card">
          <div className="kiosk-qr-step-badge">1</div>
          <div className="kiosk-qr-step-desc">
            <strong>Scan QR</strong>
            <span>Any iOS / Android camera</span>
          </div>
        </div>
        <div className="kiosk-qr-step-arrow">›</div>
        <div className="kiosk-qr-step-card">
          <div className="kiosk-qr-step-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>2</div>
          <div className="kiosk-qr-step-desc">
            <strong>Direct Route</strong>
            <span>Indoor map & steps loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KioskQRCode;


