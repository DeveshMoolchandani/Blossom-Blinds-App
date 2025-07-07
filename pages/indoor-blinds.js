import { useState } from 'react';
import { useRouter } from 'next/router';

export default function IndoorBlinds() {
  const router = useRouter();
  const [subcategory, setSubcategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subcategory) {
      router.push(`/indoor-blinds/${subcategory}`);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Indoor Blinds</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <label htmlFor="subcategory">Select a Subcategory:</label>
        <br />
        <select
          id="subcategory"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          style={{ marginTop: '10px', padding: '5px' }}
        >
          <option value="">--Choose an option--</option>
          <option value="roller-blinds">Roller Blinds</option>
          <option value="zebra-blinds">Zebra Blinds</option>
          <option value="venetian-blinds">Venetian Blinds</option>
        </select>
        <br />
        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
          Next
        </button>
      </form>
    </div>
  );
}
