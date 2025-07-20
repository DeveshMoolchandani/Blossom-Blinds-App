// Trigger redeploy - Devesh
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import styles from '../styles/Form.module.css';

const blankWindowTemplate = {
 roomName: '',
  width: '',
  height: '',
  fabric: '',
  color: '',
  control: '',
  fit: '',
  roll: '',
  comments: ''
};

const blankWindow = {
  control: ["Left", "Right"],
  fit: ["Face", "Recess"],
  roll: ["Standard", "Reverse"],
};

const fabricToColours = {
  "ANSARI": ["ASH", "CHARCOAL", "COCONUT", "FOG", "FOSSIL", "LEAD", "SLATE", "STONE", "TO CONFIRM", "OTHER"],
  "BALMORAL BLOCKOUT": ["ARMOUR", "BIRCH", "BOURNEVILLE", "CHROME", "CONCRETE", "DOVE", "JET", "PEARL", "PLATINUM", "PUTTY", "PYRITE", "STEEL", "TO CONFIRM", "WHITE", "OTHER"],
  "BALMORAL LIGHT FILTER": ["DRIFTWOOD", "DUNE", "PAPERBARK", "PUMICE", "SAND", "SURF", "TO CONFIRM", "OTHER"],
  "ETCH": ["FELT", "MONO", "PENCIL", "PLATE", "STEEL", "TISSUE", "TO CONFIRM", "ZINC", "OTHER"],
  "FOCUS": ["ASH", "BAY", "CARBON", "CHALK", "CLOUD", "COAL", "DOVE", "DRIFT", "EBONY", "ESPRESSO", "FEATHER", "FIG - DISCONTINUED", "MAGNETIC", "MIST", "OYSTER", "POLAR", "POWDER - DISCONTINUED", "SANDSTONE -DISCONTINUED", "SHELL", "TEMPEST", "TO CONFIRM", "WHITE", "OTHER"],
  "ICON FR": ["CEYLON", "FLORA", "HARBOUR", "JET", "LEATHER", "LIQUORICE", "MARITIME", "OSPREY", "PAPYRUS", "SAIL", "SCULPTURE", "SEA MIST", "SOLAR", "STONEWASH", "TAURUS", "TO CONFIRM", "OTHER"],
  "KLEENSCREEN": ["ALLOY", "BARLEY", "BLACK", "BLACK PEARL", "CHARCOAL", "GRAPHITE", "GREY", "IVORY", "PEWTER", "PURE WHITE", "SHALE", "SILVER PEARL", "TO CONFIRM", "WHITE PEARL", "OTHER"],
  "LE REVE BLOCKOUT": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM", "OTHER"],
  "LE REVE LIGHT FILTER": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM", "OTHER"],
  "LINESQUE LIGHT FILTER": ["CHESTNUT", "DELTA", "GRANITE", "HAZEL", "LEVI", "LILY", "OATCAKE", "OWL", "STONEWASH", "TO CONFIRM", "TRELLIS", "WICKER", "WINTER", "OTHER"],
  "MANTRA BLOCKOUT": ["COTTON", "FLINT", "OPAL", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "SPICE", "TO CONFIRM", "OTHER"],
  "MANTRA LIGHT FILTER": ["COTTON", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "TO CONFIRM", "OTHER"],
  "METROSHADE BLOCKOUT": ["BLACK", "DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "PEBBLE", "QUILL", "SEAL", "SLATE", "STORM", "TO CONFIRM", "WHITEWASH", "OTHER"],
  "METROSHADE LIGHT FILTER": ["DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "QUILL", "TO CONFIRM", "OTHER"],
  "ONESCREEN": ["BLACK", "CHARCOAL", "DUNE", "GREY", "GUNMETAL", "ICE", "LINEN BRONZE", "MERCURY", "SAND", "SILVER BLACK", "TO CONFIRM", "WALLABY", "WHITE", "OTHER"],
  "SANCTUARY BLOCKOUT": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SUEDE", "TO CONFIRM", "TRUFFLE", "WHITEWASH", "OTHER"],
  "SANCTUARY LIGHT FILTER": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SLATE", "SUEDE", "TO CONFIRM", "WHITEWASH", "OTHER"],
  "SKYE BLOCKOUT": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM", "OTHER"],
  "SKYE LIGHT FILTER": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM", "OTHER"],
  "TERRA": ["ARIA", "ELA", "FLINT", "HAZEL", "KAI", "MISTY", "RIDGE", "STELLA", "STORM", "TO CONFIRM", "WILLOW", "OTHER"],
  "VIBE": ["ALLOY", "BIRCH", "BISTRO", "CHATEAU", "CLAY", "CLOUD", "COAL", "DUNE", "ICE", "LACE", "LIMESTONE", "LINEN", "LOFT", "MIST", "NIMBUS", "ODESSEY", "ORIENT", "PORCELAIN", "PURE", "SPIRIT DISCONTINUED", "STONE", "STORM", "SURF", "TERRACE", "TO CONFIRM", "TUNDRA", "WHISPER", "ZIRCON", "OTHER"],
  "ZENO": ["BARRANCA", "CUSCO", "ICA", "LIMA", "MALA", "PUNO", "TARMA", "TO CONFIRM", "OTHER"],
  "OTHER": ["TO CONFIRM", "OTHER"],
};

const fabricOptions = [...Object.keys(fabricToColours).filter(f => f !== "OTHER").sort(), "OTHER"];

export default function IndoorBlindsForm() {
  const [formData, setFormData] = useState({
    date: '', time: '', salesRep: '', customerName: '', customerAddress: '', customerPhone: '', customerEmail: ''
  });
  const [windows, setWindows] = useState([JSON.parse(JSON.stringify(blankWindowTemplate))]);
  const [collapsedSections, setCollapsedSections] = useState([]);

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, []);

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;
    if (name === 'fabric') updated[index]['color'] = '';
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows(prev => [...prev, JSON.parse(JSON.stringify(blankWindowTemplate))]);
  };

  const deleteWindow = (index) => {
    const confirmDelete = window.confirm("Delete this window?");
    if (confirmDelete) setWindows(windows.filter((_, i) => i !== index));
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const capitalize = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Indoor Blinds Submission", 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: Object.entries(formData).map(([key, val]) => [capitalize(key), val])
    });

    windows.forEach((win, idx) => {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Window ${idx + 1}`]],
        body: []
      });
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: Object.entries(win).map(([key, val]) => [capitalize(key), val])
      });
    });

    doc.save("indoor-blinds.pdf");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = { ...formData, windows, productType: "Indoor Blinds" };
    try {
      const res = await fetch('/api/indoor-blinds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.result === 'success') {
        generatePDF();
        alert("✅ Submitted successfully");
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch {
      alert("❌ Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          Customer Information
        </h4>
        {!collapsedSections.includes(-1) && (
          <>
            {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
              <div key={field} className={styles.inputGroup}>
                <label>{capitalize(field)}:</label>
                <input name={field} value={formData[field]} onChange={handleFormChange} required />
              </div>
            ))}
          </>
        )}
      </div>

      {windows.map((w, i) => (
        <div key={i} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(i)}>
            Window {i + 1}
            <button type="button" onClick={() => deleteWindow(i)} className={styles.deleteBtn}>✕</button>
          </h4>
          {!collapsedSections.includes(i) && (
            <>
              {["roomName", "width", "height", "fabric", "color", "control", "fit", "roll", "comments"].map(field => {
                if (field === 'fabric') {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>Fabric:</label>
                      <select name="fabric" value={w.fabric} onChange={e => handleWindowChange(i, e)} required>
                        <option value="">-- Select Fabric --</option>
                        {fabricOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                } else if (field === 'color') {
                  const colorOptions = fabricToColours[w.fabric] || [];
                  return (
                    <div key={field} className={styles.inputGroup}>
  <label>Color:</label>
  <select name="color" value={w.color} onChange={e => handleWindowChange(i, e)} required>
    <option value="">-- Select Color --</option>
    {colorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
</div>

                  );
                } else if (field === 'control' || field === 'fit' || field === 'roll') {
                  const options = blankWindow[field];
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>{capitalize(field)}:</label>
                      <select name={field} value={w[field]} onChange={e => handleWindowChange(i, e)} required>
                        <option value="">-- Select --</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                } else {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label>{capitalize(field)}:</label>
                      <input
                        name={field}
                        type={['width', 'height'].includes(field) ? 'number' : 'text'}
                        value={w[field]}
                        onChange={e => handleWindowChange(i, e)}
                        required={field !== 'comments'}
                      />
                    </div>
                  );
                }
              })}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}