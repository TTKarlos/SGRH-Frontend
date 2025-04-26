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
                if (!formData.get('archivo')) {
                    throw new Error('Debe seleccionar un archivo');
                }

                if (!formData.get('nombre')) {
                    throw new Error('El nombre del documento es obligatorio');
                }

                if (!formData.get('tipo_documento')) {
                    throw new Error('El tipo de documento es obligatorio');
                }

                if (!formData.get('id_empleado')) {
                    throw new Error('El ID del empleado es obligatorio');
                }

                const idEmpleado = formData.get('id_empleado');
                formData.set('id_empleado', String(idEmpleado));

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
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateDocumento(id, data) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                if (!data.nombre) {
                    throw new Error('El nombre del documento es obligatorio');
                }

                if (!data.tipo_documento) {
                    throw new Error('El tipo de documento es obligatorio');
                }

                const response = await documentosApi.updateMetadata(id, data);

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
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateDocumentoWithFile(id, formData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                if (!formData.get('archivo')) {
                    throw new Error('Debe seleccionar un archivo');
                }

                if (!formData.get('nombre')) {
                    throw new Error('El nombre del documento es obligatorio');
                }

                if (!formData.get('tipo_documento')) {
                    throw new Error('El tipo de documento es obligatorio');
                }

                if (!formData.get('id_empleado')) {
                    throw new Error('El ID del empleado es obligatorio');
                }

                const idEmpleado = formData.get('id_empleado');
                formData.set('id_empleado', String(idEmpleado));

                const response = await documentosApi.updateWithFile(id, formData);

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
                throw error;
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
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async downloadDocumento(id) {
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const documento = await this._obtenerDocumento(id);

                const response = await documentosApi.download(id);

                const contentType = response.headers['content-type'] || 'application/octet-stream';

                const filename = this._determinarNombreArchivo(documento, response.headers, contentType);

                await this._ejecutarDescarga(response.data, contentType, filename);

                return true;
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al descargar documento";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                throw error;
            }
        },

        async _obtenerDocumento(id) {
            const docIndex = this.documentos.findIndex(d => d.id_documento === id);
            if (docIndex !== -1) {
                return this.documentos[docIndex];
            }

            if (this.currentDocumento?.id_documento === id) {
                return this.currentDocumento;
            }

            try {
                const docResponse = await documentosApi.getById(id);
                if (docResponse.data.success) {
                    return docResponse.data.data.documento;
                }
            } catch (e) {
            }

            throw new Error("No se pudo obtener la información del documento");
        },

        _determinarNombreArchivo(documento, headers, contentType) {
            const contentDisposition = headers['content-disposition'];
            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    return matches[1].replace(/['"]/g, '');
                }
            }

            const mimeToExt = {
                'image/jpeg': '.jpg',
                'image/jpg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/bmp': '.bmp',
                'image/webp': '.webp',
                'image/tiff': '.tiff',
                'image/svg+xml': '.svg',
                'application/pdf': '.pdf',
                'application/msword': '.doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                'application/vnd.ms-excel': '.xls',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
                'application/vnd.ms-powerpoint': '.ppt',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
                'text/plain': '.txt',
                'text/html': '.html',
                'text/css': '.css',
                'text/javascript': '.js',
                'application/zip': '.zip',
                'application/x-rar-compressed': '.rar',
                'application/x-7z-compressed': '.7z',
                'application/gzip': '.gz',
                'application/json': '.json',
                'application/xml': '.xml'
            };

            let extension = '.pdf';

            if (contentType && mimeToExt[contentType]) {
                extension = mimeToExt[contentType];
            } else if (documento.nombre_original) {
                const lastDotIndex = documento.nombre_original.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    extension = documento.nombre_original.substring(lastDotIndex);
                }
            }

            let filename = documento.nombre || 'documento';

            if (filename.lastIndexOf('.') > 0) {
                filename = filename.substring(0, filename.lastIndexOf('.')) + extension;
            } else {
                filename += extension;
            }

            return filename || 'documento.pdf';
        },

        _ejecutarDescarga(data, contentType, filename) {
            return new Promise((resolve) => {
                const blob = new Blob([data], { type: contentType });

                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    resolve();
                }, 150);
            });
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
                throw error;
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