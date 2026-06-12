import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const parseDealer = (dealer) => {
  if (!dealer) return null;
  if (Array.isArray(dealer)) return dealer[0] || null;
  return dealer;
};

const PostReview = () => {
  const [dealer, setDealer] = useState(null);
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const { id } = useParams();
  const dealer_url = `/djangoapp/dealer/${id}`;
  const review_url = `/djangoapp/add_review`;
  const carmodels_url = `/djangoapp/get_cars`;

  const postreview = async (e) => {
    e.preventDefault();
    setError("");

    let name = `${sessionStorage.getItem("firstname") || ""} ${sessionStorage.getItem("lastname") || ""}`.trim();
    if (!name || name.includes("null")) {
      name = sessionStorage.getItem("username") || "Anonymous";
    }

    if (!model || !review.trim() || !date || !year) {
      setError("All fields are required.");
      return;
    }

    const modelParts = model.split(" ");
    const make_chosen = modelParts[0];
    const model_chosen = modelParts.slice(1).join(" ");

    if (!model_chosen) {
      setError("Please select a valid car make and model.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          dealership: parseInt(id, 10),
          review: review.trim(),
          purchase: true,
          purchase_date: date,
          car_make: make_chosen,
          car_model: model_chosen,
          car_year: parseInt(year, 10),
        }),
      });

      const json = await res.json();
      if (json.status === 200) {
        window.location.href = `/dealer/${id}`;
        return;
      }
      if (json.status === 403) {
        setError("Your session expired. Please log in again.");
        setTimeout(() => { window.location.href = "/login"; }, 1500);
        return;
      }
      setError(json.message || "Failed to post review. Please try again.");
    } catch {
      setError("Network error. Check that Django and the database service are running.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("username")) {
      window.location.href = "/login";
      return;
    }

    const loadPage = async () => {
      try {
        const [dealerRes, carsRes] = await Promise.all([
          fetch(dealer_url),
          fetch(carmodels_url),
        ]);

        const dealerData = await dealerRes.json();
        const carsData = await carsRes.json();

        if (dealerData.status === 200) {
          setDealer(parseDealer(dealerData.dealer));
        } else {
          setLoadError(dealerData.message || "Could not load dealer.");
        }

        if (carsData.CarModels) {
          setCarmodels(Array.from(carsData.CarModels));
        }
      } catch {
        setLoadError("Failed to load page data. Please refresh.");
      }
    };

    loadPage();
  }, [dealer_url, carmodels_url]);

  return (
    <div>
      <Header/>
      <div className="postreview_container">
        <h1 style={{ color: "darkblue" }}>
          {dealer?.full_name || (loadError ? "Dealer unavailable" : "Loading dealer...")}
        </h1>
        {dealer && (
          <p className="postreview_dealer_info">
            {dealer.city}, {dealer.state} — {dealer.address}
          </p>
        )}
        {loadError && <p className="postreview_error">{loadError}</p>}

        <form onSubmit={postreview}>
          <p className="postreview_hint">Share your experience with this dealership.</p>

          <textarea
            id="review"
            cols="50"
            rows="7"
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />

          <div className="input_field">
            <label htmlFor="purchase_date">Purchase Date</label>
            <input
              id="purchase_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input_field">
            <label htmlFor="cars">Car Make &amp; Model</label>
            <select
              name="cars"
              id="cars"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            >
              <option value="" disabled>Choose Car Make and Model</option>
              {carmodels.map((carmodel, index) => (
                <option key={index} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                  {carmodel.CarMake} {carmodel.CarModel}
                </option>
              ))}
            </select>
          </div>

          <div className="input_field">
            <label htmlFor="car_year">Car Year</label>
            <input
              id="car_year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              max={2026}
              min={2015}
              required
            />
          </div>

          {error && <p className="postreview_error">{error}</p>}

          <div className="postreview_actions">
            <button type="submit" className="postreview" disabled={submitting || !!loadError}>
              {submitting ? "Posting..." : "Post Review"}
            </button>
            <a className="postreview_cancel" href={`/dealer/${id}`}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReview;
