import { useState, useEffect } from 'react';
import styles from '../styles/Form.module.css';
import { useRouter } from 'next/router';

const fabricToColours = {
  "ICON FR": ["CEYLON", "FLORA", "HARBOUR", "JET", "LEATHER", "LIQUORICE", "MARITIME", "OSPREY", "PAPYRUS", "SAIL", "SCULPTURE", "SEA MIST", "SOLAR", "STONEWASH", "TAURUS", "TO CONFIRM"],
  "LINESQUE LIGHT FILTER": ["CHESTNUT", "DELTA", "GRANITE", "HAZEL", "LEVI", "LILY", "OATCAKE", "OWL", "STONEWASH", "TO CONFIRM", "TRELLIS", "WICKER", "WINTER"],
  "ZENO": ["BARRANCA", "CUSCO", "ICA", "LIMA", "MALA", "PUNO", "TARMA", "TO CONFIRM"],
  "SKYE LIGHT FILTER": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM"],
  "SKYE BLOCKOUT": ["BLAZER", "CHIFFON", "CHROME", "EARL GREY", "OYSTER", "PORCELAIN", "RAVEN", "SAIL", "SWAN", "TO CONFIRM"],
  "LE REVE LIGHT FILTER": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM"],
  "LE REVE BLOCKOUT": ["CHALK", "CONCRETE", "CRYSTAL", "GRAPHITE", "MARBLE", "MINK", "ONYX", "PEWTER", "SAND", "SHELL", "TO CONFIRM"],
  "MANTRA LIGHT FILTER": ["COTTON", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "TO CONFIRM"],
  "MANTRA BLOCKOUT": ["COTTON", "FLINT", "OPAL", "PARCHMENT", "PEBBLE", "SEAGRASS", "SEED PEARL", "SESAME", "SHALE", "SPICE", "TO CONFIRM"],
  "KLEENSCREEN": ["ALLOY", "BARLEY", "BLACK", "BLACK PEARL", "CHARCOAL", "GRAPHITE", "GREY", "IVORY", "PEWTER", "PURE WHITE", "SHALE", "SILVER PEARL", "TO CONFIRM", "WHITE PEARL"],
  "ANSARI": ["ASH", "CHARCOAL", "COCONUT", "FOG", "FOSSIL", "LEAD", "SLATE", "STONE", "TO CONFIRM"],
  "BALMORAL BLOCKOUT": ["ARMOUR", "BIRCH", "BOURNEVILLE", "CHROME", "CONCRETE", "DOVE", "JET", "PEARL", "PLATINUM", "PUTTY", "PYRITE", "STEEL", "TO CONFIRM", "WHITE"],
  "BALMORAL LIGHT FILTER": ["DRIFTWOOD", "DUNE", "PAPERBARK", "PUMICE", "SAND", "SURF", "TO CONFIRM"],
  "VIBE": ["ALLOY", "BIRCH", "BISTRO", "CHATEAU", "CLAY", "CLOUD", "COAL", "DUNE", "ICE", "LACE", "LIMESTONE", "LINEN", "LOFT", "MIST", "NIMBUS", "ODESSEY", "ORIENT", "PORCELAIN", "PURE", "SPIRIT DISCONTINUED", "STONE", "STORM", "SURF", "TERRACE", "TO CONFIRM", "TUNDRA", "WHISPER", "ZIRCON"],
  "FOCUS": ["ASH", "BAY", "CARBON", "CHALK", "CLOUD", "COAL", "DOVE", "DRIFT", "EBONY", "ESPRESSO", "FEATHER", "FIG - DISCONTINUED", "MAGNETIC", "MIST", "OYSTER", "POLAR", "POWDER - DISCONTINUED", "SANDSTONE -DISCONTINUED", "SHELL", "TEMPEST", "TO CONFIRM", "WHITE"],
  "METROSHADE BLOCKOUT": ["BLACK", "DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "PEBBLE", "QUILL", "SEAL", "SLATE", "STORM", "TO CONFIRM", "WHITEWASH"],
  "METROSHADE LIGHT FILTER": ["DOVE/WHITE", "ECRU", "ICE GREY", "MOONSTONE", "NOUGAT", "QUILL", "TO CONFIRM"],
  "SANCTUARY BLOCKOUT": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SUEDE", "TO CONFIRM", "TRUFFLE", "WHITEWASH"],
  "SANCTUARY LIGHT FILTER": ["BALTIC", "CERAMIC", "LAVA", "MARBLE", "MINERAL", "PLASTER", "SLATE", "SUEDE", "TO CONFIRM", "WHITEWASH"],
  "TERRA": ["ARIA", "ELA", "FLINT", "HAZEL", "KAI", "MISTY", "RIDGE", "STELLA", "STORM", "TO CONFIRM", "WILLOW"],
  "ETCH": ["FELT", "MONO", "PENCIL", "PLATE", "STEEL", "TISSUE", "TO CONFIRM", "ZINC"],
  "ONESCREEN": ["BLACK", "CHARCOAL", "DUNE", "GREY", "GUNMETAL", "ICE", "LINEN BRONZE", "MERCURY", "SAND", "SILVER BLACK", "TO CONFIRM", "WALLABY", "WHITE"]
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
      control: '',
      fit: '',
      roll: '',
      motorised: '',
      baseRail: '',
      componentColour: '',
      brackets: '',
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

  const addWindow = () => {
    setWindows(prev => [...prev, { ...windows[0], roomName: '', fabric: '', color: '', comments: '' }]);
  };

  const deleteWindow = (index) => {
    if (Object.values(windows[index]).every(v => !v)) {
      setWindows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const validateMeasurements = () => {
    return windows.every(w =>
      /^\d+$/.test(w.width) && /^\d+$/.test(w.height)
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
        window.location.reload();
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (err) {
      alert('❌ Network error — submission failed.');
      console.error(err);
    }
  };

  const renderInput = (field, idx, window) => {
    if (field === "fabric") {
      return (
        <div key={field} className={styles.inputGroup}>
          <label>Fabric:</label>
          <select name="fabric" value={window.fabric} onChange={(e) => handleWindowChange(idx, e)} required>
            <option value="">-- Select Fabric --</option>
            {fabricOptions.map(fab => (
              <option key={fab} value={fab}>{fab}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field === "color") {
      const colours = fabricToColours[window.fabric] || [];
      return (
        <div key={field} className={styles.inputGroup}>
          <label>Colour:</label>
          <select name="color" value={window.color} onChange={(e) => handleWindowChange(idx, e)} required disabled={!window.fabric}>
            <option value="">-- Select Colour --</option>
            {colours.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      );
    }

    const dropdowns = {
      control: ["Left", "Right"],
      fit: ["Recess", "Face"],
      roll: ["Standard", "Over Roll"],
      motorised: ["Yes", "No"],
      baseRail: ["N/A", "Black Grey", "Sandstone", "White"],
      componentColour: ["White", "Black", "Grey", "N/A"],
      brackets: [
        "N/A (Default)",
        "55mm",
        "Dual Opposite side",
        "Dual Same Side to suit",
        "Dual Same side",
        "Dual opposite Side to suit",
        "None",
        "Single",
        "Slim Combo Top Back",
        "Slim Combo Top Back to suit",
        "Slim Combo Top Front to suit",
        "Slim Combo Top front"
      ]
    };

    if (dropdowns[field]) {
      return (
        <div key={field} className={styles.inputGroup}>
          <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
          <select name={field} value={window[field]} onChange={(e) => handleWindowChange(idx, e)} required>
            <option value="">-- Select {field} --</option>
            {dropdowns[field].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (["width", "height"].includes(field)) {
      return (
        <div key={field} className={`${styles.inputGroup} ${styles.highlight}`}>
          <label>{field} (mm):</label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            name={field}
            value={window[field]}
            onChange={(e) => handleWindowChange(idx, e)}
            required
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
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      {/* Customer Info */}
      <div className={styles.windowSection}>
        <h4 className={styles.windowHeader} onClick={() => toggleCollapse(-1)}>
          <span>Customer Information</span>
          <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>{formData.customerName || ''}</span>
        </h4>
        {!collapsedSections.includes(-1) && (
          <>
            {["salesRep", "customerName", "customerAddress", "customerPhone", "customerEmail"].map(field => (
              <div key={field} className={styles.inputGroup}>
                <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
                <input
                  type={field === "customerPhone" ? "tel" : field === "customerEmail" ? "email" : "text"}
                  name={field}
                  inputMode={field === "customerPhone" ? "numeric" : undefined}
                  pattern={field === "customerPhone" ? "^04\\d{8}$" : undefined}
                  value={formData[field]}
                  onChange={handleFormChange}
                  required
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Windows */}
      {windows.map((window, idx) => (
        <div key={idx} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(idx)}>
            <span>{`Window ${idx + 1}`}</span>
            <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>{window.roomName || ''}</span>
            <button type="button" onClick={() => deleteWindow(idx)} className={styles.deleteBtn} title="Delete window">✕</button>
          </h4>

          {!collapsedSections.includes(idx) && (
            <>
              {["roomName", "subcategory", "fabric", "color", "control", "fit", "roll", "motorised", "baseRail", "componentColour", "brackets", "width", "height", "comments"]
                .map(field => renderInput(field, idx, window))}
            </>
          )}
        </div>
      ))}

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Another Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
