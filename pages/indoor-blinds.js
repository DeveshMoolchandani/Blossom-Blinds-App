import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';

export default function IndoorBlindsForm() {
  const [formData, setFormData] = useState({
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
      control: '',
      fit: '',
      roll: '',
      motorised: '',
      baseRail: '',
      componentColour: '',
      brackets: '',
      comments: '',
      width: '',
      height: ''
    }
  ]);

  const [collapsedSections, setCollapsedSections] = useState([]);
  const [showReview, setShowReview] = useState(false);

  // 🕒 Set time/date on load
  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0]
    }));
  }, []);

  // 🛡 Prevent losing data if navigating away
  useEffect(() => {
    const hasData = formData.customerName || windows.some(w => w.roomName);
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    if (hasData) window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, windows]);

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows(prev => [...prev, {
      roomName: '',
      subcategory: '',
      fabric: '',
      color: '',
      control: '',
      fit: '',
      roll: '',
      motorised: '',
      baseRail: '',
      componentColour: '',
      brackets: '',
      comments: '',
      width: '',
      height: ''
    }]);
  };

  const deleteWindow = (index) => {
    const blank = Object.values(windows[index]).every(val => val === '');
    if (!blank) return;
    setWindows(prev => prev.filter((_, i) => i !== index));
  };

  const validateMeasurements = () => {
    return windows.every(w => /^\d+$/.test(w.width) && /^\d+$/.test(w.height));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || windows.length === 0) {
      alert("Please fill in Customer Name, Phone, and at least one window");
      return;
    }

    if (!validateMeasurements()) {
      alert("Width and Height must be numeric (in mm).");
      return;
    }

    const payload = {
      ...formData,
      windows,
      productType: "Indoor Blinds"
    };

    try {
      const res = await fetch('/api/indoor-blinds-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully!');
        setFormData({
          date: '',
          time: '',
          salesRep: '',
          customerName: '',
          customerAddress: '',
          customerPhone: '',
          customerEmail: ''
        });
        setWindows([{
          roomName: '',
          subcategory: '',
          fabric: '',
          color: '',
          control: '',
          fit: '',
          roll: '',
          motorised: '',
          baseRail: '',
          componentColour: '',
          brackets: '',
          comments: '',
          width: '',
          height: ''
        }]);
        setShowReview(false);
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      alert('❌ Network error — submission failed.');
    }
  };

  const dropdownOptions = {
    control: ["Left", "Right"],
    fit: ["Reveal", "Face"],
    roll: ["Standard", "Reverse"],
    motorised: ["Yes", "No"],
    baseRail: ["Oval", "Flat", "Sealed"],
    componentColour: ["White", "Black", "Grey", "Ivory"],
    brackets: ["Standard", "Extension"]
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      {/* 🧍 Customer Info Section */}
      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          Customer Information
          {!collapsedSections.includes(-1) && formData.customerName && (
            <span style={{ marginLeft: '12px', fontWeight: 'bold' }}>{formData.customerName}</span>
          )}
        </h4>
        {!collapsedSections.includes(-1) && (
          <>
            {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
              <div key={field} className={styles.inputGroup}>
                <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
                <input
                  type={field === "customerPhone" ? "tel" : "text"}
                  inputMode={field === "customerPhone" ? "numeric" : "text"}
                  pattern={field === "customerPhone" ? "\\d{10}" : undefined}
                  name={field}
                  value={formData[field]}
                  onChange={handleFormChange}
                  required
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* 🪟 Window Sections */}
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>{`Window ${idx + 1}`}</span>
            <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>
              {window.roomName || ''}
            </span>
            <button
              type="button"
              onClick={() => deleteWindow(idx)}
              className={styles.deleteBtn}
              title="Delete window"
            >✕</button>
          </h4>

          {!collapsedSections.includes(idx) && (
            <>
              {["roomName", "subcategory", "fabric", "color", "comments"].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
                  <input
                    type="text"
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required={field !== "comments"}
                  />
                </div>
              ))}

              {["control", "fit", "roll", "motorised", "baseRail", "componentColour", "brackets"].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
                  <select
                    name={field}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {dropdownOptions[field].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}

              {["width", "height"].map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field} (mm):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name={field}
                    className={styles.measurementInput}
                    value={window[field]}
                    onChange={(e) => handleWindowChange(idx, e)}
                    required
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

      <button
        type="button"
        className={styles.reviewBtn}
        onClick={() => setShowReview(true)}
      >
        📋 Review Before Submit
      </button>

      <button type="submit" className={styles.submitBtn}>
        ✅ Submit
      </button>

      {showReview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Review Submission</h3>
            <pre>{JSON.stringify({ ...formData, windows }, null, 2)}</pre>
            <button onClick={() => setShowReview(false)} className={styles.addBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
