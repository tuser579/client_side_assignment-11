import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useRole = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: allUser = [], isLoading: roleLoading} = useQuery({
        queryKey: ['allUser'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/allUser`);
            return res.data;
        }
    })
    const singUser = allUser.find(all => all.email === user.email);
    const role = singUser?.role;

    return { role , roleLoading };
};

export default useRole;