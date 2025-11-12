
function Card({image, title, description }) {
  return (
    
    <div className="card">
      <div className="card-img">
        <img src={image} alt={title} className="img" />
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
     
  );
}

export default Card;