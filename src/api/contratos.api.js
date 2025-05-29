import api from "./axios";

export default {
    getAll(params) {
        return api.get("/contratos", { params });
    },

    getById(id) {
        return api.get(`/contratos/${id}`);
    },

    getByEmpleado(idEmpleado, params) {
        return api.get(`/contratos/empleado/${idEmpleado}`, { params });
    },

    create(formData) {
        return api.post("/contratos", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    update(id, formData) {
        return api.put(`/contratos/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    delete(id) {
        return api.delete(`/contratos/${id}`);
    },

    upload(id, formData) {
        return api.post(`/contratos/upload/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    download(id) {
        return api.get(`/contratos/download/${id}`, { responseType: 'blob' });
    },

    preview(id) {
        return api.get(`/contratos/preview/${id}`, { responseType: 'blob' });
    },
    getProximosAVencer(params = {}) {
        return api.get("/contratos/proximos-a-vencer", { params });
    }
};