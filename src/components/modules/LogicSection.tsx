import React from "react";
import { InputNumber, Input, Divider } from "antd";
import { DynamicList } from "../common/DynamicList";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { LogicModule, Paper } from "../../types";
import { LOGIC_ERROR_KEYS } from "../../utils/constants";

interface LogicSectionProps {
  data: LogicModule;
  onChange: (data: LogicModule) => void;
}

export const LogicSection: React.FC<LogicSectionProps> = ({ data, onChange }) => (
  <ModuleCard title="🧩 逻辑判断">
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
                size="small"
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
            size="small"
            className="field-input"
          />
        </div>
        <div className="tip-bar">符号速查：因=因果倒置 · 他=另有他因 · 无=无关项 · 反=因果反了 · 范=范围扩大/缩小 · 搭=搭桥加强 · 拆=拆桥削弱</div>
      </div>
    </div>
  </ModuleCard>
);
