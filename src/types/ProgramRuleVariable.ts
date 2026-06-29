export interface ProgramRuleVariable {
  id: string;
  name: string;
  programRuleVariableSourceType: string;
  useCodeForOptionSet?: boolean | string;
  program: { id: string };
  dataElement?: { id: string };
}
