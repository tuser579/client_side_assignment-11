import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layout/AuthLayout";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import ErrorPage from '../Components/ErrorPage/ErrorPage';
import AllIssue from "../pages/All_Issue/AllIssue";
import CitizenDashboard from "../pages/CitizenPage/CitizenDashboard";
import ProfilePage from "../pages/CitizenPage/ProfilePage";
import GivenReview from "../pages/CitizenPage/GivenReview";
import ReportIssuePage from "../pages/CitizenPage/ReportIssuePage";
import MyIssuesPage from "../pages/CitizenPage/MyIssuesPage";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../layout/DashboardLayout";
import AboutUs from "../pages/About_Us/AboutUs";
import Contact from "../pages/Contact/Contact";
import PaymentSuccess from "../pages/CitizenPage/Payment/PaymentSuccess";
import PaymentCancelled from "../pages/CitizenPage/Payment/PaymentCancelled";
import MyPaymentHistory from "../pages/CitizenPage/Payment/MyPaymentHistory";
import IssueDetailsPage from "../pages/IssueDetailsPage/IssueDetailsPage";
import AdminDashboard from "../pages/AdminPage/AdminDashboard";
import ManageUsers from "../pages/AdminPage/ManageUsers";
import StaffManagement from "../pages/AdminPage/StaffManagement";
import PaymentsPage from "../pages/AdminPage/PaymentsPage";
import IssuesManagement from "../pages/AdminPage/IssuesManagement";
import AdminProfilePage from "../pages/AdminPage/AdminProfilePage";
import StaffDashboard from "../pages/StaffPage/StaffDashboard";
import AssignedIssues from "../pages/StaffPage/AssignedIssues";
import StaffProfilePage from "../pages/StaffPage/StaffProfilePage";
import AdminRoute from "./AdminRoute";
import CitizenRoute from "./CitizenRoute";
import StaffRoute from "./StaffRoute";
// import useRole from "../hooks/useRole";

// const { role } = useRole();

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home
      },
      {
        path: '/all-issue',
        Component: AllIssue,
      },
      {
        path: '/aboutus',
        Component: AboutUs
      },
      {
        path: '/contact',
        Component: Contact
      },
      {
        path: '/issueDetailsPage/:id',
        element: <PrivateRoute><IssueDetailsPage></IssueDetailsPage></PrivateRoute>
      }
    ]
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'register',
        Component: Register
      }
    ]
  },
  {
    path: 'dashboard',
    element: <PrivateRoute><DashboardLayout></DashboardLayout></PrivateRoute>,
    children: [
      {
        path: 'citizenDashboard',
        element: <CitizenRoute><CitizenDashboard></CitizenDashboard></CitizenRoute>
      },
      {
        path: 'myIssues',
        element: <CitizenRoute><MyIssuesPage></MyIssuesPage></CitizenRoute>
      },
      {
        path: 'reportIssue',
        element: <CitizenRoute><ReportIssuePage></ReportIssuePage></CitizenRoute>
      },
      {
        path: 'profilePage',
        element: <CitizenRoute><ProfilePage></ProfilePage></CitizenRoute>
      },
      {
        path: 'givenReview',
        element: <CitizenRoute><GivenReview></GivenReview></CitizenRoute>
      },
      {
        path: 'my-payment-history',
        Component: MyPaymentHistory
      },
      {
        path: 'payment-success',
        Component: PaymentSuccess
      },
      {
        path: 'payment-cancelled',
        Component: PaymentCancelled
      },
      {
        path: 'adminDashboard',
        element: <AdminRoute><AdminDashboard></AdminDashboard></AdminRoute>
      },
      {
        path: 'issuesManagement',
        element: <AdminRoute><IssuesManagement></IssuesManagement></AdminRoute>
      },
      {
        path: "manageUsers",
        element: <AdminRoute><ManageUsers></ManageUsers></AdminRoute>
      },
      {
        path: 'paymentsPage',
        element: <AdminRoute><PaymentsPage></PaymentsPage></AdminRoute>
      },
      {
        path: 'staffManagement',
        element: <AdminRoute><StaffManagement></StaffManagement></AdminRoute>
      },
      {
        path: 'adminProfile',
        element: <AdminRoute><AdminProfilePage></AdminProfilePage></AdminRoute>
      },
      {
        path: 'staffDashboard',
        element: <StaffRoute><StaffDashboard></StaffDashboard></StaffRoute>
      },
      {
        path: 'assignedIssues',
        element: <StaffRoute><AssignedIssues></AssignedIssues></StaffRoute>
      },
      {
        path: 'staffProfile',
        element: <StaffRoute><StaffProfilePage></StaffProfilePage></StaffRoute>
      }
    ]
  },
  {
    path: '*',
    Component: ErrorPage
  }
]);