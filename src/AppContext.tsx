import {createContext, type ReactNode, useContext, useState, useEffect} from 'react';

interface AppContextType {
  userData: Record<string, UserData>;
  setUserData: (data: Record<string, UserData>) => void;
}

interface UserData{
  tables: {
    name: string;
    created_at: string
    N: number,
    M: number,
    data: Record<string, string>;
  }[]
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {

  const [userData, setUserData] = useState<Record<string, UserData>>(() => {
    const saved = localStorage.getItem('myTableApp_Data');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('myTableApp_Data', JSON.stringify(userData));
  }, [userData]);

  return (
    <AppContext.Provider value={{ userData, setUserData }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  return useContext(AppContext);
};