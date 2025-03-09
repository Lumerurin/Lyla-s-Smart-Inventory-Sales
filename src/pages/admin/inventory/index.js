import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Layout from "../layout";
import {
  MagnifyingGlass,
  CaretRight,
  TrashSimple,
} from "@phosphor-icons/react";
import AddEventModal from "./components/AddEventModal"; // Import the AddEventModal component
import { Badge } from "./components/badge"; // Import the Badge component

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (newEvent) => {
    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        fetchEvents();
        setIsModalOpen(false);
      } else {
        console.error("Error adding event:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventToDelete.EventID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchEvents();
        setEventToDelete(null);
      } else {
        console.error("Error deleting event:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <div className="w-full flex items-center gap-3">
          <h1 className="text-blueSerenity py-5">Inventory</h1>
        </div>
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center relative">
            <input
              className="text-left pl-14"
              placeholder="Search by name or product number"
            />
            <MagnifyingGlass size={32} className="absolute ml-3" />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 bg-blueSerenity text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-all duration-200 w-fit"
              onClick={() => setIsModalOpen(true)}
            >
              Add new Event
              <CaretRight size={20} />
            </button>
            <button
              className="flex items-center gap-2 bg-blueSerenity hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded-lg shadow-md  w-fit"
              onClick={() => navigate("/admin/inventory/event-inventory")}
            >
              Manage StockIn/StockOut
              <CaretRight size={20} />
            </button>
          </div>
        </div>

        <div className="px-10 max-h-full h-full overflow-x-auto gap-3 flex flex-col">
          <div className="w-full rounded-lg p-5 grid grid-cols-7 items-center">
            <span className="font-semibold text-darkGray text-left">
              Event Title
            </span>
            <span className="font-semibold text-darkGray text-left">
              Schedule ID
            </span>
            <span className="font-semibold text-darkGray text-left">
              Date Start
            </span>
            <span className="font-semibold text-darkGray text-left">
              Date End
            </span>
            <span className="font-semibold text-darkGray text-left">
              Event Type
            </span>
            <span></span>
            <span></span>
          </div>

          <div className="w-full h-full overflow-y-scroll flex flex-col gap-3">
            {events.map((event) => (
              <div
                className="bg-solidWhite w-full rounded-lg p-5 grid grid-cols-7 items-center"
                key={event.EventID}
              >
                <span>{event.EventTitle}</span>
                <span>{event.ScheduleID}</span>
                <span>{event.ScheduleStartDate}</span>
                <span>{event.ScheduleEndDate}</span>
                <span>
                  <Badge id={event.EventTypeID} />
                </span>
                <span></span>
                <span>
                  <TrashSimple
                    size={25}
                    className="cursor-pointer"
                    onClick={() => setEventToDelete(event)}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {isModalOpen && (
        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEvent}
        />
      )}
      {eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the event "
              {eventToDelete.EventTitle}"?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDeleteEvent}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InventoryPage;
