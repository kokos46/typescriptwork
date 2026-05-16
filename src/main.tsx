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

const router = createBrowserRouter([
  {
    // 1. Объявляем главный Layout для всего приложения (или его части)
    element: <App />,
    children: [
      {
        path: 'dashboard',
        element: <Auth><DashboardPage /></Auth>,
      },
      {
        path: 'documents/:documentId',
        element: <Table />
      },
      {
        path: 'profile',
        element: <Profile />
      }
    ]
  },
  {
    path: '/',
    element: <Navigate to="/dashboard"/>
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
