import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Stockpage.css';
import printing from './assets/printing.png';

function StockReport() {
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [bagFilter, setBagFilter] = useState('All');

  // 🔁 Load initial data for current month
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = '01';
    const firstDay = `${yyyy}-${mm}-${dd}`;
    const lastDay = today.toISOString().split('T')[0];
  
    setFromDate(firstDay);
    setToDate(lastDay);
  
    fetchData(firstDay, lastDay, 'All');
  }, []);
  

  // 🔁 Fetch function
  const fetchData = (fromDateVal, toDateVal, bagFilterVal) => {
    fetch(`http://localhost:9000/api/stock/report?fromDate=${fromDateVal}&toDate=${toDateVal}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate))
          : [];
        setStockData(sorted);
        const updated = processFilteredData(sorted, fromDateVal, toDateVal, bagFilterVal);
        setFilteredData(updated);
      })
      .catch((err) => console.error("Error fetching stock report:", err));
  };

  const processFilteredData = (data, fromDateVal, toDateVal, bagFilterValue) => {
    return data.filter(item => {
      const entryDate = new Date(item.entryDate);
      const isWithinDateRange =
        (!fromDateVal || entryDate >= new Date(fromDateVal)) &&
        (!toDateVal || entryDate <= new Date(toDateVal));
      const isSameBag = bagFilterValue === 'All' || item.bagCode === bagFilterValue;
      return isWithinDateRange && isSameBag;
    });
  };

  const handleDateChange = (type, value) => {
    if (type === 'from') setFromDate(value);
    if (type === 'to') setToDate(value);
  };

  const handleBagChange = (e) => {
    const selectedBag = e.target.value;
    setBagFilter(selectedBag);
  };

  const handleSearch = () => {
    fetchData(fromDate, toDate, bagFilter);
  };

  const bagCodeList = [...new Set(stockData.map(item => item.bagCode))];
  const handlePrint = (rowData, fromDate, toDate) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const htmlContent = `
      <html>
        <head>
          <title>Stock Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 10px; text-align: left; }
            th { background-color: #007BFF; color: white; }
          </style>
        </head>
        <body>
          <h2>Stock Report</h2>
          <p><strong>From Date:</strong> ${fromDate}</p>
          <p><strong>To Date:</strong> ${toDate}</p>
          <table>
            <tr><th>Bag Code</th><td>${rowData.bagCode}</td></tr>
            <tr><th>Opening Stock</th><td>${rowData.opening}</td></tr>
             <tr><th>Receipt</th><td>${rowData.receipt}</td></tr>
            <tr><th>Issued</th><td>${rowData.issued}</td></tr>
           
            <tr><th>Closing Stock</th><td>${rowData.closing}</td></tr>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 0);
            }
          </script>
        </body>
      </html>
    `;
  
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Stock Report</h1>
        <button style={{ margin: '20px',background:"#007bff",border:"none",color:"white", padding:"10px" }} onClick={() => navigate('/')} type="button">Data Entry</button>
      </div>
      <div className="report_split_container">
      <form id="stockForm">
        <div className="report_grid">
          <label htmlFor="bagCode">Bag Code:</label>
          <select className="StockSelect" id="bagCode" value={bagFilter} onChange={handleBagChange} style={{width:"150px"}}>
            <option value="All">All</option>
            {bagCodeList.map((code, idx) => (
              <option key={idx} value={code}>{code}</option>
            ))}
          </select>
        </div>
        <div className="report_grid">
          <label htmlFor="from">From Date:</label>
          <input
          style={{padding:"5px",width:"150px",boxSizing: "border-box"}}
            type="date"
            id="from"
            value={fromDate}
            onChange={(e) => handleDateChange('from', e.target.value)}
          />
        </div>
        <div className="report_grid">
          <label htmlFor="to">To Date:</label>
          <input
           style={{padding:"5px",width:"150px",boxSizing: "border-box"}}
            type="date"
            id="to"
            value={toDate}
            onChange={(e) => handleDateChange('to', e.target.value)}
          />
        </div>
        <div className="report_grid">
          <p></p>
          <button type="button" onClick={handleSearch} style={{padding:"5px",width:"150px"}}>
            Search
          </button>
        </div>
      </form>
      <div  className="tablescroll">
      <table>
        <thead>
          <tr>
            <th>Bag Code</th>
            <th>Opening</th>
            <th>Receipt</th>
            <th>Issued</th>
            <th>Closing</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No data found</td>
            </tr>
          ) : (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.bagCode}</td>
                <td>{item.opening}</td>
                <td>{item.receipt}</td>
                <td>{item.issued}</td>
                <td>{item.closing}</td>
                <td><img  style={{ cursor: 'pointer' }}
    onClick={() => handlePrint(item, fromDate, toDate)}  src={printing} alt="Print Icon" width="25px" /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}

export default StockReport;

