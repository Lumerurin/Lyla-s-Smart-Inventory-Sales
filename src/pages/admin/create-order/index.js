import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import Separator from "../../../components/ui/Separator";
import axios from "axios";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, orderDetails, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Order</h2>
          <button onClick={onClose} disabled={isProcessing}>
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="max-h-40 overflow-y-auto">
            {orderDetails.items.map((item) => (
              <div key={item.ProductID} className="flex justify-between py-1">
                <span>{item.quantity}x {item.ProductName}</span>
                <span>₱{(item.quantity * item.Price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            <span>₱{orderDetails.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>₱{orderDetails.discount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-bold mt-2">
            <span>Total:</span>
            <span>₱{orderDetails.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mt-2">
            <span>Amount Paid:</span>
            <span>₱{orderDetails.amountPaid.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Change:</span>
            <span>₱{orderDetails.change.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{orderDetails.paymentMethod}</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateOrder = () => {
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [username, setUsername] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const data = {
    products: [
      { ProductID: 1, ProductName: "Biscoff Cheesecake", CategoryID: 1, Price: 150 },
      { ProductID: 2, ProductName: "Funfetti", CategoryID: 1, Price: 210 },
      { ProductID: 3, ProductName: "Matcha with Cream Cheese", CategoryID: 1, Price: 180 },
      { ProductID: 4, ProductName: "Nutella Blast", CategoryID: 1, Price: 220 },
      { ProductID: 5, ProductName: "Oreo Cheesecake", CategoryID: 1, Price: 240 },
      { ProductID: 6, ProductName: "Rocky Road", CategoryID: 1, Price: 200 },
      { ProductID: 7, ProductName: "Smores 2.0", CategoryID: 1, Price: 250 },
      { ProductID: 8, ProductName: "Special Crinkles", CategoryID: 1, Price: 100 },
      { ProductID: 9, ProductName: "Brownies", CategoryID: 2, Price: 150 },
      { ProductID: 10, ProductName: "Butterscotch", CategoryID: 2, Price: 170 },
      { ProductID: 11, ProductName: "Revel Bars", CategoryID: 2, Price: 190 },
      { ProductID: 12, ProductName: "Red Velvet Cheesecake", CategoryID: 2, Price: 230 },
      { ProductID: 13, ProductName: "Ham and Cheese Empanada", CategoryID: 3, Price: 120 },
      { ProductID: 14, ProductName: "Small - Korean Cream Cheese Garlic Bread", CategoryID: 3, Price: 140 },
      { ProductID: 15, ProductName: "Medium - Korean Cream Cheese Garlic Bread", CategoryID: 3, Price: 160 },
      { ProductID: 16, ProductName: "Large - Korean Cream Cheese Garlic Bread", CategoryID: 3, Price: 180 },
    ],
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.ProductID === product.ProductID);
      if (existingItem) {
        return prevItems.map(item =>
          item.ProductID === product.ProductID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productID) => {
    setCartItems((prevItems) => {
      return prevItems.filter(item => item.ProductID !== productID);
    });
  };

  const updateQuantity = (productID, quantity) => {
    setCartItems((prevItems) => {
      return prevItems.map(item =>
        item.ProductID === productID
          ? { ...item, quantity: parseInt(quantity) || 1 }
          : item
      );
    });
  };

  const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.Price, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = subtotal - discountAmount;
  const amountPaidValue = parseFloat(amountPaid) || 0;
  const change = amountPaidValue - total;

  const handleCheckout = () => {
    // Validation
    if (cartItems.length === 0) {
      setErrorMessage("Please add items to cart before checkout");
      return;
    }

    if (amountPaidValue < total) {
      setErrorMessage("Amount paid is less than the total amount");
      return;
    }

    if (paymentMethod === 'Digital Wallet' && !referenceNumber) {
      setErrorMessage("Please enter reference number for Digital Wallet payment");
      return;
    }

    setErrorMessage("");
    setModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Create customer record or get existing one
      // For demo, we'll use a fixed customer ID
      const customerID = 6; // Using a customer from the database
      
      // 2. Get employee ID (assuming logged in user has ID stored)
      const employeeID = localStorage.getItem('employeeID') || 6; // Fallback to ID 6
      
      // 3. Get current schedule (using a fixed value for demo)
      const scheduleID = 6;
      
      // 4. Create transaction record
      const transactionResponse = await axios.post('/api/transactions', {
        CustomerID: customerID,
        EmployeeID: employeeID,
        ScheduleID: scheduleID,
        TotalCost: total,
        TransactionDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        CashPayment: amountPaidValue
      });
      
      const transactionID = transactionResponse.data.TransactionID;
      
      // 5. Create order details for each item
      const orderDetailsPromises = cartItems.map(item => {
        return axios.post('/api/orderdetails', {
          TransactionID: transactionID,
          StockID: item.ProductID,  
          Subtotal: item.Price * item.quantity,
          DiscountedPrice: item.Price,  
          Quantity: item.quantity
        });
      });
      
      await Promise.all(orderDetailsPromises);
      
      // 6. Create payment method record if using Digital Wallet
      if (paymentMethod === 'Digital Wallet') {
        await axios.post('/api/paymentmethod', {
          TransactionID: transactionID,
          PaymentMethodID: 2, // 2 for Digital Wallet as per database
          ReferenceNumber: referenceNumber
        });
      }
      
      // Success handling
      setSuccessMessage("Order completed successfully!");
      setModalOpen(false);
      
      // Reset cart and form
      setCartItems([]);
      setDiscount(0);
      setAmountPaid(0);
      setReferenceNumber('');
      
    } catch (error) {
      console.error("Error processing order:", error);
      setErrorMessage("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare order details for modal
  const orderDetails = {
    items: cartItems,
    subtotal: subtotal,
    discount: discountAmount,
    total: total,
    amountPaid: amountPaidValue,
    change: change,
    paymentMethod: paymentMethod
  };

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-blueSerenity py-5">Hello, {username}</h1>
          <div className="flex items-center relative">
            <input
              className="text-left pl-14"
              placeholder="Search by name or product number"
            />
            <MagnifyingGlass size={32} className="absolute ml-3" />
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")}>
              <X size={20} />
            </button>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")}>
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex gap-8 h-full overflow-y-hidden">
          <div className="bg-solidWhite flex rounded-lg shadow-lg p-5 max-h-full h-full flex-col overflow-y-scroll">
            {/* Cookies Section  */}
            <div className="w-full">
              <h2>Cookies</h2>
              <div className="flex gap-5 flex-wrap ">
                {data.products
                  .filter((item) => item.CategoryID === 1)
                  .map((item) => (
                    <div
                      key={item.ProductID}
                      className="cursor-pointer p-4 border rounded-lg"
                      onClick={() => addToCart(item)}
                    >
                      <p className="text-center mt-2">{item.ProductName}</p>
                      <p className="text-center text-gray-600">₱{item.Price}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bars Section */}
            <div className="w-full">
              <h2>Bars</h2>
              <div className="flex gap-5 flex-wrap ">
                {data.products
                  .filter((item) => item.CategoryID === 2)
                  .map((item) => (
                    <div
                      key={item.ProductID}
                      className="cursor-pointer p-4 border rounded-lg"
                      onClick={() => addToCart(item)}
                    >
                      <p className="text-center mt-2">{item.ProductName}</p>
                      <p className="text-center text-gray-600">₱{item.Price}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bread Section */}
            <div className="w-full">
              <h2>Bread</h2>
              <div className="flex gap-5 flex-wrap ">
                {data.products
                  .filter((item) => item.CategoryID === 3)
                  .map((item) => (
                    <div
                      key={item.ProductID}
                      className="cursor-pointer p-4 border rounded-lg"
                      onClick={() => addToCart(item)}
                    >
                      <p className="text-center mt-2">{item.ProductName}</p>
                      <p className="text-center text-gray-600">₱{item.Price}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="p-10 bg-solidWhite rounded-lg shadow-lg w-[30%] h-full flex flex-col">
            <h2>Cart</h2>
            <Separator />

            {/* Scrollable Cart Section */}
            <div className="w-full overflow-x-auto max-h-[25rem] flex-grow">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Product</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.ProductID} className="hover:bg-gray-50">
                      <td className="p-2">{item.ProductName}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.ProductID, e.target.value)}
                          className="w-12 text-center"
                        />
                      </td>
                      <td className="p-2 text-right">₱{(item.quantity * item.Price).toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <button
                          className="text-white bg-red-500 hover:bg-red-600 text-sm px-2 py-1 rounded w-20"
                          onClick={() => removeFromCart(item.ProductID)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex w-full justify-between px-2 py-2">
              <label className="font-semibold">Total</label>
              <label className="font-semibold">
                ₱{subtotal.toFixed(2)}
              </label>
            </div>
            <Separator />

            {/* Payment Details */}
            <div className="flex flex-col gap-2">
              <div className="flex w-full justify-between px-2 py-2 items-center">
                <label className="font-semibold">Discount</label>
                <input
                  className="w-[10rem]"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^0-9.]/g,
                      ""
                    );
                  }}
                />
              </div>

              <div className="flex w-full justify-between px-2 py-2 items-center">
                <label className="font-semibold">Final Total</label>
                <label className="font-semibold w-[10rem] text-right">
                  ₱{total.toFixed(2)}
                </label>
              </div>

              <div className="flex w-full justify-between px-2 py-2 items-center">
                <label className="font-semibold">Amount Paid</label>
                <input
                  className="w-[10rem]"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^0-9.]/g,
                      ""
                    );
                  }}
                />
              </div>

              <div className="flex w-full justify-between px-2 py-2 items-center">
                <label className="font-semibold">Change</label>
                <label className="font-semibold w-[10rem] text-right">
                  ₱{change.toFixed(2)}
                </label>
              </div>

              <div className="flex w-full justify-between px-2 py-2 items-center">
                <label className="font-semibold">Mode of Payment</label>
                <select 
                  className="w-[10rem]"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                </select>
              </div>

              {paymentMethod === 'Digital Wallet' && (
                <div className="flex w-full justify-between px-2 py-2 items-center">
                  <label className="font-semibold">Reference Number</label>
                  <input
                    className="w-[10rem]"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter reference number"
                  />
                </div>
              )}
            </div>

            {/* Checkout Button Aligned to Bottom */}
            <div className="mt-auto flex justify-center">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          orderDetails={orderDetails}
          onConfirm={handleConfirmOrder}
          isProcessing={isProcessing}
        />
      </section>
    </Layout>
  );
};

export default CreateOrder;