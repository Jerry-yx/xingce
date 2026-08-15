import React from "react";
import { InputNumber, Input, Checkbox, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { DynamicList } from "../common/DynamicList";
import { ModuleCard } from "../common/ModuleCard";
import type { EssayModule, Paper } from "../../types";

interface EssaySectionProps {
  data: EssayModule;
  onChange: (data: EssayModule) => void;
  onSave?: () => void;
}

export const EssaySection: React.FC<EssaySectionProps> = ({ data, onChange, onSave }) => (
  <ModuleCard title="📝 申论对策" headerExtra={onSave ? <Button type="text"  icon={<SaveOutlined />} onClick={onSave}>保存</Button> : undefined} collapsible defaultCollapsed>
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
        overTime: "",
        isOverTime: false,
        scoreKeywords: 0,
        missKeywordsCount: 0,
        missKeywords: "",
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
          </div>
          <div className="field-grid">
            <div className="field-cell">
              <label className="field-label">⏱️ 超时</label>
              <Checkbox checked={paper.isOverTime} onChange={(e) => onUpdate({ ...paper, isOverTime: e.target.checked })}>
                未超时
              </Checkbox>
            </div>
            {!paper.isOverTime && (
              <div className="field-cell">
                <label className="field-label">超过时长</label>
                <Input
                  value={paper.overTime}
                  onChange={(e) => onUpdate({ ...paper, overTime: e.target.value })}
                  placeholder="min"
                  
                  className="field-input"
                />
              </div>
            )}
            <div className="field-cell">
              <label className="field-label">✅ 得分词</label>
              <InputNumber
                value={paper.scoreKeywords}
                onChange={(v) => onUpdate({ ...paper, scoreKeywords: v || 0 })}
                min={0}
                
                className="field-input"
              />
            </div>
            <div className="field-cell">
              <label className="field-label">📌 漏抄数</label>
              <InputNumber
                value={paper.missKeywordsCount}
                onChange={(v) => onUpdate({ ...paper, missKeywordsCount: v || 0 })}
                min={0}
                
                className="field-input"
              />
            </div>
          </div>
          <div className="field-cell" style={{ marginTop: 8 }}>
            <label className="field-label" style={{ width: 80 }}>
              📌 漏抄词
            </label>
            <Input
              value={paper.missKeywords}
              onChange={(e) => onUpdate({ ...paper, missKeywords: e.target.value })}
              placeholder="漏抄关键词，逗号分隔"
              
              className="field-input"
            />
          </div>
        </div>
      )}
      addLabel="添加套卷"
      minItems={0}
    />
  </ModuleCard>
);
