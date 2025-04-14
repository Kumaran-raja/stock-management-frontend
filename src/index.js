import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/Entrypage';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import ReportPage from './components/StockReport';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path='/' element={<App/>} />
      <Route path='/report' element={<ReportPage/>} />
    </Routes>
  </Router>
 
);

reportWebVitals();
