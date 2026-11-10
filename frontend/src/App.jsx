import { useEffect, useRef, useState } from 'react';
import {
  Activity, AlertCircle, ArrowLeft, ArrowDownRight, ArrowUpRight,
  Bell, CalendarDays, CheckCircle2, ChevronDown,
  Clock3, Filter, LayoutDashboard, Menu, MessageSquare,
  MoreHorizontal, Plus, Search, Send, Settings,
  ShieldCheck, Sparkles, Users, Workflow, X
} from 'lucide-react';
import './App.css';
import Heart3D from './components/Heart3D';
import {
  getEnquiries,
  createEnquiry,
  analyzeEnquiry,
  approveEnquiry,
  updateEnquiryStatus,
  updateEnquiry,
  deleteEnquiry,
  sendChatbotMessage
} from './components/services/api';
import Auth from './components/Auth';


const menuItems = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'AI Inbox', icon: MessageSquare, count: '8' },
  { name: 'Appointments', icon: CalendarDays },
  { name: 'Automation', icon: Workflow },
  { name: 'Patients', icon: Users },
];



const formatEnquiry = (item) => ({
  id: item.id,
  initials: item.patientName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),

  name: item.patientName,
  phone: item.phone || '',
  email: item.email || '',
  time: item.createdAt
    ? new Date(item.createdAt).toLocaleString()
    : 'Recently',
  createdAt: item.createdAt || null,
analyzedAt: item.analyzedAt || null,
approvedAt: item.approvedAt || null,
resolvedAt: item.resolvedAt || null,

  message: item.message,
  draftResponse: item.draftResponse || '',
  intent: item.enquiryType || 'General enquiry',
  color: 'blue',
  status: item.status === 'NEW' ? 'Needs review' : item.status,
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
  () => Boolean(localStorage.getItem('careflowToken'))
);
  const [activePage, setActivePage] = useState('Overview');
  const pageHistory = useRef(['Overview']);
const isGoingBack = useRef(false);
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [periodOpen, setPeriodOpen] = useState(false);
const [selectedPeriod, setSelectedPeriod] = useState('This week');

const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);

  const [showNewEnquiry, setShowNewEnquiry] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState('');

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [settings, setSettings] = useState(() => {
  try {
    const savedSettings = localStorage.getItem('careflowSettings');

    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          adminName: 'Clinic Admin',
          adminEmail: '',
          emailNotifications: true,
          enquiryNotifications: true,
          aiAssistance: true,
          autoAnalysis: true,
        };
  } catch {
    return {
      adminName: 'Clinic Admin',
      adminEmail: '',
      emailNotifications: true,
      enquiryNotifications: true,
      aiAssistance: true,
      autoAnalysis: true,
    };
  }
});

  const [chatMessages, setChatMessages] = useState([
  {
    role: 'assistant',
    text: "Hello! Welcome to CareFlow AI. 👋 I'm your patient support assistant. How can I help you today?"
  }
]);

const [chatInput, setChatInput] = useState('');
const [isChatLoading, setIsChatLoading] = useState(false);

const [isChatOpen, setIsChatOpen] = useState(false);

  const [isApproving, setIsApproving] = useState(false);

  const [draftResponse, setDraftResponse] = useState('');

  const [isEditingEnquiry, setIsEditingEnquiry] = useState(false);

const [editForm, setEditForm] = useState({
  patientName: '',
  phone: '',
  email: '',
  message: '',
  enquiryType: '',
});

  const [enquiriesData, setEnquiriesData] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('ALL');
const [categoryFilter, setCategoryFilter] = useState('ALL');

useEffect(() => {
  if (isGoingBack.current) {
    isGoingBack.current = false;
    return;
  }

  const history = pageHistory.current;

  if (history[history.length - 1] !== activePage) {
    history.push(activePage);
  }
}, [activePage]);

const handleGoBack = () => {
  if (pageHistory.current.length <= 1) return;

  pageHistory.current.pop();

  const previousPage =
    pageHistory.current[pageHistory.current.length - 1];

  isGoingBack.current = true;
  setActivePage(previousPage);
};

useEffect(() => {
  localStorage.setItem('careflowSettings', JSON.stringify(settings));
}, [settings]);

  const stats = [
  {
    label: 'Total enquiries',
    value: enquiriesData.length,
    change: 'Live data',
    detail: 'Total enquiries received',
    icon: MessageSquare,
    color: 'teal',
    positive: true,
  },
  {
    label: 'Appointment requests',
    value: enquiriesData.filter(
      (item) => item.intent === 'APPOINTMENT'
    ).length,
    change: 'Live data',
    detail: 'Appointment enquiries',
    icon: CalendarDays,
    color: 'purple',
    positive: true,
  },
  {
    label: 'Pending reviews',
    value: enquiriesData.filter(
      (item) =>
        item.status === 'NEW' ||
        item.status === 'Needs review' ||
        item.status === 'NEEDS_REVIEW'
    ).length,
    change: 'Needs attention',
    detail: 'Awaiting review',
    icon: Clock3,
    color: 'orange',
    positive: false,
  },
  {
    label: 'AI responses drafted',
    value: enquiriesData.filter(
      (item) => item.draftResponse
    ).length,
    change: 'Live data',
    detail: 'Responses generated and saved',
    icon: Sparkles,
    color: 'blue',
    positive: true,
  },
];

const categoryStats = enquiriesData.reduce((acc, item) => {
  const category = item.intent || 'GENERAL';
  acc[category] = (acc[category] || 0) + 1;
  return acc;
}, {});



const dailyEnquiries = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const daysAgo = selectedPeriod === 'Last week'
  ? 13 - index
  : 6 - index;

date.setDate(date.getDate() - daysAgo);

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const count = enquiriesData.filter((item) => {
    if (!item.createdAt) return false;

    const enquiryDate = new Date(item.createdAt);

    return enquiryDate >= date && enquiryDate < nextDate;
  }).length;

  return {
    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    count,
  };
});



