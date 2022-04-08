import { createContext, useContext } from "react";
import useMethods from "use-methods";
export const initialState = {
  currentAddress: null,
  isApiInProgress: false,
  user: {},
};

export const methods = (state) => ({
  reset() {
    return initialState;
  },

  setCurrentAddress(value) {
    state.currentAddress = value;
  },
  startCallingApi() {
    state.isApiInProgress = true;
  },
  endCallingApi() {
    state.isApiInProgress = false;
  },
  openConnectToWallet(afterOnboardingUrl) {
    state.afterOnboardingUrl = afterOnboardingUrl;
    state.isWalletModalOpen = true;
  },
  onWalletModalClose() {
    state.isWalletModalOpen = false;
  },
});

const PageContext = createContext();
export const StateProvider = ({ children }) => {
  return (
    <PageContext.Provider value={useMethods(methods, initialState)}>
      {children}
    </PageContext.Provider>
  );
};
export const usePageState = () => useContext(PageContext);
