import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../styles/Form.module.css';
import fabricGroupMap from '../lib/curtainFabricGroups';
import pricingData from '../data/curtains_pricing_data.json';

export default function CurtainsForm() {
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
    height: '',
    fabric: '',
    color: '',
    opening: '',
    fit: '',
    trackType: '',
    trackColour: '',
    comments: '',
    price: 0,
    bracket: 0
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

  const getGroupForFabric = (fabric) => fabricGroupMap[fabric] || null;

  const getNearestSize = (val, field, group) => {
    const values = pricingData
      .filter(entry => entry.Group === group && entry[field])
      .map(entry => Number(entry[field]))
      .sort((a, b) => a - b);
    return values.find(n => n >= val) || values[values.length - 1];
  };

  const getPriceInfo = (width, height, fabric) => {
    const group = getGroupForFabric(fabric);
    if (!group) return { price: 0, bracket: 0 };

    const dropLimit = height > 3000 ? 6000 : 3000;
    const nearestWidth = getNearestSize(width, 'Width', group);
    const match = pricingData.find(entry =>
      entry.Group === group &&
      entry.Width === nearestWidth &&
      entry.Drop === dropLimit
    );

    if (!match) return { price: 0, bracket: 0 };

    const linearMeters = width / 1000;
    const cpPerMeter = match['Cost Price (Your Cost)'] / (nearestWidth / 1000);
    const mrp = (cpPerMeter + 60) * linearMeters;
    const retail = discount ? mrp * (1 - discount / 100) : mrp;

    return {
      price: parseFloat(retail.toFixed(2)),
      bracket: parseFloat(match['Cost Price (Your Cost)'].toFixed(2))
    };
  };

  const updateTotal = (winArr) => {
    const total = winArr.reduce((acc, w) => acc + (parseFloat(w.price) || 0), 0);
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
    const h = parseFloat(updated[index].height);
    const f = updated[index].fabric;

    if (!isNaN(w) && !isNaN(h) && f) {
      const { price, bracket } = getPriceInfo(w, h, f);
      updated[index].price = price;
      updated[index].bracket = bracket;
    }

    setWindows(updated);
    updateTotal(updated);
  };

  const handleDiscountChange = (e) => {
    const val = parseFloat(e.target.value);
    const safe = isNaN(val) ? 0 : val;
    setDiscount(safe);
    const updated = windows.map(w => {
      const { price, bracket } = getPriceInfo(w.width, w.height, w.fabric);
      return { ...w, price, bracket };
    });
    setWindows(updated);
    updateTotal(updated);
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
    if (!confirm("Delete this window?")) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    updateTotal(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      windows,
      productType: 'Curtains',
      discount,
      totalPrice
    };

    try {
      const res = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success || result.result === 'success') {
        alert('✅ Submitted!');
        generatePDF();
      } else {
        alert('❌ Submission failed');
      }
    } catch (err) {
      console.error("Error:", err);
      alert('❌ Error submitting');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Curtain Quote", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: Object.entries(formData).map(([k, v]) => [k, v])
    });

    windows.forEach((w, i) => {
      const { bracket, ...printData } = w; // remove bracket
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Window ${i + 1}`]],
        body: []
      });
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: Object.entries(printData).map(([k, v]) => [k, v])
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

    doc.save('curtain-quote.pdf');
  };

  const fabricOptions = Object.keys(fabricGroupMap).sort();

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>
      <div className={styles.inputGroup}>
        <label>Sales Rep:</label>
        <input type="text" name="salesRep" value={formData.salesRep} onChange={handleFormChange} />
        <label>Customer Name:</label>
        <input type="text" name="customerName" required value={formData.customerName} onChange={handleFormChange} />
        <label>Customer Address:</label>
        <input type="text" name="customerAddress" required value={formData.customerAddress} onChange={handleFormChange} />
        <label>Phone:</label>
        <input type="text" name="customerPhone" required value={formData.customerPhone} onChange={handleFormChange} />
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
              <label>Height (mm):</label>
              <input type="number" name="height" value={win.height} onChange={(e) => handleWindowChange(index, e)} />
              <label>Fabric:</label>
              <select name="fabric" value={win.fabric} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select Fabric --</option>
                {fabricOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <label>Color:</label>
              <input type="text" name="color" value={win.color} onChange={(e) => handleWindowChange(index, e)} />
              <label>Opening:</label>
              <select name="opening" value={win.opening} onChange={(e) => handleWindowChange(index, e)}>
                <option>Middle Opening</option>
                <option>One Way Left</option>
                <option>One Way Right</option>
                <option>Other</option>
              </select>
              <label>Fit:</label>
              <select name="fit" value={win.fit} onChange={(e) => handleWindowChange(index, e)}>
                <option>Face FIT Under Cornice</option>
                <option>Top Ceiling Fit</option>
                <option>Other</option>
              </select>
              <label>Track Type:</label>
              <select name="trackType" value={win.trackType} onChange={(e) => handleWindowChange(index, e)}>
                <option>Standard</option>
                <option>Designer</option>
                <option>Other</option>
              </select>
              <label>Track Colour:</label>
              <select name="trackColour" value={win.trackColour} onChange={(e) => handleWindowChange(index, e)}>
                <option>White</option>
                <option>Black</option>
                <option>Grey</option>
                <option>Silver</option>
                <option>Other</option>
              </select>
              <label>Comments:</label>
              <input type="text" name="comments" value={win.comments} onChange={(e) => handleWindowChange(index, e)} />
              <label>Price:</label>
              <input type="text" value={`$${win.price.toFixed(2)}`} readOnly />
              <label>Bracket (Hidden):</label>
              <input type="text" value={`$${win.bracket.toFixed(2)}`} readOnly style={{ opacity: 0.4 }} />
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
          placeholder="Leave blank for no discount"
        />
      </div>

      <div className={styles.totalBox}>
        Total: <strong>${totalPrice.toFixed(2)}</strong> — Discount: <strong>{discount || 0}%</strong>
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
