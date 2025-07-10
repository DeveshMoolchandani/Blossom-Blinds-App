import { useState, useEffect } from 'react';
import styles from '../styles/styles/Form.module.css';

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
      material: '',
      color: '',
      width: '',
      drop: '',
      controlSide: '',
      brackets: '',
      baseRailColor: '',
      componentColor: '',
      rollDirection: '',
      collapsed: false
    }
  ]);

  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString();
    setCustomerInfo(prev => ({ ...prev, date, time }));
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    setWindows(prev => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addWindow = () => {
    setWindows(prev => [
      ...prev,
      {
        roomName: '',
        material: '',
        color: '',
        width: '',
        drop: '',
        controlSide: '',
        brackets: '',
        baseRailColor: '',
        componentColor: '',
        rollDirection: '',
        collapsed: false
      }
    ]);
  };

  const deleteWindow = (index) => {
    const w = windows[index];
    const isEmpty = Object.values(w).every(val => val === '' || val === false);
    if (isEmpty && windows.length > 1) {
      const updated = [...windows];
      updated.splice(index, 1);
      setWindows(updated);
    } else {
      alert('❌ You can only delete an empty window section.');
    }
  };

  const toggleCollapse = (index) => {
    setWindows(prev => {
      const updated = [...prev];
      updated[index].collapsed = !updated[index].collapsed;
      return updated;
    });
  };

  const validateFields = () => {
    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert('❌ Customer name, phone, and at least one window are required.');
      return false;
    }

    if (!/^\d{10}$/.test(customerInfo.customerPhone)) {
      alert('❌ Phone number must be exactly 10 digits.');
      return false;
    }

    for (let i = 0; i < windows.length; i++) {
      const { roomName, width, drop } = windows[i];
      if (!roomName || !width || !drop) {
        alert(`❌ Window ${i + 1} is missing Room Name, Width, or Drop.`);
        return false;
      }
      if (!/^\d+$/.test(width) || !/^\d+$/.test(drop)) {
        alert(`❌ Window ${i + 1} Width and Drop must be numbers.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const payload = {
      ...customerInfo,
      windows
    };

    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Form submitted!');
        window.location.reload();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Submission failed: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {Object.keys(customerInfo).map((field) => (
        <div key={field} className={styles.inputGroup}>
          <label>{field}:</label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            readOnly={field === 'date' || field === 'time'}
            className={styles.inputField}
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <div className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>Window {idx + 1}</span>
            <span>
              {window.collapsed ? '➕ Expand' : '➖ Collapse'}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWindow(idx);
                }}
                className={styles.deleteBtn}
                title="Delete window"
              >
                🗑
              </button>
            </span>
          </div>
          {!window.collapsed && (
            <>
              {[
                { name: 'roomName', label: 'Room Name' },
                { name: 'material', label: 'Material' },
                { name: 'color', label: 'Colour' },
                { name: 'width', label: 'Width (mm)', highlight: true },
                { name: 'drop', label: 'Drop (mm)', highlight: true },
                { name: 'controlSide', label: 'Control Side (Left or Right)' }
              ].map(({ name, label, highlight }) => (
                <div key={name} className={styles.inputGroup}>
                  <label>{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={`${styles.inputField} ${highlight ? styles.measurementInput : ''}`}
                  />
                </div>
              ))}

              {[
                {
                  name: 'brackets',
                  label: 'Brackets',
                  options: [
                    '', 'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit',
                    'Dual Same side', 'Dual opposite Side to suit None', 'Single',
                    'Slim Combo Top Back', 'Slim Combo Top Back to suit',
                    'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                {
                  name: 'baseRailColor',
                  label: 'Base Rail Colour',
                  options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
                },
                {
                  name: 'componentColor',
                  label: 'Component Colour',
                  options: ['Black Grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  name: 'rollDirection',
                  label: 'Roll Direction',
                  options: ['Over Roll', 'Standard']
                }
              ].map(({ name, label, options }) => (
                <div key={name} className={styles.inputGroup}>
                  <label>{label}</label>
                  <select
                    name={name}
                    value={window[name]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={styles.inputField}
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

      <button
        type="button"
        onClick={addWindow}
        className={`${styles.addBtn} ${styles.button}`}
      >
        ➕ Add Another Window
      </button>

      <button
        type="button"
        onClick={() => setShowReview(true)}
        className={`${styles.reviewBtn} ${styles.button}`}
      >
        🔍 Preview Before Submit
      </button>

      <button type="submit" className={`${styles.submitBtn} ${styles.button}`}>
        🚀 Submit
      </button>

      {showReview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Review Submission</h3>
            <pre>{JSON.stringify({ customerInfo, windows }, null, 2)}</pre>
            <button onClick={() => setShowReview(false)} className={styles.button}>Close</button>
          </div>
        </div>
      )}
    </form>
  );
}
