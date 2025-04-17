import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Stockpage.css';
import printing from './assets/printing.png'

function StockReport() {
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [monthFilter, setMonthFilter] = useState('');
  const [bagFilter, setBagFilter] = useState('All');

  useEffect(() => {
    fetch("https://stockmanagementapi-50025934013.development.catalystappsail.in/api/stock/report")
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate)) : [];
        setStockData(sorted);

        const currentMonthDate = new Date();
        setMonthFilter(currentMonthDate.toISOString().slice(0, 7)); 
        const filtered = processMonthlyData(sorted, currentMonthDate, 'All');
        setFilteredData(filtered);
      })
      .catch((err) => console.error("Error fetching stock report:", err));
  }, []);

  const processMonthlyData = (data, selectedMonthDate, bagFilterValue) => {
    return data.filter(item => {
      const isSameBag = bagFilterValue === 'All' || item.bagCode === bagFilterValue;
      const entryDate = new Date(item.entryDate);
      return isSameBag &&
        entryDate.getMonth() === selectedMonthDate.getMonth() &&
        entryDate.getFullYear() === selectedMonthDate.getFullYear();
    });
  };

  const handleMonthChange = (e) => {
    const monthStr = e.target.value;
    setMonthFilter(monthStr);
    const selectedDate = new Date(`${monthStr}-01`);
    const updated = processMonthlyData(stockData, selectedDate, bagFilter);
    setFilteredData(updated);
  };

  const handleBagChange = (e) => {
    const selectedBag = e.target.value;
    setBagFilter(selectedBag);
    const selectedDate = new Date(`${monthFilter}-01`);
    const updated = processMonthlyData(stockData, selectedDate, selectedBag);
    setFilteredData(updated);
  };

  const bagCodeList = [...new Set(stockData.map(item => item.bagCode))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Stock Report</h1>
        <button style={{ margin: '20px' }} onClick={() => navigate('/')} type="button">Data Entry</button>
      </div>

      <form style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <div>
          <label htmlFor="bagCode">Select Bag Code:</label>
          <select className="StockSelect" id="bagCode" value={bagFilter} onChange={handleBagChange}>
            <option value="All">All</option>
            {bagCodeList.map((code, idx) => (
              <option key={idx} value={code}>{code}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month">Select Month:</label>
          <input
            type="month"
            id="month"
            value={monthFilter}
            onChange={handleMonthChange}
          />
        </div>
      </form>

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
              <td colSpan="5" style={{ textAlign: 'center' }}>No data found</td>
            </tr>
          ) : (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.bagCode}</td>
                <td>{item.opening}</td>
                <td>{item.receipt}</td>
                <td>{item.issued}</td>
                <td>{item.closing}</td>
                <td><img src={printing} alt="" width="25px"/></td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StockReport;
