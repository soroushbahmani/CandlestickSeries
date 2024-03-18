import React from 'react';
import './App.css'
import Graph from './components/Graph';
import CustomChart2 from './components/CustomChart';

export function App() {
  return (
    <div className='app'>
      <CustomChart2 />
      <br />
      <br />

      <Graph />
    </div>
  );
}



