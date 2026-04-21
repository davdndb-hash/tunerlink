'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Vehicle = {
  id: string
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
  color: string | null
  engine: string | null
  transmission: string | null
  drivetrain: string | null
  ecu_type: string | null
  mods: string[] | null
  goals: string | null
  notes: string | null
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState<any>({
    year: '', make: '', model: '', trim: '', color: '',
    engine: '', transmission: '', drivetrain: '', ecu_type: '',
    mods: '', goals: '', notes: '',
  })

  const loadVehicles = async (uid: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', uid)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setVehicles((data as Vehicle[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/vehicles'
        return
      }
      setUserId(user.id)
      await loadVehicles(user.id)
    }
    init()
  }, [])

  const update = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const resetForm = () => {
    setForm({ year: '', make: '', model: '', trim: '', color: '', engine: '', transmission: '', drivetrain: '', ecu_type: '', mods: '', goals: '', notes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const payload: any = {
      owner_id: userId,
      year: form.year ? parseInt(form.year, 10) : null,
      make: form.make || null,
      model: form.model || null,
      trim: form.trim || null,
      color: form.color || null,
      engine: form.engine || null,
      transmission: form.transmission || null,
      drivetrain: form.drivetrain || null,
      ecu_type: form.ecu_type || null,
      mods: form.mods ? form.mods.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      goals: form.goals || null,
      notes: form.notes || null,
    }

    const res = editingId
      ? await supabase.from('vehicles').update(payload).eq('id', editingId)
      : await supabase.from('vehicles').insert(payload)

    if (res.error) {
      setError(res.error.message)
    } else {
      await loadVehicles(userId)
      resetForm()
    }
  }

  const handleEdit = (v: Vehicle) => {
    setEditingId(v.id)
    setForm({
      year: v.year?.toString() || '',
      make: v.make || '',
      model: v.model || '',
      trim: v.trim || '',
      color: v.color || '',
      engine: v.engine || '',
      transmission: v.transmission || '',
      drivetrain: v.drivetrain || '',
      ecu_type: v.ecu_type || '',
      mods: (v.mods || []).join(', '),
      goals: v.goals || '',
      notes: v.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return
    if (!userId) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) setError(error.message)
    else await loadVehicles(userId)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
      </nav>

      <div style={{ padding: 52 }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Dashboard
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="label-tl">My Garage</div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9 }}>
              Your <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vehicles.</em>
            </h1>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
              + Add Vehicle
            </button>
          )}
        </div>

        {error && <div style={{ marginTop: 24, padding: '12px 16px', border: '1px solid #ff2233', background: 'rgba(255,34,51,0.08)', fontSize: 13, color: '#ff6677' }}>{error}</div>}

        {showForm && (
          <form onSubmit={handleSave} style={{ marginTop: 32, border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <Field label="Year"><input className="input-tl" type="number" min={1900} max={2030} value={form.year} onChange={e => update('year', e.target.value)} required /></Field>
              <Field label="Make"><input className="input-tl" value={form.make} onChange={e => update('make', e.target.value)} required /></Field>
              <Field label="Model"><input className="input-tl" value={form.model} onChange={e => update('model', e.target.value)} required /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <Field label="Trim"><input className="input-tl" value={form.trim} onChange={e => update('trim', e.target.value)} /></Field>
              <Field label="Color"><input className="input-tl" value={form.color} onChange={e => update('color', e.target.value)} /></Field>
              <Field label="Engine"><input className="input-tl" value={form.engine} onChange={e => update('engine', e.target.value)} placeholder="e.g. 2JZ-GTE" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <Field label="Transmission"><input className="input-tl" value={form.transmission} onChange={e => update('transmission', e.target.value)} placeholder="Manual / Auto / DCT" /></Field>
              <Field label="Drivetrain"><input className="input-tl" value={form.drivetrain} onChange={e => update('drivetrain', e.target.value)} placeholder="RWD / AWD / FWD" /></Field>
              <Field label="ECU Type"><input className="input-tl" value={form.ecu_type} onChange={e => update('ecu_type', e.target.value)} placeholder="AEM, Haltech, OEM..." /></Field>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Field label="Mods (comma-separated)"><input className="input-tl" value={form.mods} onChange={e => update('mods', e.target.value)} placeholder="GTX3582, coilovers, catback exhaust" /></Field>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Field label="Goals"><textarea className="input-tl" value={form.goals} onChange={e => update('goals', e.target.value)} rows={3} placeholder="What are you trying to achieve with this car?" style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }} /></Field>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Field label="Notes"><textarea className="input-tl" value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="Anything else shops should know" style={{ resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11 }}>
                {editingId ? 'Save Changes' : 'Add Vehicle'}
              </button>
              <button type="button" onClick={resetForm} className="btn-tl" style={{ padding: '14px 32px', fontSize: 11 }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 32 }}>
          {loading ? (
            <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
          ) : vehicles.length === 0 && !showForm ? (
            <div style={{ border: '1px solid var(--border)', padding: 64, textAlign: 'center', background: 'var(--dark)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🚗</div>
              <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 8 }}>No vehicles yet</h2>
              <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
                Add your car(s) so shops know exactly what&rsquo;s coming in. Spec sheets save everyone time.
              </p>
              <button onClick={() => setShowForm(true)} className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
                + Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {vehicles.map(v => (
                <div key={v.id} style={{ border: '1px solid var(--border)', padding: 24, background: 'var(--dark)' }}>
                  <div style={{ fontWeight: 800, fontSize: 22, textTransform: 'uppercase', marginBottom: 8 }}>
                    {v.year} {v.make} {v.model}
                  </div>
                  {v.trim && <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 12 }}>{v.trim}</div>}
                  <div style={{ fontSize: 13, color: 'var(--lgrey)', lineHeight: 1.9 }}>
                    {v.engine && <div>Engine: {v.engine}</div>}
                    {v.transmission && <div>Transmission: {v.transmission}</div>}
                    {v.drivetrain && <div>Drivetrain: {v.drivetrain}</div>}
                    {v.ecu_type && <div>ECU: {v.ecu_type}</div>}
                  </div>
                  {v.mods && v.mods.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 6 }}>Mods</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {v.mods.map(m => <span key={m} className="tag-tl" style={{ fontSize: 9, padding: '3px 8px' }}>{m}</span>)}
                      </div>
                    </div>
                  )}
                  {v.goals && (
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--black)', fontSize: 13, color: 'var(--lgrey)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#ff2233', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Goals:</strong><br />{v.goals}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => handleEdit(v)} className="btn-tl" style={{ padding: '8px 16px', fontSize: 10 }}>Edit</button>
                    <button onClick={() => handleDelete(v.id)} style={{ padding: '8px 16px', fontSize: 10, background: 'none', border: '1px solid var(--border)', color: 'var(--grey)', cursor: 'pointer', fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {children}
    </label>
  )
}
