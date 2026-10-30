import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';

import { AppContextProvider } from './context/app-context';
import Spinner from './components/common/Spinner';
import OnboardingLayout from './layout/OnboardingLayout';
import DashboardLayout from './layout/DashboardLayout';

import Login from './pages/onboarding/Login';
import Users from './pages/Dashboard/Users';
import Packages from './pages/Dashboard/Packages';
import Coupons from './pages/Dashboard/Coupons';
import Sports from './pages/Dashboard/Sports';
import Colleges from './pages/Dashboard/Colleges';
import Coaches from './pages/Dashboard/Coaches';
import Players from './pages/Dashboard/Players';

function App() {
  const router = createHashRouter([
    {
      path: '/',
      element: <OnboardingLayout />,
      children: [{ path: '', element: <Login /> }],
    },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { path: 'users', element: <Users /> },
        { path: 'packages', element: <Packages /> },
        { path: 'coupons', element: <Coupons /> },
        { path: 'players', element: <Players /> },
        { path: 'coaches', element: <Coaches /> },
        { path: 'colleges', element: <Colleges /> },
        { path: 'sports', element: <Sports /> },
      ],
    },
  ]);

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      <AppContextProvider>
        <Suspense fallback={<Spinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppContextProvider>
    </>
  );
}

export default App;
