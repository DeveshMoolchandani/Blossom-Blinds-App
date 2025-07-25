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

  const getGroup = (fabric) => fabricGroupMap[fabric] || null;

  const getNearestWidth = (width, group) => {
    const widths = pricingData
      .filter(p => p.Group === group)
      .map(p => p.Width)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b);

    return widths.find(w => w >= width) || widths[widths.length - 1];
  };

  const calculatePrice = (width, height, fabric) => {
    const group = getGroup(fabric);
    if (!group) return { price: 0, bracket: 0, linearPrice: 0 };

    const groupItems = pricingData.filter(p => p.Group === group);
    const nearestWidth = getNearestWidth(width, group);
    const dropBracket = height <= 3000 ? 3000 : 6000;

    const match = groupItems.find(p => p.Width === nearestWidth && p.Drop === dropBracket);
    if (!match) return { price: 0, bracket: 0, linearPrice: 0 };

    const mrp = match["MRP (Shown to Customer)"];
    const baseCost = match["Cost Price (Your Cost)"];
    const discountedPrice = discount ? mrp * (1 - discount / 100) : mrp;
    const widthInM = width / 1000;
    const linearRate = mrp / widthInM;

    return {
      price: parseFloat(discountedPrice.toFixed(2)),
      bracket: parseFloat(baseCost.toFixed(2)),
      linearPrice: parseFloat(linearRate.toFixed(2))
    };
  };

  const updatePrices = () => {
    const updated = windows.map(w => {
      if (w.width && w.height && w.fabric) {
        const { price, bracket, linearPrice } = calculatePrice(w.width, w.height, w.fabric);
        return { ...w, price, bracket, linearPrice };
      }
      return w;
    });
    setWindows(updated);
    const total = updated.reduce((sum, w) => sum + (w.price || 0), 0);
    setTotalPrice(total);
  };

  useEffect(updatePrices, [discount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWindowChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...windows];
    updated[i][name] = value;

    const width = parseFloat(updated[i].width);
    const height = parseFloat(updated[i].height);
    const fabric = updated[i].fabric;

    if (!isNaN(width) && !isNaN(height) && fabric) {
      const { price, bracket, linearPrice } = calculatePrice(width, height, fabric);
      updated[i].price = price;
      updated[i].bracket = bracket;
      updated[i].linearPrice = linearPrice;
    }

    setWindows(updated);
    const total = updated.reduce((sum, w) => sum + (w.price || 0), 0);
    setTotalPrice(total);
  };

  const addWindow = () => {
    setWindows([...windows, JSON.parse(JSON.stringify(blankWindow))]);
  };

  const deleteWindow = (i) => {
    if (!window.confirm("Delete this window?")) return;
    const updated = windows.filter((_, index) => index !== i);
    setWindows(updated);
    const total = updated.reduce((sum, w) => sum + (w.price || 0), 0);
    setTotalPrice(total);
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
      const { bracket, showBracket, ...printWin } = w;
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[`Window ${i + 1}`]],
        body: []
      });
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [['Field', 'Value']],
        body: Object.entries(printWin).map(([k, v]) => [k, v])
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
        alert('✅ Submitted!');
        generatePDF();
      } else {
        alert('❌ Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>

      <div className={styles.inputGroup}>
        <label>Sales Rep:</label>
        <input type="text" name="salesRep" value={formData.salesRep} onChange={handleChange} />
        <label>Customer Name:</label>
        <input type="text" name="customerName" required value={formData.customerName} onChange={handleChange} />
        <label>Customer Address:</label>
        <input type="text" name="customerAddress" required value={formData.customerAddress} onChange={handleChange} />
        <label>Phone:</label>
        <input type="text" name="customerPhone" required value={formData.customerPhone} onChange={handleChange} />
        <label>Email:</label>
        <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
      </div>

      {windows.map((win, index) => (
        <div key={index} className={styles.windowSection}>
          <h4 className={styles.windowHeader}>
            Window {index + 1}
            <button type="button" onClick={() => deleteWindow(index)}>✕</button>
          </h4>

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
              {Object.keys(fabricGroupMap).sort().map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <label>Color:</label>
            <input type="text" name="color" value={win.color} onChange={(e) => handleWindowChange(index, e)} />
            <label>Opening:</label>
            <select name="opening" value={win.opening} onChange={(e) => handleWindowChange(index, e)}>
              <option value="">-- Select Opening --</option>
              <option value="Middle Opening">Middle Opening</option>
              <option value="One Way Left">One Way Left</option>
              <option value="One Way Right">One Way Right</option>
              <option value="Other">Other</option>
            </select>
            <label>Fit:</label>
            <select name="fit" value={win.fit} onChange={(e) => handleWindowChange(index, e)}>
              <option value="">-- Select Fit --</option>
              <option value="Face FIT Under Cornice">Face FIT Under Cornice</option>
              <option value="Top Ceiling Fit">Top Ceiling Fit</option>
              <option value="Other">Other</option>
            </select>
            <label>Track Type:</label>
            <select name="trackType" value={win.trackType} onChange={(e) => handleWindowChange(index, e)}>
              <option value="">-- Select Track Type --</option>
              <option value="Standard">Standard</option>
              <option value="Designer">Designer</option>
              <option value="Other">Other</option>
            </select>
            <label>Track Colour:</label>
            <select name="trackColour" value={win.trackColour} onChange={(e) => handleWindowChange(index, e)}>
              <option value="">-- Select Track Colour --</option>
              <option value="White">White</option>
              <option value="Black">Black</option>
              <option value="Grey">Grey</option>
              <option value="Silver">Silver</option>
              <option value="Other">Other</option>
            </select>
            <label>Comments:</label>
            <input type="text" name="comments" value={win.comments} onChange={(e) => handleWindowChange(index, e)} />
            <label>Price:</label>
            <input type="text" value={`$${win.price.toFixed(2)}`} readOnly />
            <label>Linear Price:</label>
            <input type="text" value={`$${win.linearPrice.toFixed(2)}`} readOnly />
            <details>
              <summary>Bracket</summary>
              <input type="text" value={`$${win.bracket.toFixed(2)}`} readOnly />
            </details>
          </div>
        </div>
      ))}

      <div className={styles.inputGroup}>
        <label>Discount (%):</label>
        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      </div>

      <div className={styles.totalBox}>
        Total: <strong>${totalPrice.toFixed(2)}</strong> — Discount: <strong>{discount || 0}%</strong>
      </div>

      <button type="button" onClick={addWindow} className={styles.addBtn}>➕ Add Window</button>
      <button type="submit" className={styles.submitBtn}>✅ Submit</button>
    </form>
  );
}
