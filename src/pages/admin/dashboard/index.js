import React, { useContext, useEffect, useState } from "react";
import Layout from "../layout";
import SalesSummary from "./components/salesSummary";
//import StockReport from "./components/stockReport";
import SalesOrder from "./components/salesOrder";

const Dashboard = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <h1 className="text-blueSerenity py-5">Hello, Angela{username}</h1>
        <div className="flex flex-col flex-1 gap-8 overflow-hidden">
          <SalesSummary />
          <div className="flex w-full gap-8 flex-1">
            {/* Left Section */}
            <div className="flex flex-col w-full gap-8 flex-1">
              <div className="bg-solidWhite flex-1 rounded-lg shadow-lg p-10 max-h-[20.125rem]">
                insert chart here
              </div>
              <SalesOrder />
            </div>
            {/* Right Section - Empty Container */}
            <div className="p-10 bg-solidWhite rounded-lg shadow-lg w-[30%] h-full">
              <h2>Best Selling Products</h2>

              <div className="flex flex-col">
                <div className="grid grid-cols-2">
                  <span>Product Name</span>
                  <span>Total Sales</span>
                </div>

                <div className="grid grid-cols-2">
                  <span>Name</span>
                  <span>P 0.00</span>
                </div>

                <div className="grid grid-cols-2">
                  <span>Name</span>
                  <span>P 0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
