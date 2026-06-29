/**
 * Shape of the error object thrown by the DHIS2 app-runtime when an API
 * call fails (HTTP-level error or a FetchError from @dhis2/data-engine).
 */
export interface DhisApiError {
  httpStatus?: string;
  httpStatusCode?: number;
  status?: string;
  message?: string;
  type?: string;
  details?: {
    message?: string;
    type?: string;
    [key: string]: unknown;
  };
}
