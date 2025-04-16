import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Entrypage.css';
import printing from './assets/printing.png'
function Entrypage() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [allData, setAllData] = useState([]);
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

  // Fetch data when the component mounts or when type changes
  useEffect(() => {
    fetchData(formData.type);
  }, [formData.type]);

  const fetchData = async (type) => {
    try {
      const response = await fetch(`https://stock-50025934013.development.catalystappsail.in/api/stock/entries?type=${type}`);
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
      const response = await fetch('https://stock-50025934013.development.catalystappsail.in/api/stock/submit', {
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
        console.log('Data saved successfully');
        fetchData(formData.type); // refresh table
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  
  const [filterBagCode, setFilterBagCode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const handleFilter = (e) => {
    e.preventDefault();
  
    const filtered = allData.filter(item => {
      const itemDate = new Date(item.entryDate);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
  
      const matchesBagCode = filterBagCode ? item.bagCode === filterBagCode : true;
      const matchesFrom = from ? itemDate >= from : true;
      const matchesTo = to ? itemDate <= to : true;
  
      return matchesBagCode && matchesFrom && matchesTo;
    });
  
    setTableData(filtered);
  };
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Entry Page</h1>
        <div>
          <button style={{ margin: '20px' }} onClick={() => navigate('/report')} type="button">
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
            <select id="entrypageSelect" name="type" value={formData.type} onChange={handleInputChange}>
              <option value="receipt">RECEIPT</option>
              <option value="issued">ISSUED</option>
            </select>
          </div>

          <div className="form-group">
          <p></p>
            <input className='userinput' type="submit" />
          </div>
        </form>

        {/* Table section */}
        <div>
          <h2 style={{textAlign:"center"}}>{formData.type.toUpperCase()} DATA</h2>
          <form onSubmit={handleFilter} style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <label>Bag Code:</label>
            <select style={{ padding: "5px" }} value={filterBagCode} onChange={(e) => setFilterBagCode(e.target.value)}>
              <option value="">All</option>
              {/* dynamically populate options from allData */}
              {[...new Set(allData.map(item => item.bagCode))].map((code, i) => (
                <option key={i} value={code}>{code}</option>
              ))}
            </select>

            <label>From:</label>
            <input style={{ padding: "5px" }} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />

            <label>To:</label>
            <input style={{ padding: "5px" }} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

            <button style={{ padding: "5px" }} type="submit">Search</button>
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
                    <td><img   style={{ cursor: 'pointer', width: '20px' }}
  onClick={() => handlePrint(item)} src={printing} alt="" width="25px"/></td>
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
