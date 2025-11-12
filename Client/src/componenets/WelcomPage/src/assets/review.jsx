
function Review({ image }) {
  return (
    <div className="review-card">
      <div className="quote-icon">&#10077;</div>
      <img src={image} alt="review" className="review-img" />
    </div>
  );
}

export default Review;