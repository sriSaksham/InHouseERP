import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/AdminDash';
import Attendance from './pages/Attendance/Attendance';
import Leave from './pages/Attendance/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Inventory from './pages/Inventory';
import DefaultLayout from './layout/DefaultLayout';
import SummaryPage from "./components/Inventory/SummaryPage";
import Request from "./components/Inventory/RequestItemsPage";
import AddItem from "./components/Inventory/AddInventory";
import RequestedItem from "./components/Admin/RequestListPage";
import { SiteProvider } from './components/SiteContext/SiteContext';
import PageWithSiteId from './components/SiteContext/PageWithSiteId';
import LeaveManagementPage from './components/Admin/LeaveRequest';
import ApprovedReq from './components/Admin/ApprovedRequestsPage';
import StatusPage from './components/Inventory/RequestItemStatusPage';
import PendingQuantityRequestsPage from './components/Admin/PendingQuantityRequestsPage';
import Footer from './pages/footer';
import EditQuantityRequestPage from './components/Admin/EditQuantityRequestPage';
import NewVendor from './components/Inventory/CreateVendorPage';
import ExpenseVoucherPage from './pages/Expense Voucher/Voucher';
import VoucherConsole from './components/Admin/VoucherConsole'
import MaterialQuantitiesPage from './components/Admin/QuantityView';
import QuantityRequestStatus from './components/Inventory/QuantityRequestStatusPage';
// Helper function to check authentication
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return token !== null; // Add token expiry validation if needed
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/signin" replace />;
  }
  return <>{children}</>;
};


function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <SiteProvider>
      <DefaultLayout>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/auth/signin"
            element={
              
              <>
                <PageTitle title="Sign In | SMM Infratech" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Sign Up | SMM Infratech" />
                <SignUp />
              </>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="eCommerce Dashboard | SMM Infratech" />
                  <ECommerce />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Calendar | SMM Infratech" />
                  <Calendar />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense_voucher"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Expense Voucher | SMM Infratech" />
                  <ExpenseVoucherPage />
                </>
              </ProtectedRoute>
            }
          />
<Route
            path="/admin/quantity/requests"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Quantity Requests | SMM Infratech" />
                  <PendingQuantityRequestsPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/approvedRequests"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Calendar | SMM Infratech" />
                  <ApprovedReq />
                </>
              </ProtectedRoute>
            }
          />

<Route
            path="/inventory/quantityRequeststatus"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Quantity Status | SMM Infratech" />
                  <QuantityRequestStatus />
                </>
              </ProtectedRoute>
            }
          />

        <Route
            path="/inventory/newVendor"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Add Vendor | SMM Infratech" />
                  <NewVendor />
                </>
              </ProtectedRoute>
            }
          />

        <Route
            path="/admin/editrequestapprove"
            element={
              <ProtectedRoute>
                <>
                <PageTitle title="Quantity Request Page | SMM Infratech" />
                <EditQuantityRequestPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-items"
            element={
              <ProtectedRoute>
                <PageWithSiteId>
                <PageTitle title="Request Items | SMM Infratech" />
                  <Request />
                </PageWithSiteId>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-items/status"
            element={
              <ProtectedRoute>
              <PageTitle title="Status | SMM Infratech" />

                  <StatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Profile | SMM Infratech" />
                  <Profile />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/addItems"
            element={
              <ProtectedRoute>
              <PageTitle title="Add Items | SMM Infratech" />
                  <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requestedItems"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Request Page | SMM Infratech" />
                  <RequestedItem />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leaverequest"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Leave Request" />
                  <LeaveManagementPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/summary"
            element={
              <ProtectedRoute>
             <PageTitle title="Summary | SMM Infratech" />

                <SummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/attendance"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Attendance | SMM Infratech" />
                  <Attendance />
                </>
              </ProtectedRoute>
            }
          />
          <Route
          path="/admin/getQuantity"
          element={
            <>
              <PageTitle title="Quantity on Site" />
              <MaterialQuantitiesPage />
            </>
          }
        />
        <Route
          path="/admin/voucher"
          element={
            <>
              <PageTitle title="Quantity on Site" />
              <VoucherConsole />
            </>
          }
        />
        <Route
            path="/forms/form-layout"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Leave | SMM Infratech" />
                  <Leave />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <PageWithSiteId>
                <PageTitle title="Add Quantity | SMM Infratech" />
                  <Inventory />
                </PageWithSiteId>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Settings | SMM Infratech" />
                  <Settings />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chart"
            element={
              <ProtectedRoute>
                <>
                  <PageTitle title="Basic Chart | SMM Infratech" />
                  <Chart />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </DefaultLayout>
      <Footer />


    </SiteProvider>
  );
}

export default App;
