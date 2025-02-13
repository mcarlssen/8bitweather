import React from 'react';

interface HourlyGraphProps {
  currentValue: number;
  hourlyValues: number[];
  hourlyTimes: string[];
}

const HourlyGraph: React.FC<HourlyGraphProps> = ({ currentValue, hourlyValues, hourlyTimes }) => {
  // Format times to hour only (e.g., "2023-01-01T14:00" -> "2PM")
  const formattedTimes = hourlyTimes.map(time => 
    new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' })
  );

  // Calculate relative changes from current value
  const relativeChanges = hourlyValues.map(value => 
    ((value - currentValue) / currentValue) * 100
  );

  return (
    <>
      <div className="hourly-times">
        {formattedTimes.map((time, i) => (
          <div key={i}>{time}</div>
        ))}
      </div>
      <div className="hourly-graph">
        <div className="baseline"></div>
        {relativeChanges.map((change, i) => (
          <div key={i} className="hourly-bar-container">
            <div className="hourly-value">
              {hourlyValues[i].toFixed(1)}
            </div>
            <div
              className="hourly-bar"
              style={{
                height: `${Math.abs(change * 1.5)}%`,
                position: 'absolute',
                bottom: change > 0 ? '50%' : undefined,
                top: change > 0 ? undefined : '50%',
                left: 0,
                right: 0,
                backgroundColor: change > 0 ? '#fdeade77' : '#ff634777'
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default HourlyGraph; 