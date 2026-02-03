import React from 'react';
import useAuth from '../../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const SocialLogin = () => {
    const { signInGoogle } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const handleGoogleSignIn = () => {
        signInGoogle()
            .then(async (result) => {
                console.log(result.user);

                try {
                    // check if user already exists in DB
                    const res = await axiosSecure.get(`/singleUser?email=${result.user.email}`);
                    const singleUser = res.data;

                    if (!singleUser) {
                        // user data save in db
                        const userData = {
                            name: result.user.displayName,
                            email: result.user.email,
                            photoURL: result.user.photoURL,
                            phoneNumber: "",
                            address: "",
                            memberSince: new Date(),
                            isPremium: false,
                            isBlocked: false,
                            role: "citizen",
                            issueCount: 0,
                            totalPayment: 0,
                        };

                        await axiosSecure.post("/citizensUser", userData);
                    }

                    // navigate after login
                    navigate(location.state || "/");
                } catch (error) {
                    console.error("Error saving user:", error);
                }
            })
            .catch((error) => {
                console.error("Google sign-in error:", error);
            });
    };


    return (
        <div className='text-center pb-8'>
            <button
                onClick={handleGoogleSignIn}
                className="btn bg-white text-black border-[#e5e5e5] hover:bg-blue-500 hover:text-white">
                <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                Login with Google
            </button>
        </div>
    );
};

export default SocialLogin;