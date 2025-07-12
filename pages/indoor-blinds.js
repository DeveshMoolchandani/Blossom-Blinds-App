import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import { AnimatePresence, motion } from 'framer-motion';
import styles from '../styles/Form.module.css';

const blankWindowTemplate = {
  roomName: '', subcategory: '', fabric: '', color: '', control: '',
  fit: '', roll: '', motorised: '', bottomFinish: '', baseRail: '',
  componentColour: '', brackets: '', comments: '', width: '', height: ''
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
    "Slim Combo Top Front to suit", "Slim Combo Top front", "─ Dual ─",
    "Dual Opposite side", "Dual Same Side to suit", "Dual Same side",
    "Dual opposite Side to suit", "─ Other ─", "Single", "55mm", "None"
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
};

const fabricOptions = Object.keys(fabricToColours).sort();

function generatePDF(formData, windows) {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text("Indoor Blinds Order Form", 10, y);
  y += 10;

  const addField = (label, value) => {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 10, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${value || ''}`, 60, y);
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  };

  Object.entries(formData).forEach(([k, v]) => {
    addField(k.replace(/([A-Z])/g, ' $1'), v);
  });

  windows.forEach((w, i) => {
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text(`Window ${i + 1}`, 10, y);
    y += 7;

    Object.entries(w).forEach(([k, v]) => {
      addField(k.replace(/([A-Z])/g, ' $1'), v);
    });
  });

  return doc;
}
export default function IndoorBlindsForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '', time: '', salesRep: '', customerName: '',
    customerAddress: '', customerPhone: '', customerEmail: '', formID: ''
  });

  const [windows, setWindows] = useState([blankWindowTemplate]);
  const [isDirty, setIsDirty] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
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

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (isDirty && !confirm("⚠️ You have unsaved changes. Are you sure you want to leave this page?")) {
        router.events.emit('routeChangeError');
        throw 'Route change cancelled';
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [isDirty]);

  useEffect(() => {
    if (formData.customerName) {
      const prefix = formData.customerName.trim().slice(0, 3).toUpperCase().padEnd(3, 'X');
      const stored = localStorage.getItem(`formIDCount_${prefix}`);
      const count = stored ? parseInt(stored) + 1 : 1;
      localStorage.setItem(`formIDCount_${prefix}`, count);
      const id = `${prefix}${String(count).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, formID: id }));
    }
  }, [formData.customerName]);

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
  const deleteWindow = (index) => setWindows(windows.filter((_, i) => i !== index));
  const toggleCollapse = (i) =>
    setCollapsedSections(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );

  const capitalize = str => str.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auPhone = /^(\+61|0)[2-478]( ?\d){8}$/;
    if (!auPhone.test(formData.customerPhone)) return alert("❌ Invalid Australian phone number");

    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.test(formData.customerEmail)) return alert("❌ Invalid email address");

    const postcode = /\b\d{4}\b/;
    if (!postcode.test(formData.customerAddress)) return alert("❌ Address must include a valid postcode");

    const payload = { ...formData, windows, productType: "Indoor Blinds" };

    try {
      const res = await fetch('/api/indoor-blinds-proxy', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.result === 'success') {
        alert("✅ Submitted successfully");
        const doc = generatePDF(formData, windows);
        doc.save(`${formData.formID || 'indoor-blinds'}.pdf`);

        setFormData({
          date: '', time: '', salesRep: '', customerName: '',
          customerAddress: '', customerPhone: '', customerEmail: '', formID: ''
        });
        setWindows([blankWindowTemplate]);
        setShowReview(false);
        setIsDirty(false);
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader}>Customer Information — {formData.formID}</h4>
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
        <div className={styles.inputGroup}>
          <label>Form ID:</label>
          <input value={formData.formID} readOnly className={styles.readOnlyInput} />
        </div>
      </div>

      {/* Windows Accordion */}
      {windows.map((w, i) => (
        <div key={i} className={styles.windowSection}>
          <div className={styles.windowHeader} onClick={() => toggleCollapse(i)}>
            Window {i + 1}
            <button type="button" onClick={() => deleteWindow(i)} className={styles.deleteBtn}>✕</button>
          </div>
          <AnimatePresence initial={false}>
            {!collapsedSections.includes(i) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                {[
                  "roomName", "subcategory", "fabric", "color", "control", "fit", "roll", "motorised",
                  "bottomFinish", "baseRail", "componentColour", "brackets", "comments"
                ].map(field => {
                  if (field === "fabric") {
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>Fabric</label>
                        <select name="fabric" value={w.fabric || ''} onChange={(e) => handleWindowChange(i, e)} required>
                          <option value="">-- Select Fabric --</option>
                          {fabricOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (field === "color") {
                    const options = fabricToColours[w.fabric] || [];
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>Colour</label>
                        <select name="color" value={w.color || ''} onChange={(e) => handleWindowChange(i, e)} disabled={!w.fabric} required>
                          <option value="">-- Select Colour --</option>
                          {options.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (field === "comments") {
                    return (
                      <div key={field} className={styles.inputGroup}>
                        <label>Comments</label>
                        <textarea name="comments" value={w.comments || ''} onChange={(e) => handleWindowChange(i, e)} rows={2} />
                      </div>
                    );
                  }

                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>{capitalize(field)}</label>
                      {blankWindow[field] ? (
                        <select name={field} value={w[field] || ''} onChange={(e) => handleWindowChange(i, e)} required>
                          <option value="">-- Select {capitalize(field)} --</option>
                          {blankWindow[field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input type="text" name={field} value={w[field] || ''} onChange={(e) => handleWindowChange(i, e)} />
                      )}
                    </div>
                  );
                })}

                {["width", "height"].map(field => (
                  <div key={field} className={styles.inputGroup}>
                    <label>{capitalize(field)} (mm)</label>
                    <input
                      type="number"
                      name={field}
                      value={w[field] || ''}
                      onChange={(e) => handleWindowChange(i, e)}
                      required
                      className={styles.measurementHighlight}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className={styles.buttonGroup}>
        <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
        <button type="button" onClick={() => setShowReview(true)} className={styles.reviewBtn}>📋 Review</button>
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
            <button onClick={() => setShowReview(false)} className={styles.addBtn}>❌ Close</button>
          </div>
        </div>
      )}
    </form>
  );
}
