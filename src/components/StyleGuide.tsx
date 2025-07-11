import React from "react";

const colors = [
  { name: 'Deep Navy', value: '#0A1F44' },
  { name: 'Bright Accent', value: '#FF5A5F' },
  { name: 'White', value: '#fff' },
];

const StyleGuide = () => (
  <div style={{ background: '#0A1F44', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>Style Guide</h1>
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Color Palette</h2>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {colors.map(c => (
          <div key={c.name} style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: c.value, borderRadius: 12, border: '2px solid #fff', marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </section>
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Typography</h2>
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontFamily: 'Montserrat, var(--font-headline, sans-serif)', fontWeight: 800, fontSize: '2rem' }}>
          Headline: Bold, geometric sans‑serif (Montserrat, 800)
        </span>
      </div>
      <div>
        <span style={{ fontFamily: 'Inter, var(--font-body, sans-serif)', fontWeight: 400, fontSize: '1.1rem' }}>
          Body: Clean sans‑serif (Inter, 400)
        </span>
      </div>
    </section>
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>UI Components</h2>
      <ul style={{ lineHeight: 2 }}>
        <li>Hero (headline, subheadline, CTA, illustration)</li>
        <li>HowItWorks (three columns: Create & Share, Search & Queue, Play in Sync)</li>
        <li>Features (alternating text/image rows)</li>
        <li>Testimonials (carousel)</li>
        <li>CTABanner (full-width call to action)</li>
        <li>Footer (links, copyright)</li>
      </ul>
    </section>
    <section>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Usage</h2>
      <p>See <code>src/app/page.tsx</code> for how these components are composed into the landing page.</p>
    </section>
  </div>
);

export default StyleGuide; 