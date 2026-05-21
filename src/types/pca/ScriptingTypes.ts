import type { PcaDataElement } from './PcaDataElement';
import type { ProgramRule } from '../ProgramRule';
import type { ProgramRuleAction } from '../ProgramRuleAction';
import type { ProgramRuleVariable } from '../ProgramRuleVariable';
interface SharingAccess {
  access: string;
  id?: string;
  displayName?: string;
}

export interface SharingSettings {
  public: string;
  users: Record<string, SharingAccess>;
  userGroups: Record<string, SharingAccess>;
  external?: boolean;
  owner?: string;
}

// ── Score map tree ────────────────────────────────────────────────────────────

export interface ScoreQuestion {
  subLevels?: string[];
  prgVarName?: string;
  scoreNum?: number;
  scoreDen?: number;
  isCritical?: 'Yes' | 'No';
}

interface ScoreMapExpressions {
  numC?: string;
  denC?: string;
  numN?: string;
  denN?: string;
}

/** A leaf node in the score map tree — holds scoring questions. */
export interface ScoreMapLeaf extends ScoreMapExpressions {
  order?: string | number;
  questions: ScoreQuestion[];
}

/** An intermediate branch node in the score map tree. */
export interface ScoreMapBranch extends ScoreMapExpressions {
  order?: string | number;
  childs: ScoreMapNode[];
}

export type ScoreMapNode = ScoreMapLeaf | ScoreMapBranch;

/** Root of the score map tree (no order, only childs). */
export interface ScoreMapRoot extends ScoreMapExpressions {
  childs: ScoreMapNode[];
}

// ── Feedback tree ─────────────────────────────────────────────────────────────

export interface FeedbackTreeNode {
  score?: PcaDataElement;
  content: PcaDataElement[];
  [key: string]:
    | FeedbackTreeNode
    | PcaDataElement
    | PcaDataElement[]
    | undefined;
}

export type FeedbackTree = Record<string, FeedbackTreeNode>;

// ── Builder input types ───────────────────────────────────────────────────────

export interface CompositeScoreInput {
  subLevels: string[];
  feedbackOrder: string;
  formName: string;
  prgVarName: string;
  uid: string;
}

/**
 * Maps a feedback-order key (e.g. "1.2") to the full PcaDataElement for that
 * composite score. Scripting functions access `.id` and `.formName` from it.
 */
export type ScoresMapping = Record<string, PcaDataElement>;

// ── Builder return types ──────────────────────────────────────────────────────

export interface ProgramRulesBuilderResult {
  programRules: ProgramRule[];
  programRuleActions: ProgramRuleAction[];
  scoreMap: ScoreMapRoot;
}

export interface ProgramIndicatorsBuilderResult {
  programIndicators: ProgramIndicator[];
  indicatorIDs: string[];
  gsInd: string;
}

export interface VisualizationsBuilderResult {
  visualizations: unknown[];
  maps: unknown[];
  androidSettingsVisualizations: Array<{
    id: string;
    name: string;
    timestamp: string;
  }>;
  dashboards: unknown[];
  eventReports: unknown[];
}

export interface FeedbackRulesBuilderResult {
  programRules: ProgramRule[];
  programRuleActions: ProgramRuleAction[];
}

export interface ProgramRuleVariablesBuilderResult {
  programRuleVariables: ProgramRuleVariable[];
}

// ── Scripting function parameter types ───────────────────────────────────────

export interface BuildProgramRuleVariablesParams {
  sections: Array<{ dataElements: PcaDataElement[] }>;
  scoresSection: { dataElements: PcaDataElement[] };
  compositeScores: string[];
  programId: string;
  useCompetencyClass?: string;
  uidPool: string[];
}

export interface BuildProgramRulesParams {
  sections: Array<{ dataElements: PcaDataElement[] }>;
  stageId: string;
  programId: string;
  compositeValues: string[];
  scoresMapping: ScoresMapping;
  uidPool: string[];
  useCompetencyClass?: string;
  healthArea?: string;
  scoreMap?: ScoreMapRoot;
}

export interface BuildProgramIndicatorsParams {
  programId: string;
  programStage: {
    id: string;
    program: { shortName: string };
  };
  scoreMap: ScoreMapRoot;
  uidPool: string[];
  useCompetency?: string;
  sharingSettings: SharingSettings;
  PIAggregationType?: string;
}

export interface BuildFeedbackRulesParams {
  tree: FeedbackTree;
  prvsMap: Record<string, ProgramRuleVariable & { name: string }>;
  programId: string;
  uidPool: string[];
  legacy?: boolean;
}

// ProgramIndicator is large; use a minimal shape for the builder output
export interface ProgramIndicator {
  id: string;
  name: string;
  shortName: string;
  program: { id: string };
  [key: string]: unknown;
}
