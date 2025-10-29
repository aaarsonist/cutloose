import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import Men from '../modules/Men';
import Women from '../modules/Women';
import Footer from '../modules/Footer';

function Services(){
    return (
    <div className="App">
      <Navigation /> 
      <Women/>
      <Men/>
      <section id="about">
        <Footer/>
      </section>      
    </div>
    )
}

export default Services;