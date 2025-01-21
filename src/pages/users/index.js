import Layout from '@/layout/Layout';
import React, { useEffect, useState } from 'react'
import Details from '../api/Listing/Details';
import Link from 'next/link';

export default function index() {

  const [listing, setLisitng] = useState("");
  const [Loading, setLoading] = useState(false);
  const getusers = () => {
    setLoading(true);
    const main = new Details();
    main
      .Usersget("customer")
      .then((r) => {
        setLoading(false);
        setLisitng(r?.data?.data);
      })
      .catch((err) => {
        setLoading(false);
        setLisitng([]);
        console.log("error", err);
      });
  };

  useEffect(() => {
    getusers();
  }, []);
  console.log("listing", listing);
 
  return (
    <Layout page={"Users"}>
      <div className="flex items-center justify-between items-center space-y-4 md:space-y-0">
        <h2 className="text-[#151547] text-lg tracking-[-0.04em] font-medium m-0">Carrier  Listing </h2>
        <Link href="/carriers/add" className="bg-[#1C5FE8] hover:bg-[#0a3fab] inline-block font-medium text-base text-white tracking-[-0.04em] rounded-lg lg:rounded-xl px-5 py-3  ">
          <span className="mr-1">+</span> Add New Carrier
        </Link>
      </div>
      <div className="bg-white mt-6 lg:mt-[30px] px-6 py-[30px] rounded-md lg:rounded-xl border border-black border-opacity-10">
        <div className="overflow-x-auto">
          <table className="w-full border-none">
            <thead>
              <tr className="text-[#9090AD] bg-[#F4F6F8] border border-black border-opacity-10 uppercase ">
                <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">Sr No</th>
                <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">Name</th>
                <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">Role</th>
                <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">Email</th>
                <th className="px-4 py-3  tracking-[-0.04em] text-sm font-medium text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {listing && listing?.map((data, index) => (
                <tr key={data?._id} className="border-b border-black border-opacity-10 font-medium">
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">{data?.id}</td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">{data?.name}</td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">{data?.role}</td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">{data?.email}</td>
                  <td className="px-3 py-5 text-[#1D1D42] tracking-[-0.04em] text-sm font-medium text-left">{data?.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
