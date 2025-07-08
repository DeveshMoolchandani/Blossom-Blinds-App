import { useEffect, useState } from 'react';

export default function IndoorBlindsForm() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    salesRep: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
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
    comments: ''
  });

  // Set current time on load
  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, time: formattedTime, date: formattedDate }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://api.sheetbest.com/sheets/15cd72a3-53a0-41fb-a04a-f6038ef57c4d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log("✅ Sheet.best response: ", result);
      alert('Form submitted successfully!');
    } catch (error) {
      alert('Error submitting form.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Indoor Blinds Form</h2>
      {Object.keys(formData).map((field) => (
        <div key={field} style={styles.field}>
          <label style={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>
          {field === 'date' ? (
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
              required
            />
          ) : field === 'time' ? (
            <input
              type="text"
              name="time"
              value={formData.time}
              readOnly
              style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
            />
          ) : (
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field !== 'comments'}
              style={styles.input}
            />
          )}
        </div>
      ))}
      <button type="submit" style={styles.button}>Submit</button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '700px',
    margin: '30px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '24px',
    color: '#333'
  },
  field: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#444'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};
