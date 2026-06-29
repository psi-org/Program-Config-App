export interface AttributeValueObject {
  value?: string;
}

export type AttributeValues =
  | Record<string, AttributeValueObject | string | undefined>
  | Array<{
      value?: string;
      attribute?: {
        id?: string;
      };
    }>;
