// components/ReviewsTable.js
import React from 'react';
import '../styles/Tables.css';

const ReviewsTable = () => {
  const reviews = [
    {
      id: "REV-001",
      product: "Matte Liquid Lipstick",
      customer: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely love this lipstick! The color is perfect and it lasts all day.",
      date: "2024-01-15",
      status: "published"
    },
    {
      id: "REV-002",
      product: "Hydrating Face Serum",
      customer: "Mike Chen",
      rating: 4,
      comment: "Good serum, makes my skin feel hydrated. Would recommend!",
      date: "2024-01-14",
      status: "published"
    },
    {
      id: "REV-003",
      product: "Volume Mascara",
      customer: "Emily Davis",
      rating: 5,
      comment: "Best mascara I've ever used! Doesn't clump and gives great volume.",
      date: "2024-01-13",
      status: "pending"
    },
    {
      id: "REV-004",
      product: "Anti-Aging Cream",
      customer: "Alex Rodriguez",
      rating: 3,
      comment: "Okay product, but expected better results for the price.",
      date: "2024-01-12",
      status: "published"
    },
    {
      id: "REV-005",
      product: "Eyeshadow Palette",
      customer: "Jessica Brown",
      rating: 5,
      comment: "Beautiful colors and very pigmented. Blends easily!",
      date: "2024-01-11",
      status: "published"
    }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusClass = (status) => {
    return status === 'published' ? 'status-published' : 'status-pending';
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Review ID</th>
            <th>Product</th>
            <th>Customer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, index) => (
            <tr key={index}>
              <td className="font-mono">{review.id}</td>
              <td className="font-medium">{review.product}</td>
              <td>{review.customer}</td>
              <td>
                <div className="rating">
                  <span className="rating-stars" style={{color: '#fbbf24'}}>
                    {renderStars(review.rating)}
                  </span>
                </div>
              </td>
              <td className="review-comment">
                {review.comment}
              </td>
              <td>{review.date}</td>
              <td>
                <span className={`status-badge ${getStatusClass(review.status)}`}>
                  {review.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="action-button view-button">
                    View
                  </button>
                  {review.status === 'pending' && (
                    <button className="action-button approve-button">
                      Approve
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewsTable;