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
  const [success, setSuccess] = useState(false);

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
      } else {
        alert('❌ Submission failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Submission failed: ' + err.message);
    }
  };

  if (success) {
    return (
      <div className={styles.successMessage}>
        ✅ Thank you! Your curtains form has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
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

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowCard}>
          <h4 className={styles.windowTitle}>Window {idx + 1}</h4>

          {['roomName', 'subcategory', 'fabric', 'color', 'width', 'height', 'customSplit', 'comments'].map((field) => (
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
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addWindowBtn}>
        ➕ Add Another Window
      </button>

      <button type="submit" className={styles.submitBtn}>
        Submit
      </button>
    </form>
  );
}
