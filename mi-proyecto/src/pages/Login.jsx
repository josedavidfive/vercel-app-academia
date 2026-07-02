import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../schemas/LoginSchema";

function Login() {
    const {usuario, rol} = useAuth()
    const navigate = useNavigate()
    const [ errorAuth, setErrorAuth ] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm ({resolver: zodResolver(loginSchema)})

    useEffect(() => {
        if(usuario && rol) navigate(`/${rol}`)
    }, [usuario, rol, navigate])

    async function onSubmit(datos){
        console.log(datos);
        setErrorAuth(null)
        try{
            console.log("porbando");
            await login(datos.email, datos.password)
        }catch(e){
            setErrorAuth('Email o contraseñas inválidas')
        }
    }



     return (
        <form onSubmit ={handleSubmit(onSubmit)}>
        <h1 className="
        text-3xl
        font-bold
        text-blue-800/60
        text-center
        m-2
        hover:text-red-800">Inciciar Sesión
        </h1>

        <div>
            <label>Email</label>
            <input type= "email" {...register('email')}/>
            {errors.email && <p> {errors.email.message}</p>}
        </div>

        <div>
            <label>Contraseña</label>
            <input type= "password" {...register('password')}/>
            {errors.password && <p> {errors.password.message}</p>}
        </div>

        <button type = "submit" disabled ={isSubmitting}>Login</button>
        {errorAuth && <p>{errorAuth}</p>}
        </form>
    )
}

export default Login