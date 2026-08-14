export interface Paper {
  id: string;
  totalQuestions: number;
  timeUsed: number;
  errorCount: number;
  circleQuestions: string;
  wrongQuestions: string;
  starQuestions: string;
  // 言语理解特有
  fillErrorCount?: number;
  centerErrorCount?: number;
  fillErrorQuestions?: string;
  centerErrorQuestions?: string;
  centerCircleQuestions?: string;
  // 数量关系特有
  guessRightQuestions?: string;
  // 申论特有
  overTime?: string;
  isOverTime?: boolean;
  scoreKeywords?: number;
  missKeywordsCount?: number;
  missKeywords?: string;
}

export interface ArticleTypeError {
  id: string;
  type: number;
  errorCount: number;
}

export interface ErrorTypeItem {
  key: string;
  label: string;
  count: number;
}

export interface WordPair {
  id: string;
  pairType: 'signal' | 'compare';
  signalWord?: string;
  selectedWord?: string;
  compareWord?: string;
  selectedCompareWord?: string;
  note?: string;
}

export interface LogicErrorTypes {
  因: number;
  他: number;
  无: number;
  反: number;
  范: number;
  搭: number;
  拆: number;
}

export interface NamedItem {
  id: string;
  value: string;
}

export interface CalcErrorType {
  id: string;
  type: string;
  errorCount: number;
}

export interface CalcOptimization {
  id: string;
  questionNum: string;
  originalSteps: string;
  optimizedSteps: string;
}

export interface NumberErrorType {
  id: string;
  type: string;
  errorCount: number;
}

export interface Skill {
  id: string;
  description: string;
}

export interface QuestionTypeSkill {
  id: string;
  questionType: number;
  skill: string;
}

export interface SpeechModule {
  papers: Paper[];
  articleTypes: ArticleTypeError[];
  errorTypes: Record<string, number>;
  wordPairs: WordPair[];
  questionTypeSkills: QuestionTypeSkill[];
}

export interface LogicModule {
  papers: Paper[];
  errorTypes: LogicErrorTypes;
  hardestQuestions: string;
}

export interface FigureModule {
  papers: Paper[];
  newPatterns: NamedItem[];
  errorPatterns: NamedItem[];
}

export interface CalcModule {
  papers: Paper[];
  errorTypes: CalcErrorType[];
  optimizations: CalcOptimization[];
}

export interface NumberModule {
  papers: Paper[];
  errorTypes: NumberErrorType[];
  skills: Skill[];
}

export interface EssayModule {
  papers: Paper[];
}

export interface DayData {
  date: string;
  speech: SpeechModule;
  logic: LogicModule;
  figure: FigureModule;
  calc: CalcModule;
  number: NumberModule;
  essay: EssayModule;
}
