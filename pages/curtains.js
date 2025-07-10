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
  const [collapsed, setCollapsed] = useState({});
  const [success, setSuccess] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [expandedWindows, setExpandedWindows] = useState({});

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
    const newIndex = windows.length;
    setWindows([...windows, { ...initialWindowState }]);
    setCollapsed({ ...collapsed, [newIndex]: false });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^04\d{8}$/;
    const postcodeRegex = /\b\d{4}\b/;

    if (!emailRegex.test(customerInfo.customerEmail)) {
      alert('Please enter a valid email address.');
      return false;
    }
    if (!phoneRegex.test(customerInfo.customerPhone)) {
      alert('Please enter a valid Australian mobile number (starts with 04).');
      return false;
    }
    if (!postcodeRegex.test(customerInfo.customerAddress)) {
      alert('Please include a 4-digit postcode in the address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const payload = { ...customerInfo, windows };

    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.result === 'success') {
        setSuccess(true);
        setCustomerInfo({ ...initialCustomerState });
        setWindows([{ ...initialWindowState }]);
        setCollapsed({});
        setIsPreviewing(false);
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }
  };

  const togglePreview = () => {
    if (validate()) {
      setIsPreviewing(true);
    }
  };

  const toggleCollapse = (index) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleWindow = (index) => {
    setExpandedWindows((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderPreview = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Preview Your Submission</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      <ul>
        {Object.entries(customerInfo).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>

      <h3 className={styles.sectionHeading}>Window Details</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowCard}>
          <div
            className={styles.previewToggle}
            onClick={() => toggleWindow(idx)}
          >
            {expandedWindows[idx] ? '🔽' : '▶️'} Window {idx + 1}: {window.roomName || 'Untitled'}
          </div>
          <div className={`${styles.collapsibleContent} ${!expandedWindows[idx] ? styles.collapsed : ''}`}>
            <ul>
              {Object.entries(window).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button onClick={() => setIsPreviewing(false)} className={styles.addWindowBtn}>🔙 Back to Edit</button>
        <button onClick={handleSubmit} className={styles.submitBtn}>✅ Confirm Submit</button>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className={styles.successMessage}>
        ✅ Thank you! Your curtains form has been submitted.
      </div>
    );
  }

  if (isPreviewing) return renderPreview();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        togglePreview();
      }}
      className={styles.formContainer}
    >
      <h2 className={styles.heading}>Curtains Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} className={styles.inputGroup}>
          <label className={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            className={styles.input}
            required
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements (mm)</h3>

      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowCard}>
          <div
            className={styles.previewToggle}
            onClick={() => toggleCollapse(idx)}
          >
            {collapsed[idx] ? '▶️' : '🔽'} Window {idx + 1}: {window.roomName || 'Untitled'}
          </div>

          <div className={`${styles.collapsibleContent} ${collapsed[idx] ? styles.collapsed : ''}`}>
            {['roomName', 'subcategory', 'fabric', 'color', 'customSplit', 'comments'].map((field) => (
              <div key={field} className={styles.inputGroup}>
                <label className={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </label>
                <input
                  type="text"
                  name={field}
                  value={window[field]}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={styles.input}
                  required={field !== 'comments'}
                />
              </div>
            ))}

            {['width', 'height'].map((field) => (
              <div key={field} className={styles.inputGroup}>
                <label className={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)} (mm): <span style={{ color: '#d00' }}>* Please double-check</span>
                </label>
                <input
                  type="number"
                  name={field}
                  value={window[field]}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={`${styles.input} ${styles.measurementInput}`}
                  required
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
              <div key={name} className={styles.inputGroup}>
                <label className={styles.label}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}:
                </label>
                <select
                  name={name}
                  value={window[name]}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={styles.select}
                  required
                >
                  <option value="">-- Select --</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addWindowBtn}>
        ➕ Add Another Window
      </button>

      <button type="submit" className={styles.submitBtn}>
        Preview Before Submit
      </button>
    </form>
  );
}
