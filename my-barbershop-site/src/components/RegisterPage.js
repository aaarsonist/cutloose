import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import Footer from '../modules/Footer';
import Register from '../modules/Register';

function RegisterPage(){
    return (
    <div className="App">
      <Navigation /> 
      <Register/ >
      <section id="about">
        <Footer/>
      </section>
      
    </div>
    )
}

export default RegisterPage;