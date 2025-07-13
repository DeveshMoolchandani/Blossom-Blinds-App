import { useState } from 'react';
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
  brackets: [
    "N/A", "─ Slim Combo ─", "Slim Combo Top Back", "Slim Combo Top Back to suit",
    "Slim Combo Top Front to suit", "Slim Combo Top front", "─ Dual ─", "Dual Opposite side",
    "Dual Same Side to suit", "Dual Same side", "Dual opposite Side to suit",
    "─ Other ─", "Single", "55mm", "None"
  ]
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
"other":[other],
};

const IndoorBlindsForm = () => {
  const [formData, setFormData] = useState({
    date: '', time: '', salesRep: '', customerName: '',
    customerAddress: '', customerPhone: '', customerEmail: ''
  });

  const [windows, setWindows] = useState([blankWindowTemplate]);
  const [collapsedSections, setCollapsedSections] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFormData(prev => ({ ...prev, date: formattedDate, time: formattedTime }));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    if (name === 'fabric') updated[index]['color'] = '';
    setWindows(updated);
    setIsDirty(true);
  };

  const addWindow = () => setWindows(prev => [...prev, blankWindowTemplate]);

  const deleteWindow = (index) => {
    const windowData = windows[index];
    const isEmpty = Object.values(windowData).every(val => !val);
    if (isEmpty) {
      setWindows(prev => prev.filter((_, i) => i !== index));
    } else {
      alert("❌ You cannot delete a filled window form.");
    }
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the entire form?")) {
      setFormData({
        date: '', time: '', salesRep: '', customerName: '',
        customerAddress: '', customerPhone: '', customerEmail: ''
      });
      setWindows([blankWindowTemplate]);
      setIsDirty(false);
      setShowReview(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(14);
    doc.text("Indoor Blinds Form", 10, y);
    y += 10;

    for (const [label, value] of Object.entries(formData)) {
      doc.setFontSize(10);
      doc.text(`${label}: ${value}`, 10, y);
      y += 6;
    }

    windows.forEach((win, i) => {
      doc.setFontSize(12);
      doc.text(`Window ${i + 1}`, 10, y);
      y += 6;
      for (const [key, val] of Object.entries(win)) {
        doc.setFontSize(9);
        doc.text(`${key}: ${val}`, 12, y);
        y += 5;
      }
    });

    doc.save(`indoor-blinds.pdf`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const auPhone = /^(?:\+61|0)[2-478]\d{8}$/;
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const postcode = /\b\d{4}\b/;

    if (!auPhone.test(formData.customerPhone.replace(/\s/g, '')))
      return alert("❌ Invalid Australian phone number");
    if (!email.test(formData.customerEmail))
      return alert("❌ Invalid email address");
    if (!postcode.test(formData.customerAddress))
      return alert("❌ Address must include a valid postcode");

    alert("✅ Form submitted!");
    generatePDF();
    setIsDirty(false);
  };

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader}>Customer Information</h4>
        {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
          <div key={field} className={styles.inputGroup}>
            <label>{capitalize(field)}</label>
            <input
              type={field === "customerPhone" ? "tel" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleFormChange}
              required
            />
          </div>
        ))}
      </div>

      {windows.map((w, i) => {
        const isEmpty = Object.values(w).every(val => !val);

        return (
          <div key={i} className={styles.windowSection}>
            <h4 className={styles.windowHeader} onClick={() => toggleCollapse(i)}>
              {w.roomName || `Window ${i + 1}`}
              {isEmpty && (
                <button type="button" onClick={() => deleteWindow(i)} className={styles.deleteBtn}>✕</button>
              )}
            </h4>

            {!collapsedSections.includes(i) && (
              <>
                {Object.keys(blankWindowTemplate).map(field => {
                  if (field === 'color') {
                    const colorOptions = fabricToColours[w.fabric] || [];
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>Colour</label>
                        <select name="color" value={w.color || ''} onChange={(e) => handleWindowChange(i, e)} required>
                          <option value="">-- Select Colour --</option>
                          {colorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (field === 'fabric') {
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>Fabric</label>
                        <select name="fabric" value={w.fabric || ''} onChange={(e) => handleWindowChange(i, e)} required>
                          <option value="">-- Select Fabric --</option>
                          {Object.keys(fabricToColours).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (blankWindow[field]) {
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>{capitalize(field)}</label>
                        <select name={field} value={w[field] || ''} onChange={(e) => handleWindowChange(i, e)} required>
                          <option value="">-- Select {capitalize(field)} --</option>
                          {blankWindow[field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>{capitalize(field)}</label>
                      <input
                        type={['width', 'height'].includes(field) ? 'number' : 'text'}
                        inputMode={['width', 'height'].includes(field) ? 'numeric' : 'text'}
                        name={field}
                        value={w[field] || ''}
                        onChange={(e) => handleWindowChange(i, e)}
                        required={['width', 'height'].includes(field)}
                        className={['width', 'height'].includes(field) ? styles.measurementHighlight : ''}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}

      <div className={styles.buttonGroup}>
        <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
        <button type="button" onClick={() => setShowReview(true)} className={styles.reviewBtn}>📋 Preview</button>
        <button type="button" onClick={handleReset} className={styles.reviewBtn}>🔁 Reset Form</button>
        <button type="submit" className={styles.submitBtn}>✅ Submit</button>
      </div>

      {showReview && (
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
            <button onClick={() => setShowReview(false)} className={styles.addBtn}>❌ Close Preview</button>
          </div>
        </div>
      )}
    </form>
  );
};

export default IndoorBlindsForm;
