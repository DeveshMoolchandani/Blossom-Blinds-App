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

  const getGroupForFabric = (fabric) => curtainFabricGroups[fabric] || null;

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
    const price = parseFloat((mrp * discountFactor).toFixed(2));
    const linearPrice = parseFloat((mrp / widthInM).toFixed(2));

    return { price, bracket, linearPrice };
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

  const handleDiscountChange = (e) => {
    const val = parseFloat(e.target.value);
    const safeVal = isNaN(val) ? 0 : val;
    setDiscount(isNaN(val) ? '' : val);

    const updated = windows.map(win => {
      const { price, bracket, linearPrice } = getPrice(parseFloat(win.width), parseFloat(win.height), win.fabric);
      return { ...win, price, bracket, linearPrice };
    });

    setWindows(updated);
    updateTotalPrice(updated);
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleBracket = (index) => {
    const updated = [...windows];
    updated[index].showBracket = !updated[index].showBracket;
    setWindows(updated);
  };

  const addWindow = () => setWindows([...windows, JSON.parse(JSON.stringify(blankWindow))]);

  const deleteWindow = (index) => {
    if (!confirm("Delete this curtain?")) return;
    const updated = windows.filter((_, i) => i !== index);
    setWindows(updated);
    updateTotalPrice(updated);
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

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: [
          ['Room', w.room],
          ['Width (mm)', w.width],
          ['Height (mm)', w.height],
          ['Fabric', w.fabric],
          ['Color', w.color],
          ['Opening', w.opening],
          ['Fit', w.fit],
          ['Track Type', w.trackType],
          ['Track Colour', w.trackColour],
          ['Comments', w.comments],
          ['Price', `$${w.price?.toFixed(2)}`],
          ['Price Per Linear Meter', `$${w.linearPrice?.toFixed(2)}`]
        ]
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
      const response = await fetch('/api/curtains-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.result === 'success') {
        alert("✅ Submitted successfully!");
        generatePDF();
      } else {
        alert("❌ Submission failed.");
      }
    } catch {
      alert("❌ Network error.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>

      <div className={styles.inputGroup}>
        <label>Sales Rep:</label>
        <input type="text" name="salesRep" value={formData.salesRep} onChange={handleFormChange} />
        <label>Customer Name:</label>
        <input type="text" name="customerName" value={formData.customerName} onChange={handleFormChange} required />
        <label>Address:</label>
        <input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleFormChange} />
        <label>Phone:</label>
        <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} />
        <label>Email:</label>
        <input type="text" name="customerEmail" value={formData.customerEmail} onChange={handleFormChange} />
        <label>Discount (%):</label>
        <input type="number" value={discount} onChange={handleDiscountChange} />
      </div>

      {windows.map((win, index) => (
        <div key={index} className={styles.windowSection}>
          <h4 className={styles.windowHeader} onClick={() => toggleCollapse(index)}>
            Curtain {index + 1}
            <button type="button" onClick={() => deleteWindow(index)}>✕</button>
          </h4>

          {!collapsedSections.includes(index) && (
            <div className={styles.inputGroup}>
              <label>Room:</label>
              <input name="room" value={win.room} onChange={(e) => handleWindowChange(index, e)} />
              <label>Width (mm):</label>
              <input name="width" type="number" value={win.width} onChange={(e) => handleWindowChange(index, e)} />
              <label>Height (mm):</label>
              <input name="height" type="number" value={win.height} onChange={(e) => handleWindowChange(index, e)} />
              <label>Fabric:</label>
              <select name="fabric" value={win.fabric} onChange={(e) => handleWindowChange(index, e)}>
                <option value="">-- Select --</option>
                {Object.keys(curtainFabricGroups).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <label>Color:</label>
              <input name="color" value={win.color} onChange={(e) => handleWindowChange(index, e)} />
              <label>Opening:</label>
              <select name="opening" value={win.opening} onChange={(e) => handleWindowChange(index, e)}>
                <option>Middle Opening</option>
                <option>One Way Left</option>
                <option>One Way Right</option>
                <option>Other</option>
              </select>
              <label>Fit:</label>
              <select name="fit" value={win.fit} onChange={(e) => handleWindowChange(index, e)}>
                <option>Face Fit Under Cornice</option>
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
              <input name="comments" value={win.comments} onChange={(e) => handleWindowChange(index, e)} />
              <p>Price: ${win.price.toFixed(2)}</p>
              <p>Per Meter: ${win.linearPrice.toFixed(2)}</p>
              <button type="button" onClick={() => toggleBracket(index)}>
                {win.showBracket ? 'Hide Bracket' : 'Show Bracket'}
              </button>
              {win.showBracket && <p>Bracket: ${win.bracket.toFixed(2)}</p>}
            </div>
          )}
        </div>
      ))}

      <div className={styles.totalBox}>
        Total: <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Curtain</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
