import React from 'react';
import Header from './src/componenets/resume/Header'  ;
import { Body } from './upload.jsx';
import Footer from './src/componenets/resume/Footer'  ;




function App() {
  return (
    <>
      <Header isLoggedIn={false} />
      <Body />
      <Footer isLoggedIn={false} />
     
    </>
  );
}

export default App;
