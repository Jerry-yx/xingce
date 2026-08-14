import React from "react";
import { InputNumber, Input } from "antd";
import { DynamicList } from "../common/DynamicList";
import { HistorySelect } from "../common/HistorySelect";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { CalcModule, Paper, CalcErrorType, CalcOptimization } from "../../types";
import { getHistoricalArrayValues } from "../../utils/storage";

interface CalcSectionProps {
  data: CalcModule;
  onChange: (data: CalcModule) => void;
}

export const CalcSection: React.FC<CalcSectionProps> = ({ data, onChange }) => {
  const typeOptions = getHistoricalArrayValues("calc.errorTypes.type");
  const updatePapers = (papers: Paper[]) => onChange({ ...data, papers });
  const updateErrorTypes = (errorTypes: CalcErrorType[]) => onChange({ ...data, errorTypes });
  const updateOptimizations = (optimizations: CalcOptimization[]) => onChange({ ...data, optimizations });

  return (
    <ModuleCard title="📊 资料分析">
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
                    <label className="field-label">❌ 错题</label>
                    <Input
                      value={paper.wrongQuestions}
                      onChange={(e) => onUpdate({ ...paper, wrongQuestions: e.target.value })}
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
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>错误类型</h4>
          <DynamicList
            items={data.errorTypes}
            onChange={updateErrorTypes}
            createItem={(): CalcErrorType => ({ id: String(Date.now()), type: "", errorCount: 0 })}
            renderItem={(item, _i, onUpdate) => (
              <div className="field-cell" style={{ marginBottom: 6 }}>
                <label className="field-label">类型</label>
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
            addLabel="添加类型"
            minItems={0}
          />
          <h4 style={{ marginBottom: 8, marginTop: 16, color: "#1a2b4c" }}>⚙️ 计算路径优化</h4>
          <DynamicList
            items={data.optimizations}
            onChange={updateOptimizations}
            createItem={(): CalcOptimization => ({ id: String(Date.now()), questionNum: "", originalSteps: "", optimizedSteps: "" })}
            renderItem={(item, _i, onUpdate) => (
              <div className="field-grid">
                <div className="field-cell">
                  <label className="field-label">题号</label>
                  <Input
                    value={item.questionNum}
                    onChange={(e) => onUpdate({ ...item, questionNum: e.target.value })}
                    placeholder="题号"
                    size="small"
                    className="field-input"
                  />
                </div>
                <div className="field-cell">
                  <label className="field-label">原步数</label>
                  <Input
                    value={item.originalSteps}
                    onChange={(e) => onUpdate({ ...item, originalSteps: e.target.value })}
                    placeholder="原步数"
                    size="small"
                    className="field-input"
                  />
                </div>
                <div className="field-cell">
                  <label className="field-label">新步数</label>
                  <Input
                    value={item.optimizedSteps}
                    onChange={(e) => onUpdate({ ...item, optimizedSteps: e.target.value })}
                    placeholder="新步数"
                    size="small"
                    className="field-input"
                  />
                </div>
              </div>
            )}
            addLabel="添加优化"
            minItems={1}
          />
        </div>
      </div>
    </ModuleCard>
  );
};
