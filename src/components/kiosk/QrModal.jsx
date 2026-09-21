import React, { useState } from 'react';
import { X, Smartphone, Check, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logoImg from '../../assets/kiosk/logo.png';

export const QrModal = ({ isOpen, poi, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const destId = poi?.id || poi?.name || poi?.indoorNode || '';
  const building = poi?.building || '';
  const floor = poi?.floor !== undefined && poi?.floor !== null ? poi?.floor : '';
  const type = poi?.type || '';
  const name = poi?.name || poi?.room || destId;

  const publicDefaultUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_MOBILE_URL || 'https://kiosk-gold-seven.vercel.app';
  const localOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
  const netMode = typeof window !== 'undefined' ? (localStorage.getItem('kiosk_mobile_net_mode') || 'public') : 'public';
  const customOrigin = typeof window !== 'undefined' ? localStorage.getItem('kiosk_custom_mobile_origin') : '';

  let baseOrigin = publicDefaultUrl;
  if (netMode === 'local') {
    baseOrigin = localOrigin;
  } else if (netMode === 'custom' && customOrigin) {
    baseOrigin = customOrigin;
  } else {
    baseOrigin = customOrigin || publicDefaultUrl;
  }

  const queryParams = new URLSearchParams();
  queryParams.set('start', 'stmarys_entrance');
  queryParams.set('startNode', 'g');
  if (destId) queryParams.set('dest', destId);
  if (name) queryParams.set('name', name);
  if (building) queryParams.set('building', building);
  if (floor !== '') queryParams.set('floor', String(floor));
  if (type) queryParams.set('type', type);
  queryParams.set('mobile', 'true');
  queryParams.set('qrSession', 'true');

  const shareUrl = `${baseOrigin}/?${queryParams.toString()}`;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => { });
    }
  };

  return (
    <div className="modal-backdrop open">
      <div className="kiosk-modal-box" style={{ maxWidth: 440, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
              <Smartphone size={20} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Take Directions With You</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Live GPS Mobile Navigation</span>
            </div>
          </div>
          <button className="btn-close-drawer" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div className="qr-canvas-wrapper" style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <QRCodeSVG
            value={shareUrl}
            size={220}
            level="Q"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
            imageSettings={{
              src: logoImg,
              x: undefined,
              y: undefined,
              height: 34,
              width: 34,
              excavate: true,
            }}
          />
        </div>

        <div style={{ fontSize: '0.88rem', color: '#334155', textAlign: 'center', fontWeight: 600 }}>
          {poi ? `Destination: ${poi.name} (Floor ${poi.floor ?? 'G'})` : 'Campus Map & Navigation'}
        </div>

        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontWeight: 600,
              fontSize: 13,
              color: copied ? '#15803d' : '#334155',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <button
            className="btn-secondary-touch"
            onClick={onClose}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px 16px',
              borderRadius: 12,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrModal;

