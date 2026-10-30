import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // SPINNER STATE
  const [spinner, setSpinner] = useState(false);

  return (
    <AppContext.Provider value={{ spinner, setSpinner }}>
      {children}
    </AppContext.Provider>
  );
}
