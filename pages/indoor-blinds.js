import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';

export default function IndoorBlindsForm() {
  const [customerInfo, setCustomerInfo] = useState({
    date: '',
    time: '',
    salesRep: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
  });

  const [windows, setWindows] = useState([
    {
      roomName: '',
      subcategory: '',
      fabric: '',
      color: '',
      width: '',
      height: '',
      control: '',
      fit: '',
      roll: '',
      motorised: '',
      comments: '',
    },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [collapsed, setCollapsed] = useState([false]);

  useEffect(() => {
    const now = new Date();
    setCustomerInfo((prev) => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWindows = [...windows];
    updatedWindows[index][name] = value;
    setWindows(updatedWindows);
  };

  const addWindow = () => {
    setWindows([
      ...windows,
      {
        roomName: '',
        subcategory: '',
        fabric: '',
        color: '',
        width: '',
        height: '',
        control: '',
        fit: '',
        roll: '',
        motorised: '',
        comments: '',
      },
    ]);
    setCollapsed([...collapsed, false]);
  };

  const deleteWindow = (index) => {
    const window = windows[index];
    const isBlank = Object.values(window).every((v) => v === '');
    if (!isBlank) return;
    const updatedWindows = windows.filter((_, i) => i !== index);
    const updatedCollapsed = collapsed.filter((_, i) => i !== index);
    setWindows(updatedWindows);
    setCollapsed(updatedCollapsed);
  };

  const toggleCollapse = (index) => {
    const updated = [...collapsed];
    updated[index] = !updated[index];
    setCollapsed(updated);
  };

  const validateFields = () => {
    const { customerName, customerPhone } = customerInfo;
    if (!customerName || !/^\d{10}$/.test(customerPhone)) return false;
    for (const win of windows) {
      if (!win.roomName || !win.width || !win.height) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      alert('❌ Submission failed: Missing or invalid fields (e.g. phone, width/drop)');
      return;
    }

    const payload = {
      ...customerInfo,
      windows,
    };

    try {
      const response = await fetch('/api/indoor-blinds-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully!');
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {Object.entries(customerInfo).map(([field, value]) => (
        <div className={styles.inputGroup} key={field}>
          <label>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          <input
            type={field === 'date' ? 'date' : 'text'}
            name={field}
            value={value}
            onChange={handleCustomerChange}
            required={field !== 'time'}
            readOnly={field === 'time'}
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div className={styles.windowSection} key={idx}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>{`Window ${idx + 1}`}</span>
            <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>
              {window.roomName || ''}
            </span>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => deleteWindow(idx)}
              title="Delete if blank"
            >
              ❌
            </button>
          </h4>

          {!collapsed[idx] && (
            <>
              {[
                'roomName',
                'subcategory',
                'fabric',
                'color',
                'width',
                'height',
                'control',
                'fit',
                'roll',
                'motorised',
                'comments',
              ].map((field) => (
                <div className={styles.inputGroup} key={field}>
                  <label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <input
                    type={['width', 'height'].includes(field) ? 'number' : 'text'}
                    className={['width', 'height'].includes(field) ? styles.measurementInput : ''}
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    inputMode={['width', 'height'].includes(field) ? 'numeric' : 'text'}
                    required={field !== 'comments'}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>
        ➕ Add Another Window
      </button>

      <button type="button" onClick={() => setShowPreview(true)} className={styles.reviewBtn}>
        🔍 Preview Form
      </button>

      <button type="submit" className={styles.submitBtn}>
        Submit
      </button>

      {showPreview && (
        <div className={styles.modal} onClick={() => setShowPreview(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Review Submission</h3>
            <pre>{JSON.stringify({ ...customerInfo, windows }, null, 2)}</pre>
            <button onClick={() => setShowPreview(false)} className={styles.submitBtn}>Close</button>
          </div>
        </div>
      )}
    </form>
  );
}
