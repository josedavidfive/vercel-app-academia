import { logout } from "../../services/auth.service"

function AdminDashboard(){

    return (
        <>
        <h1>Panel Administrador</h1>
        <button onClick={logout}>Cerrar Sesión</button>      
        </>
    )

}
export default AdminDashboard