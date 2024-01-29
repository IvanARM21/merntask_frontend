import { useEffect } from "react";
import { useParams, Link } from "react-router-dom"
import useProyectos from "../hooks/useProyectos";
import useAdmin from "../hooks/useAdmin";
import Spinner from "../components/Spinner";
import ModalFormularioTarea from "../components/ModalFormularioTarea";
import ModalEliminarTarea from "../components/ModalEliminarTarea";
import ModalEliminarColaborador from "../components/ModalEliminarColaborador";
import Tarea from "../components/Tarea";
import Colaborador from "../components/Colaborador";
import Alerta from "../components/Alerta";
import io from "socket.io-client"

let socket;

const Proyecto = () => {

    const params = useParams();

    const { obtenerProyecto, proyecto, cargando, handleModalTarea, handleReset, submitTareasProyecto, eliminarTareaProyecto, actualizarTareaProyecto, cambiarEstadoTarea } = useProyectos();

    const admin = useAdmin();

    useEffect(() => {
        obtenerProyecto(params.id);
    }, []);

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL);
        socket.emit('abrir proyecto', params.id);
        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        if(!proyecto.nombre || cargando) return
        socket.on("tarea agregada", tareaNueva => {
            if(tareaNueva.proyecto === proyecto._id) {
                submitTareasProyecto(tareaNueva)
            }
        });

        socket.on('tarea actualizada', tareaActualizada => {
            if(tareaActualizada.proyecto._id === proyecto._id) {
                actualizarTareaProyecto(tareaActualizada);
            }
        });

        socket.on('nuevo estado', nuevoEstadoTarea => {
            if(nuevoEstadoTarea.proyecto._id === proyecto._id) {
                cambiarEstadoTarea(nuevoEstadoTarea);
            }
        });

        socket.on("tarea eliminada", (tareaEliminada) => {
            const proyectoId = tareaEliminada.proyecto._id || tareaEliminada.proyecto
            if(proyectoId === proyecto._id) {
                eliminarTareaProyecto(tareaEliminada);
            }
        });

        return () => {
            socket.off('tarea agregada');
            socket.off('tarea actualizada');
            socket.off('nuevo estado');
            socket.off('tarea eliminada')
        }


    })

    const { nombre } = proyecto;

  return (

    cargando ? 
    (
        <Spinner/>
    ) : 
    (
        <>
            <div className="flex justify-between">
                <h1 className="font-black text-4xl">{nombre}</h1>
            { admin && (
                <div className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                    </svg>

                    <Link
                        to={`/proyectos/editar/${params.id}`}
                        className="uppercase font-bold"
                        onClick={handleReset}
                    >Editar</Link>
                </div>
            )}
                

            </div>   

            {admin && (
                <button
                    onClick={handleModalTarea}
                    type="button"
                    className="text-sm px-5 py-3 w-full md:w-auto rounded-lg uppercase font-bold bg-sky-400 text-white text-center mt-5 flex gap-1 items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                    </svg>
                    Nueva Tarea
                </button>
            )}

            <p className="font-bold text-xl mt-10">Tareas del Proyecto</p>

            <div className="bg-white shadow mt-10 rounded-lg">
                {proyecto.tareas?.length ?
                 proyecto.tareas?.map( tarea => (
                    <Tarea 
                        key={tarea._id}
                        tarea={tarea}
                    />
                 ))
                 : 
                 <p className="text-center my-5 p-10">No hay Tareas en este Proyecto</p>}
            </div>

            {admin && (
                <>
                    <div className="flex items-center justify-between mt-10">
                        <p className="font-bold text-xl mt-10">Colaboradores</p>
                        <div className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>

                            <Link
                                to={`/proyectos/nuevo-colaborador/${params.id}`}
                                className="uppercase font-bold"
                                onClick={handleReset}
                            >Añadir</Link>
                        </div>
                    </div>
                
                    <div className="bg-white shadow mt-10 rounded-lg">
                        {proyecto.colaboradores?.length ?
                        proyecto.colaboradores?.map( colaborador => (
                            <Colaborador 
                                key={colaborador._id}
                                colaborador={colaborador}
                            />
                        ))
                        : 
                        <p className="text-center my-5 p-10">No hay Colaboradores en este Proyecto</p>}
                    </div>
                </>
            )}


            <ModalFormularioTarea />
            <ModalEliminarTarea />
            <ModalEliminarColaborador />
        </>
    )
  )
}

export default Proyecto
