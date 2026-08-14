import React from "react";
import { InputNumber, Select, Input } from "antd";
import { DynamicList } from "../common/DynamicList";
import { ModuleCard, AccuracyBadge } from "../common/ModuleCard";
import type { SpeechModule, Paper, ArticleTypeError, QuestionTypeSkill } from "../../types";
import { ARTICLE_TYPE_MAP, SPEECH_ERROR_KEYS, QUESTION_TYPE_MAP } from "../../utils/constants";

interface SpeechSectionProps {
  data: SpeechModule;
  onChange: (data: SpeechModule) => void;
}

export const SpeechSection: React.FC<SpeechSectionProps> = ({ data, onChange }) => {
  const updatePapers = (papers: Paper[]) => onChange({ ...data, papers });
  const updateArticleTypes = (articleTypes: ArticleTypeError[]) => onChange({ ...data, articleTypes });
  const updateErrorTypes = (errorTypes: Record<string, number>) => onChange({ ...data, errorTypes });
  const updateQuestionTypeSkills = (questionTypeSkills: QuestionTypeSkill[]) => onChange({ ...data, questionTypeSkills });

  const renderArticleType = (item: ArticleTypeError, _i: number, onUpdate: (item: ArticleTypeError) => void) => (
    <div className="field-cell">
      <label className="field-label">文章类型</label>
      <Select
        value={item.type}
        onChange={(v) => onUpdate({ ...item, type: v })}
        size="small"
        className="field-input"
        options={Object.entries(ARTICLE_TYPE_MAP).map(([k, v]) => ({ value: Number(k), label: v }))}
      />
      <InputNumber value={item.errorCount} onChange={(v) => onUpdate({ ...item, errorCount: v || 0 })} min={0} size="small" style={{ width: 60 }} />
    </div>
  );

  const renderQuestionTypeSkill = (item: QuestionTypeSkill, _i: number, onUpdate: (item: QuestionTypeSkill) => void) => (
    <div className="field-cell">
      <label className="field-label">题目类型</label>
      <Select
        value={item.questionType}
        onChange={(v) => onUpdate({ ...item, questionType: v })}
        size="small"
        className="field-input"
        options={Object.entries(QUESTION_TYPE_MAP).map(([k, v]) => ({ value: Number(k), label: v }))}
      />
      <Input
        value={item.skill}
        onChange={(e) => onUpdate({ ...item, skill: e.target.value })}
        placeholder="技巧"
        size="small"
        className="field-input"
        style={{ width: 120 }}
      />
    </div>
  );

  return (
    <ModuleCard title="🧠 言语理解">
      <div className="module-layout">
        <div className="module-left">
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>套卷总体情况</h4>
          <DynamicList
            items={data.papers}
            onChange={updatePapers}
            createItem={() => ({
              ...(data.papers[0] || {
                id: String(Date.now()),
                totalQuestions: 0,
                timeUsed: 0,
                errorCount: 0,
                circleQuestions: "",
                wrongQuestions: "",
                starQuestions: "",
                fillErrorCount: 0,
                centerErrorCount: 0,
                fillErrorQuestions: "",
                centerErrorQuestions: "",
                centerCircleQuestions: "",
              }),
              id: String(Date.now()),
            })}
            renderItem={(paper, i, onUpdate) => {
              const totalErr = (paper.fillErrorCount || 0) + (paper.centerErrorCount || 0);
              return (
                <div className="paper-item">
                  <div className="paper-header">
                    <span className="paper-title">套卷 {i + 1}</span>
                    <AccuracyBadge correct={paper.totalQuestions - totalErr} total={paper.totalQuestions} />
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
                      <label className="field-label">选词填空错</label>
                      <InputNumber
                        value={paper.fillErrorCount}
                        onChange={(v) => onUpdate({ ...paper, fillErrorCount: v || 0 })}
                        min={0}
                        size="small"
                        className="field-input"
                      />
                    </div>
                    <div className="field-cell">
                      <label className="field-label">中心理解错</label>
                      <InputNumber
                        value={paper.centerErrorCount}
                        onChange={(v) => onUpdate({ ...paper, centerErrorCount: v || 0 })}
                        min={0}
                        size="small"
                        className="field-input"
                      />
                    </div>
                    <div className="field-cell">
                      <label className="field-label" style={{ color: "#ff4d4f" }}>
                        总错误
                      </label>
                      <span className="field-text" style={{ color: "#ff4d4f", fontWeight: 600 }}>
                        {totalErr}
                      </span>
                    </div>
                    <div className="field-cell field-cell-full">
                      <label className="field-label">⭕ 中心画圈</label>
                      <Input
                        value={paper.centerCircleQuestions}
                        onChange={(e) => onUpdate({ ...paper, centerCircleQuestions: e.target.value })}
                        placeholder="题号"
                        size="small"
                        className="field-input"
                      />
                    </div>
                    <div className="field-cell field-cell-full">
                      <label className="field-label">❌ 选词错题</label>
                      <Input
                        value={paper.fillErrorQuestions}
                        onChange={(e) => onUpdate({ ...paper, fillErrorQuestions: e.target.value })}
                        placeholder="题号"
                        size="small"
                        className="field-input"
                      />
                    </div>
                    <div className="field-cell field-cell-full">
                      <label className="field-label">❌ 中心错题</label>
                      <Input
                        value={paper.centerErrorQuestions}
                        onChange={(e) => onUpdate({ ...paper, centerErrorQuestions: e.target.value })}
                        placeholder="题号"
                        size="small"
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
              );
            }}
            addLabel="添加套卷"
            minItems={0}
          />
        </div>
        <div className="module-right">
          <h4 style={{ marginBottom: 8, color: "#1a2b4c" }}>分类别统计</h4>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>文章类型错误</div>
            <DynamicList
              items={data.articleTypes}
              onChange={updateArticleTypes}
              createItem={() => ({ id: String(Date.now()), type: 0, errorCount: 0 })}
              renderItem={renderArticleType}
              addLabel="添加类型"
              minItems={0}
            />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>错误选项类别</div>
            <div className="error-options-row">
              {SPEECH_ERROR_KEYS.map((k) => (
                <div className="error-option-item" key={k.key}>
                  <label className="field-label">{k.label}</label>
                  <InputNumber
                    value={data.errorTypes[k.key] || 0}
                    onChange={(v) => updateErrorTypes({ ...data.errorTypes, [k.key]: v || 0 })}
                    min={0}
                    size="small"
                    className="field-input"
                  />
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>题目类型与技巧</div>
            {(() => {
              const items = data.questionTypeSkills || [];
              const agg: Record<number, number> = {};
              items.forEach((qt) => {
                agg[qt.questionType] = (agg[qt.questionType] || 0) + 1;
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
                        {QUESTION_TYPE_MAP[Number(k)] || "未知"}：{v}
                      </span>
                    ))}
                </div>
              );
            })()}
            <DynamicList
              items={data.questionTypeSkills || []}
              onChange={updateQuestionTypeSkills}
              createItem={() => ({ id: String(Date.now()), questionType: 1, skill: '' })}
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
