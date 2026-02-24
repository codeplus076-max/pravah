"use client";

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    location: 'vashi',
    area_sqft: 1000,
    bhk: 2,
    bathrooms: 2,
    floor: 5,
    total_floors: 10,
    age_of_property: 5,
    parking: 1,
    lift: 1
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const localities = [
    "airoli", "ulwe", "panvel", "kharghar", "ghansoli",
    "nerul", "belapur", "cbd belapur", "vashi"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["location"].includes(name) ? value : Number(value)
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const summarizePrice = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return formatCurrency(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pravah-a3d1.onrender.com/predict';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Prediction failed. Please ensure the backend is running.');
      }

      const data = await res.json();

      // Simulate slight delay for animation effect
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 600);

    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
      setLoading(false);
    }
  };

  return (
    <div className="layout-wrapper">
      <nav className="navbar">
        <div className="logo">
          <span>❖</span> PropSight NM
        </div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Market Trends</a>
          <a href="#">API</a>
        </div>
      </nav>

      <div className="container">
        <header className="hero-section">
          <h1 className="title">
            Navi Mumbai Real Estate, <br />
            <span className="title-highlight">Valued by AI</span>
          </h1>
          <p className="subtitle">
            Leveraging gradient boosting and historical market transactions to give you instant, accurate property valuations across Navi Mumbai's rapidly growing nodes.
          </p>
          <div className="feature-tags">
            <div className="tag">XGBoost ML Engine</div>
            <div className="tag">95%+ Confidence</div>
            <div className="tag">Updated Real-Time</div>
          </div>
        </header>

        <main className="main-content">
          <section className="card form-container">
            <div className="form-header">
              <h2>Property Details</h2>
              <p>Enter the specifications of your property to get an estimate.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="location">Micro-Market Node</label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  {localities.map(loc => (
                    <option key={loc} value={loc}>
                      {loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="area_sqft">Carpet Area (Sq Ft)</label>
                  <input
                    type="number"
                    id="area_sqft"
                    name="area_sqft"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    min="100"
                    max="10000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bhk">Configurations (BHK)</label>
                  <select id="bhk" name="bhk" value={formData.bhk} onChange={handleChange}>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bathrooms">Bathrooms</label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age_of_property">Property Age (Years)</label>
                  <input
                    type="number"
                    id="age_of_property"
                    name="age_of_property"
                    value={formData.age_of_property}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="floor">Floor Number</label>
                  <input
                    type="number"
                    id="floor"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="total_floors">Total Floors in Building</label>
                  <input
                    type="number"
                    id="total_floors"
                    name="total_floors"
                    value={formData.total_floors}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parking">Parking Covered</label>
                  <select id="parking" name="parking" value={formData.parking} onChange={handleChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="lift">Lift Access</label>
                  <select id="lift" name="lift" value={formData.lift} onChange={handleChange}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Analyzing Market Vectors...' : 'Calculate Valuation'}
              </button>
              {error && <p style={{ color: '#EF4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
            </form>
          </section>

          <section className="card results-container">
            {loading ? (
              <div className="result-empty">
                <div className="loading-spinner"></div>
                <h3>Processing Analysis</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Running multi-dimensional XGBoost regression against Navi Mumbai real-estate benchmarks...</p>
              </div>
            ) : result ? (
              <div className="result-box">
                <p className="price-label">Estimated Market Value</p>
                <h2 className="price-value">{summarizePrice(result.predicted_price)}</h2>
                <div className="price-range">Range: {summarizePrice(result.low_estimate)} — {summarizePrice(result.high_estimate)}</div>

                <div className="metrics-grid">
                  <div className="metric-item">
                    <p className="metric-label">Rate (Per Sq Ft)</p>
                    <p className="metric-value">{formatCurrency(result.price_per_sqft)}</p>
                  </div>
                  <div className="metric-item">
                    <p className="metric-label">Confidence</p>
                    <p className={`metric-value ${result.confidence_score > 90 ? 'confidence-high' : ''}`}>
                      {result.confidence_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="result-icon">✧</div>
                <h3>Awaiting Details</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Select your property parameters and click the calculate button to see the AI inference.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
