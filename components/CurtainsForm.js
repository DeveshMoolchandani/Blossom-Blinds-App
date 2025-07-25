
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
    linearPrice: 0
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

  const getGroupForFabric = (fabric) => {
    return curtainFabricGroups[fabric] || null;
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

  const addWindow = () => {
    setWindows([...windows, JSON.parse(JSON.stringify(blankWindow))]);
  };

  const deleteWindow = (index) => {
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
          ['Price', `$${w.price?.toFixed(2) || '0.00'}`],
          ['Price Per Linear Meter', `$${w.linearPrice?.toFixed(2) || '0.00'}`]
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
    } catch (err) {
      alert("❌ Network error.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Curtains Form</h2>
      {/* Customer Info Section */}
      {/* Windows Section - map each window with bracket hidden behind a dropdown */}
      {/* Add Discount input, Total summary, Add Window, Submit */}
    </form>
  );
}
