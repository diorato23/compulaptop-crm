'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Package, Settings, Zap, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads',       icon: Users,           label: 'Leads',       badge: true },
  { href: '/catalog',     icon: Package,         label: 'Catálogo' },
  { href: '/settings',    icon: Settings,        label: 'Configuración' },
]

export default function Sidebar({ newLeads = 0 }: { newLeads?: number }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="mobile-header">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost btn-icon"
          style={{ padding: 6 }}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X size={22} color="var(--text-primary)" /> : <Menu size={22} color="var(--text-primary)" />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={16} color="#38bdf8" />
          <span className="sidebar-logo-text" style={{ fontSize: 14 }}>COMPULAPTOP</span>
        </div>
        <div className="realtime-dot" style={{ fontSize: 10 }}>En vivo</div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer (Desktop permanent + Mobile slide-in) */}
      <aside className={`crm-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Zap size={18} color="#38bdf8" />
              <span className="sidebar-logo-text">COMPULAPTOP</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="btn btn-ghost btn-icon mobile-only-close"
              style={{ display: 'none' }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="sidebar-logo-sub">CRM · Gestión de Clientes</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Principal</div>
          {navItems.map(({ href, icon: Icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${pathname === href ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
              {badge && newLeads > 0 && (
                <span className="sidebar-badge">{newLeads}</span>
              )}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Estado del bot</div>
          <div className="realtime-dot">Activo · Tiempo real</div>
        </div>
      </aside>
    </>
  )
}
