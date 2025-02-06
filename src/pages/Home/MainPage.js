import Layout from "@/layout/Layout";
import React from "react";
import BrokerDashboard from "./BrokerDashboard";
import { useRole } from "@/context/RoleContext";
import CarrierDashboard from "./CarrierDashboard";
import CustomerDashboard from "./CustomerDashboard";
import ShipperDashboard from "./ShipperDashboard";

export default function MainPage() {
  const { user } = useRole();

  return (
    <Layout>
      <div className="">
        {user && user?.role === "shipper" ? (
            <ShipperDashboard/>
        ) : user && user?.role === "broker" ? (
          <BrokerDashboard />
        ) : user && user?.role === "carrier" ? (
          <CarrierDashboard />
        ) : <CustomerDashboard/>}
      </div>
    </Layout>
  );
}