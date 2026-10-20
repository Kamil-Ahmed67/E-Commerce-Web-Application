"use client";

import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { FaRegEdit, FaTrash } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { AnimatePresence, motion as Motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getDeliveryCharges,
  getDistricts,
  addSubDistrict,
  updateSubDistrict,
  deleteSubDistrict,
} from "@/lib/server/deliveryChargeData";

function DistrictSelect({ districts, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = districts.find((d) => d.Id === Number(value));

  const filtered = districts.filter((d) =>
    d.Name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (d) => {
    onChange(d.Id);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((p) => !p)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer flex items-center justify-between bg-white focus-within:ring-2 focus-within:ring-blue-500"
      >
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search district..."
            className="flex-1 outline-none text-sm bg-transparent"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={selected ? "text-gray-800" : "text-gray-400"}>
            {selected ? selected.Name : "Select District"}
          </span>
        )}
        {selected && !open ? (
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 ml-1">
            <IoClose size={14} />
          </button>
        ) : (
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <Motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            ) : (
              filtered.map((d) => (
                <li
                  key={d.Id}
                  onClick={() => handleSelect(d)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${Number(value) === d.Id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                >
                  {d.Name}
                </li>
              ))
            )}
          </Motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function DistrictFilterDropdown({ districts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const filtered = districts.filter((d) =>
    d.Name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (name) => {
    onChange(name === value ? "" : name);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        title="Filter by district"
        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition
          ${value
            ? "bg-white text-blue-700 border-white shadow"
            : "bg-white/10 text-white border-white/30 hover:bg-white/20"
          }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <span className="max-w-28 truncate">{value || "District"}</span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
            className="ml-1 text-blue-400 hover:text-blue-600"
          >
            <IoClose size={13} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
            <ul className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-xs text-gray-400">No results</li>
              ) : (
                filtered.map((d) => (
                  <li
                    key={d.Id}
                    onClick={() => handleSelect(d.Name)}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700
                      ${value === d.Name ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                  >
                    {d.Name}
                    {value === d.Name && (
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                ))
              )}
            </ul>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const emptyForm = { DisId: "", SubDistrictName: "", Amount: "", Remarks: "" };

export default function DeliveryChargePage() {
  const [data, setData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [addSaving, setAddSaving] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    Promise.all([getDeliveryCharges(), getDistricts()]).then(([rows, distRows]) => {
      setData(rows);
      setDistricts(distRows);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.DistrictName?.toLowerCase().includes(q) ||
      item.SubDistrictName?.toLowerCase().includes(q) ||
      String(item.Amount).includes(q) ||
      item.Remarks?.toLowerCase().includes(q);
    const matchesDistrict = districtFilter ? item.DistrictName === districtFilter : true;
    return matchesSearch && matchesDistrict;
  });

  // ── Add ──
  const handleFormChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleAdd = async () => {
    if (!form.DisId || !form.SubDistrictName || !form.Amount) return;
    setAddSaving(true);
    try {
      const payload = {
        DisId: Number(form.DisId),
        Name: form.SubDistrictName,
        Amount: Number(form.Amount),
        Remarks: form.Remarks,
      };
      const newId = await addSubDistrict(payload);
      const district = districts.find((d) => d.Id === Number(form.DisId));
      setData((prev) => [
        ...prev,
        { Id: newId, DistrictName: district?.Name || "", SubDistrictName: form.SubDistrictName, Amount: Number(form.Amount), Remarks: form.Remarks },
      ]);
      setForm(emptyForm);
      setShowModal(false);
      toast.success("Delivery charge added");
    } catch {
      toast.error("Failed to add");
    } finally {
      setAddSaving(false);
    }
  };

  // ── Edit ──
  const handleEdit = (item) => {
    setEditItem(item);
    setEditValues({
      DisId: districts.find((d) => d.Name === item.DistrictName)?.Id || "",
      SubDistrictName: item.SubDistrictName,
      Amount: item.Amount,
      Remarks: item.Remarks,
    });
  };

  const handleEditChange = (field, value) => setEditValues((p) => ({ ...p, [field]: value }));

  const handleEditSave = async () => {
    if (!editValues.DisId || !editValues.SubDistrictName || !editValues.Amount) return;
    setEditSaving(true);
    try {
      const payload = {
        Id: editItem.Id,
        DisId: Number(editValues.DisId),
        Name: editValues.SubDistrictName,
        Amount: Number(editValues.Amount),
        Remarks: editValues.Remarks,
      };
      await updateSubDistrict(payload);
      const district = districts.find((d) => d.Id === Number(editValues.DisId));
      setData((prev) =>
        prev.map((item) =>
          item.Id === editItem.Id
            ? { ...item, DistrictName: district?.Name || item.DistrictName, SubDistrictName: editValues.SubDistrictName, Amount: Number(editValues.Amount), Remarks: editValues.Remarks }
            : item
        )
      );
      setEditItem(null);
      setEditValues({});
      toast.success("Updated successfully");
    } catch {
      toast.error("Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteSubDistrict(deleteId);
      setData((prev) => prev.filter((item) => item.Id !== deleteId));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="px-2 py-2">
      <div className="rounded-md font-roboto overflow-hidden shadow-sm border border-gray-200">

        {/* Toolbar */}
        <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="relative min-w-55 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search district, area, price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-transparent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <IoClose size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DistrictFilterDropdown
              districts={districts}
              value={districtFilter}
              onChange={setDistrictFilter}
            />
            <button onClick={() => setShowModal(true)} className="text-white hover:text-blue-200 transition" title="Add new entry">
              <IoMdAddCircle size={26} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[680px] overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b-2 border-gray-200">
                {["SL", "District", "Area / City", "Price (৳)", "Remarks", "Actions"].map((h) => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2">Loading...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 text-base font-medium">
                    {search ? `No results found for "${search}"` : "No delivery charges found"}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-800">{item.DistrictName}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.SubDistrictName}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-gray-800">৳{item.Amount}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
                        item.Remarks?.toLowerCase().includes("inside")
                          ? "text-blue-700 bg-blue-100 border-blue-300"
                          : "text-green-700 bg-green-100 border-green-300"
                      }`}>
                        {item.Remarks}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-indigo-600 hover:text-indigo-800 transition" title="Edit">
                          <FaRegEdit size={14} />
                        </button>
                        <button onClick={() => setDeleteId(item.Id)} className="p-1.5 text-red-500 hover:text-red-700 transition" title="Delete">
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editItem && (
          <Motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditItem(null)}
          >
            <Motion.div onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white shadow-2xl rounded-lg w-full max-w-md border border-gray-200"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800">Edit Delivery Charge</h3>
                <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 transition"><IoClose size={20} /></button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District <span className="text-red-500">*</span></label>
                  <DistrictSelect districts={districts} value={editValues.DisId} onChange={(id) => handleEditChange("DisId", id)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Area / City <span className="text-red-500">*</span></label>
                  <input type="text" value={editValues.SubDistrictName} onChange={(e) => handleEditChange("SubDistrictName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (৳) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={editValues.Amount} onChange={(e) => handleEditChange("Amount", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                  <input type="text" value={editValues.Remarks} onChange={(e) => handleEditChange("Remarks", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition text-gray-700">Cancel</button>
                <button onClick={handleEditSave} disabled={editSaving || !editValues.DisId || !editValues.SubDistrictName || !editValues.Amount}
                  className="px-5 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Modal ── */}
      <AnimatePresence>
        {showModal && (
          <Motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <Motion.div onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white shadow-2xl rounded-lg w-full max-w-md border border-gray-200"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800">Add Delivery Charge</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition"><IoClose size={20} /></button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District <span className="text-red-500">*</span></label>
                  <DistrictSelect districts={districts} value={form.DisId} onChange={(id) => handleFormChange("DisId", id)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Area / City <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Mirpur" value={form.SubDistrictName} onChange={(e) => handleFormChange("SubDistrictName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (৳) <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="e.g. 60" min="0" value={form.Amount} onChange={(e) => handleFormChange("Amount", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                  <input type="text" placeholder="e.g. Inside Dhaka" value={form.Remarks} onChange={(e) => handleFormChange("Remarks", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition text-gray-700">Cancel</button>
                <button onClick={handleAdd} disabled={addSaving || !form.DisId || !form.SubDistrictName || !form.Amount}
                  className="px-5 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {addSaving ? "Adding..." : "Add"}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <Motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
          >
            <Motion.div onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md border border-gray-200"
            >
              <Motion.div className="mx-auto mb-1 flex justify-center"
                initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <svg className="w-14 h-14 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <Motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01M6 20h12c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.268 17c-.77 1.333.192 3 1.732 3z"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </Motion.div>
              <h3 className="text-xl font-bold text-gray-700 text-center mb-2">Confirm Deletion</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                You are about to delete this entry. This action <span className="text-red-500 font-medium">cannot</span> be undone.
              </p>
              <div className="flex justify-center gap-3">
                <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition text-gray-700">
                  Cancel
                </Motion.button>
                <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmDelete} disabled={deleting}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md transition disabled:opacity-50">
                  {deleting ? "Deleting..." : "Delete"}
                </Motion.button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
