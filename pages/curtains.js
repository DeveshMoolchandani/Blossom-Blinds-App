import { useState } from 'react';
import styles from '../styles/Form.module.css'; //

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
  const [collapsed, setCollapsed] = useState([false]);

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
    setCollapsed([...collapsed, false]);
  };

  const toggleCollapse = (idx) => {
    const updated = [...collapsed];
    updated[idx] = !updated[idx];
    setCollapsed(updated);
  };

  const isWindowEmpty = (window) =>
    Object.values(window).every(val => !val);

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
        setCollapsed([false]);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.title}>Curtains Measurement Form</h2>

      <h3>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} className={styles.field}>
          <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
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
          <h4 style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span onClick={() => toggleCollapse(idx)}>Window {idx + 1} {collapsed[idx] ? '➕' : '➖'}</span>
            {windows.length > 1 && isWindowEmpty(window) && (
              <button
                type="button"
                onClick={() => {
                  const updatedWindows = [...windows];
                  const updatedCollapsed = [...collapsed];
                  updatedWindows.splice(idx, 1);
                  updatedCollapsed.splice(idx, 1);
                  setWindows(updatedWindows);
                  setCollapsed(updatedCollapsed);
                }}
                style={{ background: 'transparent', border: 'none', color: 'red' }}
              >
                🗑️
              </button>
            )}
          </h4>

          {!collapsed[idx] && (
            <>
              {['roomName', 'subcategory', 'fabric', 'color', 'width', 'height', 'customSplit', 'comments'].map(field => (
                <div key={field} className={styles.field}>
                  <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={`${styles.inputField} ${['width', 'height'].includes(field) ? styles.measurementInput : ''}`}
                    required={field !== 'comments'}
                    pattern={['width', 'height'].includes(field) ? '\\d*' : undefined}
                  />
                </div>
              ))}

              {[
                { name: 'headingType', options: ['Double Pinch Pleat', 'Wave Fold (S-fold)'] },
                { name: 'track', options: ['Normal', 'Designer'] },
                { name: 'trackColor', options: ['Black', 'White', 'Anodised Silver', 'N/A'] },
                { name: 'control', options: ['Centre Opening', 'Full Right', 'Full Left'] },
                { name: 'fixing', options: ['Top Fix', 'Double Extension Face Fix', 'Double Face Fix', 'Single Face Fix'] }
              ].map(({ name, options }) => (
                <div key={name} className={styles.field}>
                  <label className={styles.label}>{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
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
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={`${styles.button} ${styles.addButton}`}>
        ➕ Add Another Window
      </button>

      <button type="submit" className={styles.button}>
        Submit
      </button>
    </form>
  );
}
