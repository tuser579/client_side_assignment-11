import React from 'react';
import Banner from '../Banner/Banner';
import Brands from '../Brands/Brands';
import Reviews from '../Reviews/Reviews';
import LatestResolvedIssue from '../LatestResolvedIssue/LatestResolvedIssue';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';


const Home = () => {
    return (
        <div>
            <Banner></Banner>
            <LatestResolvedIssue></LatestResolvedIssue>
            <Features></Features>
            <HowItWorks></HowItWorks>
            <Reviews></Reviews>
        </div>
    );
};

export default Home;