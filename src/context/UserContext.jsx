import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [faculty, setFaculty] = useState("");
    const [department, setDepartment] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    return (
        <UserContext.Provider
        value={{ faculty, setFaculty, department, setDepartment, isVerified, setIsVerified}}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}