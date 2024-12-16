import React, { useEffect, useState } from 'react';
import { useContext } from "react";
import { AuthContext } from '../context/contex';

const DriverList = ({ drivers, handleRemove }) => {

  const { setAddDriver , addDriver } = useContext(AuthContext); 
  const [driveDetails , setDriverDetails] = useState([]);
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); // To handle loading state

  // To handle errors

  // console.log(setAddDriver , "done");


  useEffect(() => {
    const fetchDriverList = async () => {
      setLoading(true); // Indicate loading state
      try {
        // Send GET request to fetch the driver list
        const response = await fetch("https://avani-backend.vercel.app/api/all/driver", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch drivers.");
        }

        const responseData = await response.json();
        console.log(responseData, "res+++++++++++++++");

        setAddDriver(false);
        setDriverDetails(responseData.data);
        console.log("++++done : ", driveDetails);
        
     
        alert("Driver list fetched successfully!");
      } catch (err) {
        console.error("Error:++++++++++++++++++++++++", err);
        setError(err.message || "Failed to fetch drivers. Please try again.");
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    fetchDriverList();
  }, [setAddDriver]);

  return (
    <div className="p-2 bg-gray-50 -z-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-700 text-center sm:mb-10 mb-5">Driver List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {driveDetails.map((driver, index) => (
          <div
            key={driver.id}
            className="bg-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-gray-200 to-slate-200 p-4 rounded-t-lg">
              <h3 className="text-gray-800 text-xl font-semibold">{`${index + 1}. ${driver.driverName}`}</h3>
            </div>

            <div className="mt-4 p-4 text-gray-800">
              <div className="flex justify-between">
                <p className="text-sm">Mobile No:</p>
                <p className="font-semibold">{driver.mobileNumber}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-sm">Vehicle Type:</p>
                <p className="font-semibold">{driver.carModel}</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm">Vehicle No:</p>
                <p className="font-semibold">{driver.rcBookNumber}</p>
              </div>
            </div>

            <div className="mt-6 text-center pb-4">
              <button
                onClick={() => handleRemove(driver.id)} // This should now work if handleRemove is passed correctly
                className="text-white px-6 py-2 rounded-full shadow-md bg-gradient-to-r from-gray-500 to-slate-500 transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverList;