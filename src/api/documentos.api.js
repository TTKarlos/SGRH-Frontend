import api from "./axios";

export default {
    getAll(params) {
        return api.get("/documentos", { params });
    },

    getCount(params) {
        return api.get("/documentos/count", { params })
    },


    getById(id) {
        return api.get(`/documentos/${id}`);
    },

    getByEmpleado(idEmpleado, params) {
        return api.get(`/documentos/empleado/${idEmpleado}`, { params });
    },
 /*
    getByTipo(tipo, params) {
        return api.get(`/documentos/tipo/${tipo}`, { params });
    },
*/
    upload(formData) {
        return api.post("/documentos/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    updateMetadata(id, data) {
        if (data.id_empleado) {
            data.id_empleado = String(data.id_empleado);
        }

        return api.put(`/documentos/${id}`, data);
    },

    updateWithFile(id, formData) {
        if (!formData.get('id_empleado')) {
            throw new Error("ID de empleado no proporcionado");
        }

        const newFormData = new FormData();

        newFormData.append('id_empleado', String(formData.get('id_empleado')));

        if (formData.get('archivo')) {
            newFormData.append('archivo', formData.get('archivo'));
        } else {
            throw new Error("Archivo no proporcionado");
        }

        newFormData.append('nombre', formData.get('nombre') || '');
        newFormData.append('tipo_documento', formData.get('tipo_documento') || '');

        if (formData.get('observaciones')) {
            newFormData.append('observaciones', formData.get('observaciones'));
        }

        const url = `documentos/with-file/${id}`;

        return api.put(url, newFormData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            params: {
                id_empleado: String(formData.get('id_empleado'))
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