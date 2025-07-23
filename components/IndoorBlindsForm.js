import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../styles/Form.module.css';
import fabricGroupMap from '../lib/fabricGroups';
import fabricToColours from '../lib/fabricColors';
import pricingData from '../data/blinds_pricing_data.json';

export default function IndoorBlindsForm() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    salesRep: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: ''
  });

  const blankWindow = {
    room: '',
    width: '',
    drop: '',
    fabric: '',
    color: '',
    control: '',
    fit: '',
    roll: '',
    comments: '',
    price: 0
  };

  const [windows, setWindows] = useState([JSON.parse(JSON.stringify(blankWindow))]);
  const [collapsedSections, setCollapsedSections] = useState([]);
  const [discount, setDiscount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0]
    }));
  }, []);

  const sortOptions = (options) => {
    return options
      .filter(opt => opt !== 'TO CONFIRM' && opt !== 'OTHER')
      .sort((a, b) => a.localeCompare(b))
      .concat(['TO CONFIRM', 'OTHER']);
  };

  const fabricOptions = sortOptions(Object.keys(fabricGroupMap));

  const getColorOptions = (fabric) => {
    if (!fabric) return [];
    const match = Object.keys(fabricToColours).find(
      key => key.toLowerCase() === fabric.toLowerCase()
    );
    return match ? sortOptions(fabricToColours[match]) : [];
  };

  const getGroupForFabric = (fabric) => {
    return fabricGroupMap[fabric] || null;
  };

  const getNearestSize = (val, field, group) => {
    const numbers = pricingData
      .filter(entry => entry.Group === group)
      .map(entry => Number(entry[field]))
      .sort((a, b) => a - b);

    return numbers.find(n => n >= val) || numbers[numbers.length - 1];
  };

const getPrice = (width, drop, fabric, color, appliedDiscount = 0) => {
  const group = getGroupForFabric(fabric);
  if (!group || color === 'OTHER') return 0;

  const nearestWidth = getNearestSize(width, 'Width', group);
  const nearestDrop = getNearestSize(drop, 'Drop', group);

  const match = pricingData.find(entry =>
    entry.Group === group &&
    Number(entry.Width) === nearestWidth &&
    Number(entry.Drop) === nearestDrop
  );

  if (!match) return 0;

  const mrp = Number(match["MRP (Shown to Customer)"]);
  const discountRate = appliedDiscount / 100;
  const finalPrice = mrp * (1 - discountRate);

  return parseFloat(finalPrice.toFixed(2));
};


  const updateTotalPrice = (winArr) => {
    const total = winArr.reduce((acc, win) => acc + (parseFloat(win.price) || 0), 0);
    setTotalPrice(total);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[index][name] = value;

    const w = parseFloat(updated[index].width);
    const d = parseFloat(updated[index].drop);
    const f = updated[index].fabric;
    const c = updated[index].color;

    if (!isNaN(w) && !isNaN(d) && f && c) {
   updated[index].price = getPrice(w, d, f, c, parseFloat(discount) || 0);
    }

    setWindows(updated);
    updateTotalPrice(updated);
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const addWindow = () => {
    setWindows([...windows, JSON.parse(JSON.stringify(blankWindow))]);
  };

  const deleteWindow = (index) => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this window?");
    if (!confirmDelete) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    updateTotalPrice(updated);
  };

const handleDiscountChange = (e) => {
  const val = parseFloat(e.target.value);
  const safeVal = isNaN(val) ? 0 : val;
  setDiscount(isNaN(val) ? '' : val);

  const updated = windows.map(win => {
    const price = getPrice(win.width, win.drop, win.fabric, win.color, safeVal);
    return { ...win, price };
  });

  setWindows(updated);
  updateTotalPrice(updated);
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
const payload = {
  ...formData,
  windows,
  productType: 'Indoor Blinds',
  discount,
  totalPrice
};

console.log("🔍 SUBMITTING PAYLOAD:", payload); // ✅ Add this for debug

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ Form submitted successfully!");
      generatePDF(); // Keep PDF generation on success
    } else {
      console.error("❌ Submission error:", result.message);
      alert("❌ Submission failed: " + (result.message || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Network or server error:", err);
    alert("❌ Submission failed. Please check your internet or try again.");
  }
};


  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Indoor Blinds Quote", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: Object.entries(formData).map(([k, v]) => [k, v])
    });

    windows.forEach((w, i) => {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Window ${i + 1}`]],
        body: []
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: Object.entries(w).map(([k, v]) => [k, v])
      });
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Summary', 'Value']],
      body: [
        ['Discount (%)', discount + '%'],
        ['Total Price ($)', '$' + totalPrice.toFixed(2)]
      ]
    });

    doc.save('indoor-blinds-quote.pdf');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Indoor Blinds Form</h2>

      <div className={styles.inputGroup}>
        <label>Sales Rep:</label>
        <input type="text" name="salesRep" value={formData.salesRep} onChange={handleFormChange} />
        <label>Customer Name:</label>
        <input type="text" name="customerName" value={formData.customerName} onChange={handleFormChange} required />
        <label>Customer Address:</label>
        <input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleFormChange} required />
        <label>Phone:</label>
        <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} required />
        <label>Email:</label>
        <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleFormChange} />
      </div>

      {windows.map((win, index) => (
        <div key={index} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(index)}>
            Window {index + 1}
            <button type="button" onClick={() => deleteWindow(index)}>✕</button>
          </h4>

          {!collapsedSections.includes(index) && (
            <div className={styles.inputGroup}>
              <label>Room:</label>
              <input type="text" name="room" value={win.room} onChange={(e) => handleWindowChange(index, e)} />
              <label>Width (mm):</label>
              <input type="number" name="width" value={win.width} onChange={(e) => handleWindowChange(index, e)} />
              <label>Drop (mm):</label>
              <input type="number" name="drop" value={win.drop} onChange={(e) => handleWindowChange(index, e)} />
              <label>Fabric:</label>
              <select name="fabric" value={win.fabric} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select Fabric --</option>
                {fabricOptions.map(fab => (
                  <option key={fab} value={fab}>{fab}</option>
                ))}
              </select>
              <label>Color:</label>
              <select name="color" value={win.color} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select Color --</option>
                {getColorOptions(win.fabric).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label>Control Side:</label>
              <select name="control" value={win.control} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select --</option>
                <option>Left</option>
                <option>Right</option>
              </select>
              <label>Fit:</label>
              <select name="fit" value={win.fit} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select --</option>
                <option>Face</option>
                <option>Reveal</option>
              </select>
              <label>Roll:</label>
              <select name="roll" value={win.roll} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select --</option>
                <option>Standard</option>
                <option>Reverse</option>
              </select>
              <label>Comments:</label>
              <input type="text" name="comments" value={win.comments} onChange={(e) => handleWindowChange(index, e)} />
              <label>Price:</label>
              <input type="text" value={`$${win.price.toFixed(2)}`} readOnly />
            </div>
          )}
        </div>
      ))}

      <div className={styles.inputGroup}>
        <label>Discount (%):</label>
        <input
          type="number"
          value={discount}
          onChange={handleDiscountChange}
          min="0"
          max="100"
        />
      </div>

      <div className={styles.totalBox}>
        Total: <strong>${totalPrice.toFixed(2)}</strong> — Discount: <strong>{discount}%</strong>
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
