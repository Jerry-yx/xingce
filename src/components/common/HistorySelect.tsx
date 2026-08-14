import React from 'react';
import { AutoComplete, Input } from 'antd';

interface HistorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  historyOptions: string[];
  style?: React.CSSProperties;
  className?: string;
}

export function HistorySelect({ value, onChange, placeholder, historyOptions, style, className }: HistorySelectProps) {
  const options = historyOptions.map(opt => ({ value: opt, label: opt }));

  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      className={className}
      filterOption={(inputValue, option) =>
        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
      }
    >
      <Input />
    </AutoComplete>
  );
}