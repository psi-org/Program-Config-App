export interface ProgramRule {
  id: string;
  name: string;
  description?: string;
  program: { id: string };
  programStage?: { id: string };
  condition: string;
  priority?: number;
  programRuleActions: Array<{ id: string }>;
  attributeValues?: Array<{ attribute: { id: string }; value: string }>;
}
