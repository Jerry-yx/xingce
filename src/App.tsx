import React, { useCallback, useMemo, useRef } from "react";
import { Tabs, Button, message, Select, Modal, Tag, Divider, Badge } from "antd";
import { SaveOutlined, ExportOutlined, DownloadOutlined, ImportOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAppData } from "./hooks/useAppData";
import { SpeechSection } from "./components/modules/SpeechSection";
import { LogicSection } from "./components/modules/LogicSection";
import { FigureSection } from "./components/modules/FigureSection";
import { CalcSection } from "./components/modules/CalcSection";
import { NumberSection } from "./components/modules/NumberSection";
import { EssaySection } from "./components/modules/EssaySection";
import { WordPairSection } from "./components/modules/WordPairSection";
import { ModuleCard } from "./components/common/ModuleCard";
import { getAllDayData, loadDayData, formatDate, getAllSavedDates, saveDayData } from "./utils/storage";
import { ARTICLE_TYPE_MAP, SPEECH_ERROR_KEYS, LOGIC_ERROR_KEYS, QUESTION_TYPE_MAP } from "./utils/constants";
import type { DayData, Paper, WordPair } from "./types";
import "./styles/app.css";
// const HL = { rate: "#52c41a", err: "#ff4d4f", time: "#1890ff", key: "#8a99b0" } as const;

const Number = ({ t }: { t: number | string; }) => <span className="cmp-number">{t}个</span>;
const SmallNumber = ({ t }: { t: number | string; }) => <span className="cmp-small-number">{t}个</span>;
const Rate = ({ r }: { r: number; }) => (
  <span className={`cmp-rate ${r < 70 ? "cmp-rate-low" : "cmp-rate-ok"}`}>{r}<span className="cmp-rate-unit">%</span></span>
);
const Err = ({ n }: { n: number; }) => (
  <span className="cmp-err">{n}<span className="cmp-unit">个</span></span>
);
const Time = ({ t }: { t: number; }) => (
  <span className="cmp-time">{t}<span className="cmp-unit">min</span></span>
);

function mergeListByDeepEqual<T extends { id: string; }>(existing: T[], imported: T[]): T[] {
  const result = [...existing];
  const existingKeys = new Set(existing.map((item) => JSON.stringify({ ...item, id: undefined })));
  imported.forEach((item) => {
    const key = JSON.stringify({ ...item, id: undefined });
    if (!existingKeys.has(key)) {
      result.push(item);
    }
  });
  return result;
}

