'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Package, Settings, Zap } from 'lucide-react'

const navItems = [
  { href: '/',        icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads',   icon: Users,           label: 'Leads',    badge: true },
  { href: '/catalog', icon: Package,         label: 'Catálogo' },
  { href: '/settings',icon: Settings,        label: 'Configuración' },
]

export default function Sidebar({ newLeads = 0 }: { newLeads?: number }) {
  const pathname = usePathname()

  return (
    <aside className="crm-sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <Zap size={18} color="#38bdf8" />
          <span className="sidebar-logo-text">COMPULAPTOP</span>
        </div>
        <div className="sidebar-logo-sub">CRM · Gestión de Clientes</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Principal</div>
        {navItems.map(({ href, icon: Icon, label, badge }) => (
          <Link
            key={href}
            href={href}
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
  )
}
