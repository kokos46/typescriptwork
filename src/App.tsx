import styles from './App.module.css';
import { useEffect } from "react";
import { useAppDispatch } from "./hooks.ts";
import { setUsername } from "./slices/auth.ts";
import { Outlet } from "react-router-dom";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cookieString = document.cookie;
    if (cookieString.startsWith('username=')) {
      const savedUser = cookieString.replace('username=', '').trim();
      if (savedUser) {
        dispatch(setUsername(savedUser));
      }
    }
  }, [dispatch]);

  return (
    <div className={styles.App}>
      <div className={styles.sidePanel}></div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;