import { useState } from 'react';
import styles from '../styles/CurtainsForm.module.css';

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
  material: '',
  colour: '',
  width: '',
  drop: '',
  controlSide: '',
  brackets: '',
  baseRailColour: '',
  componentColour: '',
  rollDirection: '',
  comments: '',
  collapsed: false
};

export default function IndoorBlindsForm() {
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

  const toggleCollapse = (index) => {
    const updated = [...windows];
    updated[index].collapsed = !updated[index].collapsed;
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows([...windows, { ...initialWindowState }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...customerInfo,
      windows: windows.map(({ collapsed, ...rest }) => rest)
    };

    try {
      const response = await fetch('/api/indoor-blinds-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Indoor Blinds Measurement Form</h2>

      <h3 className={styles.sectionTitle}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} className={styles.field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            required
          />
        </div>
      ))}

      <h3 className={styles.sectionTitle}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <div className={styles.collapseHeader} onClick={() => toggleCollapse(idx)}>
            <strong>🪟 Window {idx + 1}</strong>
            <span>{window.collapsed ? '➕ Expand' : '➖ Collapse'}</span>
          </div>

          {!window.collapsed && (
            <>
              {['roomName', 'subcategory', 'material', 'colour'].map((field) => (
                <div key={field} className={styles.field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
                  />
                </div>
              ))}

              {/* Width and Drop with special styling */}
              {['width', 'drop'].map((field) => (
                <div key={field} className={styles.field}>
                  <label><strong>{field === 'width' ? 'Width (mm)' : 'Drop (mm)'}:</strong></label>
                  <input
                    type="number"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
                    className={styles.measurementInput}
                    min="0"
                    inputMode="numeric"
                  />
                </div>
              ))}
              <div className={styles.reminderNote}>
                📏 All measurements must be in millimetres (MM). Please double check!
              </div>

              {[
                { name: 'controlSide', options: ['Left', 'Right'] },
                {
                  name: 'brackets',
                  options: [
                    'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit',
                    'Dual Same side', 'Dual opposite Side to suit', 'None',
                    'Single', 'Slim Combo Top Back', 'Slim Combo Top Back to suit',
                    'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                { name: 'baseRailColour', options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black'] },
                { name: 'componentColour', options: ['Black Grey', 'Sandstone', 'White', 'Standard'] },
                { name: 'rollDirection', options: ['Over roll', 'Standard'] }
              ].map(({ name, options }) => (
                <div key={name} className={styles.field}>
                  <label>{name.replace(/([A-Z])/g, ' $1')}:</label>
                  <select
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className={styles.field}>
                <label>Comments:</label>
                <input
                  type="text"
                  name="comments"
                  value={window.comments}
                  onChange={(e) => handleWindowChange(idx, e)}
                />
              </div>
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addButton}>
        ➕ Add Another Window
      </button>

      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </form>
  );
}
