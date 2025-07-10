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
      subcategory: '',
      fabric: '',
      color: '',
      width: '',
      height: '',
      control: '',
      brackets: '',
      baseRailColor: '',
      componentColor: '',
      rollDirection: '',
      comments: '',
      collapsed: false
    }
  ]);

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toISOString().split('T')[0];
    setCustomerInfo(prev => ({ ...prev, time: formattedTime, date: formattedDate }));
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
    setWindows(prev => [
      ...prev,
      {
        roomName: '',
        subcategory: '',
        fabric: '',
        color: '',
        width: '',
        height: '',
        control: '',
        brackets: '',
        baseRailColor: '',
        componentColor: '',
        rollDirection: '',
        comments: '',
        collapsed: false
      }
    ]);
  };

  const toggleCollapse = (index) => {
    const updated = [...windows];
    updated[index].collapsed = !updated[index].collapsed;
    setWindows(updated);
  };

  const deleteWindow = (index) => {
    const isEmpty = Object.values(windows[index]).every(val => val === '' || val === false);
    if (isEmpty && windows.length > 1) {
      const updated = [...windows];
      updated.splice(index, 1);
      setWindows(updated);
    } else {
      alert("❌ Only blank windows can be deleted.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert("❌ Please complete customer info and at least one window.");
      return;
    }

    const payload = {
      ...customerInfo,
      windows: windows.map(({ collapsed, ...w }) => w)
    };

    try {
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.result === 'success') {
        alert("✅ Form submitted successfully!");
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Error submitting form.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.title}>Indoor Blinds Measurement Form</h2>

      <h3>Customer Info</h3>
      {Object.keys(customerInfo).map(field => (
        <div key={field}>
          <label className={styles.label}>{field}:</label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            className={styles.inputField}
            required={field !== 'email' && field !== 'date' && field !== 'time'}
          />
        </div>
      ))}

      <h3>Window Measurements</h3>
      {windows.map((win, idx) => (
        <div key={idx} className={styles.section}>
          <h4>
            🪟 Window {idx + 1} — <button type="button" onClick={() => toggleCollapse(idx)}>Collapse</button>
            &nbsp;
            <button type="button" onClick={() => deleteWindow(idx)}>🗑 Delete</button>
          </h4>

          {!win.collapsed && (
            <>
              {['roomName', 'subcategory', 'fabric', 'color'].map(field => (
                <div key={field}>
                  <label className={styles.label}>{field}:</label>
                  <input
                    type="text"
                    name={field}
                    value={win[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={styles.inputField}
                    required
                  />
                </div>
              ))}

              {['width', 'height'].map(field => (
                <div key={field}>
                  <label className={styles.label}><strong>{field === 'width' ? 'Width (mm)' : 'Drop (mm)'}:</strong></label>
                  <input
                    type="number"
                    name={field}
                    value={win[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={`${styles.inputField} ${styles.measurementInput}`}
                    required
                  />
                </div>
              ))}

              <p>📏 <strong>All measurements must be in millimetres (MM).</strong> Please double check!</p>

              {[
                { name: 'control', options: ['Left', 'Right'] },
                { name: 'brackets', options: ['N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit', 'None', 'Single', 'Slim Combo Top Back', 'Slim Combo Top Front'] },
                { name: 'baseRailColor', options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black'] },
                { name: 'componentColor', options: ['Black Grey', 'Sandstone', 'White', 'Standard'] },
                { name: 'rollDirection', options: ['Over Roll', 'Standard'] }
              ].map(({ name, options }) => (
                <div key={name}>
                  <label className={styles.label}>{name}:</label>
                  <select
                    name={name}
                    value={win[name]}
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
                  value={win.comments}
                  onChange={(e) => handleWindowChange(idx, e)}
                  className={styles.inputField}
                />
              </div>
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
