import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../styles/Form.module.css';
import curtainFabricGroups from '../lib/curtainFabricGroups';
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
    bracket: 0,
    linearPrice: 0,
    showBracket: false
  };

  const [windows, setWindows] = useState([JSON.parse(JSON.stringify(blankWindow))]);
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

  const getGroupForFabric = (fabric) => {
    const key = Object.keys(curtainFabricGroups).find(
      k => k.toLowerCase() === fabric?.toLowerCase()
    );
    return key ? curtainFabricGroups[key] : null;
  };

  const getNearestWidth = (width, group, height) => {
    const dropKey = height <= 3000 ? "Drop<=3000" : "Drop>3000";
    const entries = pricingData.filter(p => p.Group === group && p.DropCategory === dropKey);
    const widths = entries.map(e => e.Width).sort((a, b) => a - b);
    return widths.find(w => w >= width) || widths[widths.length - 1];
  };

  const getPrice = (width, height, fabric) => {
    const group = getGroupForFabric(fabric);
    if (!group || !width || !height) return { price: 0, bracket: 0, linearPrice: 0 };

    const dropKey = height <= 3000 ? "Drop<=3000" : "Drop>3000";
    const nearestWidth = getNearestWidth(width, group, height);

    const match = pricingData.find(p =>
      p.Group === group &&
      p.Width === nearestWidth &&
      p.DropCategory === dropKey
    );

    if (!match) return { price: 0, bracket: 0, linearPrice: 0 };

    const widthInM = width / 1000;
    const mrp = match["MRP (Shown to Customer)"];
    const bracket = match["Cost Price (Your Cost)"];
    const discountFactor = discount ? (1 - discount / 100) : 1;
    const price = mrp * discountFactor;
    const linearPrice = mrp / widthInM;

    return { price, bracket, linearPrice };
  };

  const updateTotalPrice = (arr) => {
    const total = arr.reduce((sum, w) => sum + (parseFloat(w.price) || 0), 0);
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

    const width = parseFloat(updated[index].width);
    const height = parseFloat(updated[index].height);
    const fabric = updated[index].fabric;

    if (!isNaN(width) && !isNaN(height) && fabric) {
      const { price, bracket, linearPrice } = getPrice(width, height, fabric);
      updated[index].price = price;
      updated[index].bracket = bracket;
      updated[index].linearPrice = linearPrice;
    }

    setWindows(updated);
    updateTotalPrice(updated);
  };

  const toggleBracket = (index) => {
    const updated = [...windows];
    updated[index].showBracket = !updated[index].showBracket;
    setWindows(updated);
  };

  const addWindow = () => {
    setWindows([...windows, JSON.parse(JSON.stringify(blankWindow))]);
  };

  const deleteWindow = (index) => {
    const confirmed = window.confirm("Delete this curtain?");
    if (!confirmed) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    updateTotalPrice(updated);
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
      if (result.result === 'success') {
        alert("✅ Submitted");
        generatePDF();
      } else {
        alert("❌ Submission failed");
      }
    } catch {
      alert("❌ Network Error");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Curtains Quote", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: Object.entries(formData).map(([k, v]) => [k, v])
    });

    windows.forEach((w, i) => {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Curtain ${i + 1}`]],
        body: []
      });

      const rows = Object.entries(w)
        .filter(([k]) => !['bracket', 'showBracket'].includes(k))
        .map(([k, v]) => [k, v]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: rows
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

    doc.save('curtains-quote.pdf');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>

      <div className={styles.inputGroup}>
        <label>Sales Rep:</label>
        <input type="text" name="salesRep" value={formData.salesRep} onChange={handleFormChange} />
        <label>Customer Name:</label>
        <input type="text" name="customerName" value={formData.customerName} onChange={handleFormChange} required />
        <label>Customer Address:</label>
        <input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleFormChange} />
        <label>Phone:</label>
        <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} />
        <label>Email:</label>
        <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleFormChange} />
      </div>

      {windows.map((w, i) => (
        <div key={i} className={styles.windowSection}>
          <h4 className={styles.windowHeader}>
            Curtain {i + 1}
            <button type="button" onClick={() => deleteWindow(i)}>✕</button>
          </h4>

          <div className={styles.inputGroup}>
            <label>Room:</label>
            <input type="text" name="room" value={w.room} onChange={(e) => handleWindowChange(i, e)} />
            <label>Width (mm):</label>
            <input type="number" name="width" value={w.width} onChange={(e) => handleWindowChange(i, e)} />
            <label>Height (mm):</label>
            <input type="number" name="height" value={w.height} onChange={(e) => handleWindowChange(i, e)} />
            <label>Fabric:</label>
            <select name="fabric" value={w.fabric} onChange={(e) => handleWindowChange(i, e)}>
              <option value="">-- Select --</option>
              {Object.keys(curtainFabricGroups).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <label>Color:</label>
            <input type="text" name="color" value={w.color} onChange={(e) => handleWindowChange(i, e)} />
            <label>Opening:</label>
            <select name="opening" value={w.opening} onChange={(e) => handleWindowChange(i, e)}>
              <option value="">-- Select --</option>
              <option>Middle Opening</option>
              <option>One way Left</option>
              <option>One way Right</option>
              <option>Other</option>
            </select>
            <label>Fit:</label>
            <select name="fit" value={w.fit} onChange={(e) => handleWindowChange(i, e)}>
              <option value="">-- Select --</option>
              <option>Face FIT Under Cornice</option>
              <option>Top Ceiling Fit</option>
              <option>Other</option>
            </select>
            <label>Track Type:</label>
            <select name="trackType" value={w.trackType} onChange={(e) => handleWindowChange(i, e)}>
              <option value="">-- Select --</option>
              <option>Standard</option>
              <option>Designer</option>
              <option>Other</option>
            </select>
            <label>Track Colour:</label>
            <select name="trackColour" value={w.trackColour} onChange={(e) => handleWindowChange(i, e)}>
              <option value="">-- Select --</option>
              <option>White</option>
              <option>Black</option>
              <option>Grey</option>
              <option>Silver</option>
              <option>Other</option>
            </select>
            <label>Comments:</label>
            <input type="text" name="comments" value={w.comments} onChange={(e) => handleWindowChange(i, e)} />
            <label>Price:</label>
            <input type="text" value={`$${w.price.toFixed(2)}`} readOnly />
            <label>Price Per Linear Meter:</label>
            <input type="text" value={`$${w.linearPrice.toFixed(2)}`} readOnly />
            <details>
              <summary>Bracket</summary>
              <div><strong>${w.bracket.toFixed(2)}</strong></div>
            </details>
          </div>
        </div>
      ))}

      <div className={styles.inputGroup}>
        <label>Discount (%):</label>
        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      </div>

      <div className={styles.totalBox}>
        Total: <strong>${totalPrice.toFixed(2)}</strong> — Discount: <strong>{discount}%</strong>
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Curtain</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
