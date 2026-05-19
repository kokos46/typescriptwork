import styles from './App.module.css';
import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks.ts";
import { Outlet, useLocation } from "react-router-dom";
import {restoreSession} from "./slices/auth.ts";
import {setLocalTables} from "./slices/documents.ts";
import {loadTablesForUser} from "./utils/authStorage.ts";

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const sessionRestoreStartedRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    if (sessionRestoreStartedRef.current) {
      return;
    }

    sessionRestoreStartedRef.current = true;

    dispatch(restoreSession())
      .unwrap()
      .then((user) => {
        dispatch(setLocalTables(loadTablesForUser(user.email)));
      })
      .catch(() => undefined);
  }, [dispatch, location.pathname]);

  return (
    <div className={styles.App}>
      <div className={styles.topPanel}></div>
      <div className={styles.mainNav}>
        <div className={styles.sidePanel}></div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
