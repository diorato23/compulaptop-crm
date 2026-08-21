'use client'
import Sidebar from '@/components/Sidebar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, ExternalLink, Package } from 'lucide-react'

interface Product {
  id: number
  titulo: string
  marca: string
  modelo: string
  numero_parte: string
  preco_cop: number
  status: string
  estoque: number
  url_ml: string
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [marca, setMarca] = useState('')
  const [marcas, setMarcas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('mercadolibre_catalogo').select('*').eq('status', 'Ativo').order('marca')
      if (data) {
        setProducts(data as Product[])
        const ms = Array.from(new Set(data.map((p: any) => p.marca).filter(Boolean))).sort() as string[]
        setMarcas(ms)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.titulo.toLowerCase().includes(q) || p.numero_parte?.toLowerCase().includes(q) || p.modelo?.toLowerCase().includes(q)
    const matchMarca = !marca || p.marca === marca
    return matchSearch && matchMarca
  })

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Catálogo</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{products.length.toLocaleString()} productos disponibles</div>
          </div>
        </header>
        <main className="crm-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Catálogo de Productos</h1>
              <p className="page-sub">Repuestos originales para portátiles y servidores</p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <div className="search-wrap" style={{ maxWidth: 320 }}>
              <Search size={14} />
              <input className="input" placeholder="Buscar por título, parte o modelo..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select" value={marca} onChange={e => setMarca(e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{filtered.length} resultados</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={40} />
              <p>Sin resultados para "{search}"</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {filtered.slice(0, 100).map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-card-brand">{p.marca}</div>
                  <div className="product-card-title">{p.titulo}</div>
                  <div className="product-card-part">#{p.numero_parte}</div>
                  <div className="product-card-price">{fmt(p.preco_cop)}</div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="chip" style={{ color: p.estoque > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {p.estoque > 0 ? `${p.estoque} en stock` : 'Sin stock'}
                    </span>
                    {p.url_ml && (
                      <a href={p.url_ml} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm btn-icon">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length > 100 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Mostrando 100 de {filtered.length} resultados. Refina tu búsqueda para ver más.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
