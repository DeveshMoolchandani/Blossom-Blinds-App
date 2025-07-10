import { useState } from 'react';

const initialCustomerState = {
  date: new Date().toLocaleDateString('en-GB'),
  time: new Date().toLocaleTimeString(),
  salesRep: '',
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: ''
};

const initialWindowState = {
  roomName: '',
  subcategory: '',
  fabric: '',
  color: '',
  width: '',
  height: '',
  customSplit: '',
  comments: '',
  headingType: '',
  track: '',
  trackColor: '',
  control: '',
  fixing: ''
};

export default function CurtainsForm() {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerState });
  const [windows, setWindows] = useState([{ ...initialWindowState }]);
  const [loading, setLoading] = useState(false);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows([...windows, { ...initialWindowState }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...customerInfo,
      windows
    };

    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully');
        setCustomerInfo({ ...initialCustomerState });
        setWindows([{ ...initialWindowState }]);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Curtains Measurement Form</h2>

      <h3>Customer Info</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
          <div key={field} style={{ flex: '1 1 300px', marginBottom: '10px' }}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <input
              type="text"
              name={field}
              value={customerInfo[field]}
              onChange={handleCustomerChange}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
        ))}
      </div>

      <h3>Window Measurements</h3>
      {windows.map((window, idx) => (
        <details key={idx} open style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '15px' }}>
          <summary style={{ fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}>🪟 Window {idx + 1}</summary>

          {['roomName', 'subcategory', 'fabric', 'color', 'width', 'height', 'customSplit', 'comments'].map(field => (
            <div key={field} style={{ marginBottom: '10px' }}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type="text"
                name={field}
                value={window[field]}
                onChange={(e) => handleWindowChange(idx, e)}
                style={{ width: '100%', padding: '8px' }}
                required={field !== 'comments'}
              />
            </div>
          ))}

          {[{ name: 'headingType', options: ['Double Pinch Pleat', 'Wave Fold (S-fold)'] },
            { name: 'track', options: ['Normal', 'Designer'] },
            { name: 'trackColor', options: ['Black', 'White', 'Anodised Silver', 'N/A'] },
            { name: 'control', options: ['Centre Opening', 'Full Right', 'Full Left'] },
            { name: 'fixing', options: ['Top Fix', 'Double Extension Face Fix', 'Double Face Fix', 'Single Face Fix'] }
          ].map(({ name, options }) => (
            <div key={name} style={{ marginBottom: '10px' }}>
              <label>{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
              <select
                name={name}
                value={window[name]}
                onChange={(e) => handleWindowChange(idx, e)}
                required
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">-- Select --</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </details>
      ))}

      <button
        type="button"
        onClick={addWindow}
        style={{
          marginBottom: '20px',
          padding: '10px 15px',
          backgroundColor: '#e0e0e0',
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
      >
        ➕ Add Another Window
      </button>

      <div style={{ position: 'sticky', bottom: 0, background: '#fff', paddingTop: '10px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading ? '#999' : '#0070f3',
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            borderRadius: '5px'
          }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
