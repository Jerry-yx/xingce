import React from "react";
import { InputNumber, Input } from "antd";
import { DynamicList } from "../common/DynamicList";
import { HistorySelect } from "../common/HistorySelect";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { NumberModule, Paper, NumberErrorType, Skill } from "../../types";
import { getHistoricalArrayValues } from "../../utils/storage";

interface NumberSectionProps {
  data: NumberModule;
  onChange: (data: NumberModule) => void;
}

export const NumberSection: React.FC<NumberSectionProps> = ({ data, onChange }) => {
  const typeOptions = getHistoricalArrayValues("number.errorTypes.type");
  const updatePapers = (papers: Paper[]) => onChange({ ...data, papers });
  const updateErrorTypes = (errorTypes: NumberErrorType[]) => onChange({ ...data, errorTypes });
  const updateSkills = (skills: Skill[]) => onChange({ ...data, skills });

  return (
    <ModuleCard title="🔢 数量关系">
      <div className="module-layout">
        <div className="module-left">
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>套卷总体情况</h4>
          <DynamicList
            items={data.papers}
            onChange={updatePapers}
            createItem={(): Paper => ({
              id: String(Date.now()),
              totalQuestions: 0,
              timeUsed: 0,
              errorCount: 0,
              circleQuestions: "",
              wrongQuestions: "",
              starQuestions: "",
              guessRightQuestions: "",
            })}
            renderItem={(paper, i, onUpdate) => (
              <div className="paper-item">
                <div className="paper-header">
                  <span className="paper-title">套卷 {i + 1}</span>
                  <AccuracyBadge correct={paper.totalQuestions - paper.errorCount} total={paper.totalQuestions} />
                </div>
                <div className="field-grid">
                  <div className="field-cell">
                    <label className="field-label">总题数</label>
                    <InputNumber
                      value={paper.totalQuestions}
                      onChange={(v) => onUpdate({ ...paper, totalQuestions: v || 0 })}
                      min={0}
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell">
                    <label className="field-label">用时(min)</label>
                    <InputNumber
                      value={paper.timeUsed}
                      onChange={(v) => onUpdate({ ...paper, timeUsed: v || 0 })}
                      min={0}
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell">
                    <label className="field-label">推荐用时</label>
                    <span className="field-text">{paper.totalQuestions}min</span>
                  </div>
                  <div className="field-cell">
                    <label className="field-label">错误个数</label>
                    <InputNumber
                      value={paper.errorCount}
                      onChange={(v) => onUpdate({ ...paper, errorCount: v || 0 })}
                      min={0}
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">⭕ 画圈</label>
                    <Input
                      value={paper.circleQuestions}
                      onChange={(e) => onUpdate({ ...paper, circleQuestions: e.target.value })}
                      placeholder="题号"
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">蒙对</label>
                    <Input
                      value={paper.guessRightQuestions}
                      onChange={(e) => onUpdate({ ...paper, guessRightQuestions: e.target.value })}
                      placeholder="题号"
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">❌ 错题</label>
                    <Input
                      value={paper.wrongQuestions}
                      onChange={(e) => onUpdate({ ...paper, wrongQuestions: e.target.value })}
                      placeholder="题号"
                      size="small"
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">★ 两次错</label>
                    <Input
                      value={paper.starQuestions}
                      onChange={(e) => onUpdate({ ...paper, starQuestions: e.target.value })}
                      placeholder="题号"
                      size="small"
                      className="field-input"
                    />
                  </div>
                </div>
              </div>
            )}
            addLabel="添加套卷"
            minItems={0}
          />
        </div>
        <div className="module-right">
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>错因分类</h4>
          <DynamicList
            items={data.errorTypes}
            onChange={updateErrorTypes}
            createItem={(): NumberErrorType => ({ id: String(Date.now()), type: "", errorCount: 0 })}
            renderItem={(item, _i, onUpdate) => (
              <div className="field-cell" style={{ marginBottom: 6 }}>
                <label className="field-label">错因</label>
                <HistorySelect
                  value={item.type}
                  onChange={(v) => onUpdate({ ...item, type: v })}
                  placeholder="选择或输入"
                  historyOptions={typeOptions}
                  className="field-input"
                />
                <InputNumber
                  value={item.errorCount}
                  onChange={(v) => onUpdate({ ...item, errorCount: v || 0 })}
                  min={0}
                  size="small"
                  style={{ width: 60, flexShrink: 0 }}
                />
              </div>
            )}
            addLabel="添加错因"
            minItems={0}
          />
          <h4 style={{ marginBottom: 8, marginTop: 16, color: "#1a2b4c" }}>💡 技巧</h4>
          <DynamicList
            items={data.skills}
            onChange={updateSkills}
            createItem={(): Skill => ({ id: String(Date.now()), description: "" })}
            renderItem={(item, _i, onUpdate) => (
              <Input
                value={item.description}
                onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                placeholder="描述技巧"
                size="small"
              />
            )}
            addLabel="添加技巧"
            minItems={0}
          />
        </div>
      </div>
    </ModuleCard>
  );
};
