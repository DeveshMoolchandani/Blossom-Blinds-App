import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SecurityDoorsPage() {
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
      location: '',
      doorType: '',
      fittingType: '',
      frameColour: '',
      lockType: '',
      topWidth: '',
      middleWidth: '',
      bottomWidth: '',
      leftHeight: '',
      middleHeight: '',
      rightHeight: '',
      lockHeight: '',
      lockPlacement: '',
      comments: ''
    }
  ]);

  const [collapsedSections, setCollapsedSections] = useState([]);

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
    setWindows(prev => [
      ...prev,
      {
        location: '',
        doorType: '',
        fittingType: '',
        frameColour: '',
        lockType: '',
        topWidth: '',
        middleWidth: '',
        bottomWidth: '',
        leftHeight: '',
        middleHeight: '',
        rightHeight: '',
        lockHeight: '',
        lockPlacement: '',
        comments: ''
      }
    ]);
  };

  const deleteWindow = (index) => {
    const current = windows[index];
    const isBlank = Object.values(current).every(val => val === '');
    if (!isBlank) {
      const confirmDelete = window.confirm("⚠️ This window has data. Delete?");
      if (!confirmDelete) return;
    }
    setWindows(windows.filter((_, i) => i !== index));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Security Door Submission", 14, 10);

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

    doc.save("security-door-form.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || windows.length === 0) {
      alert("Please fill in required fields.");
      return;
    }

    const payload = {
      ...formData,
      windows,
      productType: "Security Doors"
    };

    try {
      const res = await fetch('/api/roller-shutters-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.result === 'success') {
        alert('✅ Submitted successfully');
        generatePDF();
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      alert('❌ Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Security Door Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => setCollapsedSections(prev => prev.includes(-1) ? prev.filter(i => i !== -1) : [...prev, -1])}>
          Customer Information
        </h4>
        {!collapsedSections.includes(-1) && (
          <>
            {['salesRep', 'customerName', 'customerAddress', 'customerPhone', 'customerEmail'].map(field => (
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
          </>
        )}
      </div>

      {windows.map((win, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => setCollapsedSections(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}>
            {`Window ${idx + 1}`}
            <button type="button" onClick={() => deleteWindow(idx)} className={styles.deleteBtn}>✕</button>
          </h4>
          {!collapsedSections.includes(idx) && (
            <>
              {[{ name: 'location' },
                { name: 'doorType' },
                { name: 'fittingType', options: ['Hinged', 'Sliding', 'Fixed Side Panel', 'Stacker Door'] },
                { name: 'frameColour', options: ['ANOTEC DARK GREY', 'APO GREY', 'CUSTOM BLACK MATT', 'DEEP OCEAN SATIN', 'DOESKIN', 'DUNE MATT', 'JASPER SATIN', 'HAMERSLEY BROWN', 'MAGNOLIA', 'MONUMENT SATIN', 'MONUMENT MATT', 'NOTRE DAME', 'PRIMROSE GLOSS', 'PAPERBARK SATIN', 'PEARL WHITE', 'POTTERY', 'SURFMIST SATIN', 'STONE BEIGE MATT', 'ULTRA SILVER GLOSS', 'WHITE BIRCH', 'WOODLAND GREY SATIN', 'CLEAR ANOD', 'BRONZE ANOD', 'WESTERN RED CEDAR (Cost Extra)'] },
                { name: 'lockType', options: ['standard', '3 point lock', 'No lock fixed panel', 'stacker panel', 'digital lock', 'digital 3point', 'other'] },
                { name: 'topWidth', type: 'number' },
                { name: 'middleWidth', type: 'number' },
                { name: 'bottomWidth', type: 'number' },
                { name: 'leftHeight', type: 'number' },
                { name: 'middleHeight', type: 'number' },
                { name: 'rightHeight', type: 'number' },
                { name: 'lockHeight', type: 'number' },
                { name: 'lockPlacement', options: ['Above', 'Below'] },
                { name: 'comments' }
              ].map(field => (
                <div key={field.name} className={styles.inputGroup}>
                  <label>{field.name.replace(/([A-Z])/g, ' $1')}:</label>
                  {field.options ? (
                    <select name={field.name} value={win[field.name]} onChange={(e) => handleWindowChange(idx, e)} required>
                      <option value="">-- Select --</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={win[field.name]}
                      onChange={(e) => handleWindowChange(idx, e)}
                      required={field.name !== 'comments'}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
