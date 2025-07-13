import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import styles from '../styles/Form.module.css';

const blankWindowTemplate = {
  roomName: '', subcategory: '', fabric: '', color: '', control: '', fit: '', roll: '',
  motorised: '', bottomFinish: '', baseRail: '', componentColour: '', brackets: '',
  comments: '', width: '', height: ''
};

const blankWindow = {
  control: ["Left", "Right"],
  fit: ["Face", "Recess"],
  roll: ["Standard", "Reverse"],
  motorised: ["Yes", "No"],
  bottomFinish: ["N/A", "D30", "D30 Silent", "Flat", "Heavy Duty", "Oval", "S-1", "S-5", "S-6", "S-7", "S-8", "S-9"],
  baseRail: ["N/A", "Anodised", "Bone", "Pure White", "Sandstone", "Satin Black"],
  componentColour: ["N/A", "Black", "White", "Grey", "Sandstone"],
  brackets: ["N/A", "─ Slim Combo ─", "Slim Combo Top Back", "Slim Combo Top Back to suit",
    "Slim Combo Top Front to suit", "Slim Combo Top front", "─ Dual ─", "Dual Opposite side",
    "Dual Same Side to suit", "Dual Same side", "Dual opposite Side to suit", "─ Other ─",
    "Single", "55mm", "None"]
};

const fabricToColours = {
  "ANSARI": ["ASH", "CHARCOAL", "FOG", "FOSSIL", "LEAD", "SLATE", "STONE", "TO CONFIRM", "OTHER"],
  "OTHER": ["TO CONFIRM", "OTHER"]
};

const fabricOptions = [...Object.keys(fabricToColours).filter(f => f !== "OTHER").sort(), "OTHER"];

export default function IndoorBlindsForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '', time: '', salesRep: '', customerName: '', customerAddress: '', customerPhone: '', customerEmail: ''
  });
  const [windows, setWindows] = useState([JSON.parse(JSON.stringify(blankWindowTemplate))]);
  const [collapsedSections, setCollapsedSections] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    console.log("✅ IndoorBlindsForm rendered");
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, []);

  const isDirty = () =>
    Object.values(formData).some(v => v.trim() !== '') ||
    windows.some(w => Object.values(w).some(v => v.trim() !== ''));

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    if (name === 'fabric') updated[index]['color'] = '';
    setWindows(updated);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const addWindow = () => {
    setWindows(prev => [...prev, JSON.parse(JSON.stringify(blankWindowTemplate))]);
  };

  const deleteWindow = (index) => {
    const isEmpty = Object.values(windows[index]).every(val => val.trim() === '');
    if (!isEmpty) return alert("❌ Cannot delete a filled form.");
    setWindows(windows.filter((_, i) => i !== index));
  };

  const handleHomeClick = () => {
    console.log("🏠 Home button clicked");
    if (isDirty()) {
      const confirmLeave = window.confirm("⚠️ You have unsaved data. Go home anyway?");
      if (!confirmLeave) return;
    }
    router.push('/');
  };

  const handleReset = () => {
    if (confirm("Reset the form?")) {
      setFormData({
        date: '', time: '', salesRep: '', customerName: '', customerAddress: '', customerPhone: '', customerEmail: ''
      });
      setWindows([JSON.parse(JSON.stringify(blankWindowTemplate))]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Indoor Blinds Form", 10, 10);
    let y = 20;
    Object.entries(formData).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, 10, y);
      y += 6;
    });
    windows.forEach((w, idx) => {
      doc.text(`\nWindow ${idx + 1}`, 10, y);
      y += 6;
      Object.entries(w).forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, 12, y);
        y += 5;
      });
    });
    doc.save("indoor-blinds.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^(0|\+61)[2-478]( ?\d){7,8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const postcodeRegex = /\b\d{4}\b/;

    if (!phoneRegex.test(formData.customerPhone)) return alert("❌ Invalid phone number");
    if (!emailRegex.test(formData.customerEmail)) return alert("❌ Invalid email");
    if (!postcodeRegex.test(formData.customerAddress)) return alert("❌ Address must include a postcode");

    const payload = { ...formData, windows, productType: "Indoor Blinds" };

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbyoJqooQOmPZJvCN5w2zNOoN8O9ynBrIdrtRZHEjD9JWUwzNll2i1N_7I6_ZEanwhg2/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.result === "success") {
        generatePDF();
        alert("✅ Submitted successfully");
        handleReset();
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    } catch {
      alert("❌ Network error");
    }
  };

  const capitalize = s =>
    s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={() => {
            console.log("🏠 Home button clicked");
            handleHomeClick();
          }}
          className={styles.reviewBtn}
        >
          🏠 Home
        </button>
        <button type="button" onClick={() => setShowPreview(true)} className={styles.reviewBtn}>📋 Preview</button>
        <button type="button" onClick={handleReset} className={styles.reviewBtn}>🔁 Reset Form</button>
      </div>

      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
        <div className={styles.inputGroup} key={field}>
          <label>{capitalize(field)}</label>
          <input name={field} value={formData[field]} onChange={handleFormChange} required />
        </div>
      ))}

      {windows.map((w, i) => (
        <div key={i} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(i)}>
            {w.roomName || `Window ${i + 1}`}
            {Object.values(w).every(val => val === '') && (
              <button type="button" onClick={() => deleteWindow(i)} className={styles.deleteBtn}>✕</button>
            )}
          </h4>
          {!collapsedSections.includes(i) && (
            <>
              {Object.keys(blankWindowTemplate).map(field => {
                if (field === 'fabric') {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Fabric</label>
                      <select name="fabric" value={w.fabric} onChange={e => handleWindowChange(i, e)} required>
                        <option value="">-- Select Fabric --</option>
                        {fabricOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }
                if (field === 'color') {
                  const options = fabricToColours[w.fabric] || [];
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Colour</label>
                      <select name="color" value={w.color} onChange={e => handleWindowChange(i, e)} required>
                        <option value="">-- Select Colour --</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }
                if (blankWindow[field]) {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>{capitalize(field)}</label>
                      <select name={field} value={w[field]} onChange={e => handleWindowChange(i, e)}>
                        <option value="">-- Select --</option>
                        {blankWindow[field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={field} className={styles.inputGroup}>
                    <label>{capitalize(field)}</label>
                    <input
                      name={field}
                      value={w[field]}
                      onChange={e => handleWindowChange(i, e)}
                      type={['width', 'height'].includes(field) ? 'number' : 'text'}
                      inputMode={['width', 'height'].includes(field) ? 'numeric' : 'text'}
                      className={['width', 'height'].includes(field) ? styles.measurementHighlight : ''}
                      required={['width', 'height'].includes(field)}
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      ))}

      <div className={styles.buttonGroup}>
        <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
        <button type="submit" className={styles.submitBtn}>✅ Submit</button>
      </div>

      {showPreview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Review Info</h3>
            {Object.entries(formData).map(([k, v]) => (
              <p key={k}><strong>{capitalize(k)}:</strong> {v}</p>
            ))}
            {windows.map((w, idx) => (
              <div key={idx}>
                <h4>Window {idx + 1}</h4>
                {Object.entries(w).map(([k, v]) => (
                  <p key={k}><strong>{capitalize(k)}:</strong> {v}</p>
                ))}
              </div>
            ))}
            <button onClick={() => setShowPreview(false)} className={styles.addBtn}>❌ Close Preview</button>
          </div>
        </div>
      )}
    </form>
  );
}
