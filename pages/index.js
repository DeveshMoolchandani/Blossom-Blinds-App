import Link from 'next/link';

export default function Dashboard() {
  const categories = [
    { name: 'Indoor Blinds', path: '/indoor-blinds' },
    { name: 'Outdoor Blinds', path: '/outdoor-blinds' },
    { name: 'Plantation Shutters', path: '/plantation-shutters' },
    { name: 'Roller Shutters', path: '/roller-shutters' },
    { name: 'Curtains', path: '/curtains' },
    { name: 'Security Doors', path: '/security-doors' },
    { name: 'Fly Screens', path: '/fly-screens' }
  ];

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Product Dashboard</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {categories.map((cat) => (
          <Link key={cat.path} href={cat.path} legacyBehavior>
            <a style={{
              display: 'block',
              border: '1px solid #ccc',
              padding: '1.5rem',
              borderRadius: '8px',
              background: '#f5f5f5',
              textDecoration: 'none',
              color: 'black',
              fontWeight: 'bold'
            }}>
              {cat.name}
            </a>
          </Link>
        ))}
      </div>
    </main>
  );
}
