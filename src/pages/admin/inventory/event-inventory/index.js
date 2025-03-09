import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout";
import {
  CaretLeft,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

const EventInventoryPage = () => {
  const [stockToggle, setStockToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockInData, setStockInData] = useState([]);
  const [stockOutData, setStockOutData] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStockIn, setDeleteStockIn] = useState(null); // New state for deleting stock-in
  const [editStockIn, setEditStockIn] = useState(null); // New state for editing stock-in
  const [newStockIn, setNewStockIn] = useState({
    ProductID: '',
    Quantity: '',
    Price: '',
    ExpiryDate: ''
  });
  const [showAddStockIn, setShowAddStockIn] = useState(false);
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
  
    const apiUrl = 'http://localhost:5000/api/stockin';
    const stockOutUrl = 'http://localhost:5000/api/stockout';
    const eventDetailsUrl = 'http://localhost:5000/api/eventdetails';
  
    console.log(`Fetching data from: ${apiUrl}`);
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched stock-in data:', data);
        setStockInData(data);
      })
      .catch(error => console.error('Error fetching stock-in data:', error));
  
    fetch(stockOutUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched stock-out data:', data);
        setStockOutData(data);
      })
      .catch(error => console.error('Error fetching stock-out data:', error));
  
    fetch(eventDetailsUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched event details:', data);
        setEventDetails(data[0]); // Assuming you want the first event details
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching event details:', error);
        setError(error.message);
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteStockIn = (item) => {
    setDeleteStockIn(item);
  };
  
  const confirmDeleteStockIn = () => {
    const apiUrl = `http://localhost:5000/api/stockin/${deleteStockIn.StockID}`;
    fetch(apiUrl, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Change to response.text() to handle non-JSON response
      })
      .then(data => {
        console.log('Stock-in item deleted:', data);
        fetchData(); // Refresh data after deletion
        setDeleteStockIn(null);
      })
      .catch(error => console.error('Error deleting stock-in item:', error));
  };

  const handleEditStockIn = (item) => {
    setEditStockIn({
      ...item,
      ExpiryDate: new Date(item.ExpiryDate).toISOString().split('T')[0] // Format date to "yyyy-MM-dd"
    });
  };

  const handleSaveStockIn = () => {
    const apiUrl = `http://localhost:5000/api/stockin/${editStockIn.StockID}`;
    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editStockIn),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Change to response.text() to handle non-JSON response
      })
      .then(data => {
        console.log('Stock-in item updated:', data);
        fetchData(); // Refresh data after update
        setEditStockIn(null);
      })
      .catch(error => console.error('Error updating stock-in item:', error));
  };

  const handleAddStockIn = () => {
    const apiUrl = 'http://localhost:5000/api/stockin';
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStockIn),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Change to response.text() to handle non-JSON response
      })
      .then(data => {
        console.log('Stock-in item added:', data);
        fetchData(); // Refresh data after addition
        setNewStockIn({ ProductID: '', Quantity: '', Price: '', ExpiryDate: '' });
        setShowAddStockIn(false); // Close the popup after adding
      })
      .catch(error => console.error('Error adding stock-in item:', error));
  };

  const filteredStocks = stockInData.filter(
    (item) =>
      item?.ProductName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.StockID?.toString().includes(searchQuery)
  );

  const filteredStockOuts = stockOutData.filter(
    (item) =>
      item?.ProductName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <div className="w-full flex items-center gap-3">
          <div
            className="bg-lightGray p-1 rounded-full hover:scale-110 transition-all duration-150 hover:cursor-pointer"
            onClick={() => navigate('/admin/inventory')}
          >
            <CaretLeft size={25} />
          </div>
          <h1 className="text-blueSerenity py-5">Event Inventory</h1>
        </div>

        <div className="grid grid-cols-2 w-full gap-[20rem] mb-5">
          <div className="w-full grid gap-3">
            <div className="w-full grid grid-cols-2 ">
              <span className="font-semibold text-darkerGray text-lg">
                Event name
              </span>
              <span className="text-darkGray">{eventDetails.EventTitle}</span>
            </div>
          </div>
        
          <div className="w-full grid gap-3">
            <div className="w-full grid grid-cols-2">
              <span className="font-semibold text-darkerGray text-lg">
                Schedule ID
              </span>
              <span className="text-darkGray">#{eventDetails.ScheduleID}</span>
            </div>

            <div className="w-full grid grid-cols-2">
              <span className="font-semibold text-darkerGray text-lg">
                Date start
              </span>
              <span className="text-darkGray">{new Date(eventDetails.ScheduleStartDate).toLocaleDateString()}</span>
            </div>
            <div className="w-full grid grid-cols-2 grid-row-">
              <span className="font-semibold text-darkerGray text-lg">
                Date end
              </span>
              <span className="text-darkGray">{new Date(eventDetails.ScheduleEndDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full h-full overflow-y-hidden">
          <div className="w-full bg-solidWhite flex items-center justify-between p-5 rounded-t-lg">
            <div className="w-[24rem] flex items-center justify-between mb-4">
              <span
                className={`font-semibold cursor-pointer pb-1 transition-all hover:scale-110 ${
                  !stockToggle
                    ? "border-b-2 border-blueSerenity scale-110"
                    : "text-gray-500"
                }`}
                onClick={() => setStockToggle(false)}
              >
                Stock In
              </span>

              <span
                className={`font-semibold cursor-pointer pb-1 transition-all hover:scale-110 ${
                  stockToggle
                    ? "border-b-2 border-blueSerenity scale-110"
                    : "text-gray-500"
                }`}
                onClick={() => setStockToggle(true)}
              >
                Stock Out
              </span>
            </div>

            <div className="flex items-center relative mb-4">
              <MagnifyingGlass size={24} className="absolute left-4" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-2 border border-lightGray rounded-md text-black placeholder-darkGray focus:outline-none focus:ring-2 focus:ring-blueSerenity text-left"
                placeholder="Search by name or product number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full  flex items-center justify-between p-5 ">
            <div className="w-full grid grid-cols-6">
              <span className="font-semibold text-lg text-darkerGray">
                Product Name
              </span>
              <span className="font-semibold text-lg text-darkerGray">
                Number of Stocks
              </span>
              <span className="font-semibold text-lg text-darkerGray">
                Expiry Date
              </span>
              <span className="font-semibold text-lg text-darkerGray">
                Price
              </span>
              <span className="font-semibold text-lg text-darkerGray">
              </span>
              <span className="font-semibold text-lg text-darkerGray">
              </span>
            </div>
          </div>

          {/* Alternate Bg color starts */}
          <div className="w-full h-full overflow-y-scroll">
            {!stockToggle ? (
              filteredStocks.length > 0 ? (
                filteredStocks.map((item, index) => (
                  <div
                    key={item.StockID}
                    className={`w-full flex items-center justify-between p-5 ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="w-full grid grid-cols-6 text-lg text-darkerGray">
                      <span>{item.ProductName}</span>
                      <span>{item.Quantity}</span>
                      <span>{new Date(item.ExpiryDate).toLocaleDateString()}</span> {/* Format ExpiryDate */}
                      <span>₱{parseFloat(item.Price).toFixed(2)}</span> {/* Ensure Price is a number */}
                      <span>
                      <PencilSimple
                        size={24}
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleEditStockIn(item)}
                      />
                    </span>
                    <span>
                      <Trash
                        size={24}
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDeleteStockIn(item)}
                      />
                    </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-darkGray">
                  No results found
                </div>
              )
            ) : (
              filteredStockOuts.length > 0 ? (
                filteredStockOuts.map((item, index) => (
                  <div
                    key={index}
                    className={`w-full flex items-center justify-between p-5 ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="w-full grid grid-cols-5 text-lg text-darkerGray">
                      <span>{item.ProductName}</span>
                      <span>{item.NumberOfStocks}</span>
                      <span>{new Date(item.ExpiryDate).toLocaleDateString()}</span> {/* Format ExpiryDate */}
                      <span>₱{parseFloat(item.Price).toFixed(2)}</span> {/* Ensure Price is a number */}
                      <span>
                        <PencilSimple
                          size={24}
                          className="text-blue-500 cursor-pointer"
                        />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-darkGray">
                  No results found
                </div>
              )
            )}
          </div>
          <div className="flex items-center w-full gap-3 py-5">
            <button
              onClick={() => setShowAddStockIn(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Stock In
            </button>
          </div>
        </div>

        {editStockIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Edit Stock In</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={editStockIn.Quantity}
                  onChange={(e) => setEditStockIn({ ...editStockIn, Quantity: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={editStockIn.Price}
                  onChange={(e) => setEditStockIn({ ...editStockIn, Price: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={editStockIn.ExpiryDate}
                  onChange={(e) => setEditStockIn({ ...editStockIn, ExpiryDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setEditStockIn(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStockIn}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteStockIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this stock-in item?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setDeleteStockIn(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStockIn}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddStockIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Add Stock In</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Product ID</label>
                <input
                  type="number"
                  value={newStockIn.ProductID}
                  onChange={(e) => setNewStockIn({ ...newStockIn, ProductID: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newStockIn.Quantity}
                  onChange={(e) => setNewStockIn({ ...newStockIn, Quantity: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={newStockIn.Price}
                  onChange={(e) => setNewStockIn({ ...newStockIn, Price: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={newStockIn.ExpiryDate}
                  onChange={(e) => setNewStockIn({ ...newStockIn, ExpiryDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddStockIn(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStockIn}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default EventInventoryPage;