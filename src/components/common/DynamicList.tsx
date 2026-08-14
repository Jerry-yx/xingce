import React from "react";
import { Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

interface DynamicListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  addLabel?: string;
  minItems?: number;
  containerClassName?: string;
}

export function DynamicList<T extends { id: string }>({
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = "添加",
  minItems = 0,
  containerClassName,
}: DynamicListProps<T>) {
  const handleAdd = () => {
    onChange([...items, createItem()]);
  };

  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, item: T) => {
    const next = [...items];
    next[index] = item;
    onChange(next);
  };

  return (
    <div className={"dynamic-list" + (containerClassName ? " " + containerClassName : "")}>
      {items.map((item, index) => (
        <div key={item.id} className="dynamic-list-item">
          <div className="dynamic-list-item-content">{renderItem(item, index, (updated) => handleUpdate(index, updated))}</div>
          {items.length > minItems && <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => handleRemove(index)} size="small" />}
        </div>
      ))}
      <Button type="dashed" onClick={handleAdd} icon={<PlusOutlined />} size="small" block style={{ marginTop: 8 }}>
        {addLabel}
      </Button>
    </div>
  );
}
