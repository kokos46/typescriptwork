import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import NotFound from "./components/NotFound.tsx";
import Table from "./components/Table/Table.tsx";
import {AppProvider} from "./AppContext.tsx";
import Auth from "./components/Auth/Auth.tsx";
import {Provider} from "react-redux";
import {store} from "./store.ts";



const router = createBrowserRouter([
  {
    path: '/dashboard/:username',
    element: <App/>,
    errorElement: <NotFound/>,
  },
  {
    path: "/table/:username/:id",
    element: <Table/>
  },
  {
    path: '/',
    element: <Auth/>
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <Provider store={store}>
        <RouterProvider router={router}/>
      </Provider>
    </AppProvider>
  </StrictMode>,
)
