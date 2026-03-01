import React from 'react';
import Banner from '../Banner/Banner';
import Brands from '../Brands/Brands';
import Reviews from '../Reviews/Reviews';
import LatestResolvedIssue from '../LatestResolvedIssue/LatestResolvedIssue';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';
import Services from '../Services/Services';
import Partners from '../Partners/Partners';

const Home = () => {
    return (
        <div>
            <Banner></Banner>
            <LatestResolvedIssue></LatestResolvedIssue>
            <Services></Services>
            <Features></Features>
            <HowItWorks></HowItWorks>
            <Partners></Partners>
            <Reviews></Reviews>
        </div>
    );
};

export default Home;