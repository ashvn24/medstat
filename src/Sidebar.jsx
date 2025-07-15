import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, NotebookPen, Package } from 'lucide-react';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);
  return (
    <aside
      ref={sidebarRef}
      style={{
        width: 64,
        background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)',
        borderRight: '1px solid #e5e7eb',
        padding: '32px 0 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 200,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
        boxShadow: open ? '2px 0 16px #0002' : 'none',
      }}
    >
      <div style={{ marginBottom: 40, marginTop: 1, fontWeight: 800, fontSize: 22, color: '#1e293b', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
          <img
            src="/images/logo.jpg"
            alt="Medistat Logo"
            className="w-10 h-10 object-contain rounded-full"
          />
        </div>
      </div>
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/stats" style={{ padding: '12px 0', color: location.pathname === '/stats' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/stats' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}><BarChart3 size={22} /></Link>
        <Link to="/manage-review" style={{ padding: '12px 0', color: location.pathname === '/manage-review' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/manage-review' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><NotebookPen size={22} /></Link>
        <Link to="/manage-tasks" style={{ padding: '12px 0', color: location.pathname === '/manage-tasks' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/manage-tasks' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} /></Link>
        <Link
          to="/careers"
          className={location.pathname === '/careers' ? 'sidebar-link active' : 'sidebar-link'}
        >
          <span role="img" aria-label="Careers">💼</span> Careers
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar; 