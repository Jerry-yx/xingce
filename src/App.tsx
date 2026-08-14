import React, { useCallback, useMemo } from "react";
import { Tabs, Button, message, Select, Modal, Card, Tag, Divider, Badge } from "antd";
import { SaveOutlined, ExportOutlined, DownloadOutlined } from "@ant-design/icons";
import { useAppData } from "./hooks/useAppData";
import { SpeechSection } from "./components/modules/SpeechSection";
import { LogicSection } from "./components/modules/LogicSection";
import { FigureSection } from "./components/modules/FigureSection";
import { CalcSection } from "./components/modules/CalcSection";
import { NumberSection } from "./components/modules/NumberSection";
import { EssaySection } from "./components/modules/EssaySection";
import { WordPairSection } from "./components/modules/WordPairSection";
import { getAllDayData, loadDayData, formatDate } from "./utils/storage";
import { ARTICLE_TYPE_MAP, SPEECH_ERROR_KEYS, LOGIC_ERROR_KEYS, QUESTION_TYPE_MAP } from "./utils/constants";
import type { DayData, Paper, WordPair } from "./types";
import "./styles/app.css";

const App: React.FC = () => {
  const { todayData, updateTodayData, saveToday, getAllDates, activeTab, setActiveTab, todayStr } = useAppData();

  const dates = useMemo(() => getAllDates(), [getAllDates]);
  const [historyDate, setHistoryDate] = React.useState<string>(dates[0] || "");
  const [exportVisible, setExportVisible] = React.useState(false);
  const [exportText, setExportText] = React.useState("");

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
            text += `  套卷${i + 1}：正确率：${rate}% 用时：${p.timeUsed}min, 总题数：${p.totalQuestions}个 错误个数：${p.errorCount}个\n`;
            if (p.circleQuestions) text += `  画圈：${p.circleQuestions}\n`;
            if (p.wrongQuestions) text += `  错题：${p.wrongQuestions}\n`;
            if (p.starQuestions) text += `  ★：${p.starQuestions}\n`;
          });
        }
        if (key === "speech" && d.speech) {
          if (d.speech.articleTypes?.length) {
            const parts = d.speech.articleTypes
              .map((a: { type: number; errorCount: number }) => `${ARTICLE_TYPE_MAP[a.type] || "未知"}错误：${a.errorCount}个`)
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
                text += `    ${QUESTION_TYPE_MAP[qt.questionType] || "未知"}：${qt.skill}\n`;
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

  // ===== 历史记录视图 =====
  const historyData = historyDate ? loadDayData(historyDate) : null;
  const renderHistory = () => {
    if (!historyData) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>请选择日期</div>;
    const d = historyData;
    const HL = { rate: "#52c41a", err: "#ff4d4f", time: "#1890ff", key: "#8a99b0" } as const;
    const Rate = ({ r }: { r: number }) => <span style={{ color: HL.rate, fontWeight: 600 }}>{r}%</span>;
    const Err = ({ n }: { n: number }) => <span style={{ color: HL.err, fontWeight: 600 }}>{n}个</span>;
    const Time = ({ t }: { t: number }) => <span style={{ color: HL.time, fontWeight: 600 }}>{t}min</span>;

    const moduleConfigs: { key: keyof DayData; title: string }[] = [
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
          const hasData = papers.length > 0 || (key === "speech" && (d.speech.articleTypes?.length || d.speech.wordPairs?.length || d.speech.questionTypeSkills?.length));
          return (
            <Card key={key} title={title} style={{ marginBottom: 12, borderRadius: 12 }} size="small">
              {!hasData ? (
                <span style={{ color: "#bbb" }}>(无记录)</span>
              ) : (
                <>
                  {papers.map((p, i) => {
                    if (key === "speech") {
                      const totalErr = (p.fillErrorCount || 0) + (p.centerErrorCount || 0);
                      const rate = p.totalQuestions > 0 ? Math.round(((p.totalQuestions - totalErr) / p.totalQuestions) * 100) : 0;
                      return (
                        <div key={i} className="hist-line">
                          套卷{i + 1}：正确率：
                          <Rate r={rate} /> 用时：
                          <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个
                          {p.fillErrorCount ? (
                            <>
                              <br />
                              选词填空错：
                              <Err n={p.fillErrorCount} /> 中心理解错：
                              <Err n={p.centerErrorCount || 0} /> 总错误：
                              <Err n={totalErr} />
                            </>
                          ) : null}
                          {p.centerCircleQuestions ? (
                            <>
                              <br />⭕ 中心画圈：{p.centerCircleQuestions}
                            </>
                          ) : null}
                          {p.fillErrorQuestions ? (
                            <>
                              <br />❌ 选词错题：{p.fillErrorQuestions}
                            </>
                          ) : null}
                          {p.centerErrorQuestions ? (
                            <>
                              <br />❌ 中心错题：{p.centerErrorQuestions}
                            </>
                          ) : null}
                        </div>
                      );
                    }
                    if (key === "essay") {
                      return (
                        <div key={i} className="hist-line">
                          套卷{i + 1}：{p.isOverTime ? "未超时" : p.overTime ? `超时${p.overTime}min` : ""}
                          {p.scoreKeywords ? ` 得分词${p.scoreKeywords}个` : ""}
                          {p.missKeywordsCount ? ` 漏抄${p.missKeywordsCount}个` : ""}
                          {p.missKeywords ? (
                            <>
                              <br />
                              漏抄词：{p.missKeywords}
                            </>
                          ) : null}
                        </div>
                      );
                    }
                    const correct = p.totalQuestions - p.errorCount;
                    const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
                    return (
                      <div key={i} className="hist-line">
                        套卷{i + 1}：正确率：
                        <Rate r={rate} /> 用时：
                        <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个 错误个数：
                        <Err n={p.errorCount} />
                        {p.circleQuestions ? <>⭕ 画圈：{p.circleQuestions}</> : null}
                        {p.wrongQuestions ? (
                          <>
                            <br />❌ 错题：{p.wrongQuestions}
                          </>
                        ) : null}
                        {p.starQuestions ? (
                          <>
                            <br />
                            ★：{p.starQuestions}
                          </>
                        ) : null}
                        {key === "number" && p.guessRightQuestions ? (
                          <>
                            <br />
                            蒙对：{p.guessRightQuestions}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                  {/* 言语理解特有 */}
                  {key === "speech" && d.speech && (
                    <>
                      {d.speech.articleTypes?.length ? (
                        <div className="hist-line">
                          {d.speech.articleTypes.map((a, idx) => (
                            <span key={idx} style={{ marginRight: 12 }}>
                              {ARTICLE_TYPE_MAP[a.type] || "未知"}错误：
                              <Err n={a.errorCount} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {SPEECH_ERROR_KEYS.some((k) => (d.speech.errorTypes?.[k.key] || 0) > 0) ? (
                        <div className="hist-line">
                          {SPEECH_ERROR_KEYS.filter((k) => (d.speech.errorTypes?.[k.key] || 0) > 0).map((k) => (
                            <span key={k.key} style={{ marginRight: 12 }}>
                              {k.label}
                              <Err n={d.speech.errorTypes[k.key] || 0} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {d.speech.wordPairs?.filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean)).length ? (
                        <div className="hist-line">
                          <span style={{ color: HL.key }}>词组对比：</span>
                          {d.speech.wordPairs
                            .filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean))
                            .map((wp, idx) => (
                              <div key={idx} style={{ marginLeft: 12 }}>
                                {[wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].filter(Boolean).join(" / ")}
                              </div>
                            ))}
                        </div>
                      ) : null}
                      {d.speech.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
                        <div className="hist-line">
                          <span style={{ color: HL.key }}>题目类型与技巧：</span>
                          {d.speech.questionTypeSkills
                            .filter((qt) => qt.skill?.trim())
                            .map((qt, idx) => (
                              <div key={idx} style={{ marginLeft: 12 }}>
                                {QUESTION_TYPE_MAP[qt.questionType] || "未知"}：{qt.skill}
                              </div>
                            ))}
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 逻辑判断特有 */}
                  {key === "logic" && d.logic && (
                    <>
                      {LOGIC_ERROR_KEYS.some((k) => (d.logic.errorTypes[k.key as keyof typeof d.logic.errorTypes] || 0) > 0) ? (
                        <div className="hist-line">
                          <span style={{ color: HL.key }}>错因：</span>
                          {LOGIC_ERROR_KEYS.filter((k) => (d.logic.errorTypes[k.key as keyof typeof d.logic.errorTypes] || 0) > 0).map((k) => (
                            <span key={k.key} style={{ marginRight: 12 }}>
                              {k.key}({k.label})<Err n={d.logic.errorTypes[k.key as keyof typeof d.logic.errorTypes] || 0} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {d.logic.hardestQuestions ? <div className="hist-line">🎯 最难追及：{d.logic.hardestQuestions}</div> : null}
                    </>
                  )}
                  {/* 图推特有 */}
                  {key === "figure" && d.figure && (
                    <>
                      {d.figure.newPatterns?.filter((p) => p.value?.trim()).length ? (
                        <div className="hist-line">
                          新规律：
                          {d.figure.newPatterns
                            .filter((p) => p.value?.trim())
                            .map((p) => p.value)
                            .join(" | ")}
                        </div>
                      ) : null}
                      {d.figure.errorPatterns?.filter((p) => p.value?.trim()).length ? (
                        <div className="hist-line">
                          错误规律：
                          {d.figure.errorPatterns
                            .filter((p) => p.value?.trim())
                            .map((p) => p.value)
                            .join(" | ")}
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 资料分析特有 */}
                  {key === "calc" && d.calc && (
                    <>
                      {d.calc.errorTypes?.filter((e) => e.type?.trim()).length ? (
                        <div className="hist-line">
                          错误类型：
                          {d.calc.errorTypes
                            .filter((e) => e.type?.trim())
                            .map((e) => `${e.type}:${e.errorCount}题`)
                            .join("  ")}
                        </div>
                      ) : null}
                      {d.calc.optimizations?.filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps).length ? (
                        <div className="hist-line">
                          <span style={{ color: HL.key }}>计算优化：</span>
                          {d.calc.optimizations
                            .filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps)
                            .map((o, idx) => (
                              <div key={idx} style={{ marginLeft: 12 }}>
                                题{o.questionNum || "?"}：{o.originalSteps || "?"}→{o.optimizedSteps || "?"}
                              </div>
                            ))}
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* 数量关系特有 */}
                  {key === "number" && d.number && (
                    <>
                      {d.number.errorTypes?.filter((e) => e.type?.trim()).length ? (
                        <div className="hist-line">
                          错因：
                          {d.number.errorTypes
                            .filter((e) => e.type?.trim())
                            .map((e) => `${e.type}:${e.errorCount}`)
                            .join("  ")}
                        </div>
                      ) : null}
                      {d.number.skills?.filter((s) => s.description?.trim()).length ? (
                        <div className="hist-line">
                          <span style={{ color: HL.key }}>技巧：</span>
                          {d.number.skills
                            .filter((s) => s.description?.trim())
                            .map((s, idx) => (
                              <div key={idx} style={{ marginLeft: 12 }}>
                                {s.description}
                              </div>
                            ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </>
              )}
            </Card>
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
    const pairMap: Record<string, { pair: string; note: string; selectedWord: string; dates: string[]; errorCount: number }> = {};
    // 申论漏抄词：按词语去重统计次数
    const missWordMap: Record<string, { word: string; count: number }> = {};
    const allOptimizations: { date: string; content: string }[] = [];
    const allSkills: { date: string; content: string }[] = [];
    // 图推规律：去重统计
    const allFigurePatterns: Record<string, { type: string; count: number }> = {};

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
      // 技巧
      d.number?.skills?.forEach((s) => {
        if (s.description) allSkills.push({ date: d.date, content: s.description });
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
    const qtSkillMap: Record<string, { questionType: number; skills: string[]; dates: string[] }> = {};
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
    const qtGrouped: Record<number, { skills: Set<string>; dates: Set<string> }> = {};
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
        questionType: Number(type),
        skills: Array.from(v.skills),
        dayCount: v.dates.size,
      }))
      .sort((a, b) => b.dayCount - a.dayCount);

    // const totalReg = pairList.reduce((s, p) => s + p.dates.length, 0);
    // const totalErr = pairList.reduce((s, p) => s + p.errorCount, 0);

    // 漏抄词按次数排序
    const missWordList = Object.values(missWordMap).sort((a, b) => b.count - a.count);

    return (
      <div>
        <Card
          title={<span>🔤 词对分析</span>}
          extra={
            <Button
              size="small"
              type={pairSort === "count" ? "primary" : "default"}
              onClick={() => setPairSort(pairSort === "time" ? "count" : "time")}
            >
              {pairSort === "count" ? "按数量排序" : "按时间排序"}
            </Button>
          }
          className="summary-card"
          size="small"
        >
          {pairList.map((p, i) => {
            // selectedWord相同的累计次数
            const swCount = p.selectedWord ? pairList.filter((x) => x.selectedWord === p.selectedWord).length : 0;
            return (
              <div className="summary-row" key={i}>
                <span>
                  {formatDate(p.dates[0])}
                  {p.dates.length > 1 && (
                    <Tag color="blue" style={{ marginLeft: 6 }}>
                      +{p.dates.length - 1}天
                    </Tag>
                  )}
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
        </Card>
        <Card title="📋 言语技巧" className="summary-card" size="small">
          {qtGroupedList.map((g, i) => (
            <div className="summary-row" key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#1a2b4c" }}>
                  {QUESTION_TYPE_MAP[g.questionType] || "未知"}
                </span>
                <Tag color="blue">{g.dayCount}天</Tag>
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
        </Card>
        <Card title="📌 申论漏抄词" className="summary-card" size="small">
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
        </Card>
        <Card title="⚙️ 资料计算优化" className="summary-card" size="small">
          {allOptimizations.map((o, i) => (
            <div className="summary-row" key={i}>
              <span>{formatDate(o.date)}</span>
              <span>{o.content}</span>
            </div>
          ))}
          {!allOptimizations.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </Card>
        <Card title="💡 数量技巧" className="summary-card" size="small">
          {allSkills.map((s, i) => (
            <div className="summary-row" key={i}>
              <span>{formatDate(s.date)}</span>
              <span>{s.content}</span>
            </div>
          ))}
          {!allSkills.length && <div style={{ color: "#999", textAlign: "center" }}>暂无数据</div>}
        </Card>
        <Card title="🎨 图推规律" className="summary-card" size="small">
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
        </Card>
      </div>
    );
  };

  // ===== 模块对比视图 =====
  const renderCompare = () => {
    const allData = getAllDayData();
    const HL = { rate: "#52c41a", err: "#ff4d4f", time: "#1890ff", key: "#8a99b0" } as const;
    const Rate = ({ r }: { r: number }) => <span style={{ color: HL.rate, fontWeight: 600 }}>{r}%</span>;
    const Err = ({ n }: { n: number }) => <span style={{ color: HL.err, fontWeight: 600 }}>{n}个</span>;
    const Time = ({ t }: { t: number }) => <span style={{ color: HL.time, fontWeight: 600 }}>{t}min</span>;

    const renderDayDetail = (d: DayData, moduleKey: string): React.ReactNode => {
      if (moduleKey === "speech") {
        const papers = d.speech?.papers || [];
        if (!papers.length && !d.speech?.articleTypes?.length && !d.speech?.wordPairs?.length && !d.speech?.questionTypeSkills?.length) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const totalErr = (p.fillErrorCount || 0) + (p.centerErrorCount || 0);
              const rate = p.totalQuestions > 0 ? Math.round(((p.totalQuestions - totalErr) / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="hist-line">
                  套卷{i + 1}：正确率：
                  <Rate r={rate} /> 用时：
                  <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个
                  {p.fillErrorCount ? (
                    <>
                      <br />
                      选词填空错：
                      <Err n={p.fillErrorCount} /> 中心理解错：
                      <Err n={p.centerErrorCount || 0} /> 总错误：
                      <Err n={totalErr} />
                    </>
                  ) : null}
                  {p.centerCircleQuestions ? (
                    <>
                      <br />⭕ 中心画圈：{p.centerCircleQuestions}
                    </>
                  ) : null}
                  {p.fillErrorQuestions ? (
                    <>
                      <br />❌ 选词错题：{p.fillErrorQuestions}
                    </>
                  ) : null}
                  {p.centerErrorQuestions ? (
                    <>
                      <br />❌ 中心错题：{p.centerErrorQuestions}
                    </>
                  ) : null}
                </div>
              );
            })}
            {d.speech?.articleTypes?.length ? (
              <div className="hist-line">
                {d.speech.articleTypes.map((a, idx) => (
                  <span key={idx} style={{ marginRight: 12 }}>
                    {ARTICLE_TYPE_MAP[a.type] || "未知"}错误：
                    <Err n={a.errorCount} />
                  </span>
                ))}
              </div>
            ) : null}
            {SPEECH_ERROR_KEYS.some((k) => (d.speech?.errorTypes?.[k.key] || 0) > 0) ? (
              <div className="hist-line">
                {SPEECH_ERROR_KEYS.filter((k) => (d.speech?.errorTypes?.[k.key] || 0) > 0).map((k) => (
                  <span key={k.key} style={{ marginRight: 12 }}>
                    {k.label}
                    <Err n={d.speech?.errorTypes?.[k.key] || 0} />
                  </span>
                ))}
              </div>
            ) : null}
            {d.speech?.questionTypeSkills?.filter((qt) => qt.skill?.trim()).length ? (
              <div className="hist-line">
                <span style={{ color: HL.key }}>题目类型与技巧：</span>
                {d.speech.questionTypeSkills
                  .filter((qt) => qt.skill?.trim())
                  .map((qt, idx) => (
                    <div key={idx} style={{ marginLeft: 12 }}>
                      {QUESTION_TYPE_MAP[qt.questionType] || "未知"}：{qt.skill}
                    </div>
                  ))}
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "logic") {
        const papers = d.logic?.papers || [];
        if (!papers.length && !d.logic) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="hist-line">
                  套卷{i + 1}：正确率：
                  <Rate r={rate} /> 用时：
                  <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个 错误个数：
                  <Err n={p.errorCount} />
                  {p.circleQuestions ? (
                    <>
                      <br />⭕ 画圈：{p.circleQuestions}
                    </>
                  ) : null}
                  {p.wrongQuestions ? (
                    <>
                      <br />❌ 错题：{p.wrongQuestions}
                    </>
                  ) : null}
                  {p.starQuestions ? (
                    <>
                      <br />
                      ★：{p.starQuestions}
                    </>
                  ) : null}
                </div>
              );
            })}
            {LOGIC_ERROR_KEYS.some((k) => (d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0) > 0) ? (
              <div className="hist-line">
                <span style={{ color: HL.key }}>错因：</span>
                {LOGIC_ERROR_KEYS.filter((k) => (d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0) > 0).map((k) => (
                  <span key={k.key} style={{ marginRight: 12 }}>
                    {k.key}({k.label})<Err n={d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0} />
                  </span>
                ))}
              </div>
            ) : null}
            {d.logic?.hardestQuestions ? <div className="hist-line">🎯 最难追及：{d.logic.hardestQuestions}</div> : null}
          </>
        );
      }
      if (moduleKey === "figure") {
        const papers = d.figure?.papers || [];
        if (!papers.length && !d.figure?.newPatterns?.length && !d.figure?.errorPatterns?.length)
          return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="hist-line">
                  套卷{i + 1}：正确率：
                  <Rate r={rate} /> 用时：
                  <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个 错误个数：
                  <Err n={p.errorCount} />
                  {p.circleQuestions ? (
                    <>
                      <br />⭕ 画圈：{p.circleQuestions}
                    </>
                  ) : null}
                  {p.wrongQuestions ? (
                    <>
                      <br />❌ 错题：{p.wrongQuestions}
                    </>
                  ) : null}
                  {p.starQuestions ? (
                    <>
                      <br />
                      ★：{p.starQuestions}
                    </>
                  ) : null}
                </div>
              );
            })}
            {d.figure?.newPatterns?.filter((p) => p.value?.trim()).length ? (
              <div className="hist-line">
                新规律：
                {d.figure.newPatterns
                  .filter((p) => p.value?.trim())
                  .map((p) => p.value)
                  .join(" | ")}
              </div>
            ) : null}
            {d.figure?.errorPatterns?.filter((p) => p.value?.trim()).length ? (
              <div className="hist-line">
                错误规律：
                {d.figure.errorPatterns
                  .filter((p) => p.value?.trim())
                  .map((p) => p.value)
                  .join(" | ")}
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "calc") {
        const papers = d.calc?.papers || [];
        if (!papers.length && !d.calc?.errorTypes?.length && !d.calc?.optimizations?.length) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="hist-line">
                  套卷{i + 1}：正确率：
                  <Rate r={rate} /> 用时：
                  <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个 错误个数：
                  <Err n={p.errorCount} />
                  {p.circleQuestions ? (
                    <>
                      <br />⭕ 画圈：{p.circleQuestions}
                    </>
                  ) : null}
                  {p.wrongQuestions ? (
                    <>
                      <br />❌ 错题：{p.wrongQuestions}
                    </>
                  ) : null}
                </div>
              );
            })}
            {d.calc?.errorTypes?.filter((e) => e.type?.trim()).length ? (
              <div className="hist-line">
                错误类型：
                {d.calc.errorTypes
                  .filter((e) => e.type?.trim())
                  .map((e) => `${e.type}:${e.errorCount}题`)
                  .join("  ")}
              </div>
            ) : null}
            {d.calc?.optimizations?.filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps).length ? (
              <div className="hist-line">
                <span style={{ color: HL.key }}>计算优化：</span>
                {d.calc.optimizations
                  .filter((o) => o.questionNum || o.originalSteps || o.optimizedSteps)
                  .map((o, idx) => (
                    <div key={idx} style={{ marginLeft: 12 }}>
                      题{o.questionNum || "?"}：{o.originalSteps || "?"}→{o.optimizedSteps || "?"}
                    </div>
                  ))}
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "number") {
        const papers = d.number?.papers || [];
        if (!papers.length && !d.number?.errorTypes?.length && !d.number?.skills?.length) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => {
              const correct = p.totalQuestions - p.errorCount;
              const rate = p.totalQuestions > 0 ? Math.round((correct / p.totalQuestions) * 100) : 0;
              return (
                <div key={i} className="hist-line">
                  套卷{i + 1}：正确率：
                  <Rate r={rate} /> 用时：
                  <Time t={p.timeUsed} /> 总题数：{p.totalQuestions}个 错误个数：
                  <Err n={p.errorCount} />
                  {p.circleQuestions ? (
                    <>
                      <br />⭕ 画圈：{p.circleQuestions}
                    </>
                  ) : null}
                  {p.guessRightQuestions ? (
                    <>
                      <br />
                      蒙对：{p.guessRightQuestions}
                    </>
                  ) : null}
                  {p.wrongQuestions ? (
                    <>
                      <br />❌ 错题：{p.wrongQuestions}
                    </>
                  ) : null}
                  {p.starQuestions ? (
                    <>
                      <br />
                      ★：{p.starQuestions}
                    </>
                  ) : null}
                </div>
              );
            })}
            {d.number?.errorTypes?.filter((e) => e.type?.trim()).length ? (
              <div className="hist-line">
                错因：
                {d.number.errorTypes
                  .filter((e) => e.type?.trim())
                  .map((e) => `${e.type}:${e.errorCount}`)
                  .join("  ")}
              </div>
            ) : null}
            {d.number?.skills?.filter((s) => s.description?.trim()).length ? (
              <div className="hist-line">
                <span style={{ color: HL.key }}>技巧：</span>
                {d.number.skills
                  .filter((s) => s.description?.trim())
                  .map((s, idx) => (
                    <div key={idx} style={{ marginLeft: 12 }}>
                      {s.description}
                    </div>
                  ))}
              </div>
            ) : null}
          </>
        );
      }
      if (moduleKey === "essay") {
        const papers = d.essay?.papers || [];
        if (!papers.length) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {papers.map((p: Paper, i: number) => (
              <div key={i} className="hist-line">
                套卷{i + 1}：{p.isOverTime ? "未超时" : p.overTime ? `超时${p.overTime}min` : ""}
                {p.scoreKeywords ? ` 得分词${p.scoreKeywords}个` : ""}
                {p.missKeywordsCount ? ` 漏抄${p.missKeywordsCount}个` : ""}
                {p.missKeywords ? (
                  <>
                    <br />
                    漏抄词：{p.missKeywords}
                  </>
                ) : null}
              </div>
            ))}
          </>
        );
      }
      if (moduleKey === "wordpair") {
        const wps = d.speech?.wordPairs?.filter((wp) => [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean)) || [];
        if (!wps.length) return <span style={{ color: "#bbb" }}>(无记录)</span>;
        return (
          <>
            {wps.map((wp, idx) => (
              <div key={idx} className="hist-line">
                {[wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].filter(Boolean).join(" / ")}
              </div>
            ))}
          </>
        );
      }
      return null;
    };

    const renderModuleCard = (title: string, moduleKey: string, renderAgg: () => React.ReactNode) => (
      <Card key={moduleKey} title={title} className="summary-card" size="small">
        {renderAgg()}
        <Divider style={{ margin: "8px 0" }} />
        {allData.map((d) => (
          <div key={d.date}>
            <div style={{ fontWeight: 600, color: "#1a2b4c", fontSize: 13, marginBottom: 4 }}>{formatDate(d.date)}</div>
            {renderDayDetail(d, moduleKey)}
          </div>
        ))}
      </Card>
    );

    return (
      <div>
        {renderModuleCard("🧠 言语理解", "speech", () => {
          const articleAgg: Record<string, number> = {};
          const errorAgg: Record<string, number> = {};
          allData.forEach((d) => {
            d.speech?.articleTypes?.forEach((a) => {
              const name = ARTICLE_TYPE_MAP[a.type] || "未知";
              articleAgg[name] = (articleAgg[name] || 0) + a.errorCount;
            });
            SPEECH_ERROR_KEYS.forEach((k) => {
              const v = d.speech?.errorTypes?.[k.key] || 0;
              if (v) errorAgg[k.label] = (errorAgg[k.label] || 0) + v;
            });
          });
          return (
            <>
              <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
                <strong>文章类型：</strong>
                {Object.entries(articleAgg)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => `${k}:${v}题`)
                  .join(" · ") || "无"}
              </div>
              <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
                <strong>错误选项：</strong>
                {Object.entries(errorAgg)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => `${k}:${v}次`)
                  .join(" · ") || "无"}
              </div>
              <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
                <strong>题目类型：</strong>
                {(() => {
                  const qtAgg: Record<string, number> = {};
                  allData.forEach((d) => {
                    d.speech?.questionTypeSkills?.forEach((qt) => {
                      if (!qt.skill?.trim()) return;
                      const name = QUESTION_TYPE_MAP[qt.questionType] || "未知";
                      qtAgg[name] = (qtAgg[name] || 0) + 1;
                    });
                  });
                  return Object.entries(qtAgg)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k}:${v}个`)
                    .join(" · ") || "无";
                })()}
              </div>
            </>
          );
        })}

        {renderModuleCard("🔤 词组对比", "wordpair", () => {
          const pairMap: Record<string, { selectedWord: string; count: number }> = {};
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
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              <strong>高频选词TOP10：</strong>
              {list.length ? list.map((x) => `${x.selectedWord}(${x.count}次)`).join(" · ") : "无"}
            </div>
          );
        })}

        {renderModuleCard("🧩 逻辑判断", "logic", () => {
          const agg: Record<string, number> = {};
          allData.forEach((d) => {
            LOGIC_ERROR_KEYS.forEach((k) => {
              const v = d.logic?.errorTypes?.[k.key as keyof typeof d.logic.errorTypes] || 0;
              if (v) agg[k.label] = (agg[k.label] || 0) + v;
            });
          });
          const total = Object.values(agg).reduce((s, v) => s + v, 0);
          return (
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              <strong>错误类型总数和: {total}</strong>
              {Object.entries(agg)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => `${k}:${v}`)
                .join(" · ") || "无"}
            </div>
          );
        })}

        {renderModuleCard("🎨 图推", "figure", () => {
          const agg: Record<string, { type: string; count: number }> = {};
          allData.forEach((d) => {
            [...(d.figure?.newPatterns || []), ...(d.figure?.errorPatterns || [])].forEach((p) => {
              if (p.value?.trim()) {
                if (!agg[p.value]) agg[p.value] = { type: d.figure?.newPatterns?.some((x) => x.value === p.value) ? "新规律" : "错误规律", count: 0 };
                agg[p.value].count++;
              }
            });
          });
          return (
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              {/* <strong>去重: {Object.keys(agg).length}个</strong> */}
              {Object.entries(agg)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([k, v]) => `[${v.type}]${k}(${v.count}次)`)
                .join(" · ")}
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
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              {Object.entries(agg)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => `${k}:${v}题`)
                .join(" · ") || "无"}
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
          // const total = Object.values(agg).reduce((s, v) => s + v, 0);
          return (
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              <strong>类型错误</strong>
              {/* <br /> */}
              {Object.entries(agg)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => `${k}:${v}`)
                .join("   ") || "无"}
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
            <div className="summary-row" style={{ background: "#f8fafc", padding: 8, borderRadius: 8, marginBottom: 8 }}>
              <strong>Top 漏抄词:</strong>
              {top10.map(([k, v]) => `${k}(${v}次)`).join(" · ") || "无"}
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
          <SpeechSection data={todayData.speech} onChange={updateSpeech} />
          <WordPairSection wordPairs={todayData.speech.wordPairs || []} onChange={(wps) => updateSpeech({ ...todayData.speech, wordPairs: wps })} />
          <LogicSection data={todayData.logic} onChange={updateLogic} />
          <FigureSection data={todayData.figure} onChange={updateFigure} />
          <CalcSection data={todayData.calc} onChange={updateCalc} />
          <NumberSection data={todayData.number} onChange={updateNumber} />
          <EssaySection data={todayData.essay} onChange={updateEssay} />
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