const maxDailyEnquiries = Math.max(
  ...dailyEnquiries.map((day) => day.count),
  1
);

const statusStats = {
  NEW: enquiriesData.filter((item) => item.status === 'NEW').length,
  NEEDS_REVIEW: enquiriesData.filter(
    (item) =>
      item.status === 'Needs review' ||
      item.status === 'NEEDS_REVIEW'
  ).length,
  APPROVED: enquiriesData.filter(
    (item) => item.status === 'APPROVED'
  ).length,
  RESOLVED: enquiriesData.filter(
    (item) => item.status === 'RESOLVED'
  ).length,
};


const workflowStats = {
  total: enquiriesData.length,

  processed: enquiriesData.filter(
    (item) =>
      item.status === 'APPROVED' ||
      item.status === 'RESOLVED' ||
      item.approvedAt ||
      item.resolvedAt
  ).length,

  pending: enquiriesData.filter(
    (item) =>
      !item.analyzedAt &&
      item.status !== 'APPROVED' &&
      item.status !== 'RESOLVED'
  ).length,

  needsReview: enquiriesData.filter(
    (item) =>
      item.analyzedAt &&
      item.status !== 'APPROVED' &&
      item.status !== 'RESOLVED'
  ).length,
};


const categoryColors = [
  '#45c9b8',
  '#a78bfa',
  '#60a5fa',
  '#f59e0b',
  '#f472b6',
];

  useEffect(() => {
  const loadEnquiries = async () => {
    try {
      const data = await getEnquiries();

      setEnquiriesData(data.map(formatEnquiry));
    } catch (error) {
      console.error('Failed to load enquiries:', error);
      setToast('Unable to load enquiries from the server.');
    }
  };

  loadEnquiries();
}, []);

  const filteredEnquiries = enquiriesData.filter((item) => {
  const matchesSearch = `${item.name} ${item.message} ${item.intent}`
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  const normalizedStatus =
    item.status === 'Needs review' ? 'NEEDS_REVIEW' : item.status;

  const matchesStatus =
    statusFilter === 'ALL' || normalizedStatus === statusFilter;

  const matchesCategory =
    categoryFilter === 'ALL' || item.intent === categoryFilter;

  return matchesSearch && matchesStatus && matchesCategory;
});

const patients = Array.from(
  new Map(
    enquiriesData.map((item) => {
      const key = (
        item.email ||
        item.phone ||
        item.name
      ).trim().toLowerCase();

      return [key, item];
    })
  ).values()
);

const appointmentRequests = enquiriesData.filter((item) =>
  String(item.intent || '').toLowerCase().includes('appointment')
);

const automationStats = {
  analyzed: enquiriesData.filter((item) => item.analyzedAt).length,

  drafts: enquiriesData.filter(
    (item) => item.draftResponse && item.draftResponse.trim()
  ).length,

  approved: enquiriesData.filter(
    (item) => item.approvedAt || item.status === 'APPROVED'
  ).length,

  pending: enquiriesData.filter(
    (item) => !item.analyzedAt
  ).length,
};
  
const handleCreateEnquiry = async (event) => {
  event.preventDefault();

  if (!newName.trim() || !newMessage.trim()) return;

  try {
    const enquiryData = {
      patientName: newName.trim(),
      message: newMessage.trim(),
      enquiryType: 'General enquiry',
    };

    // Save enquiry to Spring Boot / MySQL
    const savedEnquiry = await createEnquiry(enquiryData);

    // Format the saved backend response
    const entry = formatEnquiry(savedEnquiry);

    setEnquiriesData((current) => [entry, ...current]);
    setSelectedMessage(entry);
    setActivePage('AI Inbox');
    setShowNewEnquiry(false);

    setNewName('');
    setNewMessage('');

    setToast('New enquiry saved successfully.');
  } catch (error) {
    console.error('Error creating enquiry:', error);

    setToast(
      error.response?.data?.message ||
      'Failed to save enquiry. Please try again.'
    );
  }
};


