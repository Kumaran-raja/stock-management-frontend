import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Entrypage.css';
import printing from './assets/printing.png'
function Entrypage() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filterType, setFilterType] = useState('receipt'); 
  const [filterBagCode, setFilterBagCode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  };

  const [formData, setFormData] = useState({
    bagCode: '',
    itemCount: '',
    type: 'receipt',
    entryDate: new Date().toISOString().split('T')[0],
    month: getCurrentMonth(),
  });

  const fetchData = async (type) => {
    try {
      const response = await fetch(`https://stock-50026128252.development.catalystappsail.in/api/stock/entries?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setAllData(data);   
        setTableData(data);
      } else {
        console.error("Failed to fetch table data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'entryDate'
          ? value
          : name === 'type'
          ? value.toLowerCase()
          : value.toUpperCase(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, bagCode, itemCount } = formData;

    if (!bagCode || !itemCount || !type) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch('https://stock-50026128252.development.catalystappsail.in/api/stock/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bagCode: formData.bagCode,
          itemCount: formData.itemCount,
          type: formData.type,
          entryDate: formData.entryDate
        }),
      });

      if (response.ok) {
        fetchData(formData.type);
        alert("Data stored successfully.");
      } else {
        alert("Data storage failed.");
      }
      
    } catch (error) {
      alert("failed to Access Backend API");
    }
  };


  const handleFilter = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`https://stock-50026128252.development.catalystappsail.in/api/stock/entries?type=${filterType}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setAllData(data);
      let filtered = data;
  
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
  
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.entryDate);
        const matchesBagCode = filterBagCode ? item.bagCode === filterBagCode : true;
        const matchesFrom = from ? itemDate >= from : true;
        const matchesTo = to ? itemDate <= to : true;
        return matchesBagCode && matchesFrom && matchesTo;
      });
  
      setTableData(filtered);
    } catch (error) {
      // 
    }
  };
  
  useEffect(() => {
    fetchData("receipt");
  }, []);

  const handlePrint = (rowData) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const htmlContent = `
      <html>
        <head>
          <title>Print Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid black;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #007BFF;
              color: white;
            }
          </style>
        </head>
        <body>
          <h2>Stock Entry Report</h2>
          <table>
            <tr><th>Bag Code</th><td>${rowData.bagCode}</td></tr>
            <tr><th>Type</th><td>${formData.type}</td></tr>
            <tr><th>Entry Date</th><td>${rowData.entryDate}</td></tr>
            <tr><th>Item Count</th><td>${rowData.itemCount}</td></tr>
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
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <h1>Entry Page</h1>
        <div>
          <button style={{ margin: '20px',background:"#28a745",padding:"10px",color:"white",border:"none" }} onClick={() => navigate('/report')} type="button">
            Stock Report
          </button>
        </div>
      </div>

      <div className='EntrypageContainer'>
        <form onSubmit={handleSubmit} className="form-container">
          <h1 style={{ textAlign: "center" }}>NEW DATA</h1>

          <div className="form-group">
            <label htmlFor="bagCode">Bag Code</label>
            <input className='userinput' style={{ textTransform: 'uppercase' }} type="text" id="bagCode" name="bagCode" value={formData.bagCode} onChange={handleInputChange} placeholder='Ex:J001' />
          </div>

          <div className="form-group">
            <label htmlFor="itemCount">Number of Items</label>
            <input className='userinput' type="number" id="itemCount" name="itemCount" value={formData.itemCount} onChange={handleInputChange} placeholder='10' />
          </div>

          <div className="form-group">
            <label htmlFor="entryDate">Entry Date</label>
            <input className='userinput' type="date" id="entryDate" name="entryDate" value={formData.entryDate} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select className='userinput' id="entrypageSelect" name="type" value={formData.type} onChange={handleInputChange}>
              <option value="receipt">RECEIPT</option>
              <option value="issued">ISSUED</option>
            </select>
          </div>

          <div className="form-group">
          <p></p>
            <input className='userinput' type="submit" />
          </div>
        </form>

        <div className='scroll_container'>
          <h2 style={{textAlign:"center"}}>ENTRY {filterType.toUpperCase()} DATA REPORT</h2>
          <form onSubmit={handleFilter} >
            <div className='entryfiltergrid'>
            <label>Bag Code:</label>
            <select style={{ padding: "5px",width:"150px",boxSizing:"border-box" }} value={filterBagCode} onChange={(e) => setFilterBagCode(e.target.value)}>
              <option value="">All</option>
              {[...new Set(allData.map(item => item.bagCode))].map((code, i) => (
                <option key={i} value={code}>{code}</option>
              ))}
            </select>
            </div>
            <div className='entryfiltergrid'>
            <label>Type:</label>
            <select style={{ padding: "5px",width:"150px",boxSizing:"border-box" }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="receipt">RECEIPT</option>
              <option value="issued">ISSUED</option>
            </select>
          </div>

            <div className='entryfiltergrid'>
            <label>From Date:</label>
            <input style={{ padding: "5px",width:"150px",boxSizing:"border-box" }} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

            </div>
            <div className='entryfiltergrid'>
            <label>To Date:</label>
            <input style={{ padding: "5px",width:"150px",boxSizing:"border-box" }} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

            </div>
            <div className='entryfiltergrid'>
              <p></p>
            <button style={{ padding: "5px",width:"150px",boxSizing:"border-box" }} type="submit">Search</button>
            </div>
         
          </form>

          <table>
            <thead>
              <tr>
                <th>BAG CODE</th>
                <th>Quantity</th>
                <th>Entry Date</th>
                <th>Print</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.bagCode}</td>
                    <td>{item.itemCount}</td>
                    <td>{item.entryDate}</td>
                    <td><img style={{ cursor: 'pointer', width: '20px' }} onClick={() => handlePrint(item)} src={printing} alt="" width="25px"/></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Entrypage;
