import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';

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
  location: '',
  material: '',
  colour: '',
  width: '',
  drop: '',
  controlSide: '',
  brackets: '',
  baseRailColour: '',
  componentColour: '',
  rollDirection: '',
  comments: ''
};

export default function IndoorBlindsForm() {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCustomerState });
  const [windows, setWindows] = useState([{ ...initialWindowState }]);
  const [collapsed, setCollapsed] = useState([false]);
  const [showReview, setShowReview] = useState(false);

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

  const isWindowEmpty = (window) =>
    Object.values(window).every((val) => val.trim() === '');

  const addWindow = () => {
    setWindows([...windows, { ...initialWindowState }]);
    setCollapsed([...collapsed, false]);
  };

  const toggleCollapse = (index) => {
    const updated = [...collapsed];
    updated[index] = !updated[index];
    setCollapsed(updated);
  };

  const validateMeasurements = (value) => /^\d*$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert('❌ Missing customer name, phone or window data');
      return;
    }

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
        setCollapsed([false]);
        setShowReview(false);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.title}>Indoor Blinds Measurement Form</h2>

      <h3>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field}>
          <label className={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            className={styles.inputField}
            required
          />
        </div>
      ))}

      <h3>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 onClick={() => toggleCollapse(idx)} style={{ cursor: 'pointer' }}>
              {collapsed[idx] ? '▶' : '▼'} Window {idx + 1}
            </h4>
            {windows.length > 1 && isWindowEmpty(window) && (
              <button
                type="button"
                onClick={() => {
                  const updated = [...windows];
                  const collapsedState = [...collapsed];
                  updated.splice(idx, 1);
                  collapsedState.splice(idx, 1);
                  setWindows(updated);
                  setCollapsed(collapsedState);
                }}
                style={{ background: 'transparent', border: 'none', color: 'red' }}
              >
                🗑️
              </button>
            )}
          </div>
          {!collapsed[idx] && (
            <>
              {[
                { name: 'roomName', label: 'Room Name' },
                { name: 'location', label: 'Location' },
                { name: 'material', label: 'Material' },
                { name: 'colour', label: 'Colour' }
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className={styles.label}>{label}:</label>
                  <input
                    type="text"
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={styles.inputField}
                    required
                  />
                </div>
              ))}

              {['width', 'drop'].map((field) => (
                <div key={field}>
                  <label className={styles.label}>
                    {field.charAt(0).toUpperCase() + field.slice(1)} (mm):
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => {
                      if (validateMeasurements(e.target.value)) {
                        handleWindowChange(idx, e);
                      }
                    }}
                    className={`${styles.inputField} ${styles.measurementInput}`}
                    required
                  />
                  <small>📏 Please double-check the measurements entered in mm</small>
                </div>
              ))}

              {/* Dropdowns */}
              {[
                {
                  name: 'controlSide',
                  label: 'Control Side',
                  options: ['Left', 'Right']
                },
                {
                  name: 'brackets',
                  label: 'Brackets',
                  options: ['N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit', 'Dual Same side', 'Dual opposite Side to suit None', 'Single', 'Slim Combo Top Back', 'Slim Combo Top Back to suit', 'Slim Combo Top Front to suit', 'Slim Combo Top front']
                },
                {
                  name: 'baseRailColour',
                  label: 'Base Rail Colour',
                  options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
                },
                {
                  name: 'componentColour',
                  label: 'Component Colour',
                  options: ['Black Grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  name: 'rollDirection',
                  label: 'Roll Direction',
                  options: ['Over Roll', 'Standard']
                }
              ].map(({ name, label, options }) => (
                <div key={name}>
                  <label className={styles.label}>{label}:</label>
                  <select
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={styles.inputField}
                    required
                  >
                    <option value="">-- Select --</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className={styles.label}>Comments:</label>
                <input
                  type="text"
                  name="comments"
                  value={window.comments}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={styles.inputField}
                />
              </div>
            </>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addWindow}
        className={`${styles.button} ${styles.addButton}`}
      >
        ➕ Add Another Window
      </button>

      {!showReview ? (
        <button
          type="button"
          onClick={() => setShowReview(true)}
          className={styles.button}
        >
          ✅ Review & Submit
        </button>
      ) : (
        <button
          type="submit"
          className={styles.button}
        >
          🚀 Final Submit
        </button>
      )}
    </form>
  );
}
