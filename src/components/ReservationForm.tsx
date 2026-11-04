// src/components/ReservationForm.tsx
// Honest demo reservation form: never confirms a booking, never claims an
// email was sent. Falls back to mailto/WhatsApp only.
import { useState } from 'react';

interface Props {
  minParty: number;
  maxParty: number;
  whatsappFallback: boolean;
  emailFallback: string;
  whatsappUrl?: string;
}

export default function ReservationForm({
  minParty,
  maxParty,
  whatsappFallback,
  emailFallback,
  whatsappUrl,
}: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    party: '2',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nombre requerido';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email válido requerido';
    if (!form.phone.trim()) e.phone = 'Teléfono requerido';
    if (!form.date) e.date = 'Fecha requerida';
    if (!form.time) e.time = 'Hora requerida';
    const party = parseInt(form.party);
    if (isNaN(party) || party < minParty || party > maxParty)
      e.party = `Entre ${minParty} y ${maxParty} personas`;
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('submitting');
    // Demo: never actually submits. After a short pause, shows a
    // prepared-request message (never "confirmed", never "email sent").
    setTimeout(() => {
      setStatus('success');
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Generate time slots
  const timeSlots: string[] = [];
  for (let h = 13; h <= 16; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 16 && m > 0) break;
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  for (let h = 20; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 23 && m > 30) break;
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-ground/50 rounded-2xl p-8 border border-secondary/30 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-ink mb-2">
          Solicitud de reserva preparada
        </h3>
        <p className="text-muted mb-2">
          Mesa para {form.party} personas el {form.date} a las {form.time}.
        </p>
        <p className="text-xs text-muted/60 italic mb-6">
          (Demo: ninguna reserva se confirma realmente. En producción, conecta un backend.)
        </p>
        <button
          onClick={() => {
            setStatus('idle');
            setForm({ name: '', email: '', phone: '', date: '', time: '', party: '2', notes: '' });
          }}
          className="mt-4 text-secondary hover:text-secondary/80 text-sm font-medium transition-colors"
        >
          Hacer otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ground/50 p-6 md:p-8 border border-muted/20" noValidate>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="res-name" className="block text-sm text-muted mb-1">
            Nombre *
          </label>
          <input
            id="res-name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink placeholder-muted/50 focus:outline-none focus:ring-2 focus-ring-accent/50 transition-all ${errors.name ? 'border-red-500' : 'border-muted/30'}`}
            placeholder="Tu nombre"
            aria-describedby={errors.name ? 'res-name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p id="res-name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="res-email" className="block text-sm text-muted mb-1">
            Email *
          </label>
          <input
            id="res-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${errors.email ? 'border-red-500' : 'border-muted/30'}`}
            placeholder="tu@email.com"
            aria-describedby={errors.email ? 'res-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p id="res-email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="res-phone" className="block text-sm text-muted mb-1">
            Teléfono *
          </label>
          <input
            id="res-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${errors.phone ? 'border-red-500' : 'border-muted/30'}`}
            placeholder="+34 600 000 000"
            aria-describedby={errors.phone ? 'res-phone-error' : undefined}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p id="res-phone-error" className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="res-party" className="block text-sm text-muted mb-1">
            Personas *
          </label>
          <select
            id="res-party"
            value={form.party}
            onChange={(e) => handleChange('party', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${errors.party ? 'border-red-500' : 'border-muted/30'}`}
            aria-describedby={errors.party ? 'res-party-error' : undefined}
            aria-invalid={!!errors.party}
          >
            {Array.from({ length: maxParty - minParty + 1 }, (_, i) => minParty + i).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'persona' : 'personas'}
              </option>
            ))}
          </select>
          {errors.party && <p id="res-party-error" className="text-red-500 text-xs mt-1">{errors.party}</p>}
        </div>
        <div>
          <label htmlFor="res-date" className="block text-sm text-muted mb-1">
            Fecha *
          </label>
          <input
            id="res-date"
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${errors.date ? 'border-red-500' : 'border-muted/30'}`}
            aria-describedby={errors.date ? 'res-date-error' : undefined}
            aria-invalid={!!errors.date}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && <p id="res-date-error" className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="res-time" className="block text-sm text-muted mb-1">
            Hora *
          </label>
          <select
            id="res-time"
            value={form.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-ground/80 border text-ink focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${errors.time ? 'border-red-500' : 'border-muted/30'}`}
            aria-describedby={errors.time ? 'res-time-error' : undefined}
            aria-invalid={!!errors.time}
          >
            <option value="">Selecciona hora</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p id="res-time-error" className="text-red-500 text-xs mt-1">{errors.time}</p>}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="res-notes" className="block text-sm text-muted mb-1">
          Notas (alergias, celebración, etc.)
        </label>
        <textarea
          id="res-notes"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-ground/80 border border-muted/30 text-ink placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          placeholder="¿Alguna petición especial?"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {status === 'submitting' ? 'Enviando solicitud...' : 'Enviar solicitud de reserva'}
      </button>

      <div className="mt-6 pt-6 border-t border-muted/10 text-center space-y-2">
        {whatsappFallback && whatsappUrl && (
          <p className="text-sm text-muted">
            ¿Prefieres WhatsApp?{' '}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              Reservar por WhatsApp
            </a>
          </p>
        )}
        <p className="text-sm text-muted">
          O envíanos un email a{' '}
          <a
            href={`mailto:${emailFallback}`}
            className="text-secondary hover:text-secondary/80 font-medium transition-colors"
          >
            {emailFallback}
          </a>
        </p>
      </div>
    </form>
  );
}
