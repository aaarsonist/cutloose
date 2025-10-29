import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import Footer from '../modules/Footer';
import Login from '../modules/Login';

function LoginPage(){
    return (
    <div className="App">
      <Navigation /> 
      <Login/>
      <section id="about">
        <Footer/>
      </section>
      
    </div>
    )
}

export default LoginPage;