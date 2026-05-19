import type {ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {useAppSelector} from "../../hooks.ts";

export default function RequireAuth({children}: {children: ReactNode}) {
  const status = useAppSelector((state) => state.auth.status);

  if (status === 'idle' || status === 'loading') {
    return <div>Загрузка...</div>;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
