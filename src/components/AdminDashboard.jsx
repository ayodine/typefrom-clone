import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  LogOut, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  UserCheck, 
  DollarSign, 
  Clipboard, 
  Check, 
  Trash2, 
  Loader2, 
  Lock, 
  User, 
  FileText 
} from 'lucide-react';
import { 
  signInAdmin, 
  signOutAdmin, 
  getAdminUser, 
  onAdminAuthStateChange, 
  fetchSubmissions, 
  updateSubmission, 
  deleteSubmission 
} from '../supabase';
import './Admin.css';

/* ──────────────────────────────────────────────────────────────────────────
   ADMIN LOGIN CARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function AdminLogin({ onLoginSuccess, onBackToForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    const res = await signInAdmin(email, password);
    setLoading(false);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src="/fav_dark.svg" alt="Logo" style={{ width: 48, height: 48, borderRadius: '8px' }} />
          <h2 className="login-title">Academy Administration</h2>
        </div>
        
        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <input
                type="email"
                className="login-input"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><Loader2 size={18} className="spinner" /> Authenticating...</> : <><Lock size={18} /> Sign In</>}
          </button>
        </form>

        <div className="login-demo-notice">
          💡 <strong>Developer Mode Preview:</strong><br />
          If Supabase connection variables are not configured in your environment, use:<br />
          <strong>admin@swingtradefx.com</strong> / <strong>admin123</strong>
        </div>

        <div className="login-back-link" onClick={onBackToForm}>
          <ArrowLeft size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Back to lead form
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard({ onBackToForm }) {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [newLeadsLast24h, setNewLeadsLast24h] = useState(0);

  // Filter / Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [investmentFilter, setInvestmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name'
  const [sortAsc, setSortAsc] = useState(false); // Default: newest first
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Lead Drawer State
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Premium Feedback States (Toasts and Custom Modals)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Check Auth State on mount
  useEffect(() => {
    let active = true;
    async function checkAuth() {
      const activeUser = await getAdminUser();
      if (activeUser) {
        if (active) setUser(activeUser);
      } else {
        // Check if we are in demo dev mode
        const demoSession = localStorage.getItem('demo_session');
        if (demoSession && active) {
          setUser(JSON.parse(demoSession));
        }
      }
      if (active) setAuthChecking(false);
    }
    checkAuth();

    // Subscribe to auth state transitions
    const unsubscribe = onAdminAuthStateChange((event, sessionUser) => {
      if (active) {
        setUser(sessionUser);
        if (!sessionUser) localStorage.removeItem('demo_session');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Fetch Submissions once authenticated
  const loadLeads = async () => {
    setLoading(true);
    const res = await fetchSubmissions();
    if (res.success) {
      setLeads(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        loadLeads();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Calculate 24h count outside render flow to maintain purity
  useEffect(() => {
    const timer = setTimeout(() => {
      const oneDayAgo = Date.now() - (24 * 3600 * 1000);
      const count = leads.filter(l => new Date(l.created_at).getTime() > oneDayAgo).length;
      setNewLeadsLast24h(count);
    }, 0);
    return () => clearTimeout(timer);
  }, [leads]);

  const handleLogout = async () => {
    await signOutAdmin();
    localStorage.removeItem('demo_session');
    setUser(null);
  };

  const handleLoginSuccess = (signedInUser) => {
    setUser(signedInUser);
    if (signedInUser.id === 'demo-admin-id') {
      localStorage.setItem('demo_session', JSON.stringify(signedInUser));
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Administrative Operations (Status update, Note save, Lead delete)
  // ────────────────────────────────────────────────────────────────────────
  
  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI update
    const prevLeads = [...leads];
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }

    const res = await updateSubmission(id, { status: newStatus });
    if (!res.success) {
      // Revert if database fails
      setLeads(prevLeads);
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prevLeads.find(l => l.id === id));
      }
      triggerToast('Failed to update status: ' + res.error, 'error');
    } else {
      triggerToast('Status updated to ' + newStatus, 'success');
      // Localstorage update for demo mode
      if (id.startsWith('mock-')) {
        const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
        localStorage.setItem('demo_submissions', JSON.stringify(
          saved.map(l => l.id === id ? { ...l, status: newStatus } : l)
        ));
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNote(true);
    
    const res = await updateSubmission(selectedLead.id, { notes: noteInput });
    setSavingNote(false);
    
    if (res.success) {
      setLeads(leads.map(lead => lead.id === selectedLead.id ? { ...lead, notes: noteInput } : lead));
      setSelectedLead({ ...selectedLead, notes: noteInput });
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
      triggerToast('Notes saved successfully', 'success');

      // Localstorage update for demo mode
      if (selectedLead.id.startsWith('mock-')) {
        const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
        localStorage.setItem('demo_submissions', JSON.stringify(
          saved.map(l => l.id === selectedLead.id ? { ...l, notes: noteInput } : l)
        ));
      }
    } else {
      triggerToast('Failed to save notes: ' + res.error, 'error');
    }
  };

  const handleDeleteLead = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteLead = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: null });
    setLoading(true);

    const res = await deleteSubmission(id);
    setLoading(false);
    if (res.success) {
      setLeads(leads.filter(lead => lead.id !== id));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }
      triggerToast('Lead deleted successfully', 'success');
      
      // Localstorage update for demo mode
      if (id.startsWith('mock-')) {
        const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
        localStorage.setItem('demo_submissions', JSON.stringify(
          saved.filter(l => l.id !== id)
        ));
      }
    } else {
      triggerToast('Failed to delete lead: ' + res.error, 'error');
    }
  };

  // Open Drawer Details Panel
  const openLeadDrawer = (lead) => {
    setSelectedLead(lead);
    setNoteInput(lead.notes || '');
  };

  const closeLeadDrawer = () => {
    setSelectedLead(null);
  };

  // Copy Lead to clipboard
  const handleCopyLeadData = (lead) => {
    const dataText = `
Candidate Name: ${lead.first_name} ${lead.last_name}
Email: ${lead.email}
Phone: ${lead.phone}
Country: ${lead.country}
Trading Experience: ${lead.trading_duration}
Biggest Struggle: ${lead.profitability_reason}
Current Situation: ${lead.trading_situation}
Profitable Now: ${lead.currently_profitable}
Willing to follow strict process: ${lead.willing_to_follow_process}
Ready to invest $5k: ${lead.investment_ready}
Reach window: ${lead.best_time_to_reach}
Status: ${lead.status}
Admin Notes: ${lead.notes || 'None'}
    `.trim();
    
    navigator.clipboard.writeText(dataText);
    triggerToast('Lead details copied to clipboard!', 'success');
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      triggerToast('No records to export', 'error');
      return;
    }

    const headers = [
      'Date Created', 'First Name', 'Last Name', 'Email', 'Phone', 'Best Reach Time', 
      'Country', 'Trading Experience', 'Biggest Struggle', 'Current Situation', 
      'Currently Profitable', 'Process Mindset', 'Investment Ready', 'Status', 'Notes'
    ];
    
    const rows = filteredLeads.map(lead => [
      new Date(lead.created_at).toLocaleString(),
      `"${(lead.first_name || '').replace(/"/g, '""')}"`,
      `"${(lead.last_name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.best_time_to_reach || '').replace(/"/g, '""')}"`,
      `"${(lead.country || '').replace(/"/g, '""')}"`,
      `"${(lead.trading_duration || '').replace(/"/g, '""')}"`,
      `"${(lead.profitability_reason || '').replace(/"/g, '""')}"`,
      `"${(lead.trading_situation || '').replace(/"/g, '""')}"`,
      `"${(lead.currently_profitable || '').replace(/"/g, '""')}"`,
      `"${(lead.willing_to_follow_process || '').replace(/"/g, '""')}"`,
      `"${(lead.investment_ready || '').replace(/"/g, '""')}"`,
      `"${(lead.status || '').replace(/"/g, '""')}"`,
      `"${(lead.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Swingtradefx_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV export downloaded successfully', 'success');
  };

  // ────────────────────────────────────────────────────────────────────────
  // Filtering & Sorting Processors
  // ────────────────────────────────────────────────────────────────────────
  
  const filteredLeads = leads
    .filter(lead => {
      // 1. Search Query Match
      const searchLower = searchQuery.toLowerCase();
      const name = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const phone = (lead.phone || '').toLowerCase();
      const country = (lead.country || '').toLowerCase();
      
      const searchMatch = 
        name.includes(searchLower) || 
        email.includes(searchLower) || 
        phone.includes(searchLower) || 
        country.includes(searchLower);

      // 2. Status Match
      const statusMatch = statusFilter === 'All' || lead.status === statusFilter;

      // 3. Investment Match
      const investMatch = investmentFilter === 'All' || lead.investment_ready === investmentFilter;

      return searchMatch && statusMatch && investMatch;
    })
    .sort((a, b) => {
      // 4. Sorting logic
      if (sortBy === 'date') {
        const d1 = new Date(a.created_at).getTime();
        const d2 = new Date(b.created_at).getTime();
        return sortAsc ? d1 - d2 : d2 - d1;
      } else if (sortBy === 'name') {
        const n1 = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        const n2 = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        if (n1 < n2) return sortAsc ? -1 : 1;
        if (n1 > n2) return sortAsc ? 1 : -1;
        return 0;
      }
      return 0;
    });

  // Calculate Paginated List
  const totalFilteredCount = filteredLeads.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;
  const validatedCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastLead = validatedCurrentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  // ────────────────────────────────────────────────────────────────────────
  // Chart and Analytics Calculations
  // ────────────────────────────────────────────────────────────────────────
  
  // 1. Country breakdown
  const countryCounts = leads.reduce((acc, curr) => {
    if (curr.status !== 'Archived') {
      const country = curr.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
    }
    return acc;
  }, {});
  const countryBreakdown = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5

  // 2. Biggest struggles breakdown
  const struggleCounts = leads.reduce((acc, curr) => {
    if (curr.status !== 'Archived') {
      const struggle = curr.profitability_reason || 'Other / Underdefined';
      acc[struggle] = (acc[struggle] || 0) + 1;
    }
    return acc;
  }, {});
  const struggleBreakdown = Object.entries(struggleCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // 3. High Intent Rate (Willing to invest $5000)
  const totalNonArchived = leads.filter(l => l.status !== 'Archived').length;
  const highIntentCount = leads.filter(l => l.status !== 'Archived' && l.investment_ready === 'Yes').length;
  const highIntentRate = totalNonArchived > 0 ? Math.round((highIntentCount / totalNonArchived) * 100) : 0;

  // 4. Enrollment Rate
  const enrolledCount = leads.filter(l => l.status === 'Enrolled').length;
  const enrollmentRate = totalNonArchived > 0 ? Math.round((enrolledCount / totalNonArchived) * 100) : 0;


  // Render Loading States
  if (authChecking) {
    return (
      <div className="login-overlay">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={40} className="spinner" style={{ color: 'var(--theme-accent)' }} />
          <p style={{ color: 'var(--theme-text-secondary)' }}>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Render Login Component if session not active
  if (!user) {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBackToForm={onBackToForm}
      />
    );
  }

  return (
    <div className="admin-container">
      {/* ────────────────────────────────────────────────────────── Header */}
      <header className="admin-header">
        <div className="admin-branding">
          <img src="/fav_dark.svg" alt="Logo" style={{ width: 32, height: 32, borderRadius: '6px' }} />
          <h1 className="branding-text" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
            Academy Lead Center <span className="admin-badge">Admin</span>
          </h1>
        </div>
        <div className="admin-header-actions">
          <span style={{ fontSize: '14px', color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} /> {user.email}
          </span>
          <button className="btn-secondary" onClick={onBackToForm}>
            <ArrowLeft size={16} /> Forms Screen
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────── Dashboard Body */}
      <div className="admin-body">
        
        {/* 1. Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Total Submissions</span>
            <span className="metric-value">{leads.length}</span>
            <span className="metric-desc">All-time lead captures</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Enrollment Rate</span>
            <span className="metric-value">{enrollmentRate}%</span>
            <span className="metric-desc">{enrolledCount} enrolled students</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">High-Intent Candidates</span>
            <span className="metric-value">{highIntentRate}%</span>
            <span className="metric-desc">{highIntentCount} leads willing to invest $5k</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Recent Applications</span>
            <span className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {newLeadsLast24h}
              {newLeadsLast24h > 0 && <TrendingUp size={24} style={{ color: '#52c41a' }} />}
            </span>
            <span className="metric-desc">Candidates applied in last 24h</span>
          </div>
        </div>

        {/* 2. Visual Graphs */}
        {leads.length > 0 && (
          <div className="charts-grid">
            {/* Country Demographics */}
            <div className="chart-card">
              <div>
                <h3 className="chart-title">Lead Geographic Spread</h3>
                <p className="metric-desc">Top candidate locations</p>
              </div>
              <div className="chart-content">
                {countryBreakdown.map((item, index) => {
                  const max = countryBreakdown[0]?.count || 1;
                  const percent = Math.round((item.count / max) * 100);
                  return (
                    <div key={item.name} className="chart-bar-row" style={{ '--index': index }}>
                      <div className="chart-bar-info">
                        <span className="chart-bar-label">{item.name}</span>
                        <span className="chart-bar-count">{item.count}</span>
                      </div>
                      <div className="chart-bar-container">
                        <div className="chart-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Struggle Category Breakdown */}
            <div className="chart-card">
              <div>
                <h3 className="chart-title">Biggest Profitability Hurdle</h3>
                <p className="metric-desc">Struggles keeping leads from profitability</p>
              </div>
              <div className="chart-content">
                {struggleBreakdown.map((item, index) => {
                  const max = struggleBreakdown[0]?.count || 1;
                  const percent = Math.round((item.count / max) * 100);
                  return (
                    <div key={item.name} className="chart-bar-row" style={{ '--index': index }}>
                      <div className="chart-bar-info">
                        <span className="chart-bar-label" style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '85%' 
                        }} title={item.name}>
                          {item.name}
                        </span>
                        <span className="chart-bar-count">{item.count}</span>
                      </div>
                      <div className="chart-bar-container">
                        <div className="chart-bar-fill" style={{ width: `${percent}%`, backgroundColor: '#ffaa00' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Controls (Filters/Search/CSV) */}
        <div className="controls-card">
          <div className="search-filter-group">
            <div className="search-input-wrapper">
              <Search size={18} style={{ color: 'var(--theme-text-tertiary)' }} />
              <input
                type="text"
                className="search-input-field"
                placeholder="Search leads by name, email, country..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Archived">Archived</option>
            </select>

            <select 
              className="filter-select" 
              value={investmentFilter}
              onChange={e => { setInvestmentFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Budgets</option>
              <option value="Yes">Ready to Invest ($5k)</option>
              <option value="No">Not Ready</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* 4. Leads Table */}
        <div className="table-card">
          {loading ? (
            <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={32} className="spinner" style={{ color: 'var(--theme-accent)' }} />
              <span style={{ color: 'var(--theme-text-secondary)' }}>Loading submissions...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="table-empty">
              <FileText size={48} style={{ color: 'var(--theme-text-tertiary)' }} />
              <div>
                <h4 style={{ color: 'var(--theme-text-primary)', fontSize: '16px', marginBottom: '4px' }}>No candidates found</h4>
                <p style={{ fontSize: '13px' }}>Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th 
                        className="sortable" 
                        onClick={() => { setSortBy('date'); setSortAsc(!sortAsc); }}
                      >
                        Date {sortBy === 'date' && (sortAsc ? '▲' : '▼')}
                      </th>
                      <th 
                        className="sortable" 
                        onClick={() => { setSortBy('name'); setSortAsc(!sortAsc); }}
                      >
                        Name {sortBy === 'name' && (sortAsc ? '▲' : '▼')}
                      </th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Country</th>
                      <th>Experience</th>
                      <th>Invest?</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(lead => (
                      <tr 
                        key={lead.id} 
                        onClick={() => openLeadDrawer(lead)}
                        className={selectedLead?.id === lead.id ? 'selected' : ''}
                      >
                        <td style={{ color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(lead.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ fontWeight: '500' }}>
                          {lead.first_name} {lead.last_name}
                        </td>
                        <td style={{ color: 'var(--theme-text-secondary)' }}>{lead.email}</td>
                        <td style={{ color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>{lead.phone}</td>
                        <td>{lead.country}</td>
                        <td style={{ color: 'var(--theme-text-secondary)' }}>{lead.trading_duration}</td>
                        <td>
                          {lead.investment_ready === 'Yes' ? (
                            <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                              <Check size={16} /> Yes
                            </span>
                          ) : (
                            <span style={{ color: 'var(--theme-text-tertiary)' }}>No</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${lead.status.toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controller */}
              <div className="table-footer">
                <span>
                  Showing <strong>{indexOfFirstLead + 1}-{Math.min(indexOfLastLead, totalFilteredCount)}</strong> of <strong>{totalFilteredCount}</strong> candidates
                </span>
                <div className="pagination-controls">
                  <button 
                    className="btn-pagination"
                    disabled={validatedCurrentPage === 1}
                    onClick={() => setCurrentPage(validatedCurrentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    className="btn-pagination"
                    disabled={validatedCurrentPage === totalPages}
                    onClick={() => setCurrentPage(validatedCurrentPage + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── Slide Drawer Details Panel */}
      <div 
        className={`drawer-backdrop ${selectedLead ? 'open' : ''}`} 
        onClick={closeLeadDrawer}
      >
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          {selectedLead && (
            <>
              {/* Drawer Header */}
              <div className="drawer-header">
                <div className="drawer-title-wrapper">
                  <h3 className="drawer-title">{selectedLead.first_name} {selectedLead.last_name}</h3>
                  <span className="drawer-subtitle">Applied on {new Date(selectedLead.created_at).toLocaleString()}</span>
                </div>
                <button className="btn-close" onClick={closeLeadDrawer}>
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="drawer-body">
                
                {/* Section 1: Contact Details */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Contact Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <Mail size={16} style={{ color: 'var(--theme-text-tertiary)' }} />
                      <a href={`mailto:${selectedLead.email}`} style={{ color: 'var(--theme-accent)', textDecoration: 'none' }}>{selectedLead.email}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <Phone size={16} style={{ color: 'var(--theme-text-tertiary)' }} />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <MapPin size={16} style={{ color: 'var(--theme-text-tertiary)' }} />
                      <span>{selectedLead.country}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <Calendar size={16} style={{ color: 'var(--theme-text-tertiary)' }} />
                      <span>Best Reach window: <strong>{selectedLead.best_time_to_reach || 'Unspecified'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Trading Profile Q&A */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Mentorship Application Profile</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="detail-item">
                      <span className="detail-label">Q: How long have you been trading Forex?</span>
                      <span className="detail-value">{selectedLead.trading_duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Main reason for not reaching profitability?</span>
                      <span className="detail-value">{selectedLead.profitability_reason}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Which describes current trading situation?</span>
                      <span className="detail-value">{selectedLead.trading_situation}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Are you currently profitable?</span>
                      <span className="detail-value">{selectedLead.currently_profitable}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Why do you want private 1:1 mentorship?</span>
                      <span className="detail-value" style={{ fontStyle: 'italic', color: 'var(--theme-text-secondary)', paddingLeft: '8px', borderLeft: '2px solid var(--theme-border)' }}>
                        "{selectedLead.mentorship_reason}"
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Willing to follow a process & be held accountable?</span>
                      <span className="detail-value">{selectedLead.willing_to_follow_process}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Q: Ready to make a $5,000 system investment?</span>
                      <span className="detail-value" style={{ color: selectedLead.investment_ready === 'Yes' ? '#52c41a' : 'inherit', fontWeight: selectedLead.investment_ready === 'Yes' ? '600' : 'normal' }}>
                        {selectedLead.investment_ready}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Status & Follow-up Actions */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Lead Management Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label className="detail-label">Pipeline Status</label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={selectedLead.status}
                      onChange={e => handleUpdateStatus(selectedLead.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Section 4: Administrative Notes */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Admin Follow-up Notes</h4>
                  <div>
                    <textarea
                      className="notes-textarea"
                      placeholder="Write notes about call schedules, payments, concerns, etc..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    />
                    <div className="notes-footer">
                      <button 
                        className="btn-secondary" 
                        onClick={handleSaveNotes}
                        disabled={savingNote || noteInput === (selectedLead.notes || '')}
                      >
                        {savingNote ? <><Loader2 size={14} className="spinner" /> Saving...</> : noteSavedFeedback ? <><Check size={14} style={{ color: '#52c41a' }} /> Saved</> : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="drawer-footer">
                <button className="btn-secondary" onClick={() => handleCopyLeadData(selectedLead)}>
                  <Clipboard size={16} /> Copy Raw Data
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    const subject = encodeURIComponent("Mentorship Application Follow-up");
                    const body = encodeURIComponent(`Hi ${selectedLead.first_name},\n\nThanks for applying for private 1:1 mentorship at Swingtradefxacademy. I reviewed your answers regarding your struggle with "${selectedLead.profitability_reason}"...\n\nLet's hop on a call to talk. Here's my scheduler: https://calendly.com/swingtradefx1/30min?month=2026-10\n\nBest regards,\nMentorship Team`);
                    window.open(`mailto:${selectedLead.email}?subject=${subject}&body=${body}`);
                  }}
                >
                  <Mail size={16} /> Send Email
                </button>
                <button className="btn-danger" style={{ flex: '0 0 auto', padding: '10px' }} onClick={() => handleDeleteLead(selectedLead.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── Custom Feedback Toasts */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} style={{ color: '#52c41a' }} /> : <FileText size={16} style={{ color: 'var(--theme-error)' }} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── Custom Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteConfirm({ show: false, id: null })}>
          <div className="confirm-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-modal-title" style={{ color: 'var(--theme-error)' }}>
              <Trash2 size={20} /> Permanent Delete
            </h3>
            <p className="confirm-modal-message">
              Are you sure you want to permanently delete this candidate? This action cannot be undone and will delete the record from the database.
            </p>
            <div className="confirm-modal-buttons">
              <button className="btn-secondary" onClick={() => setDeleteConfirm({ show: false, id: null })}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: 'var(--theme-error)', borderColor: 'transparent' }} 
                onClick={confirmDeleteLead}
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
