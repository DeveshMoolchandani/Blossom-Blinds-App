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
    { roomName: '', subcategory: '', fabric: '', color: '', width: '', height: '', customSplit: '', comments: '', headingType: '', track: '', trackColor: '', control: '', fixing: '' }
  ]);
  const [collapsed, setCollapsed] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCustomerInfo(info => ({
      ...info,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    setCollapsed([false]);
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(info => ({ ...info, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    setWindows(prev => {
      const copy = [...prev];
      copy[index][name] = value;
      return copy;
    });
  };

  const addWindow = () => {
    setWindows(prev => [...prev, {
      roomName: '', subcategory: '', fabric: '', color: '', width: '', height: '', customSplit: '', comments: '', headingType: '', track: '', trackColor: '', control: '', fixing: ''
    }]);
    setCollapsed(prev => [...prev, false]);
  };

  const toggleCollapse = (idx) => {
    setCollapsed(prev => prev.map((c, i) => (i === idx ? !c : c)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        setShowModal(false);
      } else {
        alert('❌ Submission failed: ' + result.message);
      }
    } catch (error) {
      alert('❌ Submission error: ' + error.message);
    }
  };

  const isEmptyWindow = (w) => Object.values(w).every(val => val === '');

  const deleteWindow = (idx) => {
    if (!isEmptyWindow(windows[idx])) return;
    setWindows(windows.filter((_, i) => i !== idx));
    setCollapsed(collapsed.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Measurement Form</h2>

      <h3 className={styles.sectionHeading}>Customer Info</h3>
      {Object.keys(customerInfo).map((field) => (
        <div key={field} className={styles.inputGroup}>
          <label>{field}:</label>
          <input
            type={field === 'customerPhone' ? 'tel' : 'text'}
            name={field}
            value={customerInfo[field]}
            onChange={handleCustomerChange}
            required={field !== 'customerEmail'}
          />
        </div>
      ))}

      <h3 className={styles.sectionHeading}>Window Measurements</h3>
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>{`Window ${idx + 1}`}</span>
            <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>
              {window.roomName || ''}
            </span>
            <button type="button" className={styles.deleteBtn} onClick={() => deleteWindow(idx)}>🗑</button>
          </h4>

          {!collapsed[idx] && (
            <>
              {[
                'roomName', 'subcategory', 'fabric', 'color', 'width', 'height', 'customSplit', 'comments'
              ].map((field) => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field}:</label>
                  <input
                    type={['width', 'height'].includes(field) ? 'number' : 'text'}
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    className={['width', 'height'].includes(field) ? styles.measurementInput : ''}
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
                  <label>{name}:</label>
                  <select name={name} value={window[name]} onChange={(e) => handleWindowChange(idx, e)}>
                    <option value="">-- Select --</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Another Window</button>
      <button type="button" className={styles.reviewBtn} onClick={() => setShowModal(true)}>👁 Review Before Submit</button>
      <button type="submit" className={styles.submitBtn}>Submit</button>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>📋 Review Information</h3>
            <pre>{JSON.stringify({ ...customerInfo, windows }, null, 2)}</pre>
            <button className={styles.submitBtn} onClick={handleSubmit}>✅ Confirm & Submit</button>
            <button className={styles.addBtn} onClick={() => setShowModal(false)}>❌ Cancel</button>
          </div>
        </div>
      )}
    </form>
  );
}
