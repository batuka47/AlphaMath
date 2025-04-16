import React from 'react';

const RadioButton = ({ label, value, checked, onChange }) => {
  return (
    <label className="inline-flex items-center text-xl font-semibold gap-1 ml-12 p-2">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-blue-600 h-4 w-4"
      />
      <span className="ml-2 flex justify-center items-center gap-1">{value}. {label}</span>
    </label>
  );
};

export default RadioButton;
