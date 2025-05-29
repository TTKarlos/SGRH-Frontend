import api from "./axios"

export default {
    getAll(params) {
        return api.get("/categorias-convenio", { params })
    },

    getById(id) {
        return api.get(`/categorias-convenio/${id}`)
    },

    getByConvenio(idConvenio) {
        console.log(`Llamando a API para obtener categorías del convenio ${idConvenio}`)

        return api
            .get("/", { timeout: 2000 })
            .then(() => {
                return api.get(`/categorias-convenio/convenio/${idConvenio}`).catch((error) => {
                    console.error(`Error al obtener categorías del convenio ${idConvenio}:`, error)

                    if (error.response && (error.response.status === 500 || error.response.status === 404)) {
                        console.log("Intentando método alternativo con parámetros de consulta")
                        return api.get("/categorias-convenio", {
                            params: {
                                id_convenio: idConvenio,
                                limit: 100,
                            },
                        })
                    }

                    throw error
                })
            })
            .catch((error) => {
                console.error("Error de conexión al servidor:", error)
                return Promise.resolve({
                    data: {
                        success: true,
                        message: "Datos simulados (servidor no disponible)",
                        data: {
                            categorias: [],
                            convenio: {
                                id_convenio: Number.parseInt(idConvenio),
                                nombre: "Convenio (Datos offline)",
                                numero_convenio: "N/A",
                            },
                        },
                    },
                })
            })
    },

    create(categoria) {
        return api.post("/categorias-convenio", categoria)
    },

    update(id, categoria) {
        return api.put(`/categorias-convenio/${id}`, categoria)
    },

    delete(id) {
        return api.delete(`/categorias-convenio/${id}`)
    },
}
