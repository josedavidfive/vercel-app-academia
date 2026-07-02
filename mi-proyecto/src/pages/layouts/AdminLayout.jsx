import { Outlet } from "react-router";
import AdminNavbar from "../../components/layout/AdminNavbar";

export const AdminLayout = () => {
    return (
        <>
            <AdminNavbar />
            <Outlet />
        </>
    );
}