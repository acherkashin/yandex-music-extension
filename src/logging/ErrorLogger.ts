import { defaultTraceSource } from "./TraceSource";

interface LogFunc<TResult, Params extends any[]> {
  (...parameters: Params): TResult;
}

export function errorLogger<TResult, Params extends any[]>(callback: LogFunc<TResult, Params>, logPrefix = '') {
  const wrappedFunc: LogFunc<TResult | undefined, Params> = (...parameters) => {
    try {
      return callback(...parameters);
    } catch (ex) {
      logError(ex as any, logPrefix);
    }
  };

  return wrappedFunc;
}

export function logError(ex: any, logPrefix = '') {
  if (ex?.response?.data?.error?.message) {
    // TODO: logging doesn't work here for some reason
    defaultTraceSource.info(`${logPrefix} ${ex.response.data.error.message}`);
  } else {
    defaultTraceSource.info(`${logPrefix} ${JSON.stringify(ex)}`);
  }
}