import React from "react";
import { InputNumber, Input, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { DynamicList } from "../common/DynamicList";
import { HistorySelect } from "../common/HistorySelect";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { FigureModule, Paper, NamedItem } from "../../types";
import { getAllFigurePatterns } from "../../utils/storage";

interface FigureSectionProps {
  data: FigureModule;
  onChange: (data: FigureModule) => void;
  onSave?: () => void;
}

export const FigureSection: React.FC<FigureSectionProps> = ({ data, onChange, onSave }) => {
  const patternOptions = getAllFigurePatterns();
  return (
    <ModuleCard title="🎨 图推" headerExtra={onSave ? <Button type="text"  icon={<SaveOutlined />} onClick={onSave}>保存</Button> : undefined} collapsible defaultCollapsed>
      <div className="module-layout">
        <div className="module-left">
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>套卷总体情况</h4>
          <DynamicList
            items={data.papers}
            onChange={(papers) => onChange({ ...data, papers })}
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
                  <Input
                    value={paper.name || ''}
                    onChange={(e) => onUpdate({ ...paper, name: e.target.value })}
                    placeholder="套卷名称"
                    
                    style={{ width: 140, marginLeft: 8 }}
                  />
                  <AccuracyBadge correct={paper.totalQuestions - paper.errorCount} total={paper.totalQuestions} />
                </div>
                <div className="field-grid">
                  <div className="field-cell">
                    <label className="field-label">总题数</label>
                    <InputNumber
                      value={paper.totalQuestions}
                      onChange={(v) => onUpdate({ ...paper, totalQuestions: v || 0 })}
                      min={0}
                      
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell">
                    <label className="field-label">用时(min)</label>
                    <InputNumber
                      value={paper.timeUsed}
                      onChange={(v) => onUpdate({ ...paper, timeUsed: v || 0 })}
                      min={0}
                      
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
                      
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">⭕ 画圈</label>
                    <Input
                      value={paper.circleQuestions}
                      onChange={(e) => onUpdate({ ...paper, circleQuestions: e.target.value })}
                      placeholder="题号"
                      
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">❌ 错题</label>
                    <Input
                      value={paper.wrongQuestions}
                      onChange={(e) => onUpdate({ ...paper, wrongQuestions: e.target.value })}
                      placeholder="题号"
                      
                      className="field-input"
                    />
                  </div>
                  <div className="field-cell field-cell-full">
                    <label className="field-label">★ 两次错</label>
                    <Input
                      value={paper.starQuestions}
                      onChange={(e) => onUpdate({ ...paper, starQuestions: e.target.value })}
                      placeholder="题号"
                      
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
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>新规律</h4>
          <DynamicList
            items={data.newPatterns}
            onChange={(patterns) => onChange({ ...data, newPatterns: patterns })}
            createItem={(): NamedItem => ({ id: String(Date.now()), value: "" })}
            renderItem={(item, _i, onUpdate) => (
              <HistorySelect
                value={item.value}
                onChange={(v) => onUpdate({ ...item, value: v })}
                placeholder="选择或输入新规律"
                historyOptions={patternOptions}
              />
            )}
            addLabel="添加新规律"
            minItems={0}
          />
          <h4 style={{ marginBottom: 8, marginTop: 16, color: "#1a2b4c" }}>错误规律</h4>
          <DynamicList
            items={data.errorPatterns}
            onChange={(patterns) => onChange({ ...data, errorPatterns: patterns })}
            createItem={(): NamedItem => ({ id: String(Date.now()), value: "" })}
            renderItem={(item, _i, onUpdate) => (
              <HistorySelect
                value={item.value}
                onChange={(v) => onUpdate({ ...item, value: v })}
                placeholder="选择或输入错误规律"
                historyOptions={patternOptions}
              />
            )}
            addLabel="添加错误规律"
            minItems={0}
          />
        </div>
      </div>
    </ModuleCard>
  );
};
