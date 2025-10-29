import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import SalonHeader from '../modules/SalonHeader';
import Footer from '../modules/Footer';

function Home(){
    return(
    <div className="App">
    <Navigation />
      <SalonHeader/>
      <section id="about">
        <Footer/>
      </section>     
    </div>
    )
}

export default Home;