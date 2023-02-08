import { defaultTraceSource } from "./TraceSource";

interface LogFunc<TResult, Params extends any[]> {
  (...parameters: Params): Promise<TResult> | TResult;
}

export function errorLogger<TResult, Params extends any[]>(callback: LogFunc<TResult, Params>, logPrefix = '') {
  const wrappedFunc: LogFunc<TResult | undefined, Params> = async (...parameters) => {
    try {
      return await callback(...parameters);
    } catch (_ex) {
      const ex = _ex as any;
      if (ex?.response?.data?.error?.message) {
        // TODO: logging doesn't work here for some reason
        defaultTraceSource.info(`${logPrefix} ${ex.response.data.error.message}`);
      } else {
        defaultTraceSource.info(`${logPrefix} ${JSON.stringify(ex)}`);
      }
    }
  };

  return wrappedFunc;
}