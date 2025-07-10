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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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

  const toggleCollapse = (index) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (success) {
    return <div className={styles.successMessage}>✅ Thank you! Your form has been submitted.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.heading}>Curtains Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} className={styles.inputGroup}>
          <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
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

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowCard}>
          <div className={styles.previewToggle} onClick={() => toggleCollapse(idx)}>
            {collapsed[idx] ? '▶️' : '🔽'} Window {idx + 1}: {window.roomName || 'Untitled'}
          </div>

          <div className={`${styles.collapsibleContent} ${collapsed[idx] ? styles.collapsed : ''}`}>
            {['roomName', 'subcategory', 'fabric', 'color', 'width', 'height', 'customSplit', 'comments'].map((field) => (
              <div key={field} className={styles.inputGroup}>
                <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input
                  type={['width', 'height'].includes(field) ? 'number' : 'text'}
                  name={field}
                  value={window[field]}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={`${styles.input} ${['width', 'height'].includes(field) ? styles.measurementInput : ''}`}
                  required={field !== 'comments'}
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
                <label className={styles.label}>{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
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

      <button type="button" onClick={addWindow} className={styles.addWindowBtn}>➕ Add Another Window</button>
      <button type="submit" className={styles.submitBtn}>Submit</button>
    </form>
  );
}
