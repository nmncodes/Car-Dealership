import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const parseDealer = (dealer) => {
  if (!dealer) return null;
  if (Array.isArray(dealer)) return dealer[0] || null;
  return dealer;
};

const Dealer = () => {
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postReviewLink, setPostReviewLink] = useState(null);

  const { id } = useParams();
  const dealer_url = `/djangoapp/dealer/${id}`;
  const reviews_url = `/djangoapp/reviews/dealer/${id}`;

  const senti_icon = (sentiment) => {
    if (sentiment === "positive") return positive_icon;
    if (sentiment === "negative") return negative_icon;
    return neutral_icon;
  };

  useEffect(() => {
    const loadDealer = async () => {
      try {
        const [dealerRes, reviewsRes] = await Promise.all([
          fetch(dealer_url),
          fetch(reviews_url),
        ]);

        const dealerData = await dealerRes.json();
        const reviewsData = await reviewsRes.json();

        if (dealerData.status === 200) {
          setDealer(parseDealer(dealerData.dealer));
        }

        if (reviewsData.status === 200 && Array.isArray(reviewsData.reviews)) {
          setReviews(reviewsData.reviews);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDealer();

    if (sessionStorage.getItem("username")) {
      setPostReviewLink(`/postreview/${id}`);
    }
  }, [dealer_url, reviews_url, id]);

  return (
    <div style={{ margin: "20px" }}>
      <Header/>
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>
          {dealer?.full_name || (loading ? "Loading..." : "Dealer not found")}
          {postReviewLink && (
            <a href={postReviewLink}>
              <img
                src={review_icon}
                style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }}
                alt="Post Review"
              />
            </a>
          )}
        </h1>
        {dealer && (
          <h4 style={{ color: "grey" }}>
            {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
          </h4>
        )}
      </div>
      <div className="reviews_panel">
        {loading ? (
          <span>Loading Reviews...</span>
        ) : reviews.length === 0 ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id || index} className="review_panel">
              <img src={senti_icon(review.sentiment)} className="emotion_icon" alt="Sentiment"/>
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
