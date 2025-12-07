import React from 'react';
import Banner from '../Banner/Banner';
import Brands from '../Brands/Brands';
import Reviews from '../Reviews/Reviews';
import LatestResolvedIssue from '../LatestResolvedIssue/LatestResolvedIssue';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';

const reviewsPromise = fetch('/reviews.json').then(res => res.json());

const Home = () => {
    return (
        <div>
            <Banner></Banner>
            {/* <Brands></Brands> */}
            <LatestResolvedIssue></LatestResolvedIssue>
            <Features></Features>
            <HowItWorks></HowItWorks>
            <Reviews reviewsPromise={reviewsPromise}></Reviews>
        </div>
    );
};

export default Home;