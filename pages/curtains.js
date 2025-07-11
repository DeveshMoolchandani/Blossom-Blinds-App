import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import { useRouter } from 'next/router';

export default function CurtainsForm() {
  const router = useRouter();

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
      width: '',
      height: '',
      customSplit: '',
      headingType: '',
      track: '',
      trackColor: '',
      control: '',
      fixing: '',
      comments: ''
    }
  ]);

  const [collapsedSections, setCollapsedSections] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, time: formattedTime, date: formattedDate }));
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (formStarted) {
        const confirmLeave = confirm("⚠️ Leaving will clear all entered data. Are you sure?");
        if (!confirmLeave) {
          router.events.emit('routeChangeError');
          throw 'Route change blocked.';
        }
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [formStarted]);

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleFormChange = (e) => {
    setFormStarted(true);
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    setFormStarted(true);
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
        customSplit: '',
        headingType: '',
        track: '',
        trackColor: '',
        control: '',
        fixing: '',
        comments: ''
      }
    ]);
  };

  const deleteWindow = (index) => {
    const current = windows[index];
    const isBlank = Object.values(current).every(val => val === '');
    if (!isBlank) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
  };

  const validateMeasurements = () => {
    return windows.every(w =>
      /^\d+$/.test(w.width) &&
      /^\d+$/.test(w.height)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || windows.length === 0) {
      alert("Please fill in Customer Name, Phone, and at least one window");
      return;
    }

    if (!validateMeasurements()) {
      alert("Width and Height must be numeric (in mm). Please double-check.");
      return;
    }

    const payload = {
      ...formData,
      windows,
      productType: "Curtains"
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
          width: '',
          height: '',
          customSplit: '',
          headingType: '',
          track: '',
          trackColor: '',
          control: '',
          fixing: '',
          comments: ''
        }]);
        setCollapsedSections([]);
        setShowReview(false);
        setFormStarted(false);
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      alert('❌ Network error — submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          <span>Customer Information</span>
          <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>
            {formData.customerName || ''}
          </span>
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
              {[ "roomName", "subcategory", "fabric", "color", "customSplit", "headingType", "track", "trackColor", "control", "fixing", "comments" ]
                .map(field => (
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
            <h3>Review Information</h3>
            {Object.entries(formData).map(([key, value]) => (
              <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}</p>
            ))}
            {windows.map((win, i) => (
              <div key={i}>
                <h4>Window {i + 1}</h4>
                {Object.entries(win).map(([k, v]) => (
                  <p key={k}><strong>{k.replace(/([A-Z])/g, ' $1')}:</strong> {v}</p>
                ))}
              </div>
            ))}
            <button onClick={() => setShowReview(false)} className={styles.addBtn}>
              ❌ Close Preview
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