const handleAnalyzeEnquiry = async () => {
  if (!selectedMessage?.message) return;

  setIsAnalyzing(true);
  setAiAnalysis('');
  setDraftResponse('');

  try {
    const result = await analyzeEnquiry(
  selectedMessage.message,
  selectedMessage.id
);
    const analysis = result.analysis || '';

    setAiAnalysis(analysis);

    if (result.analyzedAt) {
  setSelectedMessage((current) => ({
    ...current,
    analyzedAt: result.analyzedAt,
  }));

  setEnquiriesData((current) =>
    current.map((item) =>
      item.id === selectedMessage.id
        ? { ...item, analyzedAt: result.analyzedAt }
        : item
    )
  );
}


    // Extract the Draft Response section
    const draftMatch = analysis.match(
      /3\.\s*Draft Response:\s*([\s\S]*?)(?=\n\s*(?:4\.|$))/i
    );

    if (draftMatch) {
      const extractedDraft = draftMatch[1]
  .replace(/^\s*>\s?/gm, '')
  .trim()
  .replace(/^["“]\s*/, '')
  .replace(/\s*["”]$/, '');

      setDraftResponse(extractedDraft);
    }

  } catch (error) {
    console.error('AI analysis failed:', error);
    setToast('Unable to analyze enquiry. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};

const handleSendChatMessage = async () => {
  const message = chatInput.trim();

  if (!message || isChatLoading) return;

  setChatMessages((current) => [
    ...current,
    { role: 'user', text: message }
  ]);

  setChatInput('');
  setIsChatLoading(true);

  try {
    const result = await sendChatbotMessage(message);

    setChatMessages((current) => [
      ...current,
      {
        role: 'assistant',
        text: result.reply || 'Sorry, I could not generate a response.'
      }
    ]);
  } catch (error) {
    console.error('Chatbot error:', error);

    setChatMessages((current) => [
      ...current,
      {
        role: 'assistant',
        text: 'Sorry, I am unable to respond right now. Please try again.'
      }
    ]);
  } finally {
    setIsChatLoading(false);
  }
};

const handleApproveDraft = async () => {
  if (!selectedMessage?.id || !draftResponse.trim()) {
    setToast('Please generate or enter a response before approval.');
    return;
  }

  setIsApproving(true);

  try {
    const savedEnquiry = await approveEnquiry(
      selectedMessage.id,
      draftResponse.trim()
    );

    const updatedEnquiry = formatEnquiry(savedEnquiry);

    setEnquiriesData((current) =>
      current.map((item) =>
        item.id === updatedEnquiry.id ? updatedEnquiry : item
      )
    );

    setSelectedMessage(updatedEnquiry);

    setToast('Response approved and saved successfully!');
  } catch (error) {
    console.error('Approval failed:', error);
    setToast(
      error.response?.data?.message ||
      'Unable to approve response. Please try again.'
    );
  } finally {
    setIsApproving(false);
  }
};


const handleStatusChange = async (status) => {
  if (!selectedMessage?.id) return;

  try {
    const savedEnquiry = await updateEnquiryStatus(
      selectedMessage.id,
      status
    );

    const updatedEnquiry = formatEnquiry(savedEnquiry);

    setEnquiriesData((current) =>
      current.map((item) =>
        item.id === updatedEnquiry.id ? updatedEnquiry : item
      )
    );

    setSelectedMessage(updatedEnquiry);

    setToast(`Enquiry status updated to ${status.replace('_', ' ')}.`);
  } catch (error) {
    console.error('Status update failed:', error);
    setToast('Unable to update enquiry status.');
  }
};

const startEditingEnquiry = () => {
  if (!selectedMessage) return;

  setEditForm({
    patientName: selectedMessage.name || '',
    phone: selectedMessage.phone || '',
    email: selectedMessage.email || '',
    message: selectedMessage.message || '',
    enquiryType: selectedMessage.intent || '',
  });

  setIsEditingEnquiry(true);
};

const handleEditEnquiry = async (enquiryData) => {
  if (!selectedMessage?.id) return;

  try {
    const savedEnquiry = await updateEnquiry(
      selectedMessage.id,
      enquiryData
    );

    const updatedEnquiry = formatEnquiry(savedEnquiry);

    setEnquiriesData((current) =>
      current.map((item) =>
        item.id === updatedEnquiry.id ? updatedEnquiry : item
      )
    );

    setSelectedMessage(updatedEnquiry);
    setToast('Patient enquiry updated successfully!');
    setIsEditingEnquiry(false);
  } catch (error) {
    console.error('Enquiry update failed:', error);
    setToast(
      error.response?.data?.message ||
      'Unable to update enquiry.'
    );
  }
};

const handleDeleteEnquiry = async () => {
  if (!selectedMessage?.id) return;

  const confirmed = window.confirm(
    'Are you sure you want to delete this enquiry? This action cannot be undone.'
  );

  if (!confirmed) return;

  try {
    await deleteEnquiry(selectedMessage.id);

    setEnquiriesData((current) =>
      current.filter((item) => item.id !== selectedMessage.id)
    );

    setSelectedMessage(null);
    setDraftResponse('');
    setAiAnalysis('');

    setToast('Enquiry deleted successfully!');
  } catch (error) {
    console.error('Enquiry deletion failed:', error);
    setToast('Unable to delete enquiry. Please try again.');
  }
};

  const pageDescriptions = {
  Overview: 'Here is what is happening at your clinic today.',
  'AI Inbox': 'Review incoming messages and AI-generated responses.',
  Appointments: 'Review appointment requests received from patients.',
  Automation: 'Track AI analyses, response drafts, and approvals.',
  Patients: 'View and manage your patient directory.',
};

if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Activity size={23} />
          </div>
          <div>
            <h2>CareFlow<span>AI</span></h2>
            <p>Healthcare intelligence</p>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {menuItems.map(({ name, icon: Icon, count }) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? 'active' : ''}`}
              onClick={() => {
                setActivePage(name);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-status">
            <div className="status-heading">
              <span className="online-dot" />
              AI SYSTEM
              <span className="live-label">ACTIVE</span>
            </div>
            <p>AI assistance is ready to process enquiries.</p>
            <div className="system-progress">
              <div />
            </div>
          </div>

          <button
            className={`nav-item ${activePage === 'Settings' ? 'active' : ''}`}
            onClick={() => setActivePage('Settings')}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">SM</div>
            <div className="profile-info">
              <strong>Clinic Admin</strong>
              <span>Administrator</span>
            </div>
            <MoreHorizontal size={20} className="profile-more" />
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search enquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>

            <div className="notification-wrap">
              <button
                className="notification-button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="notification-dot" />
              </button>
              {notificationOpen && (
                <div className="notification-panel">
                  <strong>Notifications</strong>
                  <p>12 enquiries are waiting for review.</p>
                  <p>3 appointment requests need attention.</p>
                </div>
              )}
            </div>

            <div className="topbar-avatar">SM</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
  <div>
    <div className="eyebrow">
      <span className="online-dot" />
      MONDAY, NOVEMBER 9
    </div>

    <div className="page-title-row">
      {activePage !== 'Overview' && (
        <button
          className="back-button"
          onClick={handleGoBack}
          title="Go to previous page"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      )}

      <h1>
        {activePage === 'Overview'
          ? <>Good morning, <span>Admin.</span></>
          : activePage}
      </h1>
    </div>

    <p>
      {pageDescriptions[activePage] || 'Manage your workspace preferences.'}
    </p>
  </div>

  {(activePage === 'Overview' || activePage === 'AI Inbox') && (
    <button
      className="primary-button"
      onClick={() => setShowNewEnquiry(true)}
    >
      <Plus size={18} />
      New enquiry
    </button>
  )}
</section>

          {activePage === 'Overview' && (
  <section className="heart-hero">
    <div className="heart-copy">
      <span className="heart-eyebrow">
        <span className="online-dot" />
        CAREFLOW AI · HEALTHCARE INTELLIGENCE
      </span>

      <h2>Care that moves<br />
        <span>with every heartbeat.</span>
      </h2>

      <p>
        Intelligent healthcare communication,
        designed around people.
      </p>
    </div>

    
<div className="heart-visual">
  <Heart3D />
</div>

  </section>
)}

          {activePage === 'Overview' ? (
            <>
              <section className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article className="stat-card" key={stat.label}>
                      <div className="stat-top">
                        <div className={`stat-icon ${stat.color}`}>
                          <Icon size={20} />
                        </div>
                        <button className="more-button">
                          <MoreHorizontal size={19} />
                        </button>
                      </div>
                      <p className="stat-label">{stat.label}</p>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-footer">
                        <span className={stat.positive ? 'positive' : 'attention'}>
                          {stat.positive ? <ArrowUpRight size={14} /> : <AlertCircle size={14} />}
                          {stat.change}
                        </span>
                        <span>{stat.detail}</span>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="analytics-grid">

  {/* Enquiry Categories */}
  <article className="analytics-card">
    <div className="analytics-heading">
      <div>
        <h3>Enquiry Categories</h3>
        <p>Distribution by enquiry type</p>
      </div>
      <span className="analytics-total">
        {enquiriesData.length} Total
      </span>
    </div>

    <div className="category-list">
      {Object.entries(categoryStats).length === 0 ? (
        <p className="analytics-empty">No enquiry data available yet.</p>
      ) : (
        Object.entries(categoryStats).map(([category, count], index) => (
          <div className="category-item" key={category}>
            <div className="category-info">
              <span
                className="category-dot"
                style={{
                  background: categoryColors[index % categoryColors.length],
                }}
              />
              <span>{category.replace(/_/g, ' ')}</span>
              <strong>{count}</strong>
            </div>

            <div className="category-bar">
              <div
                className="category-bar-fill"
                style={{
                  width: `${(count / enquiriesData.length) * 100}%`,
                  background: categoryColors[index % categoryColors.length],
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  </article>

  {/* Enquiries Over Time */}
<article className="analytics-card trend-card">
  <div className="analytics-heading">
    <div>
      <h3>Enquiries Over Time</h3>
      <p>Enquiries received during the last 7 days</p>
    </div>
    <span className="analytics-total">Last 7 days</span>
  </div>

  <div className="trend-chart">
    {dailyEnquiries.map((day) => (
      <div className="trend-column" key={day.label}>
        <span className="trend-count">{day.count}</span>

        <div className="trend-bar-area">
          <div
            className="trend-bar"
            style={{
              height: `${(day.count / maxDailyEnquiries) * 100}%`,
            }}
          />
        </div>

        <span className="trend-label">{day.label}</span>
      </div>
    ))}
  </div>
</article>

  {/* Enquiry Status */}
  <article className="analytics-card">
    <div className="analytics-heading">
      <div>
        <h3>Enquiry Status</h3>
        <p>Current workflow overview</p>
      </div>
    </div>

    <div className="status-analytics">
      {[
        { label: 'New', value: statusStats.NEW, color: '#60a5fa' },
        { label: 'Needs Review', value: statusStats.NEEDS_REVIEW, color: '#f59e0b' },
        { label: 'Approved', value: statusStats.APPROVED, color: '#45c9b8' },
        { label: 'Resolved', value: statusStats.RESOLVED, color: '#a78bfa' },
      ].map((status) => (
        <div className="status-analytics-item" key={status.label}>
          <div className="status-analytics-label">
            <span
              className="category-dot"
              style={{ background: status.color }}
            />
            <span>{status.label}</span>
          </div>
          <strong>{status.value}</strong>
        </div>
      ))}
    </div>
  </article>

</section>

              <section className="content-grid">
                <article className="panel enquiries-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent enquiries</h3>
                      <p>AI-powered patient communication</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setActivePage('AI Inbox')}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>

                  <div className="enquiry-list">
                    {filteredEnquiries.length === 0 ? (
  <div className="empty-state">
    <Search size={24} />
    <p>No enquiries found</p>
    <span>Try changing your search or filters.</span>
  </div>
) : (
  filteredEnquiries.map((item) => (
    <div className="enquiry-item" key={item.id}>
      <div className={`patient-avatar ${item.color}`}>
        {item.initials}
      </div>

      <div className="enquiry-details">
        <div className="enquiry-name-row">
          <strong>{item.name}</strong>
          <span>{item.time}</span>
        </div>

        <p>{item.message}</p>

        <div className="enquiry-tags">
          <span className="intent-tag">{item.intent}</span>
          <span className={`review-tag ${item.status === 'Needs review' ? 'needs-review' : ''}`}>
            {item.status}
          </span>
        </div>
      </div>

      <button
        className="open-enquiry"
        onClick={() => {
          setSelectedMessage(item);
          setActivePage('AI Inbox');
        }}
        aria-label={`Open ${item.name} enquiry`}
      >
        <ArrowUpRight size={17} />
      </button>
    </div>
  ))
)}
</div>
                </article>

                <article className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>AI activity</h3>
                      <p>Recent system updates</p>
                    </div>
                    <span className="live-indicator">
                      <span className="online-dot" /> LIVE
                    </span>
                  </div>

                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon teal">
                        <Sparkles size={17} />
                      </div>
                      <div>
                        <strong>Response generated</strong>
                        <p>Appointment enquiry processed</p>
                        <span>2 minutes ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon purple">
                        <CheckCircle2 size={17} />
                      </div>
                      <div>
                        <strong>Intent identified</strong>
                        <p>Message classified successfully</p>
                        <span>18 minutes ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon orange">
                        <ShieldCheck size={17} />
                      </div>
                      <div>
                        <strong>Human review required</strong>
                        <p>One enquiry flagged for review</p>
                        <span>35 minutes ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="activity-footer">
                    <Activity size={16} />
                    All systems operational
                  </div>
                </article>
              </section>

              <section className="content-grid bottom-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Enquiry overview</h3>
                      <p>Weekly communication volume</p>
                    </div>
                    <div className="period-dropdown">
  <button
    className="period-button"
    onClick={() => setPeriodOpen((current) => !current)}
    aria-expanded={periodOpen}
  >
    {selectedPeriod} <ChevronDown size={15} />
  </button>

  {periodOpen && (
    <div className="period-menu">
      {['This week', 'Last week'].map((period) => (
        <button
          key={period}
          onClick={() => {
            setSelectedPeriod(period);
            setPeriodOpen(false);
          }}
          className={selectedPeriod === period ? 'active' : ''}
        >
          {period}
        </button>
      ))}
    </div>
  )}
</div>
                  </div>

                  <div className="chart-area">
                    <div className="chart-y-labels">
                      <span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
                    </div>
                    <div className="chart-main">
                      <div className="chart-grid-lines">
                        {[0, 1, 2, 3, 4].map((n) => <div key={n} />)}
                      </div>
                      
<div className="bar-group">
  {dailyEnquiries.map((day, index) => (
    <div className="bar-column" key={day.label}>
      <span className="trend-count">{day.count}</span>
      <div
        className={`chart-bar ${index === 6 ? 'highlight' : ''}`}
        style={{
          height: `${(day.count / maxDailyEnquiries) * 100}%`,
        }}
      />
      <span>{day.label}</span>
    </div>
  ))}
</div>

                    </div>
                  </div>
                </article>

                <article className="panel workflow-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Workflow status</h3>
                      <p>Enquiry processing breakdown</p>
                    </div>
                    <div className="workflow-menu-wrapper">
  <button
    className="more-button"
    onClick={() => setWorkflowMenuOpen((current) => !current)}
    aria-label="Workflow status options"
    aria-expanded={workflowMenuOpen}
  >
    <MoreHorizontal size={20} />
  </button>

  {workflowMenuOpen && (
    <div className="workflow-menu">
      <button
        onClick={() => {
          setActivePage('AI Inbox');
          setWorkflowMenuOpen(false);
        }}
      >
        View AI Inbox
      </button>

      <button
        onClick={() => {
          setActivePage('Automation');
          setWorkflowMenuOpen(false);
        }}
      >
        View Automation
      </button>
    </div>
  )}
</div>
                  </div>
                  <div className="workflow-stat">
  <span className="workflow-number">{workflowStats.total}</span>
  <span>Total enquiries</span>
</div>
                  <div className="workflow-bar">
  <div
    className="workflow-completed"
    style={{
      width: `${workflowStats.total ? (workflowStats.processed / workflowStats.total) * 100 : 0}%`,
    }}
  />
  <div
    className="workflow-pending"
    style={{
      width: `${workflowStats.total ? (workflowStats.pending / workflowStats.total) * 100 : 0}%`,
    }}
  />
  <div
    className="workflow-flagged"
    style={{
      width: `${workflowStats.total ? (workflowStats.needsReview / workflowStats.total) * 100 : 0}%`,
    }}
  />
</div>
                  <div className="workflow-legend">
  <div>
    <span className="legend-dot completed" /> Processed
    <strong>{workflowStats.processed}</strong>
  </div>
  <div>
    <span className="legend-dot pending" /> Pending
    <strong>{workflowStats.pending}</strong>
  </div>
  <div>
    <span className="legend-dot flagged" /> Needs review
    <strong>{workflowStats.needsReview}</strong>
  </div>
</div>
                </article>
              </section>
            </>   

) : activePage === 'AI Inbox' ? (

            <section className="panel inbox-panel">
              <div className="panel-heading">
                <div>
                  <h3>Patient message inbox</h3>
                  <p>Review AI classifications and response drafts</p>
                </div>
                <button className="period-button"><Filter size={15} /> Filter</button>
              </div>
              <div className="inbox-filters">
  <div className="inbox-search">
    <Search size={17} />
    <input
      type="text"
      placeholder="Search patient, message or category..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="ALL">All statuses</option>
    <option value="NEW">New</option>
    <option value="NEEDS_REVIEW">Needs Review</option>
    <option value="APPROVED">Approved</option>
    <option value="RESOLVED">Resolved</option>
  </select>

  <select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
  >
    <option value="ALL">All categories</option>
    {[...new Set(enquiriesData.map((item) => item.intent))].map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>
              <div className="inbox-layout">
                <div className="inbox-list">
                  {filteredEnquiries.map((item) => (
                    <button
                      key={item.id}
                      className={`inbox-row ${selectedMessage?.name === item.name ? 'selected' : ''}`}
                      onClick={() => setSelectedMessage(item)}
                    >
                      <div className={`patient-avatar ${item.color}`}>{item.initials}</div>
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.message}</p>
                        <span>{item.intent}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="message-detail">
                  {selectedMessage ? (
                    <>
                      <div className="message-heading">
                        <div className={`patient-avatar ${selectedMessage.color}`}>{selectedMessage.initials}</div>
                        <div><strong>{selectedMessage.name}</strong><p>{selectedMessage.time}</p></div>
                      </div>
                      <div className="message-bubble">{selectedMessage.message}</div>
                      <div className="patient-contact-info">
  <div>
    <span>Phone Number</span>
    {selectedMessage.phone ? (
  <a href={`tel:${selectedMessage.phone}`}>
    {selectedMessage.phone}
  </a>
) : (
  <strong>Not provided</strong>
)}
  </div>

  <div>
    <span>Email Address</span>
    {selectedMessage.email ? (
  <a href={`mailto:${selectedMessage.email}`}>
    {selectedMessage.email}
  </a>
) : (
  <strong>Not provided</strong>
)}
  </div>
</div>
                      <div className="enquiry-actions">
  <button
    className="edit-enquiry-button"
    onClick={startEditingEnquiry}
  >
    <Settings size={15} />
    Edit Details
  </button>

  <button
    className="delete-enquiry-button"
    onClick={handleDeleteEnquiry}
  >
    <X size={15} />
    Delete Enquiry
  </button>
</div>

{isEditingEnquiry && (
  <form
    className="edit-enquiry-form"
    onSubmit={(event) => {
      event.preventDefault();
      handleEditEnquiry(editForm);
    }}
  >
    <h4>Edit Patient Details</h4>

    <label>Patient Name</label>
    <input
      type="text"
      value={editForm.patientName}
      onChange={(e) =>
        setEditForm({ ...editForm, patientName: e.target.value })
      }
      required
    />

    <label>Phone Number</label>
    <input
      type="tel"
      value={editForm.phone}
      onChange={(e) =>
        setEditForm({ ...editForm, phone: e.target.value })
      }
    />

    <label>Email Address</label>
    <input
      type="email"
      value={editForm.email}
      onChange={(e) =>
        setEditForm({ ...editForm, email: e.target.value })
      }
    />

    <label>Enquiry Category</label>
    <input
      type="text"
      value={editForm.enquiryType}
      onChange={(e) =>
        setEditForm({ ...editForm, enquiryType: e.target.value })
      }
    />

    <label>Enquiry Message</label>
    <textarea
      value={editForm.message}
      onChange={(e) =>
        setEditForm({ ...editForm, message: e.target.value })
      }
      required
      rows={4}
    />

    <div className="edit-form-actions">
      <button
        type="button"
        onClick={() => setIsEditingEnquiry(false)}
      >
        Cancel
      </button>

      <button type="submit" className="primary-button">
        Save Changes
      </button>
    </div>
  </form>
)}
                      <div className="status-control">
  <label htmlFor="enquiry-status">Enquiry Status</label>

  <select
    id="enquiry-status"
    value={
      selectedMessage.status === 'Needs review'
        ? 'NEEDS_REVIEW'
        : selectedMessage.status
    }
    onChange={(e) => handleStatusChange(e.target.value)}
  >
    <option value="NEW">New</option>
    <option value="NEEDS_REVIEW">Needs Review</option>
    <option value="APPROVED">Approved</option>
    <option value="RESOLVED">Resolved</option>
  </select>
</div>

<div className="enquiry-timeline">
  <h4>Enquiry Timeline</h4>

  <div className="timeline-item">
    <div className="timeline-dot completed"></div>
    <div className="timeline-content">
      <strong>Enquiry Submitted</strong>
      <span>
        {selectedMessage.createdAt
          ? new Date(selectedMessage.createdAt).toLocaleString()
          : 'Date unavailable'}
      </span>
    </div>
  </div>

  <div className="timeline-item">
    <div className={`timeline-dot ${selectedMessage.analyzedAt ? 'completed' : ''}`}></div>
    <div className="timeline-content">
      <strong>AI Analysis Generated</strong>
      <span>
        {selectedMessage.analyzedAt
          ? new Date(selectedMessage.analyzedAt).toLocaleString()
          : 'Awaiting AI analysis'}
      </span>
    </div>
  </div>

  <div className="timeline-item">
    <div className={`timeline-dot ${selectedMessage.approvedAt ? 'completed' : ''}`}></div>
    <div className="timeline-content">
      <strong>Response Approved</strong>
      <span>
        {selectedMessage.approvedAt
          ? new Date(selectedMessage.approvedAt).toLocaleString()
          : 'Awaiting approval'}
      </span>
    </div>
  </div>

  <div className="timeline-item">
    <div className={`timeline-dot ${selectedMessage.resolvedAt ? 'completed' : ''}`}></div>
    <div className="timeline-content">
      <strong>Enquiry Resolved</strong>
      <span>
        {selectedMessage.resolvedAt
          ? new Date(selectedMessage.resolvedAt).toLocaleString()
          : 'Awaiting resolution'}
      </span>
    </div>
  </div>
</div>
                      <div className="ai-insight">
  <Sparkles size={18} />
  <div>
    <strong>Gemini AI Analysis</strong>
    <p>Generate an intelligent enquiry analysis.</p>
  </div>
</div>

<button
  className="primary-button"
  onClick={handleAnalyzeEnquiry}
  disabled={isAnalyzing}
>
  <Sparkles size={16} />
  {isAnalyzing ? 'Analyzing enquiry...' : 'Analyze with AI'}
</button>

{aiAnalysis && (
  <div className="ai-analysis-result">
    <div className="ai-result-heading">
      <Sparkles size={18} />
      <strong>AI-generated analysis</strong>
    </div>

    <div className="ai-result-content">
  {aiAnalysis
    .replace(/\*\*/g, '')
    .replace(/^\s*[*-]\s?/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\s*(\d+\.\s)/g, '\n$1')
    .replace(/Draft Response:\s*/i, 'Draft Response:\n')
    .trim()}
    </div>
  </div>
)}
                      <label className="draft-label">Suggested administrative response</label>
                      <textarea
  className="response-draft"
  value={draftResponse}
  onChange={(e) => setDraftResponse(e.target.value)}
  placeholder="AI-generated response will appear here..."
/>
                      <div className="review-notice">
                        <ShieldCheck size={16} />
                        Human approval is required before sending.
                      </div>
                      <button
  className="primary-button"
  onClick={handleApproveDraft}
  disabled={isApproving || selectedMessage?.status === 'APPROVED'}
>
  <CheckCircle2 size={16} />
  {isApproving
    ? 'Approving...'
    : selectedMessage?.status === 'APPROVED'
      ? 'Response Approved'
      : 'Approve Draft'}
</button>
                    </>
                  ) : (
                    <div className="empty-state">Select an enquiry to review its details.</div>
                  )}
                </div>
              </div>
            </section>
          
) : activePage === 'Patients' ? (
  <section className="panel inbox-panel">
    <div className="panel-heading">
      <div>
        <h3>Patient Directory</h3>
        <p>View and manage patient information from saved enquiries.</p>
      </div>
      <span className="analytics-total">
        {patients.length} Patients
      </span>
    </div>

    <div className="enquiry-list">
      {patients.filter((patient) =>
        `${patient.name} ${patient.email} ${patient.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ).length === 0 ? (
        <div className="empty-state">
          <Users size={24} />
          <p>No patients found</p>
          <span>Patient records will appear here when enquiries are received.</span>
        </div>
      ) : (
        patients
          .filter((patient) =>
            `${patient.name} ${patient.email} ${patient.phone}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((patient) => (
            <div className="enquiry-item" key={patient.id}>
              <div className="patient-avatar blue">
                {patient.initials}
              </div>

              <div className="enquiry-details">
                <div className="enquiry-name-row">
                  <strong>{patient.name}</strong>
                  <span>{patient.time}</span>
                </div>

                <div className="patient-contact-info">
                  <div>
                    <span>Phone Number</span>
                    {patient.phone ? (
                      <a href={`tel:${patient.phone}`}>
                        {patient.phone}
                      </a>
                    ) : (
                      <strong>Not provided</strong>
                    )}
                  </div>

                  <div>
                    <span>Email Address</span>
                    {patient.email ? (
                      <a href={`mailto:${patient.email}`}>
                        {patient.email}
                      </a>
                    ) : (
                      <strong>Not provided</strong>
                    )}
                  </div>
                </div>

                <div className="enquiry-tags">
                  <span className="intent-tag">{patient.intent}</span>
                  <span className="review-tag">{patient.status}</span>
                </div>
              </div>

              <button
                className="open-enquiry"
                onClick={() => {
                  setSelectedMessage(patient);
                  setActivePage('AI Inbox');
                }}
                aria-label={`View ${patient.name} enquiry`}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
          ))
      )}
    </div>
  </section>
  ) : activePage === 'Appointments' ? (
  <section className="panel inbox-panel">
    <div className="panel-heading">
      <div>
        <h3>Appointment Requests</h3>
        <p>Review appointment-related requests received from patients.</p>
      </div>
      <span className="analytics-total">
        {appointmentRequests.length} Requests
      </span>
    </div>

    <div className="enquiry-list">
      {appointmentRequests.filter((item) =>
        `${item.name} ${item.message} ${item.status}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ).length === 0 ? (
        <div className="empty-state">
          <p>No appointment requests found</p>
          <span>Appointment-related enquiries will appear here.</span>
        </div>
      ) : (
        appointmentRequests
          .filter((item) =>
            `${item.name} ${item.message} ${item.status}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((item) => (
            <div className="enquiry-item" key={item.id}>
              <div className="enquiry-details">
                <div className="enquiry-name-row">
                  <strong>{item.name}</strong>
                  <span>{item.time}</span>
                </div>

                <p>{item.message}</p>

                <div className="enquiry-tags">
                  <span className="intent-tag">Appointment Request</span>
                  <span className="review-tag">{item.status}</span>
                </div>
              </div>

              <button
                className="open-enquiry"
                onClick={() => {
                  setSelectedMessage(item);
                  setActivePage('AI Inbox');
                }}
                aria-label={`View ${item.name} enquiry`}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
          ))
      )}
    </div>
  </section>
  ) : activePage === 'Automation' ? (
  <section className="panel inbox-panel">
    <div className="panel-heading">
      <div>
        <h3>Workflow Automation</h3>
        <p>Track AI-powered activities across patient enquiries.</p>
      </div>
      <span className="analytics-total">Live Statistics</span>
    </div>

    <div className="automation-stats-grid">
      <div className="automation-stat-card">
        <span>AI Analyses Completed</span>
        <strong>{automationStats.analyzed}</strong>
        <p>Enquiries analyzed by AI</p>
      </div>

      <div className="automation-stat-card">
        <span>Drafts Generated</span>
        <strong>{automationStats.drafts}</strong>
        <p>AI response drafts created</p>
      </div>

      <div className="automation-stat-card">
        <span>Responses Approved</span>
        <strong>{automationStats.approved}</strong>
        <p>Responses approved by staff</p>
      </div>

      <div className="automation-stat-card">
        <span>Awaiting AI Analysis</span>
        <strong>{automationStats.pending}</strong>
        <p>Enquiries not yet analyzed</p>
      </div>
    </div>

    <div className="panel-heading" style={{ marginTop: '28px' }}>
      <div>
        <h3>Automated Workflow</h3>
        <p>How CareFlow AI processes incoming patient enquiries.</p>
      </div>
    </div>

    <div className="automation-workflow-list">
      <div className="automation-workflow-item">
        <span>01</span>
        <div>
          <strong>Patient Enquiry Received</strong>
          <p>Incoming patient messages are saved in the enquiry system.</p>
        </div>
      </div>

      <div className="automation-workflow-item">
        <span>02</span>
        <div>
          <strong>AI Analysis</strong>
          <p>Gemini analyzes the message and generates an administrative summary.</p>
        </div>
      </div>

      <div className="automation-workflow-item">
        <span>03</span>
        <div>
          <strong>Response Draft Generated</strong>
          <p>An AI-assisted response is prepared for staff review.</p>
        </div>
      </div>

      <div className="automation-workflow-item">
        <span>04</span>
        <div>
          <strong>Staff Review and Approval</strong>
          <p>Staff review and approve the response before sending it.</p>
        </div>
      </div>
    </div>
  </section>
):activePage === 'Settings' ? (
  <div className="settings-page">

    <section className="panel settings-card">
      <div className="settings-card-heading">
        <div>
          <h3>Administrator Profile</h3>
          <p>Manage your clinic administrator details.</p>
        </div>
        <Users size={21} />
      </div>

      <div className="settings-form">
        <label>
          Administrator name
          <input
            type="text"
            value={settings.adminName}
            onChange={(e) =>
              setSettings({ ...settings, adminName: e.target.value })
            }
            placeholder="Enter administrator name"
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) =>
              setSettings({ ...settings, adminEmail: e.target.value })
            }
            placeholder="Enter email address"
          />
        </label>
      </div>
    </section>

    <section className="panel settings-card">
      <div className="settings-card-heading">
        <div>
          <h3>Notification Preferences</h3>
          <p>Choose which notifications you want to receive.</p>
        </div>
        <Bell size={21} />
      </div>

      <label className="settings-toggle">
        <div>
          <strong>Email notifications</strong>
          <p>Receive updates through email.</p>
        </div>
        <input
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={(e) =>
            setSettings({
              ...settings,
              emailNotifications: e.target.checked,
            })
          }
        />
      </label>

      <label className="settings-toggle">
        <div>
          <strong>Enquiry notifications</strong>
          <p>Get notified about incoming patient enquiries.</p>
        </div>
        <input
          type="checkbox"
          checked={settings.enquiryNotifications}
          onChange={(e) =>
            setSettings({
              ...settings,
              enquiryNotifications: e.target.checked,
            })
          }
        />
      </label>
    </section>

    <section className="panel settings-card">
      <div className="settings-card-heading">
        <div>
          <h3>AI Configuration</h3>
          <p>Manage AI assistance preferences.</p>
        </div>
        <Sparkles size={21} />
      </div>

      <label className="settings-toggle">
        <div>
          <strong>AI assistance</strong>
          <p>Enable AI-powered enquiry assistance.</p>
        </div>
        <input
          type="checkbox"
          checked={settings.aiAssistance}
          onChange={(e) =>
            setSettings({
              ...settings,
              aiAssistance: e.target.checked,
            })
          }
        />
      </label>

      <label className="settings-toggle">
        <div>
          <strong>Automatic enquiry analysis</strong>
          <p>Enable automatic AI analysis preferences.</p>
        </div>
        <input
          type="checkbox"
          checked={settings.autoAnalysis}
          onChange={(e) =>
            setSettings({
              ...settings,
              autoAnalysis: e.target.checked,
            })
          }
        />
      </label>
    </section>

    <p className="settings-save-status">
      <CheckCircle2 size={15} />
      Your preferences are saved automatically.
    </p>

  </div>
) : (
  <section className="panel placeholder-panel">
    <div className="placeholder-icon"><Workflow size={28} /></div>
    <h3>{activePage}</h3>
    <p>This module is planned for the next development milestone.</p>
    <span>CareFlow AI · Prototype</span>
  </section>
)}

          
{toast && (
  <div className="toast-message" role="status">
    <CheckCircle2 size={18} />
    <span>{toast}</span>
    <button onClick={() => setToast('')} aria-label="Dismiss">
      <X size={16} />
    </button>
  </div>
)}

{showNewEnquiry && (
  <div
    className="modal-backdrop-custom"
    onClick={() => setShowNewEnquiry(false)}
  >
    <form
      className="enquiry-modal"
      onSubmit={handleCreateEnquiry}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="modal-title-row">
        <div>
          <span className="modal-eyebrow">CAREFLOW AI · INBOX</span>
          <h3>Create new enquiry</h3>
          <p>Add a sample patient message for AI processing.</p>
        </div>
        <button
          type="button"
          className="modal-close"
          onClick={() => setShowNewEnquiry(false)}
        >
          <X size={19} />
        </button>
      </div>

      <label>Patient name</label>
      <input
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
        placeholder="Enter a sample name"
        required
      />

      <label>Incoming message</label>
      <textarea
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        placeholder="Enter a sample enquiry..."
        rows={4}
        required
      />

      <div className="modal-notice">
        <ShieldCheck size={16} />
        Use fictional information only.
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={() => setShowNewEnquiry(false)}
        >
          Cancel
        </button>
        <button type="submit" className="primary-button">
          <Plus size={16} />
          Add enquiry
        </button>
      </div>
    </form>
  </div>
)}
  
          <footer className="footer">
            <span>© 2026 CareFlow AI. All rights reserved.</span>
            <span><ShieldCheck size={14} /> Secure healthcare workflow prototype</span>
          </footer>
        </div>

{/* Floating CareFlow AI Assistant */}
<div className="floating-chatbot">

  {isChatOpen && (
    <section className="floating-chat-window">
      <div className="floating-chat-header">
        <div className="chatbot-brand">
          <img
  className="chatbot-avatar-image"
  src="/images/careflow-robot.png"
  alt="CareFlow AI robot assistant"
/>
          <div>
            <strong>CareFlow Assistant</strong>
            <span><i className="online-dot" /> Online and ready to help</span>
          </div>
        </div>

        <button
          className="chatbot-close"
          onClick={() => setIsChatOpen(false)}
          aria-label="Close chatbot"
        >
          <X size={19} />
        </button>
      </div>

      <div className="chatbot-messages">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role}`}
          >
            <div className="chat-message-content">
              {message.text}
            </div>
          </div>
        ))}

        {isChatLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-content">
              CareFlow AI is typing...
            </div>
          </div>
        )}
      </div>

      <form
        className="chatbot-input-area"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendChatMessage();
        }}
      >
        <input
          type="text"
          placeholder="Ask me anything..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatLoading}
        />

        <button
  type="submit"
  disabled={!chatInput.trim() || isChatLoading}
  aria-label="Send message"
>
  <Send size={18} />
</button>
      </form>

      <p className="chatbot-disclaimer">
        AI assistance only · Not medical advice
      </p>
    </section>
  )}

  <button
    className="chatbot-launcher"
    onClick={() => setIsChatOpen((current) => !current)}
    aria-label="Open CareFlow Assistant"
  >
    <span className="robot-mascot">
      <img
  className="robot-face"
  src="/images/careflow-robot.png"
  alt="Friendly waving CareFlow robot"
/>
    </span>
    <span className="chatbot-launcher-dot" />
  </button>

</div>

      </main>
    </div>
  );
}

export default App;
