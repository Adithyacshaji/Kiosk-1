import React from 'react';

export const VirtualKeyboard = ({ isOpen, onKeyPress, onClose }) => {
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['CLEAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
    ['SPACE', 'DONE']
  ];

  return (
    <div className={`virtual-keyboard-overlay ${isOpen ? 'open' : ''}`}>
      {keyboardRows.map((row, rIdx) => (
        <div key={rIdx} className="keyboard-row">
          {row.map((key) => {
            let extraClass = '';
            let label = key;
            if (key === 'SPACE') {
              extraClass = 'space-key special-key';
              label = 'Space';
            } else if (key === 'DONE') {
              extraClass = 'enter-key special-key';
              label = 'Done / Search';
            } else if (key === 'BACKSPACE') {
              extraClass = 'special-key';
              label = '⌫';
            } else if (key === 'CLEAR') {
              extraClass = 'special-key';
              label = 'Clear';
            }

            return (
              <button
                key={key}
                className={`key-btn ${extraClass}`}
                onClick={() => {
                  if (key === 'DONE') {
                    onClose();
                  } else {
                    onKeyPress(key);
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

