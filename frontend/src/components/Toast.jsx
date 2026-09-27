import React from 'react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type || 'info'}`}>
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
