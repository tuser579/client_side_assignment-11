import React from "react";
import axios from "axios";
import useAuth from "./useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const axiosSecure = axios.create({
  baseURL: 'http://localhost:3999',
});

const useAxiosSecure = () => {

    const navigate = useNavigate();
    const { user, logOut } = useAuth();

    // set token in the header for all the api call using axiosSecure hook
    useEffect(() => {

        //  request interceptor
        const requestInterceptor = axiosSecure.interceptors.request.use((config => {

            const token = user?.accessToken; 
            if (token) {
                config.headers.authorization = `Bearer ${token}`;
            }

            return config;
        }));


        // response interceptor 
        const responseInterceptor = axiosSecure.interceptors.response.use(res => {
            return res;
        } , error => {

            const status = error.status;
            if(status === 401 || status === 403){

            console.log('log out the user for bad request')
            logOut()
            .then (() => {
                navigate('/register')
            })
        }
        
        });
        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        }

    }, [user, logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;