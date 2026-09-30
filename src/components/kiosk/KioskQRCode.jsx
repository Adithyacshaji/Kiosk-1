import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
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
  const publicDefaultUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_MOBILE_URL || 'https://kiosk-gold-seven.vercel.app';
  
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
  
  const isOutdoor = destination?.category === 'outdoor' || destination?.type === 'location' || (!destination?.floor && !destination?.indoorNode && !destination?.room);
  
  if (!isOutdoor) {
    if (building) queryParams.set('building', building);
    if (floor !== '') queryParams.set('floor', String(floor));
    if (type) queryParams.set('type', type);
  } else {
    queryParams.set('category', 'outdoor');
  }

  queryParams.set('mobile', 'true');
  queryParams.set('qrSession', 'true');

  const qrUrl = `${baseOrigin}/?${queryParams.toString()}`;

  const accentColor = '#1A1A1A';
  const accentBg = '#F3F4F6';

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(qrUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => { });
    }
  };

  return (
    <div className="kiosk-qr-wrapper">
      {/* Header Banner */}
      <div className="kiosk-qr-header">
        <div className="kiosk-qr-icon-badge" style={{ background: accentBg, border: `1px solid ${accentColor}30` }}>
          <Smartphone size={20} color={accentColor} />
        </div>
        <div className="kiosk-qr-header-text">
          <div className="kiosk-qr-title">
            <span>Take Directions on Phone</span>
          </div>
          <div className="kiosk-qr-sub">Scan to open live turn-by-turn mobile navigation</div>
        </div>
      </div>

      {/* Clean QR Code Container */}
      <div className="kiosk-qr-canvas-box" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <QRCodeCanvas
          value={qrUrl}
          size={210}
          level="Q"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#0f172a"
          imageSettings={{
            src: logoImg,
            x: undefined,
            y: undefined,
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      {/* Destination & Starting Point Summary */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          width: '100%',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A1A1A' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Destination</span>
          </div>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
            {destination.name || destId}
          </span>
        </div>
      </div>

      {/* Direct Link Display & Copy Button */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="kiosk-qr-link-bar" style={{ padding: '6px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
            <Link2 size={13} color="#64748b" style={{ flexShrink: 0 }} />
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
              title="Open link in new tab"
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
      </div>
    </div>
  );
}

export default KioskQRCode;


