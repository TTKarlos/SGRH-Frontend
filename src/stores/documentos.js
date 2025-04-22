import { defineStore } from "pinia";
import documentosApi from "../api/documentos.api";
import { useNotificationStore } from "./notification";

export const useDocumentosStore = defineStore("documentos", {
    state: () => ({
        documentos: [],
        currentDocumento: null,
        loading: false,
        error: null,
        filters: {
            search: "",
            tipo_documento: "",
            fecha_desde: null,
            fecha_hasta: null,
        },
        pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 1
        }
    }),

    actions: {
        async fetchDocumentos(params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const mergedParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params
                };

                const response = await documentosApi.getAll(mergedParams);

                if (response.data.success) {
                    this.documentos = response.data.data.documentos;
                    this.pagination = response.data.data.pagination;
                    return this.documentos;
                } else {
                    throw new Error(response.data.message || "Error al obtener documentos");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documentos";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return [];
            } finally {
                this.loading = false;
            }
        },

        async fetchDocumentoById(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.getById(id);

                if (response.data.success) {
                    this.currentDocumento = response.data.data.documento;
                    return this.currentDocumento;
                } else {
                    throw new Error(response.data.message || "Error al obtener documento");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async fetchDocumentosByEmpleado(idEmpleado, params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const mergedParams = {
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params
                };

                const response = await documentosApi.getByEmpleado(idEmpleado, mergedParams);

                if (response.data.success) {
                    this.documentos = response.data.data.documentos;
                    this.pagination = response.data.data.pagination;
                    return this.documentos;
                } else {
                    throw new Error(response.data.message || "Error al obtener documentos del empleado");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documentos del empleado";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return [];
            } finally {
                this.loading = false;
            }
        },

        async uploadDocumento(formData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.upload(formData);

                if (response.data.success) {
                    notificationStore.success("Documento subido correctamente");
                    return response.data.data.documento;
                } else {
                    throw new Error(response.data.message || "Error al subir documento");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al subir documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateDocumento(id, formData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.update(id, formData);

                if (response.data.success) {
                    notificationStore.success("Documento actualizado correctamente");

                    if (this.currentDocumento && this.currentDocumento.id_documento === id) {
                        this.currentDocumento = response.data.data.documento;
                    }

                    const index = this.documentos.findIndex(d => d.id_documento === id);
                    if (index !== -1) {
                        this.documentos[index] = response.data.data.documento;
                    }

                    return response.data.data.documento;
                } else {
                    throw new Error(response.data.message || "Error al actualizar documento");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al actualizar documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deleteDocumento(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.delete(id);

                if (response.data.success) {
                    notificationStore.success("Documento eliminado correctamente");

                    this.documentos = this.documentos.filter(d => d.id_documento !== id);

                    if (this.currentDocumento && this.currentDocumento.id_documento === id) {
                        this.currentDocumento = null;
                    }

                    return true;
                } else {
                    throw new Error(response.data.message || "Error al eliminar documento");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al eliminar documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async downloadDocumento(id) {
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.download(id);

                const url = window.URL.createObjectURL(new Blob([response.data]));

                let filename = 'documento.pdf';
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch.length === 2) {
                        filename = filenameMatch[1];
                    }
                }

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();

                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);

                return true;
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al descargar documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return false;
            }
        },

        async previewDocumento(id) {
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await documentosApi.preview(id);

                const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));

                return url;
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al previsualizar documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            }
        },

        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            this.pagination.page = 1;
        },

        resetFilters() {
            this.filters = {
                search: "",
                tipo_documento: "",
                fecha_desde: null,
                fecha_hasta: null,
            };
            this.pagination.page = 1;
        },

        setPage(page) {
            this.pagination.page = page;
        }
    }
});