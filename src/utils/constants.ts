import type { Paper, DayData, SpeechModule, LogicModule, FigureModule, CalcModule, NumberModule, EssayModule } from '../types';

export const ARTICLE_TYPE_MAP: Record<number, string> = {
  0: '科普类', 1: '原因类', 2: '对策类', 3: '历程类',
  4: '新闻类', 5: '区别联系类', 6: '说理类', 7: '并列',
};

export const SPEECH_ERROR_KEYS = [
  { key: '无中生有', label: '无中生有' },
  { key: '偷换概念', label: '偷换概念' },
  { key: '以偏概全', label: '以偏概全' },
  { key: '过度推断', label: '过度推断' },
];

export const LOGIC_ERROR_KEYS = [
  { key: '因', label: '因果倒置' },
  { key: '他', label: '另有他因' },
  { key: '无', label: '无关项' },
  { key: '反', label: '因果反了' },
  { key: '范', label: '范围扩大/缩小' },
  { key: '搭', label: '搭桥加强' },
  { key: '拆', label: '拆桥削弱' },
];

export const EMPTY_PAPER: Paper = {
  id: String(Date.now()),
  totalQuestions: 0,
  timeUsed: 0,
  errorCount: 0,
  circleQuestions: '',
  wrongQuestions: '',
  starQuestions: '',
};

export const DEFAULT_SPEECH: SpeechModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1' }],
  articleTypes: [{ id: 'a1', type: 0, errorCount: 0 }],
  errorTypes: Object.fromEntries(SPEECH_ERROR_KEYS.map(k => [k.key, 0])),
  wordPairs: [{ id: 'w1', pairType: 'signal', signalWord: '', selectedWord: '', note: '' }],
};

export const DEFAULT_LOGIC: LogicModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1' }],
  errorTypes: { 因: 0, 他: 0, 无: 0, 反: 0, 范: 0, 搭: 0, 拆: 0 },
  hardestQuestions: '',
};

export const DEFAULT_FIGURE: FigureModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1' }],
  newPatterns: [{ id: 'f1', value: '' }],
  errorPatterns: [{ id: 'f2', value: '' }],
};

export const DEFAULT_CALC: CalcModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1' }],
  errorTypes: [{ id: 'c1', type: '', errorCount: 0 }],
  optimizations: [{ id: 'o1', questionNum: '', originalSteps: '', optimizedSteps: '' }],
};

export const DEFAULT_NUMBER: NumberModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1' }],
  errorTypes: [{ id: 'n1', type: '', errorCount: 0 }],
  skills: [{ id: 's1', description: '' }],
};

export const DEFAULT_ESSAY: EssayModule = {
  papers: [{ ...EMPTY_PAPER, id: 'p1', overTime: '', isOverTime: false, scoreKeywords: 0, missKeywordsCount: 0, missKeywords: '' }],
};

export const DEFAULT_DAY_DATA = (date: string): DayData => ({
  date,
  speech: DEFAULT_SPEECH,
  logic: DEFAULT_LOGIC,
  figure: DEFAULT_FIGURE,
  calc: DEFAULT_CALC,
  number: DEFAULT_NUMBER,
  essay: DEFAULT_ESSAY,
});

export const STORAGE_PREFIX = 'xingce_data_';
