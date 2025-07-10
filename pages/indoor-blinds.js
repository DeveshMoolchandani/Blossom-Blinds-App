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
    customerEmail: ''
  });

  const [windows, setWindows] = useState([
    {
      roomName: '',
      width: '',
      height: '',
      material: '',
      color: '',
      controlSide: '',
      brackets: '',
      baseRailColor: '',
      componentColor: '',
      rollDirection: '',
      comments: ''
    }
  ]);

  const [expanded, setExpanded] = useState([true]);
  const [showModal, setShowModal] = useState(false);

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

  const validateNumeric = (value) => /^\d*$/.test(value);

  const addWindow = () => {
    setWindows([...windows, {
      roomName: '',
      width: '',
      height: '',
      material: '',
      color: '',
      controlSide: '',
      brackets: '',
      baseRailColor: '',
      componentColor: '',
      rollDirection: '',
      comments: ''
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

  const handleSubmit = async () => {
    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert("❌ Please fill in customer name, phone, and at least one window.");
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
        alert("✅ Submitted successfully!");
        window.location.reload();
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Network error.");
      console.error(err);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {Object.entries(customerInfo).map(([key, value]) => (
        <div key={key} className={styles.inputGroup}>
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
              {['roomName', 'material', 'color', 'comments'].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(index, e)}
                    required={field !== 'comments'}
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
              {[
                {
                  name: 'controlSide',
                  options: ['Left', 'Right']
                },
                {
                  name: 'brackets',
                  options: [
                    'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit', 'Dual Same side',
                    'Dual opposite Side to suit None', 'Single', 'Slim Combo Top Back',
                    'Slim Combo Top Back to suit', 'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                {
                  name: 'baseRailColor',
                  options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
                },
                {
                  name: 'componentColor',
                  options: ['Black Grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  name: 'rollDirection',
                  options: ['Over Roll', 'Standard']
                }
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
            <button onClick={() => setShowModal(false)} className={styles.submitBtn}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
