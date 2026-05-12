import React from 'react';

/**
 * Componente StatCard - Tarjeta de estadísticas con trend e ícono
 */
const StatCard = ({ title, value, trend, icon, accentColor = 'var(--navy-500)' }) => {
  const isPositive = trend?.up ?? true;
  const trendValue = trend?.value ?? '';

  return (
    <div className="stat-card">
      {/* Accent bar on top */}
      <div 
        className="stat-card-accent" 
        style={{ background: accentColor }}
      />
      
      {/* Icon */}
      <div 
        className="stat-card-icon"
        style={{ 
          background: `${accentColor}15`,
          color: accentColor 
        }}
      >
        <span className="text-xl">{icon}</span>
      </div>
      
      {/* Label */}
      <div className="stat-label">{title}</div>
      
      {/* Value */}
      <div className="stat-value">{value}</div>
      
      {/* Trend */}
      {trendValue && (
        <div className={`stat-trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
};

export default StatCard;
