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
      location: '',
      width: '',
      drop: '',
      material: '',
      color: '',
      controlSide: '',
      brackets: '',
      baseRailColor: '',
      componentColor: '',
      rollDirection: ''
    }
  ]);

  const [expandedWindows, setExpandedWindows] = useState([true]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCustomerInfo((prev) => ({
      ...prev,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString()
    }));
  }, []);

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
    setWindows((prev) => [
      ...prev,
      {
        location: '',
        width: '',
        drop: '',
        material: '',
        color: '',
        controlSide: '',
        brackets: '',
        baseRailColor: '',
        componentColor: '',
        rollDirection: ''
      }
    ]);
    setExpandedWindows((prev) => [...prev, true]);
  };

  const deleteWindow = (index) => {
    const win = windows[index];
    const isEmpty = Object.values(win).every((v) => !v);
    if (!isEmpty) return alert('❌ Only empty window sections can be deleted.');
    const updated = [...windows];
    const toggled = [...expandedWindows];
    updated.splice(index, 1);
    toggled.splice(index, 1);
    setWindows(updated);
    setExpandedWindows(toggled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert("❌ Missing customer name, phone or windows data");
      return;
    }

    const payload = {
      ...customerInfo,
      windows
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwyfc1yWqACSL8CvhT3WFbInDEgYal77aShA4yKaX6AGkN5yq5Er3lokIciS5gSySPg/exec', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully');
        window.location.reload();
      } else {
        alert('❌ Submission failed: ' + result.message);
      }
    } catch (err) {
      alert('❌ Submission failed');
      console.error(err);
    }
  };

  const toggleExpand = (index) => {
    const updated = [...expandedWindows];
    updated[index] = !updated[index];
    setExpandedWindows(updated);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map((field) => (
        <div key={field} className={styles.inputGroup}>
          <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
          <input
            type="text"
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            required
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((win, i) => (
        <div key={i} className={styles.windowSection}>
          <div className={styles.windowHeader} onClick={() => toggleExpand(i)}>
            <span>Window {i + 1}</span>
            <span>
              <button
                className={styles.deleteBtn}
                type="button"
                title="Delete"
                onClick={() => deleteWindow(i)}
              >
                🗑
              </button>
              {expandedWindows[i] ? '▲' : '▼'}
            </span>
          </div>
          {expandedWindows[i] && (
            <>
              {[
                { label: 'Location', name: 'location' },
                { label: 'Material', name: 'material' },
                { label: 'Colour', name: 'color' }
              ].map(({ label, name }) => (
                <div key={name} className={styles.inputGroup}>
                  <label>{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={win[name]}
                    onChange={(e) => handleWindowChange(i, e)}
                    required
                  />
                </div>
              ))}

              <div className={styles.inputGroup}>
                <label>Width (mm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  name="width"
                  value={win.width}
                  onChange={(e) => handleWindowChange(i, e)}
                  required
                  className={styles.measurementInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Drop (mm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  name="drop"
                  value={win.drop}
                  onChange={(e) => handleWindowChange(i, e)}
                  required
                  className={styles.measurementInput}
                />
              </div>

              {[
                { label: 'Control Side', name: 'controlSide', options: ['Left', 'Right'] },
                {
                  label: 'Brackets',
                  name: 'brackets',
                  options: [
                    'N/A', '55mm', 'Dual Opposite side', 'Dual Same Side to suit',
                    'Dual Same side', 'Dual opposite Side to suit', 'None', 'Single',
                    'Slim Combo Top Back', 'Slim Combo Top Back to suit',
                    'Slim Combo Top Front to suit', 'Slim Combo Top front'
                  ]
                },
                {
                  label: 'Base Rail Colour',
                  name: 'baseRailColor',
                  options: ['Anodised', 'Bone', 'Pure White', 'Sandstone', 'Satin Black']
                },
                {
                  label: 'Component Colour',
                  name: 'componentColor',
                  options: ['Black Grey', 'Sandstone', 'White', 'Standard']
                },
                {
                  label: 'Roll Direction',
                  name: 'rollDirection',
                  options: ['Over Roll', 'Standard']
                }
              ].map(({ label, name, options }) => (
                <div key={name} className={styles.inputGroup}>
                  <label>{label}</label>
                  <select name={name} value={win[name]} onChange={(e) => handleWindowChange(i, e)} required>
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
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
        👁 Preview Before Submit
      </button>

      <button type="submit" onClick={handleSubmit} className={styles.submitBtn}>
        📤 Submit
      </button>

      {showPreview && (
        <div className={styles.modal} onClick={() => setShowPreview(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Customer Info</h3>
            <pre>{JSON.stringify(customerInfo, null, 2)}</pre>
            <h3>Windows</h3>
            <pre>{JSON.stringify(windows, null, 2)}</pre>
            <button onClick={() => setShowPreview(false)} className={styles.submitBtn}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
