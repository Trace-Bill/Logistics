import Status from '@/components/Status';
import React, { useEffect, useState } from 'react';
import LocatinTracker from "../tracklocation/index"
import { IoCallSharp } from "react-icons/io5";
import MapComponent from '../tracklocation/MapComponent';
import Details from '../api/Listing/Details';

export default function TrackingMap({ data }) {
  const [routeDetails, setRouteDetails] = useState(null);
  const [status, setStatus] = useState(true);
  const [CurrentLocation, setCurrentLocation] = useState([]);
  const [StartLocation, setStartLocation] = useState(null);
  const [EndLocation, setEndLocation] = useState(null);

  const fetchDirections = async () => {
    const main = new Details();
    setStatus(true);
    try {
      if (data) {
        const response = await main.GetDirection(data?._id);
        if (response?.data?.result) {
          setCurrentLocation(response.data.result.CurrentLocation || []);
          setStartLocation(response.data.result.StartLocation);
          setEndLocation(response.data.result.EndLocation);
          setRouteDetails(response.data.result.routeDetails);
        }
        setStatus(false);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setStatus(false);
    }
  };

  useEffect(() => {
    fetchDirections();
  }, [data]);
  return (
    <div>
      <div className="border border-black border-opacity-10 rounded-md lg:rounded-xl p-3 flex flex-wrap items-center mb-3 lg:mb-4">
        <div className="w-12/12 pl-8 pr-2 relative">
          <svg className="absolute left-2 top-1" width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.66667 6.33333C4.22464 6.33333 3.80072 6.15774 3.48816 5.84518C3.1756 5.53262 3 5.10869 3 4.66667C3 4.22464 3.1756 3.80072 3.48816 3.48816C3.80072 3.17559 4.22464 3 4.66667 3C5.1087 3 5.53262 3.17559 5.84518 3.48816C6.15774 3.80072 6.33334 4.22464 6.33334 4.66667C6.33334 4.88554 6.29023 5.10226 6.20647 5.30447C6.12271 5.50668 5.99994 5.69041 5.84518 5.84518C5.69042 5.99994 5.50668 6.12271 5.30447 6.20647C5.10226 6.29022 4.88554 6.33333 4.66667 6.33333ZM4.66667 0C3.42899 0 2.24201 0.491665 1.36684 1.36683C0.491665 2.242 0 3.42899 0 4.66667C0 8.16667 4.66667 13.3333 4.66667 13.3333C4.66667 13.3333 9.33334 8.16667 9.33334 4.66667C9.33334 3.42899 8.84167 2.242 7.9665 1.36683C7.09133 0.491665 5.90435 0 4.66667 0Z" fill="#1C5FE8" />
          </svg>
          <h3 className="text-black  tracking-[-0.04em] text-sm font-medium m-0">{data?.drop_location}</h3>
        </div>
      </div>
      <div class="mb-3 lg:mb-4">
        <MapComponent
        driverAccept={data?.driverAccept}
          EndLocation={EndLocation}
          routeDetails={routeDetails}
          StartLocation={StartLocation}
          CurrentLocation={CurrentLocation}
        />
      </div>
      <div className="border border-black border-opacity-10 rounded-md lg:rounded-xl mb-3 lg:mb-4">
        <div className="border-b border-black border-opacity-10  px-3 md:px-4 lg:px-5 py-3 lg:py-4 flex flex-wrap justify-between">
          <div className="w-7/12">
            <h3 className="text-[#151547] text-medium text-base tracking-[-0.04em] m-0"><span className="text-[#727272]">Cargo ID:</span> #64756757</h3>
          </div>
          <div className="max-w-[100px]">
            <Status status={"Pick-Up"} />
          </div>
        </div>
        <div className="border-b border-black border-opacity-10 px-3 md:px-4 lg:px-5 py-3 lg:py-4  ">
          {CurrentLocation?.map((item, index) => (
            <div className="flex flex-wrap relative pb-8" key={index}>
              <div className="w-6/12 pl-6 relative">
                <div className="h-[68px] w-[1px] border-r-2 border-black border-dashed border-opacity-20 absolute top-[10px] left-[7px]"></div>
                <div className="absolute rounded-full left-0 top-1 bg-white border-4 border-[#1C5FE8] h-[15px] w-[15px]"></div>
                <h3 className="text-black tracking-[-0.04em] text-sm font-medium m-0">
                  {item?.created_at}
                </h3>
                <p className="text-[#666666] text-[12px] font-medium tracking-[-0.04em] mb-0">
                  {item?.created_at}
                </p>
              </div>
              <div className="w-6/12">
                <h3 className="text-black tracking-[-0.04em] text-sm font-medium m-0">
                  {item?.location}
                </h3>
                <p className="text-[#666666] text-[12px] font-medium tracking-[-0.04em] mb-0">
                  {item?.duration}
                </p>
              </div>
            </div>
          ))}


        </div>
        <div className="px-4 lg:px-5 py-3 lg:py-4 flex flex-wrap justify-between items-center">
          <div className="w-10/12 pl-12 pr-2 relative">
            {/* <div className="absolute rounded-full left-0 top-1 bg-[#D9D9D9] h-[35px] w-[35px]" ></div> */}
            <h3 className="text-black  tracking-[-0.04em] text-sm font-medium m-0 capitalize">{data?.customer_id?.name}</h3>
            <p className="text-[#666666] text-[12px] font-medium tracking-[-0.04em] mb-0">User</p>
          </div>
          <div className="w-2/12 text-right">
            <a href={`tel:${data?.customer_id?.contact}`} >
              <button className="bg-[#1C5FE8] bg-opacity-10 rounded-lg text-[#1C5FE8] px-5 py-2.5">
                {/* <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.48578 1.54494L5.59264 1.21123C5.95794 1.10127 6.35076 1.12795 6.69784 1.28629C7.04492 1.44464 7.32254 1.72383 7.47892 2.0718L8.25492 3.79751C8.38961 4.0969 8.42715 4.43095 8.36227 4.75276C8.2974 5.07457 8.13336 5.36798 7.89321 5.5918L6.71206 6.69237C6.55378 6.84266 6.67378 7.42837 7.25206 8.43066C7.83092 9.43351 8.27835 9.83008 8.48464 9.76837L10.0321 9.29523C10.3457 9.19929 10.6816 9.2039 10.9925 9.30842C11.3034 9.41295 11.5738 9.61214 11.7658 9.87808L12.8686 11.4067C13.0914 11.7153 13.1945 12.0944 13.1589 12.4733C13.1233 12.8523 12.9513 13.2055 12.6749 13.4672L11.8223 14.2747C11.5471 14.5353 11.2077 14.7183 10.8387 14.8049C10.4696 14.8915 10.0842 14.8787 9.72178 14.7678C7.93549 14.2209 6.28121 12.5981 4.73664 9.92208C3.18864 7.24208 2.60406 4.98151 3.01149 3.13466C3.09367 2.76252 3.2736 2.41902 3.53275 2.13959C3.79189 1.86015 4.12088 1.65488 4.48578 1.54494Z" fill="#1C5FE8" />
              </svg> */}
                <IoCallSharp color={"#1C5FE8"} size={18} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
