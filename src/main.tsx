import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider, Navigate} from "react-router-dom";
import NotFound from "./components/NotFound.tsx";
import Table from "./components/Table/Table.tsx";
import {Provider} from "react-redux";
import {store} from "./store.ts";
import DashboardPage from "./components/DashboardPage/DashboardPage.tsx";
import Auth from "./components/Auth/Auth.tsx";
import Profile from "./components/Profile/Profile.tsx";
import Register from "./components/Auth/Register.tsx";
import RequireAuth from "./components/Auth/RequireAuth.tsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        element: <Auth />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'dashboard',
        element: <RequireAuth><DashboardPage /></RequireAuth>,
      },
      {
        path: 'documents/:documentId',
        element: <RequireAuth><Table /></RequireAuth>
      },
      {
        path: 'profile',
        element: <RequireAuth><Profile /></RequireAuth>
      }
    ]
  },
  {
    path: '*',
    element: <NotFound/>
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>

  </StrictMode>,
)
