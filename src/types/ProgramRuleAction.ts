export interface ProgramRuleAction {
  id: string;
  programRuleActionType: string;
  data?: string;
  content?: string;
  location?: string;
  priority?: number;
  legendSet?: { id: string };
  dataElement?: { id: string };
  trackedEntityAttribute?: { id: string };
  programRule: { id: string };
  attributeValues?: Array<{ attribute: { id: string }; value: string }>;
}
