import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [form, setForm] = useState({
    state: "",
    income: "",
    gender: "",
    farmer: false,
    bpl: false
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });

  };

  const checkEligibility = async () => {

  if (!form.state || !form.gender || !form.income) {
    alert("Please fill all required fields.");
    return;
  }

  setLoading(true);

  try {

    const res = await axios.post(
      "https://yojanasetu.up.railway.app/api/check",
      {
        ...form,
        income: Number(form.income)
      }
    );

    setTimeout(() => {
      setResults(res.data.schemes);
      setLoading(false);
    }, 1000);

  } catch (err) {
    alert("Server Error!");
    setLoading(false);
  }

};

  return (

    <div className="container">

      <h1>YojanaSetu</h1>

      <p className="tagline">
      Ek Profile. Hazaar Mauke.
      </p>

      <p className="subtitle">
      "Discover every government scheme you're eligible for"
      </p>
      <div className="stats">

  <div className="statCard">
    <h2>3000+</h2>
    <p>Government Schemes in India</p>
  </div>

  <div className="statCard">
    <h2>5</h2>
    <p>States Covered</p>
  </div>

  <div className="statCard">
    <h2>40+</h2>
    <p>Schemes in Database</p>
  </div>

  <div className="statCard">
    <h2>2 Min</h2>
    <p>Eligibility Check</p>
  </div>

</div>

      <select name="state" onChange={handleChange}>
  <option value="">Select State</option>

  <option value="Tamil Nadu">Tamil Nadu</option>
  <option value="Odisha">Odisha</option>
  <option value="West Bengal">West Bengal</option>
  <option value="Rajasthan">Rajasthan</option>
  <option value="Uttar Pradesh">Uttar Pradesh</option>
</select>

      <input
  name="income"
  type="number"
  placeholder="Annual Income"
  onChange={handleChange}
/>

      <select
        name="gender"
        onChange={handleChange}
      >
        <option value="">Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      <label>

        <input
          type="checkbox"
          name="farmer"
          onChange={handleChange}
        />

        Farmer

      </label>

      <label>

        <input
          type="checkbox"
          name="bpl"
          onChange={handleChange}
        />

        BPL Card Holder

      </label>

      <button onClick={checkEligibility}>
🔍    Check My Eligibility
      </button>
      {loading && (
  <div className="loading">
    Checking eligibility...
  </div>
)}
{!loading && results.length === 0 && (
  <p className="subtitle">
    Fill the form and click "Check My Eligibility"
  </p>
)}

            {!loading && results.length > 0 && (
  <>
    <h2 className="resultTitle">
      Recommended For You ({results.length})
    </h2>

    {results.map((scheme) => (
      <div className="card" key={scheme.id}>
        <h2>{scheme.name}</h2>

        <p className="benefit">
          💰 {scheme.benefit}
        </p>

        <p>
          📂 Category: {scheme.category || "General"}
        </p>

        <a
          href={scheme.apply}
          target="_blank"
          rel="noreferrer"
        >
          🚀 View Official Portal →
        </a>
      </div>
    ))}
  </>
)}
{!loading && results.length === 0 && (
  <p className="subtitle">
    No schemes found yet. Try filling the form 👆
  </p>
)}
    </div>
  );

}

export default App;
