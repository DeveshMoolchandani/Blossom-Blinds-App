import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';

const blankWindow = {
  roomName: '',
  subcategory: '',
  fabric: '',
  color: '',
  width: '',
  height: '',
  control: '',
  fit: '',
  roll: '',
  motorised: '',
  bottomFinish: '',
  baseRail: '',
  componentColour: '',
  brackets: '',
  comments: ''
};

const fabricToColours = {
  "ICON FR": ["CEYLON", "FLORA", "HARBOUR", "JET", "LEATHER", "LIQUORICE", "MARITIME", "OSPREY", "PAPYRUS", "SAIL", "SCULPTURE", "SEA MIST", "SOLAR", "STONEWASH", "TAURUS", "TO CONFIRM", "OTHER"],
  "LINESQUE LIGHT FILTER": ["CHESTNUT", "DELTA", "GRANITE", "HAZEL", "LEVI", "LILY", "OATCAKE", "OWL", "STONEWASH", "TO CONFIRM", "TRELLIS", "WICKER", "WINTER", "OTHER"],
  "ZENO": ["BARRANCA", "CUSCO", "ICA", "LIMA", "MALA", "PUNO", "TARMA", "TO CONFIRM", "OTHER"],
  "SKYE LIGHT FILTER": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM", "OTHER"],
  "SKYE BLOCKOUT": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM", "OTHER"],
  "LE REVE LIGHT FILTER": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM", "OTHER"],
  "LE REVE BLOCKOUT": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM", "OTHER"],
  "MANTRA LIGHT FILTER": ["COTTON", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "TO CONFIRM", "OTHER"],
  "MANTRA BLOCKOUT": ["COTTON", "FLINT", "OPAL", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "SPICE", "TO CONFIRM", "OTHER"],
  "KLEENSCREEN": ["ALLOY", "BARLEY", "BLACK", "BLACK PEARL", "CHARCOAL", "GRAPHITE", "GREY", "IVORY", "PEWTER", "PURE WHITE", "SHALE", "SILVER PEARL", "TO CONFIRM", "WHITE PEARL", "OTHER"],
  "ANSARI": ["ASH", "CHARCOAL", "COCONUT", "FOG", "FOSSIL", "LEAD", "SLATE", "STONE", "TO CONFIRM", "OTHER"],
  "BALMORAL BLOCKOUT": ["ARMOUR", "BIRCH", "BOURNEVILLE", "CHROME", "CONCRETE", "DOVE", "JET", "PEARL", "PLATINUM", "PUTTY", "PYRITE", "STEEL", "TO CONFIRM", "WHITE", "OTHER"],
  "BALMORAL LIGHT FILTER": ["DRIFTWOOD", "DUNE", "PAPERBARK", "PUMICE", "SAND", "SURF", "TO CONFIRM", "OTHER"],
  "VIBE": ["ALLOY", "BIRCH", "BISTRO", "CHATEAU", "CLAY", "CLOUD", "COAL", "DUNE", "ICE", "LACE", "LIMESTONE", "LINEN", "LOFT", "MIST", "NIMBUS", "ODESSEY", "ORIENT", "PORCELAIN", "PURE", "SPIRIT DISCONTINUED", "STONE", "STORM", "SURF", "TERRACE", "TO CONFIRM", "TUNDRA", "WHISPER", "ZIRCON", "OTHER"],
  "FOCUS": ["ASH", "BAY", "CARBON", "CHALK", "CLOUD", "COAL", "DOVE", "DRIFT", "EBONY", "ESPRESSO", "FEATHER", "FIG - DISCONTINUED", "MAGNETIC", "MIST", "OYSTER", "POLAR", "POWDER - DISCONTINUED", "SANDSTONE -DISCONTINUED", "SHELL", "TEMPEST", "TO CONFIRM", "WHITE", "OTHER"],
  "METROSHADE BLOCKOUT": ["BLACK", "DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "PEBBLE", "QUILL", "SEAL", "SLATE", "STORM", "TO CONFIRM", "WHITEWASH", "OTHER"],
  "METROSHADE LIGHT FILTER": ["DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "QUILL", "TO CONFIRM", "OTHER"],
  "SANCTUARY BLOCKOUT": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SUEDE", "TO CONFIRM", "TRUFFLE", "WHITEWASH", "OTHER"],
  "SANCTUARY LIGHT FILTER": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SLATE", "SUEDE", "TO CONFIRM", "WHITEWASH", "OTHER"],
  "TERRA": ["ARIA", "ELA", "FLINT", "HAZEL", "KAI", "MISTY", "RIDGE", "STELLA", "STORM", "TO CONFIRM", "WILLOW", "OTHER"],
  "ETCH": ["FELT", "MONO", "PENCIL", "PLATE", "STEEL", "TISSUE", "TO CONFIRM", "ZINC", "OTHER"],
  "ONESCREEN": ["BLACK", "CHARCOAL", "DUNE", "GREY", "GUNMETAL", "ICE", "LINEN BRONZE", "MERCURY", "SAND", "SILVER BLACK", "TO CONFIRM", "WALLABY", "WHITE", "OTHER"]
};

const fabricOptions = Object.keys(fabricToColours).sort();
export default function IndoorBlindsForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    salesRep: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    formID: ''
  });

  const [windows, setWindows] = useState([{ ...blankWindow }]);
  const [collapsedSections, setCollapsedSections] = useState([0]);
  const [showReview, setShowReview] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      time: formattedTime,
      date: formattedDate
    }));
  }, []);

  useEffect(() => {
    if (formData.customerName) {
      const prefix = formData.customerName.trim().slice(0, 3).toUpperCase().padEnd(3, 'X');
      const storedCount = localStorage.getItem(`formIDCount_${prefix}`);
      const nextCount = storedCount ? parseInt(storedCount) + 1 : 1;
      localStorage.setItem(`formIDCount_${prefix}`, nextCount);
      const formID = `${prefix}${String(nextCount).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, formID }));
    }
  }, [formData.customerName]);

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
    if (name === 'fabric') updated[index]['color'] = '';
    setWindows(updated);
  };

  const toggleCollapse = (index) => {
    setCollapsedSections([index]);
  };

  const addWindow = () => {
    const newIndex = windows.length;
    setWindows(prev => [...prev, { ...blankWindow }]);
    setCollapsedSections([newIndex]);
  };

  const deleteWindow = (index) => {
    const current = windows[index];
    const isBlank = Object.values(current).every(val => val === '');
    if (!isBlank) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    setCollapsedSections([]);
  };

  const validateMeasurements = () => {
    return windows.every(w => /^\d+$/.test(w.width) && /^\d+$/.test(w.height));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    doc.text('Indoor Blinds Form Submission', 10, 10);
    let y = 20;

    Object.entries(formData).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 10, y);
      y += 7;
    });

    windows.forEach((win, i) => {
      y += 10;
      doc.text(`Window ${i + 1}`, 10, y);
      y += 7;
      Object.entries(win).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 12, y);
        y += 6;
      });
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

    for (let win of windows) {
      if ((win.fabric === 'OTHER' || win.color === 'OTHER') && !win.comments.trim()) {
        alert("If you select 'Other' for fabric or colour, comments field is required.");
        return;
      }
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
        generatePDF();
        setFormData({
          date: '', time: '', salesRep: '', customerName: '',
          customerAddress: '', customerPhone: '', customerEmail: '', formID: ''
        });
        setWindows([{ ...blankWindow }]);
        setCollapsedSections([0]);
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
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          Customer Information — {formData.formID}
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

            <div className={styles.inputGroup}>
              <label>Form ID:</label>
              <input type="text" value={formData.formID} readOnly className={styles.readOnlyInput} />
            </div>
          </>
        )}
      </div>

      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            Window {idx + 1} — {window.roomName || ''}
            <button
              type="button"
              onClick={() => deleteWindow(idx)}
              className={styles.deleteBtn}
              title="Delete"
            >✕</button>
          </h4>

          {!collapsedSections.includes(idx) && (
            <>
              {["roomName", "subcategory", "fabric", "color", "control", "fit", "roll", "motorised", "bottomFinish", "baseRail", "componentColour", "brackets", "comments"].map(field => {
                if (field === "fabric") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Fabric:</label>
                      <select
                        name="fabric"
                        value={window.fabric}
                        onChange={(e) => handleWindowChange(idx, e)}
                        required
                      >
                        <option value="">-- Select Fabric --</option>
                        {fabricOptions.map(fab => (
                          <option key={fab} value={fab}>{fab}</option>
                        ))}
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  );
                }

                if (field === "color") {
                  const colours = fabricToColours[window.fabric] || [];
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Colour:</label>
                      <select
                        name="color"
                        value={window.color}
                        onChange={(e) => handleWindowChange(idx, e)}
                        required
                        disabled={!window.fabric}
                      >
                        <option value="">-- Select Colour --</option>
                        {colours.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  );
                }

                if (field === "baseRail") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Base Rail Colour:</label>
                      <input
                        type="text"
                        name={field}
                        value={window[field]}
                        onChange={(e) => handleWindowChange(idx, e)}
                        required
                      />
                    </div>
                  );
                }

                if (field === "comments") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Comments:</label>
                      <textarea
                        name="comments"
                        value={window.comments}
                        onChange={(e) => handleWindowChange(idx, e)}
                        rows={2}
                        required={(window.fabric === 'OTHER' || window.color === 'OTHER')}
                      />
                    </div>
                  );
                }

                return (
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
                );
              })}

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

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="button" onClick={() => setShowReview(true)} className={styles.reviewBtn}>📋 Review Before Submit</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>

      {showReview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Review Information</h3>
            {Object.entries(formData).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {value}</p>
            ))}
            {windows.map((win, i) => (
              <div key={i}>
                <h4>Window {i + 1}</h4>
                {Object.entries(win).map(([k, v]) => (
                  <p key={k}><strong>{k}:</strong> {v}</p>
                ))}
              </div>
            ))}
            <button onClick={() => setShowReview(false)} className={styles.addBtn}>❌ Close Review</button>
          </div>
        </div>
      )}
    </form>
  );
}
