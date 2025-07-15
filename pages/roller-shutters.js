import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RollerShuttersPage() {
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
      shutterType: '',
      openingWidth: '',
      widthFit: '',
      height: '',
      mainProfileColour: '',
      pelmetColour: '',
      bottomBarColour: '',
      guideColour: '',
      controlStyle: '',
      motorSide: '',
      comments: ''
    }
  ]);

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0]
    }));
  }, []);

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
      shutterType: '',
      openingWidth: '',
      widthFit: '',
      height: '',
      mainProfileColour: '',
      pelmetColour: '',
      bottomBarColour: '',
      guideColour: '',
      controlStyle: '',
      motorSide: '',
      comments: ''
    }]);
  };

  const deleteWindow = (index) => {
    const current = windows[index];
    const isBlank = Object.values(current).every(val => val === '');
    if (!isBlank) {
      const confirmDelete = window.confirm("⚠️ This window has data. Are you sure you want to delete?");
      if (!confirmDelete) return;
    }
    setWindows(windows.filter((_, i) => i !== index));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Roller Shutters Submission", 14, 10);

    const customerRows = Object.entries(formData).map(([key, value]) => [key, value]);
    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: customerRows
    });

    windows.forEach((win, idx) => {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Window ${idx + 1}`]],
        body: [],
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: Object.entries(win).map(([k, v]) => [k, v])
      });
    });

    doc.save("roller-shutters-form.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || windows.length === 0) {
      alert("Please fill in Customer Name, Phone, and at least one window");
      return;
    }

    const payload = {
      ...formData,
      windows,
      productType: "Roller Shutters"
    };

    try {
      const res = await fetch('/api/roller-shutters-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.result === 'success') {
        alert('✅ Form submitted successfully!');
        generatePDF();
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      alert('❌ Network error — submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Roller Shutters Form</h2>

      <div className={styles.windowSection}>
        <h4>Customer Information</h4>
        {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
          <div key={field} className={styles.inputGroup}>
            <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleFormChange}
              required
            />
          </div>
        ))}
      </div>

      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4>{`Shutter ${idx + 1}`}</h4>
          <button type="button" onClick={() => deleteWindow(idx)} className={styles.deleteBtn}>✕</button>

          {[
            { name: 'shutterType', options: ['42mm Double Line - Standard (Suitable for widths up to 3200mm)', 'Other'] },
            { name: 'openingWidth' },
            { name: 'widthFit', options: ['Face (covers frame) (+/+)', 'Reveal (frame visible) (-/-)', 'Face / Reveal (+/-)', 'Reveal / Face (-/+)'] },
            { name: 'height' },
            { name: 'mainProfileColour', options: ['Unspecified', 'CREAM', 'OLRBEIGE', 'WHITE', 'GREY', 'BROWN', 'BEIGE(Mushroom)', 'GREEN', 'RED', 'BRONZE', 'BLACK', 'SILVER', 'DEEPOCEAN', 'MAGNOLIA', 'WOLANDGREY', 'MONUMENT', 'JASPER', 'SUREMIST', 'DUNE'] },
            { name: 'pelmetColour' },
            { name: 'bottomBarColour' },
            { name: 'guideColour' },
            { name: 'controlStyle', options: ['Manual', 'Motorised', 'Without control'] },
            { name: 'motorSide', options: ['Left', 'Right'] },
            { name: 'comments' }
          ].map(field => (
            <div key={field.name} className={styles.inputGroup}>
              <label>{field.name.replace(/([A-Z])/g, ' $1')}:</label>
              {field.options ? (
                <select name={field.name} value={window[field.name]} onChange={(e) => handleWindowChange(idx, e)} required>
                  <option value="">-- Select --</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={window[field.name]}
                  onChange={(e) => handleWindowChange(idx, e)}
                  required={field.name !== 'comments'}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Shutter</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
