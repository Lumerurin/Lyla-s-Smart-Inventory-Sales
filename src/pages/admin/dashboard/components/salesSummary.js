import React from "react";
import {
  ChartLine,
  CalendarDots,
  CurrencyCircleDollar,
  ChefHat,
} from "@phosphor-icons/react";

const SalesSummary = () => {
  return (
    <section className="p-4 sm:p-6 md:p-8 bg-solidWhite rounded-lg shadow-lg">
      <h2 className="text-lg sm:text-xl">Sales Summary</h2>

      <div className="py-4 sm:py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sales Summary Items */}
          {[
            {
              icon: <ChartLine size={40} weight="light" />,
              value: "143.3k",
              label: "Today's Sale",
            },
            {
              icon: <CalendarDots size={40} weight="light" />,
              value: "PHP 250,423.00",
              label: "Yearly Total Sales",
            },
            {
              icon: <CurrencyCircleDollar size={40} weight="light" />,
              value: "PHP 68.90k",
              label: "Net Income",
            },
            {
              icon: <ChefHat size={40} weight="light" />,
              value: "50",
              label: "Products",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex gap-3 items-center bg-white p-4 sm:p-5 rounded-lg shadow-lg text-base sm:text-lg w-full"
            >
              {item.icon}
              <div className="flex flex-col">
                <span className="font-semibold text-darkerGray">
                  {item.value}
                </span>
                <label className="text-lunarGray font-semibold">
                  {item.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesSummary;
