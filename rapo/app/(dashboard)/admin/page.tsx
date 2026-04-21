"use client";
import { useState } from "react";

export default function UsersPage() {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [actionUserIndex, setActionUserIndex] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState<"edit" | "delete" | "role" | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([
    {
      name: "Porranack",
      email: "porranack@company.com",
      phone: "099-999-9989",
      department: "ฝ่ายทรัพยากรบุคคล",
      role: "Admin",
    }
  ]);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const handleSave = () => {
    if (selectedUser._index !== undefined) {
      // EDIT
      const updated = [...users];
      updated[selectedUser._index] = selectedUser;
      setUsers(updated);
    } else {
      // CREATE
      setUsers([
        ...users,
        selectedUser
      ]);
    }

    setOpen(false);
  };
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      [user.name, user.email, user.department, user.role]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchDept =
      departmentFilter === "All" || user.department === departmentFilter;

    return matchSearch && matchDept;
  });

  return (
    <div className="bg-white rounded-xl overflow-hidden">

      {/* Black Header */}
      <div className="bg-black text-white px-6 py-3">
        User Management
      </div>

      <div className="p-6">

        {/* Search + Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-[260px]"
            />

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="All">ทุกแผนก (All Department)</option>
              <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล (HR)</option>
              <option value="ฝ่ายการตลาด">ฝ่ายการตลาด (Marketing)</option>
              <option value="ฝ่ายไอที">ฝ่ายไอที (IT)</option>
            </select>

          </div>
        </div>


        {/* table (User List) */}
        <div className="border rounded-lg overflow-hidden">

          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <div className="min-w-[900px]">

              {/* Header */}
              <div className="grid grid-cols-[1.2fr_2fr_1.2fr_1fr_0.8fr] 
      items-stretch
      bg-gray-50 text-left text-sm text-gray-600 font-medium 
      border-b sticky top-0 z-20 shadow-sm">
                <div className="p-3">Name</div>
                <div className="p-3">Contact</div>
                <div className="p-3">Department</div>
                <div className="p-3">Role</div>
                <div className="p-3">Action</div>
              </div>

              {/* Rows */}
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1.2fr_2fr_1.2fr_1fr_0.8fr] 
          items-stretch 
          ${index % 2 === 0 ? "bg-white" : "bg-gray-200"} 
          hover:bg-blue-50 transition`}
                >
                  <div className="p-3 font-medium">
                    {user.name}
                  </div>

                  <div className="p-3 text-sm">
                    <div>{user.email}</div>
                    <div className="text-gray-500">{user.phone}</div>
                  </div>

                  <div className="p-3">
                    {user.department}
                  </div>

                  <div className="p-3">
                    {user.role}
                  </div>

                  <div className="p-3 relative">
                    <button
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setMenuPosition({
                          top: rect.bottom,
                          left: rect.left
                        });
                        setMenuIndex(menuIndex === index ? null : index);
                      }}
                      className="p-2 rounded hover:bg-gray-200"
                    >
                      ⋮
                    </button>

                    {menuIndex === index && (
                      <div
                        style={{ top: menuPosition.top, left: menuPosition.left }}
                        className="fixed w-40 bg-white border rounded-lg shadow-lg z-[9999]"
                      >
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedUser({ ...user, _index: index });
                            setActionModal("edit");
                            setMenuIndex(null);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                          onClick={() => {
                            setSelectedUser({ ...user, _index: index });
                            setActionModal("delete");
                            setMenuIndex(null);
                          }}
                        >
                          Delete
                        </button>

                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedUser({ ...user, _index: index });
                            setActionModal("role");
                            setMenuIndex(null);
                          }}
                        >
                          Add Role
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            </div>


          </div>
        </div>
      </div>
      {menuIndex !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuIndex(null)}
        />
      )}

      {/* ปุ่ม Add New User */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => {
            setSelectedUser({
              name: "",
              email: "",
              phone: "",
              department: "",
              role: "",
            });
            setOpen(true);
          }}
          className="bg-[#203690] text-white 
    w-14 h-14 
    flex items-center justify-center
    rounded-full shadow-lg
    hover:bg-[#182a73] hover:scale-110 hover:shadow-xl
    transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14M5 12h14"
            />
          </svg>
        </button>

        <div
          className="absolute right-16 top-1/2 -translate-y-1/2 
    bg-black text-white text-sm px-3 py-1 rounded-md
    opacity-0 group-hover:opacity-100
    transition whitespace-nowrap"
        >
          Add New User
        </div>
      </div>


      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6 relative z-50">

            <h2 className="text-lg font-semibold mb-4">
              {selectedUser?._index !== undefined ? "Edit User" : "Add New User"}
            </h2>

            <div className="space-y-3">

              <input
                placeholder="Name"
                value={selectedUser?.name || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Email"
                value={selectedUser?.email || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Phone"
                value={selectedUser?.phone || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Password"
                type="password"
                value={selectedUser?.password || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, password: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={selectedUser?.department || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, department: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                {/* <option value="">Department</option>
                <option value="Legal">Legal</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option> */}
                <option value="">ทุกแผนก</option>
                <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล (HR)</option>
                <option value="ฝ่ายการตลาด">ฝ่ายการตลาด (Marketing)</option>
                <option value="ฝ่ายไอที">ฝ่ายไอที (IT)</option>
              </select>

              <select
                value={selectedUser?.role || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Role</option>
                <option value="Admin">Admin</option>
                <option value="DataOwner">Data Owner</option>
                <option value="DPO">DPO</option>
                <option value="Auditor">Auditor</option>
                <option value="Executive">Executive</option>
              </select>

            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-[#203690] text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-[420px] p-6 shadow-xl">

            {actionModal === "edit" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Edit User</h2>

                <div className="space-y-3">

                  <input
                    placeholder="Name"
                    value={selectedUser?.name || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <input
                    placeholder="Email"
                    value={selectedUser?.email || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, email: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <input
                    placeholder="Phone"
                    value={selectedUser?.phone || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, phone: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <select
                    value={selectedUser?.department || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, department: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {/* <option value="">Department</option>
                    <option value="Legal">Legal</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Data Processor">Data Processor</option> */}
                    <option value="">ทุกแผนก</option>
                    <option value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล (HR)</option>
                    <option value="ฝ่ายการตลาด">ฝ่ายการตลาด (Marketing)</option>
                    <option value="ฝ่ายไอที">ฝ่ายไอที (IT)</option>
                  </select>

                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      const updated = [...users];
                      updated[selectedUser._index] = selectedUser;
                      setUsers(updated);
                      setActionModal(null);
                    }}
                    className="px-4 py-2 bg-[#203690] text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {actionModal === "delete" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Delete User</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this user?
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      setUsers(users.filter((_, i) => i !== selectedUser._index));
                      setActionModal(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {actionModal === "role" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Role</h2>

                <select
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="DataOwner">Data Owner</option>
                  <option value="DPO">DPO</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Executive">Executive</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      const updated = [...users];
                      updated[selectedUser._index] = selectedUser;
                      setUsers(updated);
                      setActionModal(null);
                    }}
                    className="px-4 py-2 bg-[#203690] text-white rounded-lg"
                  >
                    Save
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