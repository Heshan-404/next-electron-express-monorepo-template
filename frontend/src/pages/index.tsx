// frontend/app/page.js
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [backendData, setBackendData] = useState<any>(null)  ;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The backend is expected to run on port 5002
  const BACKEND_URL = 'http://localhost:5002/api/sample';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBackendData(data);
      } catch (err) {
        console.error("Failed to fetch from backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Next.js Frontend in Electron</h1>
      <p>This frontend runs as a Next.js standalone server loaded by Electron.</p>
      <p>It's calling a backend process also launched by
        n..............</p>

      <h2>Backend Data:</h2>
      {loading && <p>Loading data from backend...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching data: {error}</p>}
      {backendData && (
        <div>
          <p>Message: {backendData.message}</p>
          <p>Timestamp: {backendData.timestamp}</p>
        </div>
      )}
    </div>
  );
}
