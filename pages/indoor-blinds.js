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
  location: '',
  width: '',
  drop: '',
  material: '',
  colour: '',
  control: '',
  brackets: '',
  baseRailColour: '',
  componentColour: '',
  rollDirection: '',
  comments: ''
};

export default function IndoorBlindsForm() {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerState });
  const [windows, setWindows] = useState([{ ...initialWindowState }]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(customerInfo.customerPhone)) {
      alert('❌ Phone must be exactly 10 digits');
      return;
    }

    if (!validateEmail(customerInfo.customerEmail)) {
      alert('❌ Invalid email address');
      return;
    }

    const payload = {
      ...customerInfo,
      windows
    };

    try {
      const response = await fetch('/api/indoor-blinds-proxy', {
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
        setShowPreview(false);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Indoor Blinds Measurement Form</h2>

      <h3>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} style={{ marginBottom: '10px' }}>
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

      <h3>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
          <h4 onClick={() => setExpandedIndex(idx === expandedIndex ? null : idx)} style={{ cursor: 'pointer' }}>
            {expandedIndex === idx ? '🔽' : '▶️'} Window {idx + 1}
          </h4>
          {expandedIndex === idx && (
            <div>
              {[
                'location',
                'width',
                'drop',
                'material',
                'colour',
                'comments'
              ].map(field => (
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

              {/* Dropdowns */}
              {[
                { name: 'control', options: ['Left', 'Right'] },
                {
                  name: 'brackets',
                  options: [
                    'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit', 'Dual Same side',
                    'Dual opposite Side to suit', 'None', 'Single', 'Slim Combo Top Back',
                    'Slim Combo Top Back to suit', 'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                {
                  name: 'baseRailColour',
                  options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
                },
                {
                  name: 'componentColour',
                  options: ['Black Grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  name: 'rollDirection',
                  options: ['Over Roll', 'Standard']
                }
              ].map(({ name, options }) => (
                <div key={name} style={{ marginBottom: '10px' }}>
                  <label>{name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}:</label>
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
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} style={{ marginBottom: '20px' }}>
        ➕ Add Another Window
      </button>

      <button
        type="button"
        onClick={() => setShowPreview(true)}
        style={{
          padding: '12px 20px',
          marginBottom: '10px',
          backgroundColor: 'orange',
          color: '#fff',
          border: 'none',
          fontSize: '16px'
        }}
      >
        Preview Before Submit
      </button>

      <button
        type="submit"
        style={{
          padding: '12px 20px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          fontSize: '16px'
        }}
      >
        Submit
      </button>

      {showPreview && (
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ccc',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3>🔍 Review Your Submission</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify({ ...customerInfo, windows }, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
}
