import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/router';

export default function PlantationShuttersPage() {
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
      location: '',
      width: '',
      drop: '',
      squareMetre: '',
      colour: '',
      mountingMethod: '',
      inOrOut: '',
      panelQty: '',
      bladeSize: '',
      midRailHeight: '',
      layoutCode: '',
      hingeColour: '',
      tiltrodType: '',
      frameType: '',
      left: '',
      right: '',
      top: '',
      bottom: '',
      lightBlock: '',
      comments: ''
    }
  ]);

  const [collapsedSections, setCollapsedSections] = useState([]);
  const [formStarted, setFormStarted] = useState(false);
  const [discount, setDiscount] = useState(0); // %
  const [totalPrice, setTotalPrice] = useState(0); // $

  const PRICE_PER_M2 = 540;

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0]
    }));
  }, []);

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

  const calculateTotalPrice = (winList = windows, discountPercent = discount) => {
    const subtotal = winList.reduce((acc, w) => {
      const sqm = parseFloat(w.squareMetre);
      return acc + (isNaN(sqm) ? 0 : sqm * PRICE_PER_M2);
    }, 0);
    const discounted = subtotal * (1 - discountPercent / 100);
    setTotalPrice(discounted.toFixed(2));
  };

  const handleWindowChange = (index, e) => {
    setFormStarted(true);
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;

    const width = parseFloat(updated[index].width);
    const drop = parseFloat(updated[index].drop);

    if (!isNaN(width) && !isNaN(drop)) {
      updated[index].squareMetre = ((width / 1000) * (drop / 1000)).toFixed(2);
    } else {
      updated[index].squareMetre = '';
    }

    setWindows(updated);
    calculateTotalPrice(updated, discount);
  };

  const addWindow = () => {
    const newWindow = {
      location: '',
      width: '',
      drop: '',
      squareMetre: '',
      colour: '',
      mountingMethod: '',
      inOrOut: '',
      panelQty: '',
      bladeSize: '',
      midRailHeight: '',
      layoutCode: '',
      hingeColour: '',
      tiltrodType: '',
      frameType: '',
      left: '',
      right: '',
      top: '',
      bottom: '',
      lightBlock: '',
      comments: ''
    };

    const updated = [...windows, newWindow];
    setWindows(updated);
    calculateTotalPrice(updated, discount);
  };

  const deleteWindow = (index) => {
    const current = windows[index];
    const isBlank = Object.values(current).every(val => val === '');
    if (!isBlank) {
      const confirmDelete = window.confirm("⚠️ This window has data. Are you sure you want to delete?");
      if (!confirmDelete) return;
    }
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    calculateTotalPrice(updated, discount);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Plantation Shutters Submission", 14, 10);

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

    // Price summary
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Summary', 'Value']],
      body: [
        ['Discount (%)', discount + '%'],
        ['Total Price ($)', '$' + totalPrice]
      ]
    });

    doc.save("plantation-shutters-form.pdf");
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
      discount,
      totalPrice,
      productType: "Plantation Shutters"
    };

    try {
      const res = await fetch('/api/plantation-shutters-proxy', {
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
      <h2 className={styles.formTitle}>Plantation Shutters Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          <span>Customer Information</span>
        </h4>
        {!collapsedSections.includes(-1) && (
          <>
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
          </>
        )}
      </div>

      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>{`Window ${idx + 1}`}</span>
            <button
              type="button"
              onClick={() => deleteWindow(idx)}
              className={styles.deleteBtn}
              title="Delete window"
            >✕</button>
          </h4>

          {!collapsedSections.includes(idx) && (
            <>
              {[
                { name: 'location' },
                { name: 'width', type: 'number' },
                { name: 'drop', type: 'number' },
                { name: 'squareMetre', readOnly: true },
                { name: 'colour', options: ['Alpine white', 'Ivory', 'Pure white', 'To confirm', 'Other'] },
                { name: 'mountingMethod', options: ['N/A', 'Bay Window Hinged', 'Bifold', 'Bypass', 'Corner Window Hinged', 'Double Hinged', 'Pivot Hinge', 'Standard Hinged', 'U Channel'] },
                { name: 'inOrOut', options: ['In', 'Out'] },
                { name: 'panelQty' },
                { name: 'bladeSize', options: ['114MM', '63MM', '89MM'] },
                { name: 'midRailHeight' },
                { name: 'layoutCode' },
                { name: 'hingeColour', options: ['NA', 'Silver', 'Stainless Steel', 'To Match', 'White'] },
                { name: 'tiltrodType', options: ['NA', 'Hidden'] },
                { name: 'frameType', options: ['N/A', 'Medium L No Cap', 'Medium L', 'Cap', 'No Frame', 'Small L No Cap', 'Z Frame'] },
                { name: 'left', options: ['Yes', 'No', 'Still'] },
                { name: 'right', options: ['Yes', 'No', 'Still'] },
                { name: 'top', options: ['Yes', 'No', 'Still'] },
                { name: 'bottom', options: ['Yes', 'No', 'Still'] },
                { name: 'lightBlock', options: ['N/A', 'B', 'L', 'LR', 'LRTB', 'NO', 'R', 'T', 'TB'] },
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
                      type={field.type || "text"}
                      name={field.name}
                      value={window[field.name]}
                      readOnly={field.readOnly}
                      onChange={(e) => handleWindowChange(idx, e)}
                      required={!field.readOnly && field.name !== "comments"}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <div className={styles.inputGroup}>
        <label>Discount (%):</label>
        <input
          type="number"
          value={discount}
          min="0"
          max="100"
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            const safeVal = isNaN(val) ? 0 : val;
            setDiscount(safeVal);
            calculateTotalPrice(windows, safeVal);
          }}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Total Price ($):</label>
        <input
          type="text"
          value={totalPrice}
          readOnly
        />
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
