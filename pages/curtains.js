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
    { roomName: '', subcategory: '', fabric: '', color: '', width: '', height: '', customSplit: '', comments: '', headingType: '', track: '', trackColor: '', control: '', fixing: '', collapsed: false }
  ]);

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCustomerInfo(prev => ({
      ...prev,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWindows = [...windows];
    updatedWindows[index][name] = value;
    setWindows(updatedWindows);
  };

  const addWindow = () => {
    setWindows([...windows, {
      roomName: '', subcategory: '', fabric: '', color: '', width: '', height: '', customSplit: '', comments: '', headingType: '', track: '', trackColor: '', control: '', fixing: '', collapsed: false
    }]);
  };

  const deleteWindow = (index) => {
    const win = windows[index];
    const isEmpty = Object.values(win).every(val => val === '' || val === false);
    if (isEmpty) {
      const updated = [...windows];
      updated.splice(index, 1);
      setWindows(updated);
    } else {
      alert("❌ Only blank windows can be deleted.");
    }
  };

  const toggleCollapse = (index) => {
    const updated = [...windows];
    updated[index].collapsed = !updated[index].collapsed;
    setWindows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...customerInfo,
      windows: windows.map(w => {
        const copy = { ...w };
        delete copy.collapsed;
        return copy;
      })
    };

    try {
      const res = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully!');
        window.location.reload();
      } else {
        alert('❌ Submission failed: ' + result.message);
      }
    } catch (err) {
      alert('❌ Submission error: ' + err.message);
    }
  };

  const validateAndPreview = () => {
    if (!customerInfo.customerName || !customerInfo.customerPhone || windows.length === 0) {
      alert('❌ Please complete required fields.');
      return;
    }
    setShowPreview(true);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map(field => (
        <div className={styles.inputGroup} key={field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            name={field}
            type={field === 'customerPhone' ? 'tel' : 'text'}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            required
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <div className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>
              Window {idx + 1}
              {window.collapsed && window.roomName && (
                <strong style={{ marginLeft: '6px', color: '#0070f3' }}>
                  – {window.roomName}
                </strong>
              )}
            </span>
            <div>
              <button type="button" className={styles.deleteBtn} onClick={() => deleteWindow(idx)}>🗑</button>
              <span>{window.collapsed ? '🔽' : '🔼'}</span>
            </div>
          </div>

          {!window.collapsed && (
            <>
              {['roomName', 'subcategory', 'fabric', 'color'].map(field => (
                <div className={styles.inputGroup} key={field}>
                  <label>{field}:</label>
                  <input
                    name={field}
                    type="text"
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
                  />
                </div>
              ))}

              <div className={styles.inputGroup}>
                <label>Width (mm):</label>
                <input
                  name="width"
                  type="number"
                  className={styles.measurementInput}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={window.width}
                  onChange={(e) => handleWindowChange(idx, e)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Height (mm):</label>
                <input
                  name="height"
                  type="number"
                  className={styles.measurementInput}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={window.height}
                  onChange={(e) => handleWindowChange(idx, e)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Custom Split:</label>
                <input name="customSplit" value={window.customSplit} onChange={(e) => handleWindowChange(idx, e)} />
              </div>

              <div className={styles.inputGroup}>
                <label>Comments:</label>
                <input name="comments" value={window.comments} onChange={(e) => handleWindowChange(idx, e)} />
              </div>

              {[
                { name: 'headingType', options: ['Double Pinch Pleat', 'Wave Fold (S-fold)'] },
                { name: 'track', options: ['Normal', 'Designer'] },
                { name: 'trackColor', options: ['Black', 'White', 'Anodised Silver', 'N/A'] },
                { name: 'control', options: ['Centre Opening', 'Full Right', 'Full Left'] },
                { name: 'fixing', options: ['Top Fix', 'Double Extension Face Fix', 'Double Face Fix', 'Single Face Fix'] }
              ].map(({ name, options }) => (
                <div className={styles.inputGroup} key={name}>
                  <label>{name}:</label>
                  <select name={name} value={window[name]} onChange={(e) => handleWindowChange(idx, e)} required>
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

      <button type="button" onClick={addWindow} className={`${styles.addBtn} ${styles.button}`}>➕ Add Another Window</button>
      <button type="button" onClick={validateAndPreview} className={`${styles.reviewBtn} ${styles.button}`}>🔍 Review Form</button>
      <button type="submit" className={`${styles.submitBtn} ${styles.button}`}>📤 Submit</button>

      {showPreview && (
        <div className={styles.modal} onClick={() => setShowPreview(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Review Form</h3>
            <pre>{JSON.stringify({ ...customerInfo, windows }, null, 2)}</pre>
            <button onClick={() => setShowPreview(false)} className={styles.submitBtn}>Close</button>
          </div>
        </div>
      )}
    </form>
  );
}
