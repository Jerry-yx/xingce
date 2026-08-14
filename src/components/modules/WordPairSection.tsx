import React from "react";
import { Input, Select } from "antd";
import { DynamicList } from "../common/DynamicList";
import { ModuleCard } from "../common/ModuleCard";
import type { WordPair } from "../../types";

interface WordPairSectionProps {
  wordPairs: WordPair[];
  onChange: (wordPairs: WordPair[]) => void;
}

export const WordPairSection: React.FC<WordPairSectionProps> = ({ wordPairs, onChange }) => {
  const renderWordPair = (item: WordPair, _i: number, onUpdate: (item: WordPair) => void) => {
    const isSignal = item.pairType === "signal";
    return (
      <div className="word-pair-inline-row">
        <Select
          value={item.pairType}
          onChange={(v) => onUpdate({ ...item, pairType: v as "signal" | "compare" })}
          size="small"
          className="wp-input-70"
          options={[
            { value: "signal", label: "信号词" },
            { value: "compare", label: "对比词" },
          ]}
        />
        {isSignal ? (
          <>
            <Input
              value={item.signalWord}
              onChange={(e) => onUpdate({ ...item, signalWord: e.target.value })}
              placeholder="信号"
              size="small"
              className="wp-input-70"
            />
            <span className="wp-sep">/</span>
            <Input
              value={item.selectedWord}
              onChange={(e) => onUpdate({ ...item, selectedWord: e.target.value })}
              placeholder="选词"
              size="small"
              className="wp-input-70"
            />
            <span className="wp-sep">/</span>
          </>
        ) : (
          <>
            <Input
              value={item.selectedWord}
              onChange={(e) => onUpdate({ ...item, selectedWord: e.target.value })}
              placeholder="选词"
              size="small"
              className="wp-input-70"
            />
            <span className="wp-sep">/</span>
            <Input
              value={item.compareWord}
              onChange={(e) => onUpdate({ ...item, compareWord: e.target.value })}
              placeholder="对比"
              size="small"
              className="wp-input-70"
            />
            <span className="wp-sep">/</span>
          </>
        )}
        <Input
          value={item.note}
          onChange={(e) => onUpdate({ ...item, note: e.target.value })}
          placeholder={isSignal ? "词义对比重点" : "选词对比重点"}
          size="small"
          className="wp-input-flex"
        />
      </div>
    );
  };

  return (
    <ModuleCard title="🔤 词组对比">
      <div style={{ marginBottom: 8, fontSize: 12, color: "#7a8aa8" }}>
        信号词格式：选词 / 信号词 / 重点 &nbsp;&nbsp; 对比词格式：选词 / 对比词 / 重点
      </div>
      <DynamicList
        items={wordPairs}
        onChange={onChange}
        createItem={(): WordPair => ({ id: String(Date.now()), pairType: "signal", signalWord: "", selectedWord: "", note: "" })}
        renderItem={renderWordPair}
        addLabel="添加词对"
        minItems={0}
      />
    </ModuleCard>
  );
};
