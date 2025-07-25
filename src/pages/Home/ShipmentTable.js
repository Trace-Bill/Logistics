import Popup from "@/components/Popup";
import React, { useEffect, useState, useRef } from "react";
import { FaEye } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import Details from "../api/Listing/Details";
import toast from "react-hot-toast";
import Link from "next/link";
import Status from "@/components/Status";
import { BsDownload } from "react-icons/bs";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FiTruck } from "react-icons/fi";
import ViewShipment from "@/components/ViewShipment";
import Sidepopup from "@/components/Sidepopup";
import TrackingMap from "./TrackingMap";
import VehicalInfo from "./VehicleInfo";
import Delete from "@/components/Delete";
import DriverAssign from "@/components/DriverAssign";
import ConsignmentPopup from "@/components/ConsignmentPopup";
import { createPortal } from "react-dom";
import { MdStarRate } from "react-icons/md";
import NoData from "@/components/NoData";
import { MdLocationOn } from "react-icons/md";
import moment from "moment";
import DispatchSheet from "@/components/DispatchSheet";
import { LuFileSpreadsheet } from "react-icons/lu";
import { MdAssignment } from "react-icons/md";

export default function ShipmentTable({
  shipments,
  getShipments,
  DeleteOption = false,
  role,
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCarrierPopupOpen, setIsCarrierPopupOpen] = useState(false);
  const [isSidePopupOpen, setIsSidePopupOpen] = useState(false);
  const [data, setData] = useState({});
  const [isdropdownopen, setIsdropdownopen] = useState(null);
  const [listing, setLisitng] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState();
  const [selectedShipment, setselectedShipment] = useState();
  const [dropdownPosition, setIsdropdownopendownPosition] = useState({
    top: 0,
    left: 0,
  });
  const[file,setFile]=useState(null);
  const dropdownRefs = useRef({});
  const toogleButton = (id, e) => {
    e.stopPropagation();
    if (isdropdownopen === id) {
      setIsdropdownopen(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setIsdropdownopendownPosition({
        top: rect.top + window.scrollY + button.offsetHeight,
        left: rect.left + window.scrollX - 100,
      });
      setIsdropdownopen(id);
    }
  };
  // console.log("carrier",listing);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isdropdownopen &&
        dropdownRefs.current[isdropdownopen] &&
        !dropdownRefs.current[isdropdownopen].contains(e.target)
      ) {
        setIsdropdownopen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isdropdownopen]);
  // const toogleButton = (id) => {
  //   setIsdropdownopen(isdropdownopen === id ? null : id);

  // };

  const [activeTab, setActiveTab] = useState("shippingInfo");
  const [isConsignmentOpen, setIsConsignmentOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  const getcarriers = () => {
    const main = new Details();
    main
      .Carrierget()
      .then((r) => {
        setLisitng(r?.data?.data);
      })
      .catch((err) => {
        setLisitng([]);
        console.log("error", err);
      });
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  }

  useEffect(() => {
    if (role === "broker") getcarriers();
  }, []);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const openCarrierPopup = () => setIsCarrierPopupOpen(true);
  const closeCarrierPopup = () => setIsCarrierPopupOpen(false);

  const openSidePopup = () => setIsSidePopupOpen(true);
  const closeSidePopup = () => setIsSidePopupOpen(false);

  const ConsignmentOpen = () => setIsConsignmentOpen(true);
  const closeConsignment = () => setIsConsignmentOpen(false);
  
  const DispatchOpen = () => setIsDispatchOpen(true);
  const closeDispatch = () => setIsDispatchOpen(false);

  const DriverOpen = () => setIsDriverOpen(true);
  const closeDriver = () => setIsDriverOpen(false);

  const assigncarrier = async () => {
    try {
      if (!selectedCarrier || selectedCarrier === null) {
        toast.error("Please select a carrier");
        return;
      }
      if (!file || file === null) {
        toast.error("Please upload dispatch sheet");
        return;
      }
  
      const formData = new FormData();
      formData.append("carrier_id", selectedCarrier);
      formData.append("file", file); // Append file properly
  
      const main = new Details();
      const response = await main.DispatchSheet(selectedShipment, formData); // Send FormData
      if (response && response?.data && response?.data?.status) {
        toast.success(response.data.message);
        closeCarrierPopup();
        getShipments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("error", error);
    }
  };
    
  const [bolLoading, setBolLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadBOL = async (shipmentId) => {
    if (bolLoading) {
      return;
    }

    setBolLoading(true);
    setDownloaded(false); // Reset downloaded state before a new download

    const detailsService = new Details();

    try {
      const response = await detailsService.getBOL(shipmentId);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "BOL.pdf"; // Set file name

      // Append to document, trigger download, and remove element
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Delay UI update for better UX
      setBolLoading(false);
      setTimeout(() => {
        setDownloaded(false);
      }, 3000);
    } catch (error) {
      console.error("Error downloading BOL:", error);
      setBolLoading(false);
      setDownloaded(false); // Ensure state resets on error
    }
  };

  const handleShowBOL = async(id) => {
    try{
      const main = new Details();
      const response = await main.ShowBOL(id); 
      if (response && response?.data && response?.data?.status) {
        toast.success(response.data.message);
        getShipments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("error", error);
    }
  }

  return (
    <div className="overflow-x-auto">
      {shipments && shipments?.length > 0 ? (
        <table className="w-full border-none">
          <thead>
            <tr className="text-[#9090AD] bg-[#F4F6F8] border border-black border-opacity-10 uppercase">
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Shipment ID
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Title
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Pickup Location
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Delivery Location
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Shipment Date
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Expected Delivery
              </th>
              <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                Action
              </th>
              {role === "shipper" &&
                <th className="px-4 py-3 tracking-[-0.04em] text-sm font-medium text-left whitespace-nowrap">
                BOL Access
              </th>}
            </tr>
          </thead>
          <tbody>
            {shipments &&
              shipments?.map((shipment, index) => (
                <tr
                  key={index}
                  className="border-b border-black border-opacity-10 font-medium"
                >
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                    {index < 10 ? `SHP-00${index + 1}` : `SHP-0${index + 1}`}
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left capitalize">
                    {shipment?.name}
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left capitalize">
                    {shipment?.pickup_location}
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left capitalize">
                    {shipment?.drop_location}
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left capitalize whitespace-nowrap">
                    <Status status={shipment?.status} />
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                    {shipment?.shippingDate
                      ? moment(shipment.shippingDate).format("DD/MM/YYYY")
                      : "N/A"}
                  </td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                    {shipment?.deliveryDateExpect
                      ? moment(shipment.deliveryDateExpect).format("DD/MM/YYYY")
                      : "N/A"}
                  </td>

                  {/* <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                  {shipment?.driverAccept}
                </td> */}

                  {role === "shipper" ? (
                    <>
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-center">
                      <div className="flex gap-2 items-center">
                        <FaEye
                          size={18}
                          className="cursor-pointer"
                          color="#000"
                          onClick={() => {
                            setData(shipment);
                            openPopup();
                          }}
                        />
                        {shipment?.status !== "delivered" && (
                          <Link href={`/shipment/add/${shipment?._id}`}>
                            <GrEdit
                              size={18}
                              className="cursor-pointer"
                              color="#16A34A"
                            />
                          </Link>
                        )}
                        {shipment?.status === "transit" && (
                          <MdLocationOn
                            size={24}
                            className="cursor-pointer"
                            color="#3b82f6"
                            onClick={() => {
                              setData(shipment);
                              openSidePopup();
                            }}
                          />
                        )}
                        {shipment?.status !== "delivered" && (
                          <Delete
                            step={1}
                            Id={shipment?._id}
                            getShipments={getShipments}
                            role={role}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                      {shipment?.driver_id == null && !shipment?.showBOL ? (
                        "N/A"
                      ) : shipment?.driver_id != null && !shipment?.showBOL ? (
                        <button
                          onClick={() => handleShowBOL(shipment?._id)}
                          className="bg-[#1C5FE8] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#174dc4] transition duration-200"
                        >
                          Show BOL
                        </button>
                      ) : shipment?.driver_id != null && shipment?.showBOL ? (
                        "Access already given"
                      ) : (
                        ""
                      )}
                    </td>
                    </>
                  ) : role === "broker" ? (
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                      <div className="relative">
                        <button onClick={(e) => toogleButton(index, e)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="23"
                              height="23"
                              rx="11.5"
                              stroke="#999999"
                            />
                            <path
                              d="M6 12C6 12.1989 6.07902 12.3897 6.21967 12.5303C6.36032 12.671 6.55109 12.75 6.75 12.75C6.94891 12.75 7.13968 12.671 7.28033 12.5303C7.42098 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.42098 11.6103 7.28033 11.4697C7.13968 11.329 6.94891 11.25 6.75 11.25C6.55109 11.25 6.36032 11.329 6.21967 11.4697C6.07902 11.6103 6 11.8011 6 12ZM11.25 12C11.25 12.1989 11.329 12.3897 11.4697 12.5303C11.6103 12.671 11.8011 12.75 12 12.75C12.1989 12.75 12.3897 12.671 12.5303 12.5303C12.671 12.3897 12.75 12.1989 12.75 12C12.75 11.8011 12.671 11.6103 12.5303 11.4697C12.3897 11.329 12.1989 11.25 12 11.25C11.8011 11.25 11.6103 11.329 11.4697 11.4697C11.329 11.6103 11.25 11.8011 11.25 12ZM16.5 12C16.5 12.1989 16.579 12.3897 16.7197 12.5303C16.8603 12.671 17.0511 12.75 17.25 12.75C17.4489 12.75 17.6397 12.671 17.7803 12.5303C17.921 12.3897 18 12.1989 18 12C18 11.8011 17.921 11.6103 17.7803 11.4697C17.6397 11.329 17.4489 11.25 17.25 11.25C17.0511 11.25 16.8603 11.329 16.7197 11.4697C16.579 11.6103 16.5 11.8011 16.5 12Z"
                              stroke="#999999"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {/* <TbDotsCircleHorizontal size={24}/> */}
                        </button>
                        {isdropdownopen === index &&
                          createPortal(
                            <div
                              ref={(el) => (dropdownRefs.current[index] = el)}
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                position: "absolute",
                              }}
                              className={`after:h-5 after:w-5 after:border-t after:border-l after:bg-white after:absolute after:left-36 after:top-[-9px] after:rotate-45 fixed min-w-[198px] -ml-10 mt-2 border border-black border-opacity-10 rounded-xl z-10 bg-white `}
                            >
                              <ul>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className={`flex gap-2 text-[#1B1B1B] 
                                      ${shipment?.showBOL ? "bg-transparent " : "opacity-50 cursor-not-allowed"} 
                                      border-none text-sm font-medium`}
                                    onClick={() => {
                                      if (!shipment?.showBOL) {
                                        toast.error("BOL access not provided yet");
                                        return;
                                      }
                                      handleDownloadBOL(shipment?._id);
                                    }}
                                  >
                                    {bolLoading ? (
                                      "Downloading..."
                                    ) : downloaded ? (
                                      "Download Complete ✅"
                                    ) : (
                                      <>
                                        Download PDF <BsDownload size={18} color="#1C5FE8" />
                                      </>
                                    )}
                                  </button>
                                </li>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      openPopup();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    View{" "}
                                    <IoInformationCircleOutline size={18} />
                                  </button>
                                </li>
                                {!shipment?.carrier_id && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                      className="flex gap-2 text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                      onClick={() => {
                                        setselectedShipment(shipment?._id);
                                        openCarrierPopup();
                                        setIsdropdownopen(null);
                                      }}
                                    >
                                      Assign Carrier <FiTruck size={18} />
                                      {/* <CiNoWaitingSign size={18} color="#CF0000" /> */}
                                    </button>
                                  </li>
                                )}
                                {shipment?.broker_dispatch_sheet && 
                                 <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      DispatchOpen();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    Dispatch Sheet{" "}
                                    <LuFileSpreadsheet size={16} />
                                  </button>
                                  </li>}
                                {shipment?.status === "transit" && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                      className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                      onClick={() => {
                                        setData(shipment);
                                        openSidePopup();
                                        setIsdropdownopen(null);
                                      }}
                                    >
                                      Tracking{" "}
                                      <IoInformationCircleOutline size={18} />
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>,
                            document.body
                          )}
                      </div>
                    </td>
                  ) : null}

                  {role === "carrier" && (
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                      <div className="relative">
                        <button onClick={(e) => toogleButton(index, e)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="23"
                              height="23"
                              rx="11.5"
                              stroke="#999999"
                            />
                            <path
                              d="M6 12C6 12.1989 6.07902 12.3897 6.21967 12.5303C6.36032 12.671 6.55109 12.75 6.75 12.75C6.94891 12.75 7.13968 12.671 7.28033 12.5303C7.42098 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.42098 11.6103 7.28033 11.4697C7.13968 11.329 6.94891 11.25 6.75 11.25C6.55109 11.25 6.36032 11.329 6.21967 11.4697C6.07902 11.6103 6 11.8011 6 12ZM11.25 12C11.25 12.1989 11.329 12.3897 11.4697 12.5303C11.6103 12.671 11.8011 12.75 12 12.75C12.1989 12.75 12.3897 12.671 12.5303 12.5303C12.671 12.3897 12.75 12.1989 12.75 12C12.75 11.8011 12.671 11.6103 12.5303 11.4697C12.3897 11.329 12.1989 11.25 12 11.25C11.8011 11.25 11.6103 11.329 11.4697 11.4697C11.329 11.6103 11.25 11.8011 11.25 12ZM16.5 12C16.5 12.1989 16.579 12.3897 16.7197 12.5303C16.8603 12.671 17.0511 12.75 17.25 12.75C17.4489 12.75 17.6397 12.671 17.7803 12.5303C17.921 12.3897 18 12.1989 18 12C18 11.8011 17.921 11.6103 17.7803 11.4697C17.6397 11.329 17.4489 11.25 17.25 11.25C17.0511 11.25 16.8603 11.329 16.7197 11.4697C16.579 11.6103 16.5 11.8011 16.5 12Z"
                              stroke="#999999"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {/* <TbDotsCircleHorizontal size={24}/> */}
                        </button>
                        {isdropdownopen === index &&
                          createPortal(
                            <div
                              ref={(el) => (dropdownRefs.current[index] = el)}
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                position: "absolute",
                              }}
                              className={`after:h-5 after:w-5 after:border-t after:border-l after:bg-white after:absolute after:left-36 after:top-[-9px] after:rotate-45 fixed min-w-[198px] -ml-10 mt-2 border border-black border-opacity-10 rounded-xl z-10 bg-white `}
                            >
                              <ul>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className={`flex gap-2 text-[#1B1B1B] 
                                      ${shipment?.showBOL ? "bg-transparent " : "opacity-50 cursor-not-allowed"}
                                      border-none text-sm font-medium`}
                                    onClick={() => {
                                      if (!shipment?.showBOL) {
                                          toast.error("BOL access not provided yet");
                                          return;
                                        }
                                        handleDownloadBOL(shipment?._id);
                                      }}
                                    >
                                    {bolLoading ? (
                                      "Downloading..."
                                    ) : downloaded ? (
                                      "Download Complete ✅"
                                    ) : (
                                      <>
                                        Download PDF <BsDownload size={18} color="#1C5FE8" />
                                      </>
                                    )}
                                  </button>
                                </li>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      openPopup();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    View{" "}
                                    <IoInformationCircleOutline size={18} />
                                  </button>
                                </li>
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      DispatchOpen();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    Dispatch Sheet{" "}
                                    <LuFileSpreadsheet size={16} />
                                  </button>
                                  </li>
                                {shipment?.broker_approve && !shipment?.driver_id?.name && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                    className="flex gap-2 text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      DriverOpen();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    Assign Driver <MdAssignment size={24} />
                                  </button>
                                  </li>
                                )}
                                {shipment?.status === "transit" && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                      className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                      onClick={() => {
                                        setData(shipment);
                                        openSidePopup();
                                        setIsdropdownopen(null);
                                      }}
                                    >
                                      Tracking{" "}
                                      <IoInformationCircleOutline size={18} />
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>,
                            document.body
                          )}
                      </div>
                    </td>
                  )}

                  {role === "customer" && (
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                      <div className="relative">
                        <button onClick={(e) => toogleButton(index, e)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="23"
                              height="23"
                              rx="11.5"
                              stroke="#999999"
                            />
                            <path
                              d="M6 12C6 12.1989 6.07902 12.3897 6.21967 12.5303C6.36032 12.671 6.55109 12.75 6.75 12.75C6.94891 12.75 7.13968 12.671 7.28033 12.5303C7.42098 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.42098 11.6103 7.28033 11.4697C7.13968 11.329 6.94891 11.25 6.75 11.25C6.55109 11.25 6.36032 11.329 6.21967 11.4697C6.07902 11.6103 6 11.8011 6 12ZM11.25 12C11.25 12.1989 11.329 12.3897 11.4697 12.5303C11.6103 12.671 11.8011 12.75 12 12.75C12.1989 12.75 12.3897 12.671 12.5303 12.5303C12.671 12.3897 12.75 12.1989 12.75 12C12.75 11.8011 12.671 11.6103 12.5303 11.4697C12.3897 11.329 12.1989 11.25 12 11.25C11.8011 11.25 11.6103 11.329 11.4697 11.4697C11.329 11.6103 11.25 11.8011 11.25 12ZM16.5 12C16.5 12.1989 16.579 12.3897 16.7197 12.5303C16.8603 12.671 17.0511 12.75 17.25 12.75C17.4489 12.75 17.6397 12.671 17.7803 12.5303C17.921 12.3897 18 12.1989 18 12C18 11.8011 17.921 11.6103 17.7803 11.4697C17.6397 11.329 17.4489 11.25 17.25 11.25C17.0511 11.25 16.8603 11.329 16.7197 11.4697C16.579 11.6103 16.5 11.8011 16.5 12Z"
                              stroke="#999999"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {/* <TbDotsCircleHorizontal size={24}/> */}
                        </button>
                        {isdropdownopen === index &&
                          createPortal(
                            <div
                              ref={(el) => (dropdownRefs.current[index] = el)}
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                position: "absolute",
                              }}
                              className={`after:h-5 after:w-5 after:border-t after:border-l after:bg-white after:absolute after:left-36 after:top-[-9px] after:rotate-45 fixed min-w-[198px] -ml-10 mt-2 border border-black border-opacity-10 rounded-xl z-10 bg-white `}
                            >
                              <ul>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className={`flex gap-2 text-[#1B1B1B] 
                                       ${shipment?.showBOL ? "bg-transparent" : "opacity-50 cursor-not-allowed"}
                                      border-none text-sm font-medium`}
                                    onClick={() => {
                                        if (!shipment?.showBOL) {
                                          toast.error("BOL access not provided yet");
                                          return;
                                        }
                                        handleDownloadBOL(shipment?._id);
                                      }}
                                    >
                                     {bolLoading ? (
                                      "Downloading..."
                                    ) : downloaded ? (
                                      "Download Complete ✅"
                                    ) : (
                                      <>
                                        Download PDF <BsDownload size={18} color="#1C5FE8" />
                                      </>
                                    )}
                                  </button>
                                </li>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      openPopup();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    View{" "}
                                    <IoInformationCircleOutline size={18} />
                                  </button>
                                </li>
                                {shipment?.status == "transit" && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                      className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                      onClick={() => {
                                        setData(shipment);
                                        openSidePopup();
                                        setIsdropdownopen(null);
                                      }}
                                    >
                                      Tracking{" "}
                                      <IoInformationCircleOutline size={18} />
                                    </button>
                                  </li>
                                )}
                                {/* {true && ( */}
                                {shipment?.status === "delivered" && !shipment?.review && (
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      ConsignmentOpen();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    Provide Rating
                                    <MdStarRate size={18} />
                                    {/* <IoInformationCircleOutline size={18} /> */}
                                  </button>
                                </li>
                                )}
                              </ul>
                            </div>,
                            document.body
                          )}
                      </div>
                    </td>
                  )}

                  {role === "admin" && (
                    <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                      <div className="relative">
                        <button onClick={(e) => toogleButton(index, e)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="23"
                              height="23"
                              rx="11.5"
                              stroke="#999999"
                            />
                            <path
                              d="M6 12C6 12.1989 6.07902 12.3897 6.21967 12.5303C6.36032 12.671 6.55109 12.75 6.75 12.75C6.94891 12.75 7.13968 12.671 7.28033 12.5303C7.42098 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.42098 11.6103 7.28033 11.4697C7.13968 11.329 6.94891 11.25 6.75 11.25C6.55109 11.25 6.36032 11.329 6.21967 11.4697C6.07902 11.6103 6 11.8011 6 12ZM11.25 12C11.25 12.1989 11.329 12.3897 11.4697 12.5303C11.6103 12.671 11.8011 12.75 12 12.75C12.1989 12.75 12.3897 12.671 12.5303 12.5303C12.671 12.3897 12.75 12.1989 12.75 12C12.75 11.8011 12.671 11.6103 12.5303 11.4697C12.3897 11.329 12.1989 11.25 12 11.25C11.8011 11.25 11.6103 11.329 11.4697 11.4697C11.329 11.6103 11.25 11.8011 11.25 12ZM16.5 12C16.5 12.1989 16.579 12.3897 16.7197 12.5303C16.8603 12.671 17.0511 12.75 17.25 12.75C17.4489 12.75 17.6397 12.671 17.7803 12.5303C17.921 12.3897 18 12.1989 18 12C18 11.8011 17.921 11.6103 17.7803 11.4697C17.6397 11.329 17.4489 11.25 17.25 11.25C17.0511 11.25 16.8603 11.329 16.7197 11.4697C16.579 11.6103 16.5 11.8011 16.5 12Z"
                              stroke="#999999"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {/* <TbDotsCircleHorizontal size={24}/> */}
                        </button>
                        {isdropdownopen === index &&
                          createPortal(
                            <div
                              ref={(el) => (dropdownRefs.current[index] = el)}
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                position: "absolute",
                              }}
                              className={`after:h-5 after:w-5 after:border-t after:border-l after:bg-white after:absolute after:left-36 after:top-[-9px] after:rotate-45 fixed min-w-[198px] -ml-10 mt-2 border border-black border-opacity-10 rounded-xl z-10 bg-white `}
                            >
                              <ul>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      handleDownloadBOL(shipment?._id);
                                    }}
                                  >
                                    {bolLoading ? (
                                      "Downloading..."
                                    ) : downloaded ? (
                                      "Download Complete ✅"
                                    ) : (
                                      <>
                                        Download PDF <BsDownload size={18} color="#1C5FE8" />
                                      </>
                                    )}
                                  </button>
                                </li>
                                <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                  <button
                                    className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                    onClick={() => {
                                      setData(shipment);
                                      openPopup();
                                      setIsdropdownopen(null);
                                    }}
                                  >
                                    View{" "}
                                    <IoInformationCircleOutline size={18} />
                                  </button>
                                </li>
                                {shipment?.status === "transit" && (
                                  <li className="py-2 tracking-[-0.04em] [&:not(:last-child)]:border-b border-black border-opacity-10 px-4 lg:px-6">
                                    <button
                                      className="flex gap-2 items-center text-[#1B1B1B] bg-transparent border-none text-sm font-medium"
                                      onClick={() => {
                                        setData(shipment);
                                        openSidePopup();
                                        setIsdropdownopen(null);
                                      }}
                                    >
                                      Tracking{" "}
                                      <IoInformationCircleOutline size={18} />
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>,
                            document.body
                          )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <NoData
          Heading={"No Shipment available"}
          content={
            "You don't have any data to view at the moment. Please come later"
          }
        />
      )}
      <Popup
        isOpen={isCarrierPopupOpen}
        onClose={closeCarrierPopup}
        size={"max-w-[800px]"}
      >
        <div className="lg:px-2.5 lg:pb-2.5">
          <div className="overflow-x-auto mt-8">
            <table className="w-full border-none">
              <thead>
                <tr className="text-[#9090AD] bg-[#F4F6F8] border border-black border-opacity-10 uppercase ">
                  <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">
                    Carrier ID{" "}
                  </th>
                  <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">
                    Carrier Name
                  </th>
                  <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">
                    Carrier Email
                  </th>
                  <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">
                    Company Name
                  </th>
                  <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {listing &&
                  listing?.map((carrier, index) => (
                    <tr
                      key={index}
                      className="border-b  border-black border-opacity-10 font-medium"
                    >
                      <td className="px-4 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                        {carrier?.carrier_id_given}
                      </td>
                      <td className="px-4 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                        {carrier?.career_id_ref?.name}
                      </td>
                      <td className="px-4 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                        {carrier?.career_id_ref?.email}
                      </td>
                      <td className="px-4 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">
                        {carrier?.companyname}
                      </td>
                      <td className="px-4 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-center">
                        <button
                          onClick={() => {
                            setSelectedCarrier(carrier?.career_id_ref?._id);
                          }}
                        >
                          {selectedCarrier &&
                            selectedCarrier === carrier?.career_id_ref?._id ? (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                width="24"
                                height="24"
                                rx="12"
                                fill="#0BB635"
                              />
                              <path
                                d="M4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM17.457 9.457L16.043 8.043L11 13.086L8.207 10.293L6.793 11.707L11 15.914L17.457 9.457Z"
                                fill="white"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10ZM10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM15.457 7.457L14.043 6.043L9 11.086L6.207 8.293L4.793 9.707L9 13.914L15.457 7.457Z"
                                fill="#999999"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* File Uploader */}
          <div className="mt-6 flex justify-center">
            <input
              type="file"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              onChange={(e) => handleFileUpload(e)}
            />
          </div>
          <button
            className="bg-[#1C5FE8] hover:bg-[#0a3fab] px-10 py-2.5 text-white flex mx-auto mt-6 rounded-lg"
            onClick={() => {
              assigncarrier();
            }}
          >
            Save
          </button>
        </div>
      </Popup>
      <Sidepopup isOpen={isSidePopupOpen} onClose={closeSidePopup}>
        <div className="px-4 lg:px-8 pt-6 lg:pt-12 pb-4 lg:pb-8 flex justify-between items-center">
          <h2 className="text-[#151547] text-medium text-lg md:text-2xl tracking-[-0.04em]">
            {data?.name}
          </h2>
          {/* <button
            onClick={() => {
              setActiveTab("vehicleInfo");
            }}
            className="inline-block text-[#1C5FE8] px-3 py-2 border border-[#1C5FE81A] rounded-md lg:rounded-xl hover:bg-gray-100 focus:outline-none focus:ring focus:ring-offset-.5 focus:ring-[#1C5FE8]"
          >
            {" "}
            View Driver’s details
          </button> */}
        </div>

        <div className="border-b border-black border-opacity-10 px-6">
          <ul className="flex">
            <li>
              <button
                onClick={() => setActiveTab("shippingInfo")}
                className={`px-4 py-2.5 text-[#646567] tracking-[-0.04em] text-base font-medium ${activeTab === "shippingInfo"
                  ? "border-b border-[#1C5FE8]"
                  : "border-b border-[#1C5FE8] border-opacity-0"
                  }`}
              >
                {" "}
                Shipping Info
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("vehicleInfo")}
                className={`px-4 py-2.5 text-[#646567] tracking-[-0.04em] text-base font-medium ${activeTab === "vehicleInfo"
                  ? "border-b border-[#1C5FE8]"
                  : "border-b border-[#1C5FE8] border-opacity-0"
                  }`}
              >
                Driver Info
              </button>
            </li>
            {/* <li><button onClick={() => setActiveTab("document")} className={`px-4 py-2.5 text-[#646567] tracking-[-0.04em] text-base font-medium ${activeTab === "document" ? "border-b border-[#1C5FE8]" : "border-b border-[#1C5FE8] border-opacity-0"}`} >Document</button></li>
            <li><button onClick={() => setActiveTab("billing")} className={`px-4 py-2.5 text-[#646567] tracking-[-0.04em] text-base font-medium ${activeTab === "billing" ? "border-b border-[#1C5FE8]" : "border-b border-[#1C5FE8] border-opacity-0"}`} >Billing</button></li> */}
          </ul>
        </div>
        <div className="p-4 lg:p-6">
          {activeTab === "shippingInfo" && <TrackingMap data={data} />}
          {activeTab === "vehicleInfo" && (
            <div>
              <VehicalInfo data={data} />
            </div>
          )}
        </div>
      </Sidepopup>
      <ViewShipment isOpen={isPopupOpen} onClose={closePopup} data={data} />
      <ConsignmentPopup
        isOpen={isConsignmentOpen}
        onClose={closeConsignment}
        data={data}
        getShipments={getShipments}
      />
      <DriverAssign
        isOpen={isDriverOpen}
        onClose={closeDriver}
        data={data}
        getShipments={getShipments}
      />
      <DispatchSheet
      isOpen={isDispatchOpen}
      onClose={closeDispatch}
      shipment={data}
      getShipments={getShipments}
      role={role}
      />
    </div>
  );
}
