import api from "./axios";

export default {
    getAll(params) {
        return api.get("/documentos", { params });
    },

    getById(id) {
        return api.get(`/documentos/${id}`);
    },

    getByEmpleado(idEmpleado, params) {
        return api.get(`/documentos/empleado/${idEmpleado}`, { params });
    },

    getByTipo(tipo, params) {
        return api.get(`/documentos/tipo/${tipo}`, { params });
    },

    upload(formData) {
        return api.post("/documentos/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    update(id, formData) {
        return api.put(`/documentos/with-file/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    delete(id) {
        return api.delete(`/documentos/${id}`);
    },

    download(id) {
        return api.get(`/documentos/download/${id}`, { responseType: 'blob' });
    },

    preview(id) {
        return api.get(`/documentos/preview/${id}`, { responseType: 'blob' });
    }
};