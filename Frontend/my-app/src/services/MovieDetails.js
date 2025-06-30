import React from 'react';
import './MovieService.css';

const MovieDetails = ({ movie, onBack }) => {
  return (
    <div className="movie-details-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Movies
      </button>
      
      <div className="movie-details-content">
        <div className="trailer-section">
          <h2>Official Trailer</h2>
          {movie.trailerUrl ? (
            <iframe
              src={movie.trailerUrl}
              title="Movie Trailer"
              className="trailer-iframe"
              allowFullScreen
            />
          ) : (
            <div className="no-trailer">
              <p>Trailer not available</p>
            </div>
          )}
        </div>

        <div className="movie-info-section">
          <div className="movie-details-info">
            <h3>Movie Details</h3>
            <div className="info-item">
              <strong>Movie Name:</strong> {movie.title || movie.name}
            </div>
            <div className="info-item">
              <strong>Release Date:</strong> {movie.release_date || movie.first_air_date || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Rating:</strong> ⭐ {movie.vote_average}/10
            </div>
            <div className="info-item">
              <strong>Popularity:</strong> {movie.popularity}
            </div>
            <div className="info-item">
              <strong>Vote Count:</strong> {movie.vote_count}
            </div>
            <div className="info-item">
              <strong>Overview:</strong>
              <p className="overview-text">{movie.overview || 'No overview available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;