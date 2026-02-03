import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home/Home/Home";
import Coverage from "../pages/Coverage/Coverage";
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
        path: 'coverage',
        Component: Coverage,
        loader: () => fetch('/serviceCenters.json').then(res => res.json())
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
        index: true, 
        Component: CitizenDashboard
      },
      {
        path: 'myIssues',
        Component: MyIssuesPage
      },
      {
        path: 'reportIssue',
        Component: ReportIssuePage
      },
      {
        path: 'profilePage',
        Component: ProfilePage 
      },
      {
        path: 'givenReview',
        Component: GivenReview
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
        path: 'my-payment-history',
        Component: MyPaymentHistory
      }
    ]
  },
  {
    path: '*',
    Component: ErrorPage
  }
]);