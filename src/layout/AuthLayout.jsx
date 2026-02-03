import React from 'react';
import Logo from '../Components/Logo/Logo';
import { Outlet } from 'react-router';

const AuthLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <div className='py-10'>
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default AuthLayout;