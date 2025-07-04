import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit, GripVertical, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, NotebookPen, Package } from 'lucide-react';
import Sidebar from './Sidebar';

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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Hamburger icon */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-[101] bg-white border border-gray-200 rounded-lg p-2 shadow-md md:hidden"
        style={{ display: sidebarOpen ? 'none' : 'block' }}
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
          className="fixed inset-0 bg-slate-900/25 z-[100] transition-opacity md:hidden"
        />
      )}
      <div className="flex-1">
        <div className="py-4 md:py-8 px-2 sm:px-4 md:px-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-sans">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 md:mb-8 tracking-tight ml-0 md:ml-10">🗂️ Manage Tasks</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            {columns.map(col => (
              <div key={col.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4 min-h-[520px] transition-border"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-extrabold text-slate-900">{col.title}</h2>
                  <span className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 text-sm text-blue-600 font-medium">{col.tasks.length}</span>
                </div>
                <div className="min-h-[420px]">
                  {col.tasks.map(task => (
                    <div key={task.id} draggable={editing?.id !== task.id}
                      onDragStart={() => handleDragStart(task, col.id)}
                      className="bg-gray-50 border border-gray-200 rounded-lg mb-4 p-4 transition-border"
                    >
                      {editing?.id === task.id && editing.colId === col.id ? (
                        <div className="flex flex-col gap-4">
                          <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="p-2 border border-gray-300 rounded-lg" />
                          <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="p-2 border border-gray-300 rounded-lg" />
                          <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="p-2 border border-gray-300 rounded-lg">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <div className="flex gap-4 mt-2">
                            <button onClick={() => saveEdit(task.id, col.id)} className="bg-blue-500 text-white border border-transparent rounded-lg px-4 py-2 font-medium">Save</button>
                            <button onClick={cancelEdit} className="bg-gray-200 text-gray-500 border border-transparent rounded-lg px-4 py-2 font-medium">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical size={18} color="#9ca3af" />
                            <span className="font-medium text-slate-900">{task.title}</span>
                            <span className="ml-auto bg-gray-100 text-gray-500 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium">{task.priority}</span>
                            <button onClick={() => startEdit(task, col.id)} className="bg-transparent border-transparent text-blue-500 rounded-lg ml-2 cursor-pointer" title="Edit"><Edit size={17} color="#3b82f6" /></button>
                            <button onClick={() => deleteTask(task.id, col.id)} className="bg-transparent border-transparent text-red-500 rounded-lg ml-2 cursor-pointer" title="Delete"><X size={17} color="#ef4444" /></button>
                          </div>
                          {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {addingTo === col.id ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <input value={newTask.title} onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="p-2 border border-gray-300 rounded-lg" />
                      <textarea value={newTask.description} onChange={e => setNewTask(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="p-2 border border-gray-300 rounded-lg" />
                      <select value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value }))} className="p-2 border border-gray-300 rounded-lg">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <div className="flex gap-4 mt-2">
                        <button onClick={() => addTask(col.id)} className="bg-blue-500 text-white border border-transparent rounded-lg px-4 py-2 font-medium">Add</button>
                        <button onClick={() => { setAddingTo(null); setNewTask({ title: '', description: '', priority: 'medium' }); }} className="bg-gray-200 text-gray-500 border border-transparent rounded-lg px-4 py-2 font-medium">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(col.id)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-medium text-blue-600">Add Task</button>
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