import React from 'react';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';
import ErrorPage from '../Components/ErrorPage/ErrorPage';

const CitizenRoute = ({ children }) => {
    const { loading } = useAuth();
    const { role, roleLoading } = useRole();

    if (loading || roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                    <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
                </div>
            </div>
        );
    }

    if (role !== 'citizen') {
        return <ErrorPage />;
    }

    return children;
};

export default CitizenRoute;