import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit, GripVertical, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, NotebookPen, Package } from 'lucide-react';

const STORAGE_KEY = 'kanban-tasks-v1';

const initialData = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [],
  },
];

const priorityColors = {
  high: { bg: '#fee2e2', color: '#b91c1c' },
  medium: { bg: '#fef9c3', color: '#b45309' },
  low: { bg: '#dcfce7', color: '#15803d' },
};

function Sidebar({ open, onClose }) {
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
      <div style={{ marginBottom: 40, fontWeight: 800, fontSize: 22, color: '#1e293b', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/images/logo.jpg" alt="Medistat Logo" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
      </div>
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/stats" style={{ padding: '12px 0', color: location.pathname === '/stats' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/stats' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}><BarChart3 size={22} /></Link>
        <Link to="/manage-review" style={{ padding: '12px 0', color: location.pathname === '/manage-review' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/manage-review' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><NotebookPen size={22} /></Link>
        <Link to="/manage-tasks" style={{ padding: '12px 0', color: location.pathname === '/manage-tasks' ? '#2563eb' : '#1e293b', fontWeight: 600, borderRadius: 8, background: location.pathname === '/manage-tasks' ? '#e0e7ef' : 'none', textDecoration: 'none', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} /></Link>
      </nav>
    </aside>
  );
}

export default function ManageTasks() {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return initialData;
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [addingTo, setAddingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'medium' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  useEffect(() => {
    if (!sidebarOpen) return;
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const handleDragStart = (task, colId) => {
    setDraggedTask(task);
    setDraggedFrom(colId);
  };
  const handleDrop = (colId) => {
    if (!draggedTask || draggedFrom === colId) return;
    setColumns(cols => cols.map(col => {
      if (col.id === draggedFrom) {
        return { ...col, tasks: col.tasks.filter(t => t !== draggedTask) };
      }
      if (col.id === colId) {
        return { ...col, tasks: [...col.tasks, draggedTask] };
      }
      return col;
    }));
    setDraggedTask(null);
    setDraggedFrom(null);
  };
  const addTask = (colId) => {
    if (!newTask.title.trim()) return;
    setColumns(cols => cols.map(col => col.id === colId ? { ...col, tasks: [...col.tasks, { ...newTask, id: Date.now().toString() }] } : col));
    setNewTask({ title: '', description: '', priority: 'medium' });
    setAddingTo(null);
  };
  const deleteTask = (taskId, colId) => {
    setColumns(cols => cols.map(col => col.id === colId ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) } : col));
  };
  const startEdit = (task, colId) => {
    setEditing({ id: task.id, colId });
    setEditForm({ title: task.title, description: task.description, priority: task.priority });
  };
  const saveEdit = (taskId, colId) => {
    if (!editForm.title.trim()) return;
    setColumns(cols => cols.map(col => col.id === colId ? { ...col, tasks: col.tasks.map(t => t.id === taskId ? { ...t, ...editForm } : t) } : col));
    setEditing(null);
    setEditForm({ title: '', description: '', priority: 'medium' });
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ title: '', description: '', priority: 'medium' });
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Hamburger icon */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 101,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 8,
          display: sidebarOpen ? 'none' : 'block',
          boxShadow: '0 2px 8px #0001',
        }}
        aria-label="Open sidebar"
      >
        <Menu size={28} color="#2563eb" />
      </button>
      {/* Sidebar with transition */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,41,59,0.25)',
            zIndex: 100,
            transition: 'opacity 0.3s',
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ padding: 32, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', minHeight: '100vh', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 24, letterSpacing: -1, marginLeft: 40 }}>🗂️ Manage Tasks <span style={{ color: '#3b82f6', fontWeight: 700 }}></span></h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'flex-start' }}>
            {columns.map(col => (
              <div key={col.id} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 20, minHeight: 520, border: draggedFrom === col.id ? '2px solid #3b82f6' : '1px solid #e5e7eb', transition: 'border 0.2s' }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', letterSpacing: -0.5 }}>{col.title}</h2>
                  <span style={{ background: '#e0e7ef', borderRadius: 8, padding: '2px 12px', fontSize: 14, color: '#3b82f6', fontWeight: 600 }}>{col.tasks.length}</span>
                </div>
                <div style={{ minHeight: 420 }}>
                  {col.tasks.map(task => (
                    <div key={task.id} draggable={editing?.id !== task.id}
                      onDragStart={() => handleDragStart(task, col.id)}
                      style={{ background: draggedTask?.id === task.id ? '#dbeafe' : '#f3f4f6', borderRadius: 12, marginBottom: 16, padding: 16, boxShadow: draggedTask?.id === task.id ? '0 6px 24px #3b82f655' : '0 2px 8px #0001', cursor: editing?.id === task.id ? 'default' : 'grab', opacity: draggedTask?.id === task.id ? 0.7 : 1, border: '1.5px solid #e5e7eb', transition: 'all 0.18s cubic-bezier(.4,2,.6,1)' }}
                    >
                      {editing?.id === task.id && editing.colId === col.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 15, fontWeight: 600, marginBottom: 2 }} />
                          <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 14, marginBottom: 2 }} />
                          <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 14, marginBottom: 2 }}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                            <button onClick={() => saveEdit(task.id, col.id)} style={{ background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #3b82f633', letterSpacing: 0.2 }}>Save</button>
                            <button onClick={cancelEdit} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 15 }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <GripVertical size={18} color="#9ca3af" />
                            <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{task.title}</span>
                            <span style={{ marginLeft: 'auto', background: priorityColors[task.priority].bg, color: priorityColors[task.priority].color, borderRadius: 8, fontSize: 13, padding: '3px 12px', fontWeight: 600, border: `1.5px solid ${priorityColors[task.priority].color}` }}>{task.priority}</span>
                            <button onClick={() => startEdit(task, col.id)} style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer' }} title="Edit"><Edit size={17} color="#3b82f6" /></button>
                            <button onClick={() => deleteTask(task.id, col.id)} style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }} title="Delete"><X size={17} color="#ef4444" /></button>
                          </div>
                          {task.description && <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4, marginLeft: 28 }}>{task.description}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {addingTo === col.id ? (
                    <div style={{ background: '#f3f4f6', borderRadius: 10, padding: 14, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 8px #3b82f622' }}>
                      <input value={newTask.title} onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))} placeholder="Task title" style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 15, fontWeight: 600, marginBottom: 2 }} />
                      <textarea value={newTask.description} onChange={e => setNewTask(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 14, marginBottom: 2 }} />
                      <select value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 14, marginBottom: 2 }}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                        <button onClick={() => addTask(col.id)} style={{ background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #3b82f633', letterSpacing: 0.2 }}>Add</button>
                        <button onClick={() => { setAddingTo(null); setNewTask({ title: '', description: '', priority: 'medium' }); }} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 15 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(col.id)} style={{ width: '100%', background: '#f1f5f9', color: '#3b82f6', border: '2px dashed #cbd5e1', borderRadius: 10, padding: '10px 0', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', transition: 'border 0.2s, background 0.2s' }}><Plus size={18} /> Add Task</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 