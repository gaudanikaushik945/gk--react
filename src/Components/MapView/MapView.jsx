// import React, { useContext, useEffect, useState, useCallback } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import _ from "lodash";
// import L from "leaflet";
// import { AuthContext } from "../context/contex";
// import { useMap } from "react-leaflet";

// // FlyToLocation component to update the map view on location change
// const FlyToLocation = ({ location }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (location) {
//       map.flyTo([location.lat, location.lon], map.getZoom());
//     }
//   }, [location, map]);

//   return null;
// };

// // Custom icon for markers
// const customIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61168.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// const MapView = () => {
//   const { setAddDriver } = useContext(AuthContext);
//   const [driverDetails, setDriverDetails] = useState([]); // To store driver data
//   const [userLocation, setUserLocation] = useState(null); // Store the user's location
//   const [locationHistory, setLocationHistory] = useState([]);
//   const [previousUserLocation, setPreviousUserLocation] = useState(null); // Store the previous user location
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch driver data from the API
//   const fetchDriverData = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:8000/api/all/driver");
//       if (!response.ok) {
//         throw new Error("Failed to fetch driver data");
//       }
//       const data = await response.json();
//       setDriverDetails(data.data); // Set the fetched driver data
//     } catch (err) {
//       setError("Failed to fetch driver data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Throttle location updates to avoid frequent updates
//   const updateUserLocation = async (lat, lon) => {
//     // Logic for updating user location if needed (e.g., API call to backend)
//   };

//   const updateUserLocationThrottled = useCallback(
//     _.throttle(updateUserLocation, 10000), // Throttle updates to every 10 seconds
//     []
//   );

//   const handleGeolocationError = (error) => {
//     if (error.code === error.PERMISSION_DENIED) {
//       setError("Permission to access location was denied.");
//     } else if (error.code === error.POSITION_UNAVAILABLE) {
//       setError("Location information is unavailable.");
//     } else if (error.code === error.TIMEOUT) {
//       setError("Geolocation request timed out.");
//     } else {
//       setError("An unknown error occurred while fetching the location.");
//     }
//   };



//   // Log user and driver locations every 2 seconds
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       // Log the user's location
//       if (userLocation) {
//         console.log(`User Location: [Lat: ${userLocation.lat}, Lon: ${userLocation.lon}]`);
//       }

//       // Log all driver locations
//       driverDetails.forEach((driver) => {
//         if (driver.location?.lat && driver.location?.lon) {
//           console.log(`${driver.driverName}'s Location: [Lat: ${driver.location.lat}, Lon: ${driver.location.lon}]`);
//         }
//       });
//     }, 1000); // Log every 2 seconds

//     return () => clearInterval(intervalId); // Cleanup on unmount
//   }, [userLocation, driverDetails]); // Depend on `userLocation` and `driverDetails`

//   // Fetch driver data once the component mounts
//   useEffect(() => {
//     fetchDriverData();
//   }, []);










import React, { useContext, useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { AuthContext } from "../context/UserContext";
import { io } from "socket.io-client";

// Connect to socket
const socket = io("https://avani-backend.vercel.app"); // Replace with your backend URL

// FlyToLocation component to update the map view on location change
const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (map && location) {
      map.flyTo([location.lat, location.lon], map.getZoom());
    }
  }, [location, map]);

  return null;
};

// Function to generate a custom icon with dynamic color
const getCustomIcon = (isActive) =>
  new L.Icon({
    iconUrl: isActive
      ? "/icones/red-car.png" // Active icon
      : "/icones/green-car.png", // Inactive icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: isActive ? "active-icon" : "inactive-icon",
  });

