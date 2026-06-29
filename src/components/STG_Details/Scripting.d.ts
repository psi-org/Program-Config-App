import type {
  PcaDataElement,
  ScoreMapRoot,
  FeedbackTree,
  SharingSettings,
  ScoresMapping,
  ProgramRulesBuilderResult,
  ProgramIndicatorsBuilderResult,
  VisualizationsBuilderResult,
  FeedbackRulesBuilderResult,
  BuildProgramRuleVariablesParams,
  BuildProgramRulesParams,
  BuildProgramIndicatorsParams,
  BuildFeedbackRulesParams,
} from '../../types/pca';
import type {
  ProgramRule,
  ProgramRuleAction,
  ProgramRuleVariable,
} from '../../types';

// ── Exported utilities ────────────────────────────────────────────────────────

/**
 * Returns unique/duplicate composite score feedback-order values for a set of
 * score data elements.
 */
export declare function checkScores(scores: PcaDataElement[]): {
  uniqueScores: boolean;
  compositeScores: (string | undefined)[];
  duplicatedScores: (string | undefined)[];
};

/**
 * Collects all composite-score levels referenced by questions across sections
 * (e.g. for feedback order "1.2.1" it emits "1", "1.2", "1.2.1").
 */
export declare function readQuestionComposites(
  sections: Array<{ dataElements: PcaDataElement[] }>
): string[];

/**
 * Builds the hide/show and make-mandatory program rules from a grouped map of
 * parent DE → answer value → child DEs.
 */
export declare function hideShowLogic(
  hideShowGroup: Record<
    string,
    Record<string, Array<{ id: string; mandatory: string }>>
  >,
  programId: string,
  uidPool: string[]
): { hideShowRules: ProgramRule[]; hideShowActions: ProgramRuleAction[] };

/**
 * Builds the hierarchical feedback tree and a map of dataElement.id →
 * programRuleVariable used by the feedback rule builder.
 */
export declare function buildFeedbackTree(
  dataElements: PcaDataElement[],
  programRuleVariables: Array<
    ProgramRuleVariable & { name: string; dataElement?: { id: string } }
  >
): {
  feedbackTree: FeedbackTree;
  prvsMap: Record<string, ProgramRuleVariable & { name: string }>;
};

/** Builds all DISPLAYTEXT / DISPLAYKEYVALUEPAIR feedback program rules. */
export declare function buildFeedbackRules(
  params: BuildFeedbackRulesParams
): FeedbackRulesBuilderResult;

/** Builds program rule variables for an HNQIS2 stage. */
export declare function buildProgramRuleVariables(
  params: BuildProgramRuleVariablesParams
): ProgramRuleVariable[];

/** Builds all scoring / hide-show / competency program rules for a stage. */
export declare function buildProgramRules(
  params: BuildProgramRulesParams
): ProgramRulesBuilderResult;

/** Builds program indicators for global analytics. */
export declare function buildProgramIndicators(
  params: BuildProgramIndicatorsParams
): ProgramIndicatorsBuilderResult;

/** Builds all visualizations, maps, event reports and dashboard for a program. */
export declare function buildH2BaseVisualizations(params: {
  programId: string;
  programShortName: string;
  gsInd: string;
  indicatorIDs: string[];
  uidPool: string[];
  useCompetency?: string;
  currentDashboardId?: string;
  userOU: boolean;
  ouRoot: string;
  sharingSettings: SharingSettings;
  visualizationLevel?: number;
  mapLevel?: number;
  actionPlanID: string;
}): VisualizationsBuilderResult;
