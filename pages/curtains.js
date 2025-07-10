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
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Curtains Measurement Form</h2>

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
          <h4>Window {idx + 1}</h4>
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
        </div>
      ))}

      <button type="button" onClick={addWindow} style={{ marginBottom: '20px' }}>
        ➕ Add Another Window
      </button>

      <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', fontSize: '16px' }}>
        Submit
      </button>
    </form>
  );
}