const MapView = () => {
  const { setAddDriver } = useContext(AuthContext);
  const [driverDetails, setDriverDetails] = useState([]); // To store driver data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Store the user's location
  const [userId, setUserId] = useState("user123"); // Set your userId here, dynamic if necessary

  // Fetch driver data from the API
  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://avani-backend.vercel.app/api/all/driver");
      if (!response.ok) {
        throw new Error("Failed to fetch driver data");
      }
      const data = await response.json();
      setDriverDetails(data); // Safely set the driver data
    } catch (err) {
      setError("Failed to fetch driver data");
    } finally {
      setLoading(false);
    }
  };

  // Throttle location updates to avoid frequent API calls
  const updateUserLocation = async (lat, lon) => {
    socket.emit("update-location", { userId, location: { lat, lon } });
  };

  const updateUserLocationThrottled = useCallback(
    _.throttle(updateUserLocation, 3000), // Throttle updates to every 3 seconds
    []
  );

  const handleGeolocationError = (error) => {
    if (error.code === error.PERMISSION_DENIED) {
      setError("Permission to access location was denied.");
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      setError("Location information is unavailable.");
    } else if (error.code === error.TIMEOUT) {
      setError("Geolocation request timed out.");
    } else {
      setError("An unknown error occurred while fetching the location.");
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation({ lat, lon }); // Update user location state
        updateUserLocationThrottled(lat, lon); // Throttle the updates to backend
      },
      handleGeolocationError,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updateUserLocationThrottled]);

  // Real-time updates of driver locations from the socket
  useEffect(() => {
    socket.on("location-update", (updatedDriver) => {
      setDriverDetails((prevDriverDetails) =>
        prevDriverDetails.map((driver) =>
          driver._id === updatedDriver._id ? updatedDriver : driver
        )
      );
    });

    return () => {
      socket.off("location-update");
    };
  }, []);

  // Log user and driver locations every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation) {
        console.log(
          `User ID: ${userId}, User Location: [Lat: ${userLocation.lat.toFixed(7)}, Lon: ${userLocation.lon.toFixed(7)}]`
        );
      }

      // Log all driver locations
      driverDetails.forEach((driver) => {
        if (driver.location?.lat && driver.location?.lon) {
          console.log(
            `Driver ID: ${driver._id}, Driver: ${driver.driverName}, Location: [Lat: ${driver.location.lat.toFixed(
              7
            )}, Lon: ${driver.location.lon.toFixed(7)}]`
          );
        }
      });
    }, 1000); // Log every second 

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [userLocation, driverDetails]);

  // Fetch driver data on component mount
  useEffect(() => {
    fetchDriverData();
  }, []);

  return (
    <div className="p-0" style={{ height: "100vh", width: "100vw" }}>
      {error && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            backgroundColor: "red",
            color: "white",
            padding: "10px",
          }}
        >
          {error}
        </div>
      )}

      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lon] : [21.1702, 72.8311]} // Center map on user location
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Fly to the user's location when it changes */}
        <FlyToLocation location={userLocation} />

        {/* User's location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={customIcon}>
            <Popup>
              <strong>Your Location</strong>
              <br />
              Latitude: {userLocation.lat}
              <br />
              Longitude: {userLocation.lon}
            </Popup>
          </Marker>
        )}

        {/* Drivers' locations */}
        {driverDetails.map((driver) => {
          if (driver.location?.lat && driver.location?.lon) {
            return (
              <Marker
                key={driver._id}
                position={[driver.location.lat, driver.location.lon]}
                icon={customIcon}
              >
                <Popup>
                  <strong>{driver.driverName}</strong>
                  <br />
                  Car: {driver.carModel}
                  <br />
                  Latitude: {driver.location.lat}
                  <br />
                  Longitude: {driver.location.lon}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};
export default MapView;










  // Watch the user's location using geolocation
  // useEffect(() => {
  //   const watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       const lat = position.coords.latitude;
  //       const lon = position.coords.longitude;

  //       // Check if the location has changed (if not, do not update the state)
  //       if (!previousUserLocation || previousUserLocation.lat !== lat || previousUserLocation.lon !== lon) {
  //         setUserLocation({ lat, lon });
  //         setPreviousUserLocation({ lat, lon }); // Update previous location to current
  //         updateUserLocationThrottled(lat, lon); // Call the throttled function to avoid frequent API calls
  //       }
  //     },
  //     handleGeolocationError,
  //     { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  //   );

  //   // Cleanup the geolocation watch on unmount
  //   return () => {
  //     navigator.geolocation.clearWatch(watchId);
  //   };
  // }, [previousUserLocation, updateUserLocationThrottled]);
  // useEffect(() => {
  //   const watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       const lat = position.coords.latitude;
  //       const lon = position.coords.longitude;
  //       setUserLocation({ lat, lon });  // Update user location state
  //       updateUserLocationThrottled(lat, lon);  // Throttle the updates to backend

  //       // Log all user locations in history with timestamp
  //       setLocationHistory((prevHistory) => [
  //         ...prevHistory,
  //         { lat, lon, timestamp: new Date().toLocaleTimeString() }
  //       ]);
  //     },
  //     handleGeolocationError,
  //     { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }  // Increased timeout
  //   );

  //   // Cleanup geolocation watch on component unmount
  //   return () => {
  //     navigator.geolocation.clearWatch(watchId);
  //   };
  // }, [updateUserLocationThrottled]);