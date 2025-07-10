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

const initialBlindState = {
  roomName: '',
  width: '',
  height: '',
  fabric: '',
  color: '',
  controlSide: '',
  brackets: '',
  baseRailColor: '',
  componentColor: '',
  rollDirection: '',
  comments: '',
  collapsed: false
};

export default function IndoorBlindsForm() {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerState });
  const [blinds, setBlinds] = useState([{ ...initialBlindState }]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlindChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...blinds];
    updated[index][name] = value;
    setBlinds(updated);
  };

  const addBlind = () => {
    setBlinds([...blinds, { ...initialBlindState }]);
  };

  const toggleCollapse = (index) => {
    const updated = [...blinds];
    updated[index].collapsed = !updated[index].collapsed;
    setBlinds(updated);
  };

  const validate = () => {
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(customerInfo.customerPhone)) {
      alert('❌ Phone number must be exactly 10 digits');
      return false;
    }

    if (!emailRegex.test(customerInfo.customerEmail)) {
      alert('❌ Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      product: 'Indoor Blinds',
      ...customerInfo,
      blinds
    };

    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully!');
        setCustomerInfo({ ...initialCustomerState });
        setBlinds([{ ...initialBlindState }]);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission error: ' + err.message);
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

      <h3>Blinds</h3>
      {blinds.map((blind, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Blind {idx + 1}</h4>
            <button type="button" onClick={() => toggleCollapse(idx)} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}>
              {blind.collapsed ? '➕ Expand' : '➖ Collapse'}
            </button>
          </div>

          {!blind.collapsed && (
            <>
              {[
                { name: 'roomName', label: 'Location' },
                { name: 'fabric', label: 'Material' },
                { name: 'color', label: 'Colour' },
                { name: 'width', label: 'Width (mm)' },
                { name: 'height', label: 'Drop (mm)' },
                { name: 'comments', label: 'Comments' }
              ].map(({ name, label }) => (
                <div key={name} style={{ marginBottom: '10px' }}>
                  <label>{label}:</label>
                  <input
                    type="text"
                    name={name}
                    value={blind[name]}
                    onChange={(e) => handleBlindChange(idx, e)}
                    style={{ width: '100%', padding: '8px' }}
                    required={name !== 'comments'}
                  />
                </div>
              ))}

              {[
                {
                  name: 'controlSide',
                  label: 'Control Side',
                  options: ['Left', 'Right']
                },
                {
                  name: 'brackets',
                  label: 'Brackets',
                  options: [
                    'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit',
                    'Dual Same side', 'Dual opposite Side to suit', 'None', 'Single',
                    'Slim Combo Top Back', 'Slim Combo Top Back to suit',
                    'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                {
                  name: 'baseRailColor',
                  label: 'Base Rail Colour',
                  options: ['Anodised', 'Bone', 'Pure white', 'Sandstone', 'Satin black']
                },
                {
                  name: 'componentColor',
                  label: 'Component Colour',
                  options: ['Black grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  name: 'rollDirection',
                  label: 'Roll Direction',
                  options: ['Over roll', 'Standard']
                }
              ].map(({ name, label, options }) => (
                <div key={name} style={{ marginBottom: '10px' }}>
                  <label>{label}:</label>
                  <select
                    name={name}
                    value={blind[name]}
                    onChange={(e) => handleBlindChange(idx, e)}
                    style={{ width: '100%', padding: '8px' }}
                    required
                  >
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addBlind} style={{ marginBottom: '20px' }}>
        ➕ Add Another Blind
      </button>

      <button type="submit" style={{
        padding: '12px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        fontSize: '16px',
        width: '100%',
        borderRadius: '6px'
      }}>
        Submit
      </button>
    </form>
  );
}
