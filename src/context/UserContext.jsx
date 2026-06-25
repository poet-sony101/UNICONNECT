import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [faculty, setFaculty] = useState(savedUser.faculty || "");
  const [department, setDepartment] = useState(savedUser.department || "");
  const [isVerified, setIsVerified] = useState(savedUser.is_verified || false);
  const [user, setUser] = useState(savedUser);

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <UserContext.Provider
      value={{
        faculty, setFaculty,
        department, setDepartment,
        isVerified, setIsVerified,
        user, updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}