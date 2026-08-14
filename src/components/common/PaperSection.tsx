import React from "react";
import { InputNumber, Input } from "antd";
import { DynamicList } from "./DynamicList";
import { AccuracyBadge } from "./ModuleCard";
import type { Paper } from "../../types";
import { EMPTY_PAPER } from "../../utils/constants";

interface PaperSectionProps {
  papers: Paper[];
  onChange: (papers: Paper[]) => void;
  extraFields?: (paper: Paper, index: number, onChange: (paper: Paper) => void) => React.ReactNode;
}

export function PaperSection({ papers, onChange, extraFields }: PaperSectionProps) {
  const createPaper = (): Paper => ({
    ...EMPTY_PAPER,
    id: String(Date.now()),
  });

  const renderPaper = (paper: Paper, _index: number, onUpdate: (item: Paper) => void) => {
    const correct = paper.totalQuestions - paper.errorCount;
    return (
      <div className="paper-item">
        <div className="paper-header">
          <span className="paper-title">套卷</span>
          <AccuracyBadge correct={correct} total={paper.totalQuestions} />
        </div>
        <div className="paper-row">
          <label>总题数</label>
          <InputNumber
            value={paper.totalQuestions}
            onChange={(v) => onUpdate({ ...paper, totalQuestions: v || 0 })}
            min={0}
            size="small"
            style={{ width: 70 }}
          />
          <label style={{ marginLeft: 8 }}>推荐用时: {paper.totalQuestions}min</label>
          <label style={{ marginLeft: 12 }}>用时(min)</label>
          <InputNumber value={paper.timeUsed} onChange={(v) => onUpdate({ ...paper, timeUsed: v || 0 })} min={0} size="small" style={{ width: 70 }} />
          <label style={{ marginLeft: 12 }}>错误个数</label>
          <InputNumber
            value={paper.errorCount}
            onChange={(v) => onUpdate({ ...paper, errorCount: v || 0 })}
            min={0}
            size="small"
            style={{ width: 70 }}
          />
        </div>
        <div className="paper-row">
          <label>⭕ 画圈</label>
          <Input
            value={paper.circleQuestions}
            onChange={(e) => onUpdate({ ...paper, circleQuestions: e.target.value })}
            placeholder="题号"
            size="small"
            style={{ width: 120 }}
          />
          <label style={{ marginLeft: 12 }}>❌ 错题</label>
          <Input
            value={paper.wrongQuestions}
            onChange={(e) => onUpdate({ ...paper, wrongQuestions: e.target.value })}
            placeholder="题号"
            size="small"
            style={{ width: 120 }}
          />
          <label style={{ marginLeft: 12 }}>★ (两次都错)</label>
          <Input
            value={paper.starQuestions}
            onChange={(e) => onUpdate({ ...paper, starQuestions: e.target.value })}
            placeholder="题号"
            size="small"
            style={{ width: 120 }}
          />
        </div>
        {extraFields?.(paper, _index, onUpdate)}
      </div>
    );
  };

  return <DynamicList items={papers} onChange={onChange} createItem={createPaper} renderItem={renderPaper} addLabel="添加套卷" minItems={0} />;
}
