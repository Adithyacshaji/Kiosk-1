import React from 'react';
import { X } from 'lucide-react';

export const QrModal = ({ isOpen, poi, onClose }) => {
  if (!isOpen) return null;

  // Generate procedural SVG QR pattern
  const generateQrSvg = (dataStr) => {
    const matrixSize = 25;
    const cellSize = 6;
    const svgSize = matrixSize * cellSize;
    
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      hash = ((hash << 5) - hash) + dataStr.charCodeAt(i);
      hash |= 0;
    }

    const rects = [];
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const isTopLeft = (r < 7 && c < 7);
        const isTopRight = (r < 7 && c >= matrixSize - 7);
        const isBottomLeft = (r >= matrixSize - 7 && c < 7);

        let isBlack = false;
        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isBottomLeft ? r - (matrixSize - 7) : r;
          const lc = isTopRight ? c - (matrixSize - 7) : c;
          if (lr === 0 || lr === 6 || lc === 0 || lc === 6) isBlack = true;
          else if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) isBlack = true;
        } else {
          const bitVal = Math.abs(Math.sin(hash + r * 13 + c * 37)) > 0.45;
          isBlack = bitVal;
        }

        if (isBlack) {
          rects.push(
            <rect 
              key={`${r}-${c}`}
              x={c * cellSize} 
              y={r * cellSize} 
              width={cellSize} 
              height={cellSize} 
              fill="#0f172a" 
            />
          );
        }
      }
    }

    return (
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <rect width={svgSize} height={svgSize} fill="#ffffff" />
        {rects}
      </svg>
    );
  };

  const shareUrl = poi ? `https://metropolis.hub/map?poi=${poi.id}&floor=${poi.floor}` : 'https://metropolis.hub/map';

  return (
    <div className="modal-backdrop open">
      <div className="kiosk-modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Take Directions With You</h3>
          <button className="btn-close-drawer" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Scan this QR code with your smartphone camera to continue turn-by-turn navigation on your mobile device.
        </p>
        <div className="qr-canvas-wrapper">
          {generateQrSvg(shareUrl)}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {poi ? `Directions to: ${poi.name} (Level ${poi.floor})` : 'Metropolis Interactive Directory'}
        </div>
        <button className="btn-secondary-touch" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};

