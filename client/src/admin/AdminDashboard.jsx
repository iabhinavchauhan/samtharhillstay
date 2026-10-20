import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Home,
  Building2,
  Utensils,
  Palette,
  Image as ImageIcon,
  Menu,
  Globe,
  Users,
  History,
  Inbox,
  Eye,
  Save,
  Send,
  LogOut,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Settings,
  CreditCard
} from 'lucide-react';
import { useAuth } from './AuthContext';
import AdminLogin from './AdminLogin';
import MediaLibrary from './MediaLibrary';
import ThemeCustomizer from './ThemeCustomizer';
import HomepageEditor from './HomepageEditor';
import HomestayManager from './HomestayManager';
import NavFooterSeoManager from './NavFooterSeoManager';
import RevisionBackup from './RevisionBackup';
import UserManagement from './UserManagement';
import InquiriesManager from './InquiriesManager';
import LivePreviewModal from './LivePreviewModal';
import PaymentGatewaySettings from './PaymentGatewaySettings';

export default function AdminDashboard() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState(null);
  const [publishedContent, setPublishedContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);

  // Status & action state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchDraftData = async () => {
    try {
      setLoadingContent(true);
      const res = await fetch('/api/admin/content/draft', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent(data.draft);
      setPublishedContent(data.published);
      setHasUnsavedChanges(false);
    } catch (err) {
      showToast(err.message || 'Failed to load content', 'error');
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDraftData();
    }
  }, [isAuthenticated]);

  // Handle local content modifications
  const handleContentChange = (updated) => {
    setContent(updated);
    setHasUnsavedChanges(true);
  };

  // Save Draft to Server
  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/content/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setHasUnsavedChanges(false);
      showToast('Draft changes saved securely to database!');
    } catch (err) {
      showToast(err.message || 'Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish to Live Website
  const handlePublish = async () => {
    if (!content) return;
    setIsPublishing(true);
    try {
      const note = window.prompt('Optional: Enter a brief note describing this publication update:', 'Content & design update');
      const res = await fetch('/api/admin/content/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: content, note: note || 'Published website update' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPublishedContent(content);
      setHasUnsavedChanges(false);
      showToast('🚀 Changes published live! All website visitors can see updates now.');
    } catch (err) {
      showToast(err.message || 'Failed to publish changes', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07130e] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#caa34b] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying Administrator Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={fetchDraftData} />;
  }

  const navMenuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'homepage', label: 'Homepage Sections', icon: Home },
    { id: 'homestays', label: 'Homestays & Pricing', icon: Building2 },
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'nav-footer', label: 'Header, Footer & SEO', icon: Menu },
    { id: 'inquiries', label: 'Guest Inquiries & Leads', icon: Inbox },
    { id: 'payments', label: 'Payments & Gateway', icon: CreditCard },
    { id: 'users', label: 'Admin Accounts', icon: Users },
    { id: 'revisions', label: 'Revisions & Backups', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#07130e] text-white flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="h-16 bg-[#0d1f17] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 group"
            title="View public live site"
          >
            <div className="w-8 h-8 rounded-lg bg-[#caa34b]/20 border border-[#caa34b]/40 text-[#caa34b] font-bold flex items-center justify-center text-sm">
              S
            </div>
            <span className="font-bold text-sm tracking-wide hidden sm:inline">Samthar CMS</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition" />
          </a>

          {hasUnsavedChanges && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
              Unsaved Draft Changes
            </span>
          )}
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#caa34b]" />
            <span className="hidden sm:inline">Live Preview</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3 sm:px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-3.5 sm:px-4 py-1.5 bg-[#caa34b] hover:bg-[#d8b85e] active:scale-95 text-[#10281e] text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <button
            onClick={logout}
            className="p-1.5 sm:px-3 sm:py-1.5 text-white/50 hover:text-white hover:bg-white/10 text-xs font-medium rounded-xl flex items-center gap-1.5 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-[#0a1711] border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
              Management Portal
            </p>
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#caa34b] text-[#10281e] shadow-md'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="bg-[#10281e] p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#caa34b]/20 text-[#caa34b] font-bold flex items-center justify-center text-xs">
                {(user?.name || user?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || user?.username}</p>
                <p className="text-[10px] text-white/50 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden flex overflow-x-auto bg-[#0a1711] border-b border-white/10 p-2 gap-1 shrink-0">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-[#caa34b] text-[#10281e]' : 'text-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050d09]">
          <div className="max-w-6xl mx-auto">
            {loadingContent ? (
              <div className="py-24 text-center text-white/40 text-sm">
                Fetching website configurations from database...
              </div>
            ) : content ? (
              <>
                {/* 1. OVERVIEW DASHBOARD */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#10281e] to-[#0a1711] p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                      <div className="relative z-10 max-w-2xl space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#caa34b]">
                          Live Control Center
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                          Welcome, {user?.name || user?.username}
                        </h1>
                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                          You have complete administrative authority over every editable element across the Samthar website. Make edits, preview changes in desktop/mobile modes, and publish them instantly without touching code.
                        </p>

                        <div className="pt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => setActiveTab('homepage')}
                            className="px-4 py-2 bg-[#caa34b] text-[#10281e] font-bold text-xs rounded-xl hover:bg-[#d8b85e] transition"
                          >
                            Edit Homepage
                          </button>
                          <button
                            onClick={() => setActiveTab('homestays')}
                            className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition"
                          >
                            Manage Stays & Prices
                          </button>
                          <button
                            onClick={() => setPreviewOpen(true)}
                            className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition"
                          >
                            Open Live Preview
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div
                        onClick={() => setActiveTab('homestays')}
                        className="bg-[#10281e] p-5 rounded-2xl border border-white/10 cursor-pointer hover:border-[#caa34b]/50 transition group"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-[#caa34b] transition">
                          Homestay Offerings
                        </p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {content.homestays?.length || 0}
                        </p>
                        <p className="text-[11px] text-[#caa34b] mt-1">Live & Bookable (Click to manage)</p>
                      </div>

                      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                          Active Sections
                        </p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {content.homepage?.sectionsOrder?.length || 9}
                        </p>
                        <p className="text-[11px] text-emerald-400 mt-1">Modular & Reorderable</p>
                      </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        onClick={() => setActiveTab('theme')}
                        className="p-5 bg-[#10281e] hover:bg-[#132c21] rounded-2xl border border-white/10 cursor-pointer transition space-y-2 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#caa34b]/20 text-[#caa34b] flex items-center justify-center">
                          <Palette className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-[#caa34b] transition">
                          Visual Colors & Styles
                        </h3>
                        <p className="text-xs text-white/60">
                          Instant global styling engine: alter forest brand tones, gold accents, and font faces.
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveTab('media')}
                        className="p-5 bg-[#10281e] hover:bg-[#132c21] rounded-2xl border border-white/10 cursor-pointer transition space-y-2 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
                          Persistent Media Storage
                        </h3>
                        <p className="text-xs text-white/60">
                          Upload high-resolution photography, manage banners, and replace section visuals.
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveTab('revisions')}
                        className="p-5 bg-[#10281e] hover:bg-[#132c21] rounded-2xl border border-white/10 cursor-pointer transition space-y-2 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <History className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-purple-400 transition">
                          Snapshots & Audit Revisions
                        </h3>
                        <p className="text-xs text-white/60">
                          Every published change is safely version-controlled. Restore any prior state in 1 click.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HOMEPAGE BUILDER */}
                {activeTab === 'homepage' && (
                  <HomepageEditor content={content} onChange={handleContentChange} />
                )}

                {/* 3. HOMESTAYS & PRICING */}
                {activeTab === 'homestays' && (
                  <HomestayManager content={content} onChange={handleContentChange} />
                )}

                {/* 6. THEME & COLORS */}
                {activeTab === 'theme' && (
                  <ThemeCustomizer
                    theme={content.theme || {}}
                    onChange={(newTheme) => handleContentChange({ ...content, theme: newTheme })}
                    onReset={() => {
                      const defaultTheme = {
                        primaryColor: '#10281e',
                        primaryDark: '#0b1d15',
                        accentGold: '#caa34b',
                        accentGoldHover: '#d8b85e',
                        backgroundColor: '#faf8f1',
                        textColor: '#1b2b22',
                        fontFamily: 'Inter, sans-serif',
                        displayFont: 'DM Sans, system-ui, sans-serif',
                        borderRadius: '20px',
                        buttonRadius: '10px'
                      };
                      handleContentChange({ ...content, theme: defaultTheme });
                    }}
                  />
                )}

                {/* 7. MEDIA LIBRARY */}
                {activeTab === 'media' && <MediaLibrary />}

                {/* 8. NAV, FOOTER, SEO */}
                {activeTab === 'nav-footer' && (
                  <NavFooterSeoManager content={content} onChange={handleContentChange} />
                )}

                {/* 9. INQUIRIES & LEADS */}
                {activeTab === 'inquiries' && <InquiriesManager />}

                {/* 10. PAYMENTS & GATEWAY */}
                {activeTab === 'payments' && <PaymentGatewaySettings />}

                {/* 11. USER ACCOUNTS */}
                {activeTab === 'users' && <UserManagement />}

                {/* 12. REVISIONS & BACKUP */}
                {activeTab === 'revisions' && (
                  <RevisionBackup onRestoreSuccess={fetchDraftData} />
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        previewData={content}
        onPublish={handlePublish}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-slideUp ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-500/50 text-red-200'
              : 'bg-[#10281e] border-[#caa34b]/50 text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#caa34b]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

