import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import styles from '../styles/Form.module.css';

export default function PlantationShuttersForm() {
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

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, time: formattedTime, date: formattedDate }));
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

  const handleWindowChange = (index, e) => {
    setFormStarted(true);
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;

    // Auto-calculate squareMetre
    const width = parseFloat(updated[index].width);
    const drop = parseFloat(updated[index].drop);
    if (!isNaN(width) && !isNaN(drop)) {
      updated[index].squareMetre = ((width / 1000) * (drop / 1000)).toFixed(2);
    }

    setWindows(updated);
  };

  const addWindow = () => {
    setWindows(prev => [...prev, {
      location: '', width: '', drop: '', squareMetre: '',
      colour: '', mountingMethod: '', inOrOut: '', panelQty: '',
      bladeSize: '', midRailHeight: '', layoutCode: '', hingeColour: '',
      tiltrodType: '', frameType: '', left: '', right: '', top: '',
      bottom: '', lightBlock: '', comments: ''
    }]);
  };

  const deleteWindow = (index) => {
    const isBlank = Object.values(windows[index]).every(val => val === '');
    if (!isBlank) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Plantation Shutters Form', 10, 10);
    Object.entries(formData).forEach(([key, value], i) => {
      doc.text(`${key}: ${value}`, 10, 20 + i * 8);
    });

    windows.forEach((win, i) => {
      doc.text(`Window ${i + 1}`, 10, 100 + i * 70);
      Object.entries(win).forEach(([k, v], j) => {
        doc.text(`${k}: ${v}`, 12, 110 + i * 70 + j * 6);
      });
    });

    doc.save('plantation-shutters.pdf');
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
        setFormData({
          date: '', time: '', salesRep: '', customerName: '',
          customerAddress: '', customerPhone: '', customerEmail: ''
        });
        setWindows([{
          location: '', width: '', drop: '', squareMetre: '',
          colour: '', mountingMethod: '', inOrOut: '', panelQty: '',
          bladeSize: '', midRailHeight: '', layoutCode: '', hingeColour: '',
          tiltrodType: '', frameType: '', left: '', right: '', top: '',
          bottom: '', lightBlock: '', comments: ''
        }]);
        setCollapsedSections([]);
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
      <h2 className={styles.formTitle}>Plantation Shutters</h2>

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
            <button
              type="button"
              onClick={() => deleteWindow(idx)}
              className={styles.deleteBtn}
              title="Delete window"
            >✕</button>
          </h4>

          {!collapsedSections.includes(idx) && (
            <>
              {Object.keys(window).map(field => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
                  {["colour", "mountingMethod", "inOrOut", "bladeSize", "hingeColour", "tiltrodType", "frameType", "left", "right", "top", "bottom", "lightBlock"].includes(field) ? (
                    <select name={field} value={window[field]} onChange={(e) => handleWindowChange(idx, e)}>
                      <option value="">Select</option>
                      {getOptions(field).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={["width", "drop", "squareMetre"].includes(field) ? "number" : "text"}
                      name={field}
                      value={window[field]}
                      onChange={(e) => handleWindowChange(idx, e)}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>
        ➕ Add Another Window
      </button>

      <button type="submit" className={styles.submitBtn}>
        ✅ Submit & Download PDF
      </button>
    </form>
  );
}

function getOptions(field) {
  const options = {
    colour: ['Alpine white', 'Ivory', 'Pure white', 'To confirm', 'Other'],
    mountingMethod: ['N/A', 'Bay Window Hinged', 'Bifold', 'Bypass', 'Corner Window Hinged', 'Double Hinged', 'Pivot Hinge', 'Standard Hinged', 'U Channel'],
    inOrOut: ['In', 'Out'],
    bladeSize: ['114MM', '63MM', '89MM'],
    hingeColour: ['NA', 'Silver', 'Stainless Steel', 'To Match', 'White'],
    tiltrodType: ['NA', 'Hidden'],
    frameType: ['N/A', 'Medium L No Cap', 'Medium L', 'Cap', 'No Frame', 'Small L No Cap', 'Z Frame'],
    left: ['Yes', 'No', 'Still'],
    right: ['Yes', 'No', 'Still'],
    top: ['Yes', 'No', 'Still'],
    bottom: ['Yes', 'No', 'Still'],
    lightBlock: ['N/A', 'B', 'L', 'LR', 'LRTB', 'NO', 'R', 'T', 'TB']
  };
  return options[field] || [];
}
