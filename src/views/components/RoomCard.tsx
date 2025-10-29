"use client";
import React from 'react';
import '@styles/RoomCard.css';

interface RoomCardProps {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ title, description, price, imageUrl }) => {
  return (
    <div className="room-card">
      <div className="room-card-image" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="room-card-content">
        <h3 className="room-card-title">{title}</h3>
        <p className="room-card-description">{description}</p>
        <div className="room-card-price">
          <span>${price}</span>
          <button className="book-button">Reservar</button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 