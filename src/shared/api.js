import { usePageState } from "@src/shared/state";
import useErrorHandler from "@src/shared/error/useErrorHandler";

function apiHandler(state, methods, errorHandler) {
  this.state = state;
  this.methods = methods;

  this.call = async (method, path, data = null, returnFullResponse = false) => {
    try {
      const headers = { "Content-Type": "application/json" };

      methods.startCallingApi();
      const res = await fetch(path, {
        body: data ? JSON.stringify(data) : null,
        headers,
        method: method,
      });

      const json = await res.json();
      if (json.error) {
        const internalAPIError = new Error(
          json.internalMessage || "Failed to fetch API"
        );
        errorHandler(
          internalAPIError,
          ["api-call-internal-error"],
          {
            request: { method, path, data },
          },
          false
        );
        throw internalAPIError;
      }

      methods.endCallingApi();

      return returnFullResponse ? json : json.data;
    } catch (error) {
      errorHandler(
        error,
        ["api-call-error"],
        {
          request: { method, path, data },
        },
        false
      );
      methods.endCallingApi();
      throw error;
    }
  };
}
export const useApi = () => {
  const errorHandler = useErrorHandler();
  const [state, methods] = usePageState();
  return new apiHandler(state, methods, errorHandler);
};
