import React from "react";
import { InputNumber, Input, Divider, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { DynamicList } from "../common/DynamicList";
import { HistorySelect } from "../common/HistorySelect";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { LogicModule, Paper, QuestionTypeSkill } from "../../types";
import { LOGIC_ERROR_KEYS } from "../../utils/constants";
import { getHistoricalArrayValues } from "../../utils/storage";

interface LogicSectionProps {
  data: LogicModule;
  onChange: (data: LogicModule) => void;
  onSave?: () => void;
}

export const LogicSection: React.FC<LogicSectionProps> = ({ data, onChange, onSave }) => {
  const typeOptions = getHistoricalArrayValues("logic.questionTypeSkills.questionType");
  const updateQuestionTypeSkills = (questionTypeSkills: QuestionTypeSkill[]) => onChange({ ...data, questionTypeSkills });

  const renderQuestionTypeSkill = (item: QuestionTypeSkill, _i: number, onUpdate: (item: QuestionTypeSkill) => void) => (
    <div className="field-cell">
      <label className="field-label">题目类型</label>
      <HistorySelect
        value={item.questionType}
        onChange={(v) => onUpdate({ ...item, questionType: v })}
        placeholder="选择或输入"
        historyOptions={typeOptions}
        className="field-input"
      />
      <Input
        value={item.skill}
        onChange={(e) => onUpdate({ ...item, skill: e.target.value })}
        placeholder="技巧"
        
        className="field-input"
        style={{ flex: "1 0 40%" }}
      />
    </div>
  );

  return (
  <ModuleCard title="🧩 逻辑判断" headerExtra={onSave ? <Button type="text"  icon={<SaveOutlined />} onClick={onSave}>保存</Button> : undefined} collapsible defaultCollapsed>
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
        <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>错因分布</h4>
        <div className="error-options-row">
          {LOGIC_ERROR_KEYS.map((k) => (
            <div className="error-option-item" key={k.key}>
              <label className="field-label">
                {k.key}({k.label})
              </label>
              <InputNumber
                value={data.errorTypes[k.key as keyof typeof data.errorTypes] || 0}
                onChange={(v) => onChange({ ...data, errorTypes: { ...data.errorTypes, [k.key]: v || 0 } })}
                min={0}
                
                className="field-input"
              />
            </div>
          ))}
        </div>
        <Divider className="module-divider" />
        <div className="field-cell" style={{ marginBottom: 8 }}>
          <label className="field-label" style={{ width: 100 }}>
            🎯 最难追及
          </label>
          <Input
            value={data.hardestQuestions}
            onChange={(e) => onChange({ ...data, hardestQuestions: e.target.value })}
            placeholder="题号"
            
            className="field-input"
          />
        </div>
        <div className="tip-bar">符号速查：因=因果倒置 · 他=另有他因 · 无=无关项 · 反=因果反了 · 范=范围扩大/缩小 · 搭=搭桥加强 · 拆=拆桥削弱</div>
        <Divider className="module-divider" />
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>题目类型与技巧</div>
          {(() => {
            const items = data.questionTypeSkills || [];
            const agg: Record<string, number> = {};
            items.forEach((qt) => {
              const name = qt.questionType || "未知";
              agg[name] = (agg[name] || 0) + 1;
            });
            const total = items.length;
            if (total === 0) return null;
            return (
              <div style={{ background: "#f0f5ff", borderRadius: 6, padding: "4px 10px", marginBottom: 8, fontSize: 12, color: "#4a5b79", display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 600 }}>合计 {total} 项</span>
                {Object.entries(agg)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => (
                    <span key={k}>
                      {k}：{v}
                    </span>
                  ))}
              </div>
            );
          })()}
          <DynamicList
            items={data.questionTypeSkills || []}
            onChange={updateQuestionTypeSkills}
            createItem={() => ({ id: String(Date.now()), questionType: '', skill: '' })}
            renderItem={renderQuestionTypeSkill}
            addLabel="添加题目类型"
            minItems={0}
          />
        </div>
      </div>
    </div>
  </ModuleCard>
  );
};
