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
  material: '',
  color: '',
  control: '',
  brackets: '',
  baseRailColor: '',
  componentColor: '',
  rollDirection: '',
  comments: ''
};

export default function IndoorBlindsForm() {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerState });
  const [blinds, setBlinds] = useState([{ ...initialBlindState }]);
  const [showReview, setShowReview] = useState(false);

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

  const validate = () => {
    if (!customerInfo.customerName || !customerInfo.customerPhone) {
      alert("Please fill in customer name and phone.");
      return false;
    }
    if (!blinds.length || !blinds[0].roomName) {
      alert("Please add at least one blind.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      product: 'Indoor Blinds',
      ...customerInfo,
      windows: blinds
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
        setShowReview(false);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission error: ' + err.message);
    }
  };

  return (
    <form style={{ maxWidth: '900px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '24px' }}>Indoor Blinds Measurement Form</h2>

      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
            required
          />
        </div>
      ))}

      <h3 style={{ fontSize: '20px', marginTop: '30px' }}>Blind Measurements</h3>
      {blinds.map((blind, idx) => (
        <div key={idx} style={{
          border: '1px solid #ddd',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: '#fafafa'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: '18px' }}>Blind {idx + 1}</h4>

          {['roomName', 'material', 'color', 'comments'].map(field => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <input
                type="text"
                name={field}
                value={blind[field]}
                onChange={(e) => handleBlindChange(idx, e)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '16px'
                }}
                required={field !== 'comments'}
              />
            </div>
          ))}

          {['width', 'height'].map(measurement => (
            <div key={measurement} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>
                {measurement.charAt(0).toUpperCase() + measurement.slice(1)} (mm):
              </label>
              <input
                type="number"
                name={measurement}
                value={blind[measurement]}
                onChange={(e) => handleBlindChange(idx, e)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid orange',
                  backgroundColor: '#fff9e6',
                  fontSize: '16px'
                }}
                required
              />
              <p style={{ fontSize: '14px', color: 'orange' }}>
                ⚠️ Please double-check all measurements in millimeters (mm)
              </p>
            </div>
          ))}

          {[{
            name: 'control', options: ['Left', 'Right']
          }, {
            name: 'brackets', options: ['N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit', 'Dual Same side', 'Dual opposite Side to suit None', 'Single', 'Slim Combo Top Back', 'Slim Combo Top Back to suit', 'Slim Combo Top Front to suit', 'Slim Combo Top front']
          }, {
            name: 'baseRailColor', options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
          }, {
            name: 'componentColor', options: ['Black Grey', 'Sandstone', 'White', 'Standard']
          }, {
            name: 'rollDirection', options: ['Over Roll', 'Standard']
          }].map(({ name, options }) => (
            <div key={name} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>
                {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </label>
              <select
                name={name}
                value={blind[name]}
                onChange={(e) => handleBlindChange(idx, e)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '16px'
                }}
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

      <button type="button" onClick={addBlind} style={{
        display: 'block',
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        backgroundColor: '#f2f2f2',
        border: '1px solid #ccc',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        ➕ Add Another Blind
      </button>

      <button type="button" onClick={() => setShowReview(true)} style={{
        display: 'block',
        width: '100%',
        padding: '16px',
        backgroundColor: '#0070f3',
        color: '#fff',
        fontSize: '18px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px'
      }}>
        📋 Review Before Submit
      </button>

      {showReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '90%',
            maxHeight: '90%',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Review Your Submission</h3>

            <h4>Customer Info</h4>
            <ul>
              {Object.entries(customerInfo).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>

            <h4>Blinds</h4>
            {blinds.map((blind, index) => (
              <div key={index} style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}>
                <h5>Blind {index + 1}</h5>
                <ul>
                  {Object.entries(blind).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowReview(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ccc',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                ✏️ Go Back & Edit
              </button>

              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                ✅ Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
