import React from 'react';

interface Section {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const sections: Section[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📝' },
  { id: 'cpm-diagram', label: 'CPM Analysis', icon: '📊' },
  // Future expandable
  // { id: "finance", label: "Finances", icon: "📈" },
  // { id: "settings", label: "Settings", icon: "⚙️" },
];

function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <aside
      style={{
        width: '220px',
        background: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        padding: '1rem',
        height: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '1.5rem' }}
      >
        📁 Project Panel
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={`btn ${activeSection === sec.id ? 'active' : 'outline'}`}
            style={{
              justifyContent: 'flex-start',
              padding: '0.5rem 0.75rem',
              width: '100%',
              fontWeight: activeSection === sec.id ? '600' : '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onClick={() => setActiveSection(sec.id)}
          >
            <span>{sec.icon}</span>
            {sec.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
