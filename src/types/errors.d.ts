export type TErrorMessage = {
  path: string | number;
  message: string;
};

export type TErrorHandler = {
  statusCode: number;
  message: string;
  errorMessages: TErrorMessage[];
};
