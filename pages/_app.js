// pages/_app.js
import '../styles/global.css'; // ✅ Add this line

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
