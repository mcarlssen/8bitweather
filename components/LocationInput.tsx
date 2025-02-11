import React, { useState, useEffect, useRef } from 'react';

interface LocationInputProps {
  value?: string;  // Controlled value, if provided.
  initialLocation?: string;
  onLocationChange?: (location: string, isEditing?: boolean) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  initialLocation = "Enter location",
  onLocationChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [internalLocation, setInternalLocation] = useState<string>(value || initialLocation || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // When switching to edit mode, focus the input.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  // Debounce: call onLocationChange 100ms after the user stops typing while editing.
  useEffect(() => {
    if (editing && onLocationChange) {
      const handler = setTimeout(() => {
        onLocationChange(internalLocation, editing);
      }, 100);
      return () => clearTimeout(handler);
    }
  }, [internalLocation, editing, onLocationChange]);

  useEffect(() => {
    if (value !== undefined) {
      setInternalLocation(value);
    }
  }, [value]);

  const handleBlur = () => {
    // Add a small delay to allow click events to process first
    setTimeout(() => {
      setEditing(false);
      if (onLocationChange) {
        onLocationChange(internalLocation, false);
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (onLocationChange) {
        onLocationChange(internalLocation, false);
      }
    }
  };

  return editing ? (
    <input
      ref={inputRef}
      type="text"
      onChange={(e) => setInternalLocation(e.target.value)}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      className="location-input"
    />
  ) : (
    <div
      onClick={() => setEditing(true)}
      className="location-display"
    >
      {internalLocation}
    </div>
  );
};

export default LocationInput; 