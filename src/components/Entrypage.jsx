
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Entrypage.css';

function Entrypage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      month: getCurrentMonth()
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.toUpperCase(),
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
      const response = await fetch('http://localhost:8080/api/stock/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data saved successfully');
        setIsVisible(true);
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Entry Page</h1>
        <button style={{ margin: '20px' }} onClick={() => navigate('/report')} type="button">Report</button>
      </div>

      <div className='EntrypageContainer'>
        <form onSubmit={handleSubmit} className="form-container">
          <h1 style={{ textAlign: "center" }}>NEW DATA</h1>

          <div className="form-group">
            <label style={{ marginRight: '20px' }} htmlFor="bagCode">Bag Code</label>
            <input style={{ textTransform: 'uppercase' }} type="text" id="bagCode" name="bagCode" value={formData.bagCode} onChange={handleInputChange} placeholder='Ex:J001' />
          </div>

          <div className="form-group">
            <label style={{ marginRight: '20px' }} htmlFor="itemCount">Number of Items</label>
            <input type="number" id="itemCount" name="itemCount" value={formData.itemCount} onChange={handleInputChange} placeholder='10' />
          </div>

          <div className="form-group">
            <label style={{ marginRight: '20px' }} htmlFor="type">Type</label>
            <select id="entrypageSelect" name="type" value={formData.type} onChange={handleInputChange}>
              <option value="receipt">RECEIPT</option>
              <option value="issued">ISSUED</option>
            </select>
          </div>

          <div className="form-group">
            <p></p>
            <input type="submit" />
          </div>
        </form>

        <div id='print_container' style={{ display: isVisible ? 'block' : 'none' }}>
          <h1 style={{ textAlign: "center" }}>Report</h1>
          <div id='print_data'>
            <p>Bag Code</p>
            <p>{formData.bagCode}</p>
          </div>
          <div id='print_data'>
            <p>Number of Items</p>
            <p>{formData.itemCount}</p>
          </div>
          <div id='print_data'>
            <p>{formData.type}</p>
          </div>
          <div id='print_data'>
            <p>Month</p>
            <p>{formData.month}</p>
          </div>
          <button
            style={{ fontSize: "15px", background: "green", color: "white", padding: "10px 20px" }}
            onClick={() => { window.print() }}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default Entrypage;
