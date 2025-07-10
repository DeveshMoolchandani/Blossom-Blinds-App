import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';

export default function CurtainsForm() {
  const [customerInfo, setCustomerInfo] = useState({
    date: '',
    time: '',
    salesRep: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: ''
  });

  const [windows, setWindows] = useState([
    {
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
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState([true]);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString('en-GB');
    setCustomerInfo(prev => ({ ...prev, date: formattedDate, time: formattedTime }));
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows([...windows, {
      roomName: '', subcategory: '', fabric: '', color: '',
      width: '', height: '', customSplit: '', comments: '',
      headingType: '', track: '', trackColor: '', control: '', fixing: ''
    }]);
    setExpanded([...expanded, true]);
  };

  const deleteWindow = (index) => {
    const isBlank = Object.values(windows[index]).every(val => val === '');
    if (!isBlank) return;
    const updated = windows.filter((_, i) => i !== index);
    const exp = expanded.filter((_, i) => i !== index);
    setWindows(updated);
    setExpanded(exp);
  };

  const validateNumeric = (val) => /^\d*$/.test(val);

  const handleSubmit = async () => {
    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert('❌ Missing required customer fields or window entries.');
      return;
    }

    const payload = { ...customerInfo, windows };
    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Submitted successfully!');
        window.location.reload();
      } else {
        alert('❌ Submission failed: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Submission failed: Network error');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {Object.entries(customerInfo).map(([key, value]) => (
        <div className={styles.inputGroup} key={key}>
          <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <input
            type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
            name={key}
            value={value}
            onChange={handleCustomerChange}
            required={key !== 'comments'}
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, index) => (
        <div key={index} className={styles.windowSection}>
          <div className={styles.windowHeader} onClick={() => {
            const copy = [...expanded];
            copy[index] = !copy[index];
            setExpanded(copy);
          }}>
            <span>Window {index + 1}</span>
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                deleteWindow(index);
              }}
              title="Delete if blank"
            >
              ❌
            </button>
          </div>
          {expanded[index] && (
            <>
              {['roomName', 'subcategory', 'fabric', 'color'].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(index, e)}
                    required
                  />
                </div>
              ))}
              {['width', 'height'].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field.toUpperCase()} (in mm) — Double check!</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    name={field}
                    className={styles.measurementInput}
                    value={window[field]}
                    onChange={(e) => {
                      if (validateNumeric(e.target.value)) handleWindowChange(index, e);
                    }}
                    required
                  />
                </div>
              ))}
              {['customSplit', 'comments'].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(index, e)}
                  />
                </div>
              ))}
              {[
                { name: 'headingType', options: ['Double Pinch Pleat', 'Wave Fold (S-fold)'] },
                { name: 'track', options: ['Normal', 'Designer'] },
                { name: 'trackColor', options: ['Black', 'White', 'Silver', 'N/A'] },
                { name: 'control', options: ['Centre Opening', 'Full Right', 'Full Left'] },
                { name: 'fixing', options: ['Top Fix', 'Face Fix'] }
              ].map(({ name, options }) => (
                <div key={name} className={styles.inputGroup}>
                  <label>{name}</label>
                  <select
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(index, e)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button onClick={addWindow} type="button" className={styles.addBtn}>
        ➕ Add Another Window
      </button>

      <button
        type="button"
        className={styles.reviewBtn}
        onClick={() => setShowModal(true)}
      >
        👁️ Preview Before Submit
      </button>

      <button
        onClick={handleSubmit}
        type="button"
        className={styles.submitBtn}
      >
        📤 Submit Form
      </button>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Review Data</h3>
            <pre>{JSON.stringify({ ...customerInfo, windows }, null, 2)}</pre>
            <button onClick={() => setShowModal(false)} className={styles.submitBtn}>Close Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