const App: React.FC = () => {
  const { todayData, updateTodayData, saveToday, getAllDates, activeTab, setActiveTab, todayStr } = useAppData();

  const dates = useMemo(() => getAllDates(), [getAllDates]);
  const [historyDate, setHistoryDate] = React.useState<string>(dates[0] || "");
  const [exportVisible, setExportVisible] = React.useState(false);
  const [exportText, setExportText] = React.useState("");
  const [importVisible, setImportVisible] = React.useState(false);
  const [importData, setImportData] = React.useState<Record<string, DayData> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    saveToday();
    message.success("保存成功！");
  }, [saveToday]);

  const updateSpeech = useCallback(
    (speech: typeof todayData.speech) => {
      updateTodayData((d) => ({ ...d, speech }));
    },
    [updateTodayData],
  );
  const updateLogic = useCallback(
    (logic: typeof todayData.logic) => {
      updateTodayData((d) => ({ ...d, logic }));
    },
    [updateTodayData],
  );
  const updateFigure = useCallback(
    (figure: typeof todayData.figure) => {
      updateTodayData((d) => ({ ...d, figure }));
    },
    [updateTodayData],
  );
  const updateCalc = useCallback(
    (calc: typeof todayData.calc) => {
      updateTodayData((d) => ({ ...d, calc }));
    },
    [updateTodayData],
  );
  const updateNumber = useCallback(
    (num: typeof todayData.number) => {
      updateTodayData((d) => ({ ...d, number: num }));
    },
    [updateTodayData],
  );
  const updateEssay = useCallback(
    (essay: typeof todayData.essay) => {
      updateTodayData((d) => ({ ...d, essay }));
    },
    [updateTodayData],
  );

  // ===== 导出 =====
  const generateExport = useCallback(() => {
    const allData = getAllDayData();
    let text = "";
    const modules = [
      { key: "speech" as const, title: "言语理解" },
      { key: "logic" as const, title: "逻辑判断" },
      { key: "figure" as const, title: "图推" },
      { key: "calc" as const, title: "资料分析" },
      { key: "number" as const, title: "数量关系" },
      { key: "essay" as const, title: "申论对策" },
    ];
    modules.forEach(({ key, title }) => {
      text += `\n══════ ${title} ══════\n`;
      allData.forEach((d) => {
        text += `【${d.date}】\n`;
        const mod = d[key];
        if (mod?.papers) {
          mod.papers.forEach((p: Paper, i: number) => {
            const correct = p.totalQuestions - p.errorCount;
            const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
            text += `套卷${i + 1} ${p.name ? `${p.name} ` : ""}：正确率：${rate}% 用时：${p.timeUsed}min, 总题数：${p.totalQuestions}个 错误个数：${p.errorCount}个\n`;
            if (p.circleQuestions) text += `  画圈：${p.circleQuestions}\n`;
            if (p.wrongQuestions) text += `  错题：${p.wrongQuestions}\n`;
            if (p.starQuestions) text += `  ★：${p.starQuestions}\n`;
          });
        }
        if (key === "speech" && d.speech) {
          if (d.speech.articleTypes?.length) {
            const parts = d.speech.articleTypes
              .map((a: { type: number; errorCount: number; }) => `${ARTICLE_TYPE_MAP[a.type] || "未知"}错误：${a.errorCount}个`)
              .join("  ");
            text += `  ${parts}\n`;
          }
          SPEECH_ERROR_KEYS.forEach((k) => {
            const v = d.speech.errorTypes?.[k.key] || 0;
            if (v > 0) text += `  ${k.label}${v}个\n`;
          });
          if (d.speech.wordPairs?.length) {
            text += "  词组对比：\n";
            d.speech.wordPairs.forEach((wp: WordPair) => {
              const parts = [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].filter(Boolean);
              if (parts.length) text += `    ${parts.join(" / ")}\n`;
            });
          }
          if (d.speech.questionTypeSkills?.length) {
            text += "  题目类型与技巧：\n";
            d.speech.questionTypeSkills.forEach((qt) => {
              if (qt.skill?.trim()) {
                text += `    ${QUESTION_TYPE_MAP[qt.questionType] || qt.questionType}：${qt.skill}\n`;
              }
            });
          }
        }
        if (key === "essay" && d.essay?.papers) {
          d.essay.papers.forEach((p: Paper) => {
            if (p.missKeywords) text += `  漏抄词：${p.missKeywords}\n`;
          });
        }
      });
    });
    return text;
  }, []);

  const handleExport = useCallback(() => {
    const text = generateExport();
    setExportText(text);
    setExportVisible(true);
  }, [generateExport]);

  const handleDownload = useCallback(() => {
    const text = generateExport();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xingce_export_${todayStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("导出成功！");
  }, [generateExport, todayStr]);

  const handleExportJson = useCallback(() => {
    const allDates = getAllSavedDates();
    const allData: Record<string, DayData> = {};
    allDates.forEach((date) => {
      const data = loadDayData(date);
      if (data) allData[date] = data;
    });
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const desc = prompt("请输入导出描述（可选）：", "数据备份");
    const filename = desc ? `${todayStr}_${desc}.json` : `${todayStr}_数据备份.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    message.success("JSON 文件已导出");
  }, [todayStr]);

  const handleImportJson = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<string, DayData>;
        setImportData(data);
        setImportVisible(true);
      } catch {
        message.error("JSON 格式错误，请检查文件");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!importData) return;
    let mergedCount = 0;
    let overwriteCount = 0;

    Object.entries(importData).forEach(([date, importedDay]) => {
      const existing = loadDayData(date);
      if (!existing) {
        saveDayData(importedDay);
        overwriteCount++;
        return;
      }

      const merged: DayData = { ...existing };
      merged.speech = {
        ...existing.speech,
        papers: mergeListByDeepEqual(existing.speech.papers || [], importedDay.speech?.papers || []),
        articleTypes: mergeListByDeepEqual(existing.speech.articleTypes || [], importedDay.speech?.articleTypes || []),
        wordPairs: mergeListByDeepEqual(existing.speech.wordPairs || [], importedDay.speech?.wordPairs || []),
        questionTypeSkills: mergeListByDeepEqual(existing.speech.questionTypeSkills || [], importedDay.speech?.questionTypeSkills || []),
        errorTypes: (() => {
          const merged = { ...existing.speech.errorTypes };
          if (importedDay.speech?.errorTypes) {
            Object.entries(importedDay.speech.errorTypes).forEach(([k, v]) => {
              merged[k] = (merged[k] || 0) + v;
            });
          }
          return merged;
        })(),
      };
      merged.logic = {
        ...existing.logic,
        papers: mergeListByDeepEqual(existing.logic.papers || [], importedDay.logic?.papers || []),
        questionTypeSkills: mergeListByDeepEqual(existing.logic.questionTypeSkills || [], importedDay.logic?.questionTypeSkills || []),
        errorTypes: (() => {
          const merged = { ...existing.logic.errorTypes };
          if (importedDay.logic?.errorTypes) {
            Object.entries(importedDay.logic.errorTypes).forEach(([k, v]) => {
              merged[k as keyof typeof merged] = (merged[k as keyof typeof merged] || 0) + (v as number);
            });
          }
          return merged;
        })(),
      };
      merged.figure = {
        ...existing.figure,
        papers: mergeListByDeepEqual(existing.figure.papers || [], importedDay.figure?.papers || []),
        newPatterns: mergeListByDeepEqual(existing.figure.newPatterns || [], importedDay.figure?.newPatterns || []),
        errorPatterns: mergeListByDeepEqual(existing.figure.errorPatterns || [], importedDay.figure?.errorPatterns || []),
      };
      merged.calc = {
        ...existing.calc,
        papers: mergeListByDeepEqual(existing.calc.papers || [], importedDay.calc?.papers || []),
        errorTypes: mergeListByDeepEqual(existing.calc.errorTypes || [], importedDay.calc?.errorTypes || []),
        optimizations: mergeListByDeepEqual(existing.calc.optimizations || [], importedDay.calc?.optimizations || []),
      };
      merged.number = {
        ...existing.number,
        papers: mergeListByDeepEqual(existing.number.papers || [], importedDay.number?.papers || []),
        errorTypes: mergeListByDeepEqual(existing.number.errorTypes || [], importedDay.number?.errorTypes || []),
      };
      merged.essay = {
        ...existing.essay,
        papers: (() => {
          const existPapers = [...(existing.essay.papers || [])];
          const importPapers = importedDay.essay?.papers || [];
          const existKeys = existPapers.map((p) => {
            const { id, missKeywords, missKeywordsCount, ...rest } = p;
            return JSON.stringify(rest);
          });
          importPapers.forEach((imp) => {
            const { id, missKeywords: impMiss, missKeywordsCount: _mc, ...impRest } = imp;
            const impKey = JSON.stringify(impRest);
            const matchIdx = existKeys.indexOf(impKey);
            if (matchIdx >= 0) {
              const existMiss = (existPapers[matchIdx].missKeywords || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
              const importMiss = (impMiss || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
              const union = [...new Set([...existMiss, ...importMiss])].join(",");
              existPapers[matchIdx] = { ...existPapers[matchIdx], missKeywords: union, missKeywordsCount: union ? union.split(",").length : 0 };
            } else {
              existPapers.push(imp);
            }
          });
          return existPapers;
        })(),
      };

      saveDayData(merged);
      mergedCount++;
    });

    setImportVisible(false);
    setImportData(null);
    message.success(`导入完成：覆盖 ${overwriteCount} 天，合并 ${mergedCount} 天`);
    window.location.reload();
  }, [importData]);

  // ===== 历史记录视图 =====
  const historyData = historyDate ? loadDayData(historyDate) : null;
  const renderHistory = () => {
    if (!historyData) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>请选择日期</div>;
    const d = historyData;

    const moduleConfigs: { key: keyof DayData; title: string; }[] = [
      { key: "speech", title: "🧠 言语理解" },
      { key: "logic", title: "🧩 逻辑判断" },
      { key: "figure", title: "🎨 图推" },
      { key: "calc", title: "📊 资料分析" },
      { key: "number", title: "🔢 数量关系" },
      { key: "essay", title: "📝 申论对策" },
    ];

    return (
      <div>
        {moduleConfigs.map(({ key, title }) => {
          const mod = d[key] as unknown as Record<string, unknown>;
          const papers = (mod?.papers as Paper[]) || [];
          let hasData = papers.length > 0;
          if (key === "speech") hasData = hasData || (d.speech?.articleTypes?.length ?? 0) > 0 || (d.speech?.wordPairs?.length ?? 0) > 0 || (d.speech?.questionTypeSkills?.length ?? 0) > 0;
          if (key === "logic") hasData = hasData || (d.logic?.questionTypeSkills?.length ?? 0) > 0;
          return (
            <ModuleCard key={key} title={title} collapsible>
              {!hasData ? (
                <span style={{ color: "#bbb" }}>(无记录)</span>
              ) : (
                <>
                  {papers.map((p, i) => {
                    const detailStyle = { paddingLeft: 16, fontSize: 13, lineHeight: 2.2 };
                    const labelStyle = { fontWeight: 600, color: "#4a5b79" };
                    if (key === "speech") {
                      const totalErr = (p.fillErrorCount || 0) + (p.centerErrorCount || 0);
                      const rate = p.totalQuestions > 0 ? Math.round(((p.totalQuestions - totalErr) / p.totalQuestions) * 100) : 0;
                      return (
                        <div key={i} className="cmp-p-section">
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2b4c", marginBottom: 2, padding: "4px 8px", background: "#f0f5ff", borderRadius: 6 }}>
                            套卷{i + 1} {p.name || ""}
                          </div>
                          <div style={detailStyle}>
                            <span style={labelStyle}>正确率：</span><Rate r={rate} />
                            <span style={{ marginLeft: 12 }}><span style={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                            <span style={{ marginLeft: 12 }}><span style={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                            {(p.fillErrorCount || p.centerErrorCount) ? (
                              <span style={{ marginLeft: 12 }}>
                                <span style={labelStyle}>选词填空错：</span><Err n={p.fillErrorCount || 0} />
                                <span style={{ marginLeft: 8 }}><span style={labelStyle}>中心理解错：</span><Err n={p.centerErrorCount || 0} /></span>
                                <span style={{ marginLeft: 8 }}><span style={labelStyle}>总错误：</span><Err n={totalErr} /></span>
                              </span>
                            ) : null}
                          </div>
                          {(p.centerCircleQuestions || p.fillErrorQuestions || p.centerErrorQuestions) ? (
                            <div style={{ ...detailStyle, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                              {p.centerCircleQuestions ? <span><span style={labelStyle}>⭕ 中心画圈：</span>{p.centerCircleQuestions}</span> : null}
                              {p.fillErrorQuestions ? <span><span style={labelStyle}>❌ 选词错题：</span>{p.fillErrorQuestions}</span> : null}
                              {p.centerErrorQuestions ? <span><span style={labelStyle}>❌ 中心错题：</span>{p.centerErrorQuestions}</span> : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    if (key === "essay") {
                      return (
                        <div key={i} className="cmp-p-section">
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2b4c", marginBottom: 2, padding: "4px 8px", background: "#f0f5ff", borderRadius: 6 }}>
                            套卷{i + 1} {p.name || ""}
                          </div>
                          <div style={detailStyle}>
                            {p.isOverTime ? <span style={{ color: "#52c41a", fontWeight: 600 }}>未超时</span> : p.overTime ? <span style={{ color: "#ff4d4f", fontWeight: 600 }}>超时{p.overTime}min</span> : null}
                            {p.scoreKeywords ? <span style={{ marginLeft: 12 }}><span style={labelStyle}>得分词：</span><span style={{ color: "#52c41a", fontWeight: 600 }}>{p.scoreKeywords}个</span></span> : null}
                            {p.missKeywordsCount ? <span style={{ marginLeft: 12 }}><span style={labelStyle}>漏抄：</span><span style={{ color: "#ff4d4f", fontWeight: 600 }}>{p.missKeywordsCount}个</span></span> : null}
                          </div>
                          {p.missKeywords ? <div style={detailStyle}><span style={labelStyle}>漏抄词：</span>{p.missKeywords}</div> : null}
                        </div>
                      );
                    }
                    const correct = p.totalQuestions - p.errorCount;
                    const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
                    return (
                      <div key={i} className="cmp-p-section">
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2b4c", marginBottom: 2, padding: "4px 8px", background: "#f0f5ff", borderRadius: 6 }}>
                          套卷{i + 1} {p.name || ""}
                        </div>
                        <div style={detailStyle}>
                          <span style={labelStyle}>正确率：</span><Rate r={rate} />
                          <span style={{ marginLeft: 12 }}><span style={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                          <span style={{ marginLeft: 12 }}><span style={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                          <span style={{ marginLeft: 12 }}><span style={labelStyle}>错误个数：</span><Err n={p.errorCount} /></span>
                        </div>
                        {(p.circleQuestions || p.wrongQuestions || p.starQuestions || (key === "number" && p.guessRightQuestions)) ? (
                          <div style={{ ...detailStyle, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                            {p.circleQuestions ? <span><span style={labelStyle}>⭕ 画圈：</span><SmallNumber t={p.circleQuestions} /></span> : null}
                            {p.wrongQuestions ? <span><span style={labelStyle}>❌ 错题：</span><SmallNumber t={p.wrongQuestions} /></span> : null}
                            {p.starQuestions ? <span><span style={labelStyle}>★ 两次错：</span><SmallNumber t={p.starQuestions} /></span> : null}
                            {key === "number" && p.guessRightQuestions ? <span><span style={labelStyle}>蒙对：</span><SmallNumber t={p.guessRightQuestions} /></span> : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {/* 言语理解特有 */}
                  {key === "speech" && d.speech && (
                    <>
                      {d.speech.articleTypes?.length ? (
                        <>
                          <div className="cmp-sub-group">
                            <span className="cmp-sub-label">文章类型错误</span>
                            <div className="cmp-chip-wrap">
                              {d.speech.articleTypes.map((a, idx) => (
                                <div key={idx} className="cmp-chip">
                                  {ARTICLE_TYPE_MAP[a.type] || "未知"}
                                  <span className="cmp-chip-num-red">{a.errorCount}</span>
                                  {a.skill?.trim() ? <><span className="cmp-chip-unit">{a.skill}</span></> : null}
                                </div>
                              ))}
                            </div>
                          </div></>
                      ) : null}
                      {SPEECH_ERROR_KEYS.some((k) => (d.speech.errorTypes?.[k.key] || 0) > 0) ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">错误选项</span>
                          <div className="cmp-chip-wrap">
                            {SPEECH_ERROR_KEYS.filter((k) => (d.speech?.errorTypes?.[k.key] || 0) > 0).map((k) => (
                              <div key={k.key} className="cmp-chip">
                                {k.label}
                                <span className="cmp-chip-num-red">{d.speech?.errorTypes?.[k.key] || 0}</span>
                                <span className="cmp-chip-unit">次</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {d.speech.wordPairs?.filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean)).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">词组对比</span>
                          <div className="cmp-chip-wrap">
                            {d.speech.wordPairs
                              .filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean))
                              .map((wp, idx) => (
                                <div key={idx} className="cmp-chip">
                                  {[wp.signalWord, wp.selectedWord, wp.compareWord].filter(Boolean).join(" / ")}
                                  <span className="cmp-chip-num-red">{wp.note}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                      {d.speech.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">题目类型与技巧</span>
                          <div className="cmp-chip-wrap">
                            {d.speech.questionTypeSkills
                              .filter((qt) => qt.skill?.trim())
                              .map((qt, idx) => (
                                <div key={idx} className="cmp-chip">
                                  {QUESTION_TYPE_MAP[qt.questionType] || qt.questionType}

                                  <span className="cmp-chip-unit">{qt.skill}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 逻辑判断特有 */}
                  {key === "logic" && d.logic && (
                    <>
                      {LOGIC_ERROR_KEYS.some((k) => (d.logic.errorTypes[k.key as keyof typeof d.logic.errorTypes] || 0) > 0) ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">错因</span>
                          <div className="cmp-chip-wrap">
                            {LOGIC_ERROR_KEYS.filter((k) => (d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0) > 0).map((k) => (
                              <div key={k.key} className="cmp-chip">
                                {k.key}({k.label})
                                <span className="cmp-chip-num-red">{d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {d.logic?.hardestQuestions ? <div className="cmp-sub-group"><span >🎯 最难追及：</span>{d.logic.hardestQuestions}</div> : null}
                      {d.logic?.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">题目类型与技巧</span>
                          <div className="cmp-chip-wrap">
                            {d.logic.questionTypeSkills
                              .filter((qt) => qt.skill?.trim())
                              .map((qt, idx) => (
                                <div key={idx} className="cmp-chip">
                                  {QUESTION_TYPE_MAP[qt.questionType] || qt.questionType}

                                  <span className="cmp-chip-unit">{qt.skill}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 图推特有 */}
                  {key === "figure" && d.figure && (
                    <>
                      {d.figure?.newPatterns?.filter((p) => p.value?.trim()).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">新规律</span>
                          <div className="cmp-chip-wrap">
                            {d.figure.newPatterns
                              .filter((p) => p.value?.trim())
                              .map((p, idx) => (
                                <div key={idx} className="cmp-chip cmp-chip-green">
                                  <span className="cmp-badge cmp-badge-new">新</span>
                                  {p.value}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                      {d.figure?.errorPatterns?.filter((p) => p.value?.trim()).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">错误规律</span>
                          <div className="cmp-chip-wrap">
                            {d.figure.errorPatterns
                              .filter((p) => p.value?.trim())
                              .map((p, idx) => (
                                <div key={idx} className="cmp-chip cmp-chip-red-pattern">
                                  <span className="cmp-badge cmp-badge-err">错</span>
                                  {p.value}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 资料分析特有 */}
                  {key === "calc" && d.calc && (
                    <>
                      <div className="cmp-sub-group">
                        <span className="cmp-sub-label">错误类型</span>
                        <div className="cmp-chip-wrap">
                          {d.calc.errorTypes
                            .filter((e) => e.type?.trim())
                            .map((e, idx) => (
                              <div key={idx} className="cmp-chip">
                                {e.type}
                                <span className="cmp-chip-num-red">{e.errorCount}</span>

                                <span className="cmp-chip-unit">题</span>
                                {e.skill?.trim() ? <><span className="cmp-chip-unit">{e.skill}</span></> : null}
                              </div>
                            ))}
                        </div>
                      </div>

                      {d.calc.optimizations?.filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">计算优化</span>
                          <div className="cmp-chip-wrap">
                            {d.calc.optimizations
                              .filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps)
                              .map((o, idx) => (
                                <div key={idx} className="cmp-chip">
                                  题{o.questionNum || "?"}

                                  <span className="cmp-chip-unit">{o.originalSteps || "?"}→{o.optimizedSteps || "?"}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 数量关系特有 */}
                  {key === "number" && d.number && (
                    <>
                      {d.number?.errorTypes?.filter((e) => e.type?.trim()).length ? (
                        <div className="cmp-sub-group">
                          <span className="cmp-sub-label">错因</span>
                          <div className="cmp-chip-wrap">
                            {d.number.errorTypes
                              .filter((e) => e.type?.trim())
                              .map((e, idx) => (
                                <div key={idx} className="cmp-chip">
                                  {e.type}
                                  <span className="cmp-chip-num-red">{e.errorCount}</span>
                                  {e.skill?.trim() ? <><span className="cmp-chip-unit">{e.skill}</span></> : null}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </>
              )}
            </ModuleCard>
          );
        })}
      </div>
    );
  };

  // ===== 汇总视图 =====
  const renderSummary = () => {
    const allData = getAllDayData();
    const [pairSort, setPairSort] = React.useState<"time" | "count">("time");
    // 词对：按selectedWord去重统计次数
    const pairMap: Record<string, { pair: string; note: string; selectedWord: string; dates: string[]; errorCount: number; }> = {};
    // 申论漏抄词：按词语去重统计次数
    const missWordMap: Record<string, { word: string; count: number; }> = {};
    const allOptimizations: { date: string; content: string; }[] = [];
    const allSkills: { date: string; content: string; }[] = [];
    // 图推规律：去重统计
    const allFigurePatterns: Record<string, { type: string; count: number; }> = {};

    allData.forEach((d) => {
      // 词对
      d.speech?.wordPairs?.forEach((wp) => {
        const key = [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].filter(Boolean).join("|");
        if (!key) return;
        if (!pairMap[key])
          pairMap[key] = {
            pair: [wp.signalWord, wp.selectedWord, wp.compareWord].filter(Boolean).join("/"),
            note: wp.note || "",
            selectedWord: wp.selectedWord || "",
            dates: [],
            errorCount: 0,
          };
        pairMap[key].dates.push(d.date);
        if (wp.selectedWord) pairMap[key].errorCount++;
      });
      // 漏抄词：split后统计
      d.essay?.papers?.forEach((p) => {
        if (p.missKeywords) {
          p.missKeywords.split(/[,，]/).forEach((w) => {
            const t = w.trim();
            if (t) {
              if (!missWordMap[t]) missWordMap[t] = { word: t, count: 0 };
              missWordMap[t].count++;
            }
          });
        }
      });
      // 优化
      d.calc?.optimizations?.forEach((o) => {
        if (o.questionNum || o.originalSteps || o.optimizedSteps) {
          allOptimizations.push({ date: d.date, content: `题${o.questionNum || "?"}:${o.originalSteps || "?"}→${o.optimizedSteps || "?"}` });
        }
      });
      // 数量技巧
      d.number?.errorTypes?.forEach((e) => {
        if (e.skill?.trim()) allSkills.push({ date: d.date, content: `${e.type || "未知"}: ${e.skill}` });
      });
      // 图推规律
      [...(d.figure?.newPatterns || []), ...(d.figure?.errorPatterns || [])].forEach((p) => {
        if (p.value?.trim()) {
          if (!allFigurePatterns[p.value])
            allFigurePatterns[p.value] = { type: d.figure?.newPatterns?.some((x) => x.value === p.value) ? "新规律" : "错误规律", count: 0 };
          allFigurePatterns[p.value].count++;
        }
      });
    });

    // 词对排序
    const pairList = Object.values(pairMap);
    if (pairSort === "count") {
      pairList.sort((a, b) => b.errorCount - a.errorCount || b.dates.length - a.dates.length);
    } else {
      pairList.sort((a, b) => b.dates[0]?.localeCompare(a.dates[0] || "") || 0);
    }

    // 题目类型与技巧汇总
    const qtSkillMap: Record<string, { questionType: string; skills: string[]; dates: string[]; }> = {};
    allData.forEach((d) => {
      d.speech?.questionTypeSkills?.forEach((qt) => {
        if (!qt.skill?.trim()) return;
        const key = `${qt.questionType}_${qt.skill.trim()}`;
        if (!qtSkillMap[key]) {
          qtSkillMap[key] = { questionType: qt.questionType, skills: [], dates: [] };
        }
        qtSkillMap[key].skills.push(qt.skill.trim());
        qtSkillMap[key].dates.push(d.date);
      });
    });
    // const qtSkillList = Object.values(qtSkillMap).sort((a, b) => b.dates.length - a.dates.length);

    // 题目类型聚合：按类型分组，收集所有技巧
    const qtGrouped: Record<string, { skills: Set<string>; dates: Set<string>; }> = {};
    allData.forEach((d) => {
      d.speech?.questionTypeSkills?.forEach((qt) => {
        if (!qt.skill?.trim()) return;
        if (!qtGrouped[qt.questionType]) {
          qtGrouped[qt.questionType] = { skills: new Set(), dates: new Set() };
        }
        qtGrouped[qt.questionType].skills.add(qt.skill.trim());
        qtGrouped[qt.questionType].dates.add(d.date);
      });
    });
    const qtGroupedList = Object.entries(qtGrouped)
      .map(([type, v]) => ({
        questionType: type,
        skills: Array.from(v.skills),
        dayCount: v.dates.size,
      }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // 言语文章类型技巧聚合
    const articleSkillGrouped: Record<string, { skills: Set<string>; dates: Set<string>; }> = {};
    allData.forEach((d) => {
      d.speech?.articleTypes?.forEach((a) => {
        if (!a.skill?.trim()) return;
        const name = ARTICLE_TYPE_MAP[a.type] || "未知";
        if (!articleSkillGrouped[name]) articleSkillGrouped[name] = { skills: new Set(), dates: new Set() };
        articleSkillGrouped[name].skills.add(a.skill.trim());
        articleSkillGrouped[name].dates.add(d.date);
      });
    });
    const articleSkillList = Object.entries(articleSkillGrouped)
      .map(([type, v]) => ({ type, skills: Array.from(v.skills), dayCount: v.dates.size }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // 判断技巧聚合
    const logicSkillGrouped: Record<string, { skills: Set<string>; dates: Set<string>; }> = {};
    allData.forEach((d) => {
      d.logic?.questionTypeSkills?.forEach((qt) => {
        if (!qt.skill?.trim()) return;
        if (!logicSkillGrouped[qt.questionType]) logicSkillGrouped[qt.questionType] = { skills: new Set(), dates: new Set() };
        logicSkillGrouped[qt.questionType].skills.add(qt.skill.trim());
        logicSkillGrouped[qt.questionType].dates.add(d.date);
      });
    });
    const logicSkillList = Object.entries(logicSkillGrouped)
      .map(([type, v]) => ({ questionType: type, skills: Array.from(v.skills), dayCount: v.dates.size }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // 资料分析技巧聚合
    const calcSkillGrouped: Record<string, { skills: Set<string>; dates: Set<string>; }> = {};
    allData.forEach((d) => {
      d.calc?.errorTypes?.forEach((e) => {
        if (!e.skill?.trim()) return;
        const name = e.type || "未知";
        if (!calcSkillGrouped[name]) calcSkillGrouped[name] = { skills: new Set(), dates: new Set() };
        calcSkillGrouped[name].skills.add(e.skill.trim());
        calcSkillGrouped[name].dates.add(d.date);
      });
    });
    const calcSkillList = Object.entries(calcSkillGrouped)
      .map(([type, v]) => ({ type, skills: Array.from(v.skills), dayCount: v.dates.size }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // 数量关系技巧聚合
    const numSkillGrouped: Record<string, { skills: Set<string>; dates: Set<string>; }> = {};
    allData.forEach((d) => {
      d.number?.errorTypes?.forEach((e) => {
        if (!e.skill?.trim()) return;
        const name = e.type || "未知";
        if (!numSkillGrouped[name]) numSkillGrouped[name] = { skills: new Set(), dates: new Set() };
        numSkillGrouped[name].skills.add(e.skill.trim());
        numSkillGrouped[name].dates.add(d.date);
      });
    });
    const numSkillList = Object.entries(numSkillGrouped)
      .map(([type, v]) => ({ type, skills: Array.from(v.skills), dayCount: v.dates.size }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // const totalReg = pairList.reduce((s, p) => s + p.dates.length, 0);
    // const totalErr = pairList.reduce((s, p) => s + p.errorCount, 0);

    // 漏抄词按次数排序
    const missWordList = Object.values(missWordMap).sort((a, b) => b.count - a.count);

    return (
      <div>
        <ModuleCard
          title="🔤 词对分析"
          collapsible
          headerExtra={
            <Button
              size="small"
              type={pairSort === "count" ? "primary" : "default"}
              onClick={() => setPairSort(pairSort === "time" ? "count" : "time")}
            >
              {pairSort === "count" ? "按数量排序" : "按时间排序"}
            </Button>
          }
        >
          {pairList.map((p, i) => {
            // selectedWord相同的累计总次数（跨所有词对、所有天）
            const swCount = p.selectedWord ? pairList.filter((x) => x.selectedWord === p.selectedWord).reduce((s, x) => s + x.dates.length, 0) : 0;
            return (
              <div className="summary-row" key={i}>
                <span>
                  {formatDate(p.dates[0])}
                  {/* {p.dates.length > 1 && (
                    <Tag color="blue" style={{ marginLeft: 6 }}>
                      +{p.dates.length - 1}天
                    </Tag>
                  )} */}
                  <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center" }}>
                    {p.selectedWord ? (
                      <Badge count={swCount > 1 ? swCount : 0} size="small" offset={[4, -4]}>
                        <span style={{ padding: "0 4px" }}>{p.pair}</span>
                      </Badge>
                    ) : (
                      p.pair
                    )}
                    {p.note ? ` (${p.note})` : ""}
                  </span>
                </span>
                {/* <span>
                  <span className="stat-tag stat-tag-info">登{p.dates.length}</span>
                  {p.errorCount > 0 && <span className="stat-tag stat-tag-danger">错{p.errorCount}</span>}
                </span> */}
              </div>
            );
          })}
          {!pairList.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="📋 言语技巧" collapsible>
          {qtGroupedList.map((g, i) => (
            <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#1a2b4c" }}>
                  {QUESTION_TYPE_MAP[g.questionType] || g.questionType}
                </span>
                {/* <Tag color="blue">{g.dayCount}天</Tag> */}
                <Tag color="green">{g.skills.length}条技巧</Tag>
              </div>
              <div style={{ fontSize: 12, color: "#4a5b79", paddingLeft: 4 }}>
                {g.skills.map((s, i) => (
                  <Tag key={i} style={{ margin: "0 4px 4px 0" }}>
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
          {!qtGroupedList.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="📋 言语文章类型技巧" collapsible>
          {articleSkillList.map((g, i) => (
            <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#1a2b4c" }}>{g.type}</span>
                {/* <Tag color="blue">{g.dayCount}天</Tag> */}
                <Tag color="green">{g.skills.length}条技巧</Tag>
              </div>
              <div style={{ fontSize: 12, color: "#4a5b79", paddingLeft: 4 }}>
                {g.skills.map((s, i) => (
                  <Tag key={i} style={{ margin: "0 4px 4px 0" }}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
          {!articleSkillList.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="🧩 判断技巧" collapsible>
          {logicSkillList.map((g, i) => (
            <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#1a2b4c" }}>
                  {QUESTION_TYPE_MAP[g.questionType] || g.questionType}
                </span>
                {/* <Tag color="blue">{g.dayCount}天</Tag> */}
                <Tag color="green">{g.skills.length}条技巧</Tag>
              </div>
              <div style={{ fontSize: 12, color: "#4a5b79", paddingLeft: 4 }}>
                {g.skills.map((s, i) => (
                  <Tag key={i} style={{ margin: "0 4px 4px 0" }}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
          {!logicSkillList.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="📌 申论漏抄词" collapsible>
          {missWordList.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {missWordList.map((w, i) => (
                <Badge key={i} count={w.count > 1 ? w.count : 0} size="small" offset={[4, -4]}>
                  <Tag style={{ margin: 0 }}>{w.word}</Tag>
                </Badge>
              ))}
            </div>
          ) : (
            <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>
          )}
        </ModuleCard>
        <ModuleCard title="📊 资料分析" collapsible>
          {calcSkillList.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>技巧</div>
              {calcSkillList.map((g, i) => (
                <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "#1a2b4c" }}>{g.type}</span>
                    <Tag color="green">{g.skills.length}条技巧</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: "#4a5b79", paddingLeft: 4 }}>
                    {g.skills.map((s, i) => (
                      <Tag key={i} style={{ margin: "0 4px 4px 0" }}>{s}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {allOptimizations.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#4a5b79" }}>计算优化</div>
              {allOptimizations.map((o, i) => (
                <div className="summary-row" key={i}>
                  <span>{formatDate(o.date)}</span>
                  <span>{o.content}</span>
                </div>
              ))}
            </div>
          )}
          {!calcSkillList.length && !allOptimizations.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="💡 数量关系技巧" collapsible>
          {numSkillList.map((g, i) => (
            <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#1a2b4c" }}>{g.type}</span>
                <Tag color="green">{g.skills.length}条技巧</Tag>
              </div>
              <div style={{ fontSize: 12, color: "#4a5b79", paddingLeft: 4 }}>
                {g.skills.map((s, i) => (
                  <Tag key={i} style={{ margin: "0 4px 4px 0" }}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
          {!numSkillList.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
        <ModuleCard title="🎨 图推规律" collapsible>
          {Object.entries(allFigurePatterns)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([k, v], i) => (
              <div className="summary-row" key={i}>
                <Badge count={v.count > 1 ? v.count : 0} size="small" offset={[4, -4]}>
                  <span>
                    [{v.type}] {k}
                  </span>
                </Badge>
              </div>
            ))}
          {!Object.keys(allFigurePatterns).length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </ModuleCard>
      </div>
    );
  };

  // ===== 模块对比视图 =====
  const renderCompare = (externalData?: DayData[]) => {
    const allData = externalData || getAllDayData();
    // 仅改 Rate / Err / Time 三个数字样式（字号、字重、颜色），不改变任何文字结构

    const renderDayDetail = (d: DayData, moduleKey: string): React.ReactNode => {
      const detailStyle = "cmp-detail";
      const labelStyle = "cmp-label";
      const detailFlexStyle = "cmp-detail-flex";
      if (moduleKey === "speech") {
        const papers = d.speech?.papers || [];
        if (!papers.length && !d.speech?.articleTypes?.length && !d.speech?.wordPairs?.length && !d.speech?.questionTypeSkills?.length) return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const totalErr = (p.fillErrorCount || 0) + (p.centerErrorCount || 0);
              const rate = p.totalQuestions > 0 ? Math.round(((p.totalQuestions - totalErr) / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="cmp-p-section">
                  <div className="cmp-paper-title">
                    套卷{i + 1} {p.name || ""}
                  </div>
                  <div className={detailStyle}>
                    <span className={labelStyle}>正确率：</span><Rate r={rate} />
                    <span className="cmp-ml12"><span className={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                    {(p.fillErrorCount || p.centerErrorCount) ? (
                      <span className="cmp-ml12">
                        <span className={labelStyle}>选词填空错：</span><Err n={p.fillErrorCount || 0} />
                        <span className="cmp-ml8"><span className={labelStyle}>中心理解错：</span><Err n={p.centerErrorCount || 0} /></span>
                        <span className="cmp-ml8"><span className={labelStyle}>总错误：</span><Err n={totalErr} /></span>
                      </span>
                    ) : null}
                  </div>
                  {(p.centerCircleQuestions || p.fillErrorQuestions || p.centerErrorQuestions) ? (
                    <div className={detailFlexStyle}>
                      {p.centerCircleQuestions ? <span><span className={labelStyle}>⭕ 中心画圈：</span>{p.centerCircleQuestions}</span> : null}
                      {p.fillErrorQuestions ? <span><span className={labelStyle}>❌ 选词错题：</span>{p.fillErrorQuestions}</span> : null}
                      {p.centerErrorQuestions ? <span><span className={labelStyle}>❌ 中心错题：</span>{p.centerErrorQuestions}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {d.speech?.articleTypes?.length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">文章类型错误</span>
                <div className="cmp-chip-wrap">
                  {d.speech.articleTypes.map((a, idx) => (
                    <div key={idx} className="cmp-chip">
                      {ARTICLE_TYPE_MAP[a.type] || "未知"}
                      <span className="cmp-chip-num-red">{a.errorCount}</span>
                      {a.skill?.trim() ? <><span className="cmp-chip-unit">{a.skill}</span></> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {SPEECH_ERROR_KEYS.some((k) => (d.speech?.errorTypes?.[k.key] || 0) > 0) ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">错误选项</span>
                <div className="cmp-chip-wrap">
                  {SPEECH_ERROR_KEYS.filter((k) => (d.speech?.errorTypes?.[k.key] || 0) > 0).map((k) => (
                    <div key={k.key} className="cmp-chip">
                      {k.label}
                      <span className="cmp-chip-num-red">{d.speech?.errorTypes?.[k.key] || 0}</span>
                      <span className="cmp-chip-unit">次</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {d.speech?.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">题目类型与技巧</span>
                <div className="cmp-chip-wrap">
                  {d.speech.questionTypeSkills
                    .filter((qt) => qt.skill?.trim())
                    .map((qt, idx) => (
                      <div key={idx} className="cmp-chip">
                        {QUESTION_TYPE_MAP[qt.questionType] || qt.questionType}

                        <span className="cmp-chip-unit">{qt.skill}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "logic") {
        const papers = d.logic?.papers || [];
        if (!papers.length && !d.logic) return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="cmp-p-section">
                  <div className="cmp-paper-title">
                    套卷{i + 1} {p.name || ""}
                  </div>
                  <div className={detailStyle}>
                    <span className={labelStyle}>正确率：</span><Rate r={rate} />
                    <span className="cmp-ml12"><span className={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>错误个数：</span><Err n={p.errorCount} /></span>
                  </div>
                  {(p.circleQuestions || p.wrongQuestions || p.starQuestions) ? (
                    <div className={detailFlexStyle}>
                      {p.circleQuestions ? <span><span className={labelStyle}>⭕ 画圈：</span>{p.circleQuestions}</span> : null}
                      {p.wrongQuestions ? <span><span className={labelStyle}>❌ 错题：</span>{p.wrongQuestions}</span> : null}
                      {p.starQuestions ? <span><span className={labelStyle}>★ 两次错：</span>{p.starQuestions}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {LOGIC_ERROR_KEYS.some((k) => (d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0) > 0) ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">错因</span>
                <div className="cmp-chip-wrap">
                  {LOGIC_ERROR_KEYS.filter((k) => (d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0) > 0).map((k) => (
                    <div key={k.key} className="cmp-chip">
                      {k.key}({k.label})
                      <span className="cmp-chip-num-red">{d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {d.logic?.hardestQuestions ? <div className="cmp-sub-group"><span className={labelStyle}>🎯 最难追及：</span>{d.logic.hardestQuestions}</div> : null}
            {d.logic?.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">题目类型与技巧</span>
                <div className="cmp-chip-wrap">
                  {d.logic.questionTypeSkills
                    .filter((qt) => qt.skill?.trim())
                    .map((qt, idx) => (
                      <div key={idx} className="cmp-chip">
                        {QUESTION_TYPE_MAP[qt.questionType] || qt.questionType}

                        <span className="cmp-chip-unit">{qt.skill}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "figure") {
        const papers = d.figure?.papers || [];
        if (!papers.length && !d.figure?.newPatterns?.length && !d.figure?.errorPatterns?.length)
          return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="cmp-p-section">
                  <div className="cmp-paper-title">
                    套卷{i + 1} {p.name || ""}
                  </div>
                  <div className={detailStyle}>
                    <span className={labelStyle}>正确率：</span><Rate r={rate} />
                    <span className="cmp-ml12"><span className={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>错误个数：</span><Err n={p.errorCount} /></span>
                  </div>
                  {(p.circleQuestions || p.wrongQuestions || p.starQuestions) ? (
                    <div className={detailFlexStyle}>
                      {p.circleQuestions ? <span><span className={labelStyle}>⭕ 画圈：</span>{p.circleQuestions}</span> : null}
                      {p.wrongQuestions ? <span><span className={labelStyle}>❌ 错题：</span>{p.wrongQuestions}</span> : null}
                      {p.starQuestions ? <span><span className={labelStyle}>★ 两次错：</span>{p.starQuestions}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {d.figure?.newPatterns?.filter((p) => p.value?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">新规律</span>
                <div className="cmp-chip-wrap">
                  {d.figure.newPatterns
                    .filter((p) => p.value?.trim())
                    .map((p, idx) => (
                      <div key={idx} className="cmp-chip cmp-chip-green">
                        <span className="cmp-badge cmp-badge-new">新</span>
                        {p.value}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
            {d.figure?.errorPatterns?.filter((p) => p.value?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">错误规律</span>
                <div className="cmp-chip-wrap">
                  {d.figure.errorPatterns
                    .filter((p) => p.value?.trim())
                    .map((p, idx) => (
                      <div key={idx} className="cmp-chip cmp-chip-red-pattern">
                        <span className="cmp-badge cmp-badge-err">错</span>
                        {p.value}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "calc") {
        const papers = d.calc?.papers || [];
        if (!papers.length && !d.calc?.errorTypes?.length && !d.calc?.optimizations?.length) return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="cmp-p-section">
                  <div className="cmp-paper-title">
                    套卷{i + 1} {p.name || ""}
                  </div>
                  <div className={detailStyle}>
                    <span className={labelStyle}>正确率：</span><Rate r={rate} />
                    <span className="cmp-ml12"><span className={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>错误个数：</span><Err n={p.errorCount} /></span>
                  </div>
                  {(p.circleQuestions || p.wrongQuestions) ? (
                    <div className={detailFlexStyle}>
                      {p.circleQuestions ? <span><span className={labelStyle}>⭕ 画圈：</span>{p.circleQuestions}</span> : null}
                      {p.wrongQuestions ? <span><span className={labelStyle}>❌ 错题：</span>{p.wrongQuestions}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {d.calc?.errorTypes?.filter((e) => e.type?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">错误类型</span>
                <div className="cmp-chip-wrap">
                  {d.calc.errorTypes
                    .filter((e) => e.type?.trim())
                    .map((e, idx) => (
                      <div key={idx} className="cmp-chip">
                        {e.type}
                        <span className="cmp-chip-num-red">{e.errorCount}</span>

                        <span className="cmp-chip-unit">题</span>
                        {e.skill?.trim() ? <><span className="cmp-chip-unit">{e.skill}</span></> : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
            {d.calc?.optimizations?.filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">计算优化</span>
                <div className="cmp-chip-wrap">
                  {d.calc.optimizations
                    .filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps)
                    .map((o, idx) => (
                      <div key={idx} className="cmp-chip">
                        题{o.questionNum || "?"}

                        <span className="cmp-chip-unit">{o.originalSteps || "?"}→{o.optimizedSteps || "?"}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "number") {
        const papers = d.number?.papers || [];
        if (!papers.length && !d.number?.errorTypes?.length) return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="cmp-p-section">
                  <div className="cmp-paper-title">
                    套卷{i + 1} {p.name || ""}
                  </div>
                  <div className={detailStyle}>
                    <span className={labelStyle}>正确率：</span><Rate r={rate} />
                    <span className="cmp-ml12"><span className={labelStyle}>用时：</span><Time t={p.timeUsed} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>总题数：</span><Number t={p.totalQuestions} /></span>
                    <span className="cmp-ml12"><span className={labelStyle}>错误个数：</span><Err n={p.errorCount} /></span>
                  </div>
                  {(p.circleQuestions || p.guessRightQuestions || p.wrongQuestions || p.starQuestions) ? (
                    <div className={detailFlexStyle}>
                      {p.circleQuestions ? <span><span className={labelStyle}>⭕ 画圈：</span>{p.circleQuestions}</span> : null}
                      {p.guessRightQuestions ? <span><span className={labelStyle}>蒙对：</span>{p.guessRightQuestions}</span> : null}
                      {p.wrongQuestions ? <span><span className={labelStyle}>❌ 错题：</span>{p.wrongQuestions}</span> : null}
                      {p.starQuestions ? <span><span className={labelStyle}>★ 两次错：</span>{p.starQuestions}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {d.number?.errorTypes?.filter((e) => e.type?.trim()).length ? (
              <div className="cmp-sub-group">
                <span className="cmp-sub-label">错因</span>
                <div className="cmp-chip-wrap">
                  {d.number.errorTypes
                    .filter((e) => e.type?.trim())
                    .map((e, idx) => (
                      <div key={idx} className="cmp-chip">
                        {e.type}
                        <span className="cmp-chip-num-red">{e.errorCount}</span>
                        {e.skill?.trim() ? <><span className="cmp-chip-unit">{e.skill}</span></> : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "essay") {
        const papers = d.essay?.papers || [];
        if (!papers.length) return <span className="cmp-empty">(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => (
              <div key={i} className="cmp-p-section">
                <div className="cmp-paper-title">
                  套卷{i + 1} {p.name || ""}
                </div>
                <div className={detailStyle}>
                  {p.isOverTime ? <span className="cmp-essay-ok">未超时</span> : p.overTime ? (
                    <span>
                      <span className={labelStyle}>超时</span>
                      <span className="cmp-essay-over">{p.overTime}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", marginLeft: 2 }}>min</span>
                    </span>
                  ) : null}
                  {p.scoreKeywords ? (
                    <span className="cmp-ml12">
                      <span className={labelStyle}>得分词：</span>
                      <span className="cmp-essay-score">{p.scoreKeywords}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", marginLeft: 2 }}>个</span>
                    </span>
                  ) : null}
                  {p.missKeywordsCount ? (
                    <span className="cmp-ml12">
                      <span className={labelStyle}>漏抄：</span>
                      <span className="cmp-essay-miss">{p.missKeywordsCount}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", marginLeft: 2 }}>个</span>
                    </span>
                  ) : null}
                </div>
                {p.missKeywords ? <div className={detailStyle}><span className={labelStyle}>漏抄词：</span>{p.missKeywords}</div> : null}
              </div>
            ))}
          </>
        );
      }
      if (moduleKey === "wordpair") {
        const wps = d.speech?.wordPairs?.filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean)) || [];
        if (!wps.length) return <span className="cmp-empty">(无记录)</span>;
        return (
          <div style={{ paddingLeft: 16 }}>
            {wps.map((wp, idx) => (
              <div key={idx} className="hist-line">
                {[wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].filter(Boolean).join(" / ")}
              </div>
            ))}
          </div>
        );
      }
      return null;
    };

    const renderModuleCard = (title: string, moduleKey: string, renderAgg: () => React.ReactNode) => (
      <ModuleCard key={moduleKey} title={title} collapsible>
        {renderAgg()}
        <Divider style={{ margin: "8px 0" }} />
        {allData.map((d) => (
          <div key={d.date}>
            <div className="cmp-date">{formatDate(d.date)}</div>
            {renderDayDetail(d, moduleKey)}
          </div>
        ))}
      </ModuleCard>
    );

    return (
      <div>
        {renderModuleCard("🧠 言语理解", "speech", () => {
          const articleAgg: Record<string, number> = {};
          const errorAgg: Record<string, number> = {};
          const qtAgg: Record<string, number> = {};
          allData.forEach((d) => {
            d.speech?.articleTypes?.forEach((a) => {
              const name = ARTICLE_TYPE_MAP[a.type] || "未知";
              articleAgg[name] = (articleAgg[name] || 0) + a.errorCount;
            });
            SPEECH_ERROR_KEYS.forEach((k) => {
              const v = d.speech?.errorTypes?.[k.key] || 0;
              if (v) errorAgg[k.label] = (errorAgg[k.label] || 0) + v;
            });
            d.speech?.questionTypeSkills?.forEach((qt) => {
              const name = QUESTION_TYPE_MAP[qt.questionType] || qt.questionType;
              qtAgg[name] = (qtAgg[name] || 0) + 1;
            });
          });
          return (
            <>
              <div className="cmp-chip-card">
                <div className="cmp-chip-header">
                  <span className="cmp-chip-title">📝 文章类型</span>
                  {/* <span className="cmp-chip-tag cmp-chip-tag-gray">错误分布</span> */}
                </div>
                <div className="cmp-chip-wrap">
                  {Object.entries(articleAgg).length ? Object.entries(articleAgg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="cmp-chip">
                        {k}<span className="cmp-chip-num-blue">{v}</span>
                      </div>
                    )) : <span className="cmp-chip-empty">无</span>}
                </div>
              </div>
              <div className="cmp-chip-card">
                <div className="cmp-chip-header">
                  <span className="cmp-chip-title">❌ 错误选项</span>
                </div>
                <div className="cmp-chip-wrap">
                  {Object.entries(errorAgg).length ? Object.entries(errorAgg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="cmp-chip">
                        {k}<span className="cmp-chip-num-red">{v}</span>
                        <span className="cmp-chip-unit">次</span>
                      </div>
                    )) : <span className="cmp-chip-empty">无</span>}
                </div>
              </div>
              <div className="cmp-chip-card">
                <div className="cmp-chip-header">
                  <span className="cmp-chip-title">📚 题目类型</span>
                </div>
                <div className="cmp-chip-wrap">
                  {Object.entries(qtAgg).length ? Object.entries(qtAgg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="cmp-chip">
                        {k}<span className="cmp-chip-num-blue">{v}</span>
                      </div>
                    )) : <span className="cmp-chip-empty">无</span>}
                </div>
              </div>
            </>
          );
        })}

        {renderModuleCard("🔤 词组对比", "wordpair", () => {
          const pairMap: Record<string, { selectedWord: string; count: number; }> = {};
          allData.forEach((d) => {
            d.speech?.wordPairs?.forEach((wp) => {
              if (wp.selectedWord) {
                if (!pairMap[wp.selectedWord]) pairMap[wp.selectedWord] = { selectedWord: wp.selectedWord, count: 0 };
                pairMap[wp.selectedWord].count++;
              }
            });
          });
          const list = Object.values(pairMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          return (
            <div className="cmp-chip-card">
              <div className="cmp-chip-header">
                <span className="cmp-chip-title">🔤 高频选词</span>
                <span className="cmp-chip-tag cmp-chip-tag-gray">TOP 10</span>
              </div>
              <div className="cmp-chip-wrap">
                {list.length ? list.map((x) => (
                  <div key={x.selectedWord} className="cmp-chip">
                    {x.selectedWord}<span className="cmp-chip-num-blue">{x.count}</span>

                    <span className="cmp-chip-unit">次</span>
                  </div>
                )) : <span className="cmp-chip-empty">无</span>}
              </div>
            </div>
          );
        })}

        {renderModuleCard("🧩 逻辑判断", "logic", () => {
          const agg: Record<string, number> = {};
          const qtAgg: Record<string, number> = {};
          allData.forEach((d) => {
            LOGIC_ERROR_KEYS.forEach((k) => {
              const v = d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0;
              if (v) agg[k.label] = (agg[k.label] || 0) + v;
            });
            d.logic?.questionTypeSkills?.forEach((qt) => {
              const name = QUESTION_TYPE_MAP[qt.questionType] || qt.questionType;
              qtAgg[name] = (qtAgg[name] || 0) + 1;
            });
          });
          const total = Object.values(agg).reduce((s, v) => s + v, 0);
          return (
            <>
              <div className="cmp-chip-card">
                <div className="cmp-chip-header">
                  <span className="cmp-chip-title">⚠️ 错因</span>
                  <span className="cmp-chip-tag cmp-chip-tag-red">总计 {total}</span>
                </div>
                <div className="cmp-chip-wrap">
                  {Object.entries(agg).length ? Object.entries(agg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="cmp-chip">
                        {k}<span className="cmp-chip-num-red">{v}</span>
                      </div>
                    )) : <span className="cmp-chip-empty">无</span>}
                </div>
              </div>
              <div className="cmp-chip-card">
                <div className="cmp-chip-header">
                  <span className="cmp-chip-title">📚 题目类型</span>
                </div>
                <div className="cmp-chip-wrap">
                  {Object.entries(qtAgg).length ? Object.entries(qtAgg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="cmp-chip">
                        {k}<span className="cmp-chip-num-blue">{v}</span>
                      </div>
                    )) : <span className="cmp-chip-empty">无</span>}
                </div>
              </div>
            </>
          );
        })}

        {renderModuleCard("🎨 图推", "figure", () => {
          const agg: Record<string, { type: string; count: number; }> = {};
          allData.forEach((d) => {
            [...(d.figure?.newPatterns || []), ...(d.figure?.errorPatterns || [])].forEach((p) => {
              if (p.value?.trim()) {
                if (!agg[p.value]) agg[p.value] = { type: d.figure?.newPatterns?.some((x) => x.value === p.value) ? "新规律" : "错误规律", count: 0 };
                agg[p.value].count++;
              }
            });
          });
          return (
            <div className="cmp-chip-card">
              <div className="cmp-chip-header">
                <span className="cmp-chip-title">🎨 规律</span>
                <span className="cmp-chip-tag cmp-chip-tag-purple">TOP 5</span>
              </div>
              <div className="cmp-chip-wrap">
                {Object.entries(agg).length ? Object.entries(agg)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 5)
                  .map(([k, v]) => {
                    const isNew = v.type === "新规律";
                    return (
                      <div key={k} className={`cmp-chip ${isNew ? "cmp-chip-green" : "cmp-chip-red-pattern"}`}>
                        <span className={`cmp-badge ${isNew ? "cmp-badge-new" : "cmp-badge-err"}`}>{v.type}</span>
                        {k}<span className={isNew ? "cmp-chip-num-green" : "cmp-chip-num-red"}>{v.count}</span>
                      </div>
                    );
                  }) : <span className="cmp-chip-empty">无</span>}
              </div>
            </div>
          );
        })}

        {renderModuleCard("📊 资料分析", "calc", () => {
          const agg: Record<string, number> = {};
          allData.forEach((d) => {
            d.calc?.errorTypes?.forEach((e) => {
              if (e.type) agg[e.type] = (agg[e.type] || 0) + e.errorCount;
            });
          });
          return (
            <div className="cmp-chip-card">
              <div className="cmp-chip-header">
                <span className="cmp-chip-title">错误类型</span>
              </div>
              <div className="cmp-chip-wrap">
                {Object.entries(agg).length ? Object.entries(agg)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => (
                    <div key={k} className="cmp-chip">
                      {k}<span className="cmp-chip-num-red">{v}</span>

                      <span className="cmp-chip-unit">题</span>
                    </div>
                  )) : <span className="cmp-chip-empty">无</span>}
              </div>
            </div>
          );
        })}

        {renderModuleCard("🔢 数量关系", "number", () => {
          const agg: Record<string, number> = {};
          allData.forEach((d) => {
            d.number?.errorTypes?.forEach((e) => {
              if (e.type) agg[e.type] = (agg[e.type] || 0) + e.errorCount;
            });
          });
          return (
            <div className="cmp-chip-card">
              <div className="cmp-chip-header">
                <span className="cmp-chip-title">⚠️ 错因</span>
              </div>
              <div className="cmp-chip-wrap">
                {Object.entries(agg).length ? Object.entries(agg)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => (
                    <div key={k} className="cmp-chip">
                      {k}<span className="cmp-chip-num-red">{v}</span>
                    </div>
                  )) : <span className="cmp-chip-empty">无</span>}
              </div>
            </div>
          );
        })}

        {renderModuleCard("📝 申论对策", "essay", () => {
          const wordCount: Record<string, number> = {};
          allData.forEach((d) => {
            d.essay?.papers?.forEach((p) => {
              if (p.missKeywords) {
                p.missKeywords.split(/[,，]/).forEach((w) => {
                  const t = w.trim();
                  if (t) wordCount[t] = (wordCount[t] || 0) + 1;
                });
              }
            });
          });
          const top10 = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
          return (
            <div className="cmp-chip-card">
              <div className="cmp-chip-header">
                <span className="cmp-chip-title">📝 漏抄词</span>
                <span className="cmp-chip-tag cmp-chip-tag-orange">TOP 10</span>
              </div>
              <div className="cmp-chip-wrap">
                {top10.length ? top10.map(([k, v]) => (
                  <div key={k} className="cmp-chip cmp-chip-orange">
                    {k}<span className="cmp-chip-num-orange">{v}</span>
                    <span className="cmp-chip-unit">次</span>
                  </div>
                )) : <span className="cmp-chip-empty">无</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tabItems = [
    {
      key: "input",
      label: "今日输入",
      children: (
        <div>
          <SpeechSection data={todayData.speech} onChange={updateSpeech} onSave={handleSave} />
          <WordPairSection wordPairs={todayData.speech.wordPairs || []} onChange={(wps) => updateSpeech({ ...todayData.speech, wordPairs: wps })} onSave={handleSave} />
          <LogicSection data={todayData.logic} onChange={updateLogic} onSave={handleSave} />
          <FigureSection data={todayData.figure} onChange={updateFigure} onSave={handleSave} />
          <CalcSection data={todayData.calc} onChange={updateCalc} onSave={handleSave} />
          <NumberSection data={todayData.number} onChange={updateNumber} onSave={handleSave} />
          <EssaySection data={todayData.essay} onChange={updateEssay} onSave={handleSave} />
          <div className="tip-bar" style={{ marginTop: 16, marginBottom: 16 }}>
            ⭕ 画圈 = 做题时"不太确定/二选一纠结"（含对/错）&nbsp;&nbsp;❌ 错题 = 答案直接选错
            <br />
            ★ (逻辑) = 同一道题"做题错+复盘重做又错" → 留周六深挖
            <br />★ (图推) = 新规律 → 留周六整理进"图推规律本"
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large">
              保存今日记录
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport} size="large">
              导出所有数据
            </Button>
            <Button icon={<FileTextOutlined />} onClick={handleExportJson} size="large">
              导出JSON
            </Button>
            <Button icon={<ImportOutlined />} onClick={handleImportJson} size="large">
              导入JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button icon={<DownloadOutlined />} onClick={handleDownload} size="large">
              下载TXT
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "history",
      label: "历史记录",
      children: (
        <div>
          <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#333" }}>选择日期：</span>
            <Select
              value={historyDate}
              onChange={setHistoryDate}
              style={{ width: 200 }}
              options={dates.map((d) => ({ value: d, label: d }))}
              placeholder="选择日期"
            />
          </div>
          {renderHistory()}
        </div>
      ),
    },
    { key: "summary", label: "汇总视图", children: renderSummary() },
    { key: "compare", label: "模块对比", children: renderCompare() },
  ];

  return (
    <div>
      <div className="app-header">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" style={{ color: "#fff" }} tabBarStyle={{ color: "#fff" }} />
      </div>
      <Modal
        title="导入数据预览"
        open={importVisible}
        onCancel={() => { setImportVisible(false); setImportData(null); }}
        footer={[
          <Button key="close" onClick={() => { setImportVisible(false); setImportData(null); }}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmImport}>
            确认导入
          </Button>,
        ]}
        width={900}
      >
        <div style={{ maxHeight: "60vh", overflow: "auto" }}>
          {importData ? renderCompare(Object.values(importData).sort((a, b) => a.date.localeCompare(b.date))) : null}
        </div>
      </Modal>
      <Modal
        title="导出数据预览"
        open={exportVisible}
        onCancel={() => setExportVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExportVisible(false)}>
            关闭
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载TXT
          </Button>,
        ]}
        width={700}
      >
        <div className="export-preview">{exportText}</div>
      </Modal>
    </div>
  );
};

export default App;
