// components/SidebarIntern.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function SidebarIntern({ isOpen, onClose }) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle-btn')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <nav className={`sidebar bg-light p-3 ${isOpen ? 'open' : ''}`}>
      <div className="d-flex flex-column">
        <Link className="sidebar-btn" to="/avanceinterno" onClick={handleLinkClick}>
          Avance Interno
        </Link>
      </div>
    </nav>
  );
}

export default SidebarIntern;
