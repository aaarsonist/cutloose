import React from 'react';
import '../App.css';
import Navigation from '../modules/Navigation';
import AdminDashboard from '../modules/AdminDashboard';
import Footer from '../modules/Footer';

function Admin(){
    return(
    <div className="App">
      <Navigation />
      <AdminDashboard />
      <section id="about">
        <Footer/>
      </section>     
    </div>
    )
}

export default Admin;