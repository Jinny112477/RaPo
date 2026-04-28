"use client";
import { useState, useEffect } from "react";

const DEPARTMENTS = [
  { department_id: "06315740-4498-4146-91a7-576504c4ad4a", department_name: "Information Technology" },
  { department_id: "12f6b227-b7a8-4d05-b33b-509cca4832cd", department_name: "Quality Assurance" },
  { department_id: "1f553f93-61fd-4666-baf5-16641a62ce0f", department_name: "Training and Development" },
  { department_id: "1f70d651-b9cd-4600-a7d0-8d94f8ea1e96", department_name: "Product Management" },
  { department_id: "29b46b44-314a-47b6-9a0e-f1ccb0d2e369", department_name: "Customer Service" },
  { department_id: "557476d8-6411-4996-afe4-afe33de61a32", department_name: "Compliance" },
  { department_id: "5afc3f03-20b3-4d61-ab6f-5ff05f606fa0", department_name: "Public Relations" },
  { department_id: "665fcf35-e76a-4b5d-86f4-2d8fd8e1741c", department_name: "Research and Development" },
  { department_id: "6dc76fe1-5d2d-413f-b5f1-907327602b2d", department_name: "Strategy and Planning" },
  { department_id: "709e480a-c062-4fb1-b59c-343dd10644b9", department_name: "Data Analytics" },
];

const ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Data Controller", label: "Data Controller" },
  { value: "DPO", label: "DPO" },
  { value: "Auditor", label: "Auditor" },
  { value: "Executive", label: "Executive" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState<"edit" | "delete" | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({
    name: "", email: "", phone: "",
    department_id: "", department_name: "", role: "",
  });

  // GET: fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch users");

        const mapped = data.map((user: any) => {
          const membership = user.user_membership ?? {};
          const dept = membership.departments ?? {};
          return {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            department_id: dept.department_id ?? "",
            department_name: dept.department_name ?? "",
            role: membership.role ?? "",
          };
        });

        setUsers(mapped);
      } catch (err: any) {
        console.error("Failed to fetch users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  // POST: create user
  const handleCreate = async () => {
    setError("");
    if (!newUser.name || !newUser.email || !newUser.department_id || !newUser.role) {
      setError("Name, email, department and role are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email, name: newUser.name,
          department_id: newUser.department_id,
          role: newUser.role, phone: newUser.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("SERVER ERROR:", data);
        throw new Error(data.error || JSON.stringify(data));
      }

      setUsers((prev) => [...prev, { ...newUser, user_id: data.user_id }]);
      setOpen(false);
      setNewUser({ name: "", email: "", phone: "", department_id: "", department_name: "", role: "" });
      alert(`User created!\n\nEmail: ${newUser.email}\nPassword: Temp1234\n\nShare this with the user.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // PUT: update user
  const handleUpdate = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${selectedUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          department_id: selectedUser.department_id,
          role: selectedUser.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // sync local state
      setUsers(prev => prev.map(u =>
        u.user_id === selectedUser.user_id ? selectedUser : u
      ));
      setActionModal(null);
      setSelectedUser(null);
    } catch (err: any) {
      alert("Failed to update user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE: delete user
  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${selectedUser.user_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers(prev => prev.filter(u => u.user_id !== selectedUser.user_id));
      setActionModal(null);
      setSelectedUser(null);
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch = [user.name, user.email, user.department_name, user.role]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === "All" || user.department_name === departmentFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="bg-white rounded-xl overflow-hidden">

      <div className="bg-black text-white px-6 py-3 text-sm font-medium">
        User Management
      </div>

      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text" placeholder="Search user..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-[260px] text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
          />
          <select
            value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
            ))}
          </select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <div className="min-w-[900px]">

              <div className="grid grid-cols-[1.2fr_2fr_1.5fr_1fr_0.8fr] bg-gray-50 text-xs text-gray-500 font-semibold uppercase border-b sticky top-0 z-20">
                <div className="px-4 py-3">Name</div>
                <div className="px-4 py-3">Contact</div>
                <div className="px-4 py-3">Department</div>
                <div className="px-4 py-3">Role</div>
                <div className="px-4 py-3">Action</div>
              </div>

              {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                <div key={user.user_id}
                  className={`grid grid-cols-[1.2fr_2fr_1.5fr_1fr_0.8fr] items-center border-t
                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                >
                  <div className="px-4 py-3 font-medium text-sm">{user.name}</div>
                  <div className="px-4 py-3 text-sm">
                    <div>{user.email}</div>
                    <div className="text-gray-400 text-xs">{user.phone}</div>
                  </div>
                  <div className="px-4 py-3 text-sm">{user.department_name}</div>
                  <div className="px-4 py-3 text-sm capitalize">{user.role}</div>
                  <div className="px-4 py-3 relative">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
                        setMenuIndex(menuIndex === index ? null : index);
                      }}
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                    >
                      ⋮
                    </button>

                    {/* ── Dropdown: set selectedUser THEN open modal ── */}
                    {menuIndex === index && (
                      <div
                        style={{ top: menuPosition.top, left: menuPosition.left }}
                        className="fixed w-40 bg-white border rounded-lg shadow-lg z-[9999]"
                      >
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setSelectedUser({ ...user });   // ← set first
                            setActionModal("edit");          // ← then open
                            setMenuIndex(null);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                          onClick={() => {
                            setSelectedUser({ ...user });   // ← set first
                            setActionModal("delete");        // ← then open
                            setMenuIndex(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
              )}

            </div>
          </div>
        </div>
      </div>

      {menuIndex !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuIndex(null)} />
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => { setError(""); setOpen(true); }}
          className="bg-[#203690] text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-[#182a73] hover:scale-110 transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Add New User
        </div>
      </div>

      {/* ── ADD USER MODAL ── */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[480px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-800">Add New User</h2>
              <p className="text-xs text-gray-400 mt-0.5">A temporary password will be auto-generated and sent to the user.</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                  <input placeholder="Full name" value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  <input placeholder="Phone number" value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                <input placeholder="user@company.com" type="email" value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Department *</label>
                <select value={newUser.department_id}
                  onChange={(e) => {
                    const dept = DEPARTMENTS.find((d) => d.department_id === e.target.value);
                    setNewUser({ ...newUser, department_id: dept?.department_id || "", department_name: dept?.department_name || "" });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Role *</label>
                <select value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 bg-[#203690] text-white rounded-lg text-sm disabled:opacity-60 hover:bg-[#182a73]">
                {saving ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTION MODALS ── */}
      {actionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-[420px] p-6 shadow-2xl">

            {/* EDIT MODAL */}
            {actionModal === "edit" && (
              <>
                <h2 className="text-base font-semibold mb-4">Edit User</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
                    <input value={selectedUser.name || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                    <input value={selectedUser.email || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                    <input value={selectedUser.phone || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Department</label>
                    <select value={selectedUser.department_id || ""}
                      onChange={(e) => {
                        const dept = DEPARTMENTS.find((d) => d.department_id === e.target.value);
                        setSelectedUser({ ...selectedUser, department_id: dept?.department_id || "", department_name: dept?.department_name || "" });
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Role</label>
                    <select value={selectedUser.role || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select role</option>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => { setActionModal(null); setSelectedUser(null); }}
                    className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                  <button onClick={handleUpdate} disabled={saving}
                    className="px-4 py-2 bg-[#203690] text-white rounded-lg text-sm disabled:opacity-60">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}

            {/* DELETE MODAL */}
            {actionModal === "delete" && (
              <>
                <h2 className="text-base font-semibold mb-2">Delete User</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete <strong>{selectedUser.name}</strong>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setActionModal(null); setSelectedUser(null); }}
                    className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                  <button onClick={handleDelete} disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-60">
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}