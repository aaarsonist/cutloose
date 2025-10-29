import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import UserDashboard from '../modules/UserDashboard';
import Footer from '../modules/Footer';

function User(){
    return(
    <div className="App">
      <Navigation />
      <UserDashboard />
      <section id="about">
        <Footer/>
      </section>     
    </div>
    )
}

export default User;