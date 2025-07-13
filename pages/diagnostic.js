// pages/diagnostic.js
import React from 'react';
import IndoorBlindsForm from './indoor-blinds';
import styles from '../styles/Form.module.css';

export default function Diagnostic() {
  const checks = [];

  const isComponentValid =
    typeof IndoorBlindsForm === 'function' ||
    (typeof IndoorBlindsForm === 'object' && IndoorBlindsForm !== null);

  checks.push({ label: '✅ Next.js is running correctly', passed: true });
  checks.push({ label: '✅ IndoorBlindsForm is a valid React component', passed: isComponentValid });

  let homeButtonExists = false;
  try {
    const jsx = IndoorBlindsForm().props.children;
    homeButtonExists = JSON.stringify(jsx).includes("🏠 Home");
  } catch {
    homeButtonExists = false;
  }

  checks.push({ label: '🏠 Home button is rendered', passed: homeButtonExists });

  const usesGoogleSheets = IndoorBlindsForm.toString().includes("https://script.google.com/macros/s/");
  checks.push({ label: '📤 Google Sheets URL found in code', passed: usesGoogleSheets });

  const usesPDF = IndoorBlindsForm.toString().includes('jsPDF');
  checks.push({ label: '📄 jsPDF is used in the form', passed: usesPDF });

  const usesCSS = IndoorBlindsForm.toString().includes('styles.formContainer');
  checks.push({ label: '🎨 CSS Modules (Form.module.css) applied', passed: usesCSS });

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>🔍 Diagnostic Check</h1>
      <ul>
        {checks.map((c, idx) => (
          <li key={idx}>{c.passed ? '✅' : '❌'} {c.label}</li>
        ))}
      </ul>
    </div>
  );
}
