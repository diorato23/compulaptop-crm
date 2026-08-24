'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import {
  Megaphone, MessageCircle, Users, Zap,
  BarChart2, CheckCircle, ArrowRight, Info, DollarSign,
  TrendingUp, Target, Bot, FileText, ChevronDown, ChevronUp
} from 'lucide-react'

/* ──────────────────────────────────────────────
   COST CALCULATOR COMPONENT
   ────────────────────────────────────────────── */
function CostCalculator() {
  const [clicks, setClicks] = useState(500)
  const [cpc, setCpc] = useState(0.8)
  const [convRate, setConvRate] = useState(15)
  const [templateDays, setTemplateDays] = useState(3)

  const budget = clicks * cpc
  const conversations = Math.round(clicks * (convRate / 100))
  const freeWindow = conversations                     // 72h window = free (business-initiated)
  const extraTemplates = Math.max(0, templateDays - 3) * conversations
  const templateCost = extraTemplates * 0.038
  const costPerLead = conversations > 0 ? (budget + templateCost) / conversations : 0
  const closedSales = Math.round(conversations * 0.12)   // ~12% close rate
  const revenueEstimate = closedSales * 350               // avg ticket USD

  return (
    <div className="calc-card">
      <div className="calc-header">
        <DollarSign size={18} color="#10b981" />
        <span>Calculadora de Costos WhatsApp Ads</span>
        <span className="calc-badge">Más Barato</span>
      </div>

      <div className="calc-grid">
        {/* Inputs */}
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Clics en el anuncio</label>
            <div className="calc-slider-row">
              <input type="range" min={100} max={5000} step={50}
                value={clicks} onChange={e => setClicks(+e.target.value)}
                className="calc-slider" />
              <span className="calc-val">{clicks.toLocaleString()}</span>
            </div>
          </div>

          <div className="calc-field">
            <label>CPC promedio (USD)</label>
            <div className="calc-slider-row">
              <input type="range" min={0.3} max={3} step={0.1}
                value={cpc} onChange={e => setCpc(+e.target.value)}
                className="calc-slider" />
              <span className="calc-val">${cpc.toFixed(2)}</span>
            </div>
          </div>

          <div className="calc-field">
            <label>% de clics que inician conversación</label>
            <div className="calc-slider-row">
              <input type="range" min={5} max={60} step={1}
                value={convRate} onChange={e => setConvRate(+e.target.value)}
                className="calc-slider" />
              <span className="calc-val">{convRate}%</span>
            </div>
          </div>

          <div className="calc-field">
            <label>Días de seguimiento con templates</label>
            <div className="calc-slider-row">
              <input type="range" min={1} max={30} step={1}
                value={templateDays} onChange={e => setTemplateDays(+e.target.value)}
                className="calc-slider" />
              <span className="calc-val">{templateDays}d</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="calc-results">
          <div className="calc-result-item blue">
            <div className="calc-result-label">Inversión en Meta Ads</div>
            <div className="calc-result-val">${budget.toFixed(0)} <span>USD/mes</span></div>
          </div>
          <div className="calc-result-item green">
            <div className="calc-result-label">Conversaciones WhatsApp</div>
            <div className="calc-result-val">{conversations} <span>contactos</span></div>
            <div className="calc-result-note">72h gratis por conversación iniciada por anuncio</div>
          </div>
          <div className="calc-result-item yellow">
            <div className="calc-result-label">Costo templates adicionales</div>
            <div className="calc-result-val">${templateCost.toFixed(2)} <span>USD</span></div>
            <div className="calc-result-note">≈ COP {(templateCost * 4200).toLocaleString('es-CO')}</div>
          </div>
          <div className="calc-result-item purple">
            <div className="calc-result-label">Costo por Lead</div>
            <div className="calc-result-val">${costPerLead.toFixed(2)} <span>USD/lead</span></div>
          </div>
          <div className="calc-result-divider" />
          <div className="calc-result-item green" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
            <div className="calc-result-label">Ventas estimadas (12% cierre)</div>
            <div className="calc-result-val" style={{ color: '#10b981' }}>{closedSales} <span>ventas</span></div>
            <div className="calc-result-note">≈ ${revenueEstimate.toLocaleString()} USD en ingresos</div>
          </div>
        </div>
      </div>

      <div className="calc-tip">
        <Info size={13} />
        <span>
          <strong>Estrategia más barata:</strong> Usa Meta Ads con Click-to-WhatsApp + Evolution API.
          La ventana de 72h gratuita cubre toda la conversación inicial.
          Solo pagas templates si el lead no responde y necesitas reactivar después de 72h.
          COP ~150 por template de marketing (≈ USD $0.038).
        </span>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   STEP CARD
   ────────────────────────────────────────────── */
function StepCard({ num, icon: Icon, color, title, children }: {
  num: number, icon: any, color: string, title: string, children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="step-card" style={{ '--step-color': color } as React.CSSProperties}>
      <div className="step-card-header" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <div className="step-num" style={{ background: color + '22', color }}>
          <Icon size={16} />
        </div>
        <div className="step-title-row">
          <span className="step-num-label" style={{ color }}>Paso {num}</span>
          <span className="step-title">{title}</span>
        </div>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </div>
      {open && <div className="step-body">{children}</div>}
    </div>
  )
}

/* ──────────────────────────────────────────────
   PRICING TABLE
   ────────────────────────────────────────────── */
function PricingRow({ label, value, note, highlight }: { label: string, value: string, note?: string, highlight?: boolean }) {
  return (
    <div className={`pricing-row ${highlight ? 'highlight' : ''}`}>
      <div className="pricing-label">{label}</div>
      <div className="pricing-right">
        <div className="pricing-val">{value}</div>
        {note && <div className="pricing-note">{note}</div>}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export default function PublicidadPage() {
  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Publicidad & Ads</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Integración Meta Ads → WhatsApp → CRM</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <a
              href="https://www.facebook.com/adsmanager"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}
            >
              Abrir Meta Ads Manager
            </a>
          </div>
        </header>

        <main className="crm-content" style={{ paddingBottom: 40 }}>

          {/* Hero Banner */}
          <div className="ads-hero">
            <div className="ads-hero-content">
              <div className="ads-hero-badge">
                <Zap size={12} />
                Guía de Integración Completa
              </div>
              <h1 className="ads-hero-title">
                Publicidad en WhatsApp<br />
                <span>al menor costo posible</span>
              </h1>
              <p className="ads-hero-sub">
                Conecta Meta Ads con Evolution API y tu CRM para capturar leads automáticamente,
                responder al instante con IA y cerrar ventas sin perder ningún contacto.
              </p>
              <div className="ads-hero-stats">
                <div className="ads-stat">
                  <div className="ads-stat-val" style={{ color: '#10b981' }}>72h</div>
                  <div className="ads-stat-label">gratis por conversación</div>
                </div>
                <div className="ads-stat-divider" />
                <div className="ads-stat">
                  <div className="ads-stat-val" style={{ color: '#38bdf8' }}>~$0.80</div>
                  <div className="ads-stat-label">costo por clic promedio</div>
                </div>
                <div className="ads-stat-divider" />
                <div className="ads-stat">
                  <div className="ads-stat-val" style={{ color: '#a855f7' }}>COP 150</div>
                  <div className="ads-stat-label">por template marketing</div>
                </div>
              </div>
            </div>
            <div className="ads-hero-visual">
              <div className="flow-visual">
                {[
                  { icon: Megaphone, label: 'Meta Ads', color: '#1877F2' },
                  { icon: MessageCircle, label: 'WhatsApp', color: '#25D366' },
                  { icon: Bot, label: 'Evolution IA', color: '#38bdf8' },
                  { icon: Users, label: 'CRM Lead', color: '#a855f7' },
                ].map((item, i) => (
                  <div key={i} className="flow-node-wrap">
                    <div className="flow-node" style={{ '--node-color': item.color } as React.CSSProperties}>
                      <item.icon size={20} color={item.color} />
                      <span>{item.label}</span>
                    </div>
                    {i < 3 && <ArrowRight size={14} color="var(--text-muted)" className="flow-arrow" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator */}
          <CostCalculator />



          {/* Steps */}
          <div className="section-title-row" style={{ marginTop: 32 }}>
            <Target size={16} color="#38bdf8" />
            <h2>Paso a Paso de Integración</h2>
          </div>

          <div className="steps-list">
            <StepCard num={1} icon={Megaphone} color="#1877F2" title="Configurar Anuncios en Meta Ads Manager">
              <ul className="step-list">
                <li>Crea una <strong>campaña de Mensajes</strong> (objetivo: Mensajes).</li>
                <li>En "Lugar para recibir mensajes" selecciona <strong>WhatsApp</strong>.</li>
                <li>Define público, presupuesto y creatividad (imagen del laptop con precio).</li>
                <li>El botón de acción será <strong>"Enviar mensaje en WhatsApp"</strong>.</li>
                <li>Agrega un mensaje de saludo automático pre-llenado (ej: <em>"Hola, quiero información sobre laptops"</em>).</li>
              </ul>
              <div className="step-tip">
                <CheckCircle size={13} color="#10b981" />
                <span><strong>Consejo:</strong> Usa creatividades con video de 15s. El CPM suele ser 40% más bajo y el CTR mayor.</span>
              </div>
            </StepCard>

            <StepCard num={2} icon={MessageCircle} color="#25D366" title="Integración con Evolution API">
              <ul className="step-list">
                <li>El clic del anuncio abre una conversación directa en tu número WhatsApp Business.</li>
                <li>Evolution API entrega el evento <code>MESSAGES_UPSERT</code> al webhook de tu n8n.</li>
                <li>Puedes identificar leads de anuncios por el campo <code>body.contextInfo.forwardingScore</code> o usando UTM en el link del anuncio.</li>
                <li>Configura el webhook de Evolution para enviar los eventos al endpoint: <code>/api/webhook</code> de este CRM.</li>
              </ul>
              <div className="step-code">
                <span className="step-code-label">Endpoint webhook Evolution → CRM</span>
                <code>POST https://tu-crm.vercel.app/api/webhook</code>
              </div>
            </StepCard>

            <StepCard num={3} icon={Users} color="#a855f7" title="Captura Automática de Leads en el CRM">
              <ul className="step-list">
                <li>Cada conversación nueva crea automáticamente un <strong>Lead en "Nuevo"</strong>.</li>
                <li>Campos capturados: número, nombre (pushName), mensaje inicial.</li>
                <li>Puedes marcar leads de anuncios con la etiqueta <strong>"Ads"</strong> usando el campo <code>source</code> en la tabla leads.</li>
                <li>El dashboard mostrará métricas de CPL (Costo por Lead) y CPV (Costo por Venta).</li>
              </ul>
            </StepCard>

            <StepCard num={4} icon={Bot} color="#38bdf8" title="Automatización de Respuesta Inicial">
              <ul className="step-list">
                <li>La IA (n8n + Gemini) responde <strong>automáticamente</strong> en segundos.</li>
                <li>Dentro de la ventana de <strong>72h gratuita</strong>, todas las respuestas son sin costo.</li>
                <li>Configura un template aprobado por WhatsApp para reactivar leads fríos después de 72h.</li>
                <li>Ejemplo de template: <em>"¡Hola [nombre]! 👋 Vimos que estabas interesado en laptops. ¿Aún buscas opciones? Te enviamos las mejores ofertas de hoy."</em></li>
              </ul>
              <div className="step-tip">
                <Info size={13} color="#38bdf8" />
                <span>El template debe estar aprobado por Meta con al menos 24h de anticipación. Costo: ~COP 150 por envío.</span>
              </div>
            </StepCard>

            <StepCard num={5} icon={FileText} color="#f59e0b" title="Flujo de Cotización y Cierre de Ventas">
              <ul className="step-list">
                <li>Cuando el lead avanza, n8n puede <strong>generar PDF de cotización</strong> automáticamente.</li>
                <li>Enviar link de pago (PayPal, Bancolombia PSE, Nequi).</li>
                <li>El CRM actualiza el estado a <strong>"Cotización Enviada"</strong> → <strong>"Venta Cerrada"</strong>.</li>
                <li>Notificación al equipo de ventas vía WhatsApp cuando hay una venta.</li>
              </ul>
            </StepCard>

            <StepCard num={6} icon={BarChart2} color="#ef4444" title="Métricas y ROI en el Dashboard">
              <ul className="step-list">
                <li>El dashboard del CRM ya muestra leads por día y tasa de conversión.</li>
                <li>Agrega el campo <code>source</code> en leads para filtrar por <strong>Ads vs Orgánico</strong>.</li>
                <li>Calcula <strong>CPL</strong> = inversión Ads ÷ leads totales del período.</li>
                <li>Calcula <strong>ROAS</strong> = ingresos generados ÷ inversión en Ads.</li>
                <li>Meta: CPL menor a USD $3 y ROAS mayor a 4x son resultados excelentes.</li>
              </ul>
              <div className="step-tip">
                <TrendingUp size={13} color="#10b981" />
                <span>Con la automatización de IA activa, un solo agente puede manejar 200+ leads simultáneos.</span>
              </div>
            </StepCard>
          </div>

          {/* Bottom CTA */}
          <div className="ads-cta">
            <div className="ads-cta-text">
              <h3>¿Listo para lanzar tu primera campaña?</h3>
              <p>La estrategia más barata: Meta Ads + Evolution API auto-hospedado + n8n open source = <strong>USD ~$10/mes de infraestructura</strong> + inversión en ads.</p>
            </div>
            <div className="ads-cta-actions">
              <a href="https://www.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Megaphone size={14} />
                Meta Ads Manager
              </a>
              <a href="/leads" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                <Users size={14} />
                Ver Leads Actuales
              </a>
            </div>
          </div>

        </main>
      </div>

      <style>{`
        /* ── HERO ── */
        .ads-hero {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          margin-bottom: 24px;
          overflow: hidden;
          position: relative;
        }
        .ads-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1877F2, #25D366, #38bdf8, #a855f7);
        }
        .ads-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #38bdf8;
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 99px;
          padding: 4px 12px;
          margin-bottom: 16px;
        }
        .ads-hero-title {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }
        .ads-hero-title span {
          background: linear-gradient(135deg, #38bdf8, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ads-hero-sub {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 480px;
        }
        .ads-hero-stats {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .ads-stat-val {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .ads-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .ads-stat-divider {
          width: 1px;
          height: 32px;
          background: var(--border);
        }

        /* ── FLOW VISUAL ── */
        .ads-hero-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flow-visual {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .flow-node-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .flow-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: border-color 0.2s;
          min-width: 72px;
        }
        .flow-node:hover { border-color: var(--node-color, #38bdf8); }

        /* ── CALCULATOR ── */
        .calc-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 24px;
        }
        .calc-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .calc-badge {
          margin-left: auto;
          background: rgba(16,185,129,0.15);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .calc-field {
          margin-bottom: 16px;
        }
        .calc-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }
        .calc-slider-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .calc-slider {
          flex: 1;
          height: 4px;
          border-radius: 99px;
          background: var(--bg-elevated);
          outline: none;
          appearance: none;
          cursor: pointer;
          accent-color: #38bdf8;
        }
        .calc-val {
          font-size: 14px;
          font-weight: 700;
          color: #38bdf8;
          min-width: 64px;
          text-align: right;
        }
        .calc-results { display: flex; flex-direction: column; gap: 10px; }
        .calc-result-item {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
        }
        .calc-result-item.blue  { border-color: rgba(56,189,248,0.2); }
        .calc-result-item.green { border-color: rgba(16,185,129,0.2); }
        .calc-result-item.yellow{ border-color: rgba(245,158,11,0.2); }
        .calc-result-item.purple{ border-color: rgba(168,85,247,0.2); }
        .calc-result-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }
        .calc-result-val {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }
        .calc-result-val span { font-size: 12px; font-weight: 400; color: var(--text-muted); }
        .calc-result-note { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .calc-result-divider { height: 1px; background: var(--border); }
        .calc-tip {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 20px;
          padding: 12px 16px;
          background: rgba(56,189,248,0.06);
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .calc-tip svg { flex-shrink: 0; margin-top: 1px; color: #38bdf8; }

        /* ── PRICING TABLE ── */
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .section-title-row h2 {
          font-size: 16px;
          font-weight: 700;
        }
        .pricing-table {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 24px;
        }
        .pricing-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 20px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          gap: 16px;
        }
        .pricing-row:last-child { border-bottom: none; }
        .pricing-row:hover { background: var(--bg-elevated); }
        .pricing-row.highlight { background: rgba(16,185,129,0.06); }
        .pricing-label {
          font-size: 13px;
          color: var(--text-secondary);
          flex: 1;
        }
        .pricing-right { text-align: right; }
        .pricing-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .pricing-row.highlight .pricing-val { color: #10b981; }
        .pricing-note {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        /* ── STEPS ── */
        .steps-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .step-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .step-card:hover { border-color: var(--border-light); }
        .step-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          user-select: none;
        }
        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-title-row { flex: 1; }
        .step-num-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .step-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .step-body {
          padding: 0 20px 20px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .step-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .step-list li {
          font-size: 13px;
          color: var(--text-secondary);
          padding-left: 16px;
          position: relative;
          line-height: 1.5;
        }
        .step-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--text-muted);
          font-size: 11px;
        }
        .step-list strong { color: var(--text-primary); }
        .step-list code {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 6px;
          font-family: monospace;
          font-size: 12px;
          color: #38bdf8;
        }
        .step-tip {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(56,189,248,0.06);
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .step-tip svg { flex-shrink: 0; margin-top: 1px; }
        .step-code {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-top: 8px;
        }
        .step-code-label {
          display: block;
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .step-code code {
          font-family: monospace;
          font-size: 13px;
          color: #10b981;
        }

        /* ── CTA ── */
        .ads-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(135deg, rgba(56,189,248,0.08), rgba(168,85,247,0.08));
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: var(--radius);
          padding: 28px 32px;
        }
        .ads-cta-text h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .ads-cta-text p {
          font-size: 13px;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.5;
        }
        .ads-cta-text strong { color: #10b981; }
        .ads-cta-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .ads-hero { grid-template-columns: 1fr; }
          .ads-hero-visual { display: none; }
          .calc-grid { grid-template-columns: 1fr; }
          .ads-cta { flex-direction: column; }
          .ads-hero-stats { flex-wrap: wrap; gap: 12px; }
        }
      `}</style>
    </div>
  )
}
