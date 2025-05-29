import { defineStore } from "pinia"
import documentosApi from "../api/documentos.api"
import { useNotificationStore } from "./notification"
import api from "../api/axios"

export const useDocumentosStore = defineStore("documentos", {
    state: () => ({
        documentos: [],
        currentDocumento: null,
        totalDocumentos: 0,
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
            totalPages: 1,
        },
    }),

    actions: {
        async fetchDocumentosCount() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.get("/documentos/count")
                const data = response.data

                if (data.success) {
                    this.totalDocumentos = data.data.total || 0
                    return this.totalDocumentos
                } else {
                    throw new Error(data.message || "Error al obtener el conteo de documentos")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al obtener el conteo de documentos"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return 0
            } finally {
                this.loading = false
            }
        },

        async fetchDocumentos(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const mergedParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params,
                }

                const response = await documentosApi.getAll(mergedParams)

                if (response.data.success) {
                    this.documentos = response.data.data.documentos
                    this.pagination = response.data.data.pagination
                    this.totalDocumentos = this.pagination.totalItems
                    return this.documentos
                } else {
                    throw new Error(response.data.message || "Error al obtener documentos")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documentos"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchDocumentoById(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await documentosApi.getById(id)

                if (response.data.success) {
                    this.currentDocumento = response.data.data.documento
                    return this.currentDocumento
                } else {
                    throw new Error(response.data.message || "Error al obtener documento")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchDocumentosByEmpleado(idEmpleado, params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const mergedParams = {
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params,
                }

                const response = await documentosApi.getByEmpleado(idEmpleado, mergedParams)

                if (response.data.success) {
                    this.documentos = response.data.data.documentos
                    this.pagination = response.data.data.pagination

                    if (this.documentos.length) {
                        setTimeout(() => this.verificarYLimpiarDocumentosInaccesibles(), 500)
                    }

                    return this.documentos
                } else {
                    throw new Error(response.data.message || "Error al obtener documentos del empleado")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al obtener documentos del empleado"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async verificarYLimpiarDocumentosInaccesibles() {
            const notificationStore = useNotificationStore()
            if (!this.documentos.length) return this.documentos

            try {
                this.loading = true

                let documentosInaccesibles = 0

                const resultados = await Promise.allSettled(
                    this.documentos.map(async (doc) => {
                        try {
                            await documentosApi.preview(doc.id_documento)
                            return { ...doc, archivoInaccesible: false }
                        } catch (error) {
                            const esErrorArchivo =
                                error.response?.status === 404 ||
                                error.response?.status === 500 ||
                                error.message?.includes("no se encuentra") ||
                                error.message?.includes("not found") ||
                                error.message?.includes("no existe") ||
                                error.message?.includes("inaccesible")

                            if (esErrorArchivo) {
                                documentosInaccesibles++
                                return { ...doc, archivoInaccesible: true }
                            }
                            return { ...doc, archivoInaccesible: false }
                        }
                    }),
                )

                const documentosVerificados = resultados
                    .filter((resultado) => resultado.status === "fulfilled")
                    .map((resultado) => resultado.value)

                this.documentos = documentosVerificados

                if (documentosInaccesibles > 0) {
                    let eliminados = 0

                    const docsInaccesibles = this.documentos.filter((doc) => doc.archivoInaccesible)

                    for (const doc of docsInaccesibles) {
                        try {
                            await documentosApi.delete(doc.id_documento)
                            eliminados++
                            this.totalDocumentos--
                        } catch (error) {
                            console.error(`Error al eliminar documento ${doc.id_documento}:`, error)
                        }
                    }

                    this.documentos = this.documentos.filter((doc) => !doc.archivoInaccesible)

                    notificationStore.success(
                        `Se han eliminado automáticamente ${eliminados} documento(s) inaccesibles de la base de datos.`,
                        "Limpieza completada",
                    )
                }

                return this.documentos
            } catch (error) {
                console.error("Error al verificar y limpiar documentos inaccesibles:", error)
                notificationStore.error("Error al verificar y eliminar documentos inaccesibles", "Error de verificación")
                return this.documentos
            } finally {
                this.loading = false
            }
        },

        async verificarArchivosExistentes() {
            if (!this.documentos.length) return this.documentos

            const notificationStore = useNotificationStore()
            let documentosInaccesibles = 0

            try {
                this.loading = true

                const resultados = await Promise.allSettled(
                    this.documentos.map(async (doc) => {
                        try {
                            await documentosApi.preview(doc.id_documento)
                            return { ...doc, archivoInaccesible: false }
                        } catch (error) {
                            const esErrorArchivo =
                                error.response?.status === 404 ||
                                error.response?.status === 500 ||
                                error.message?.includes("no se encuentra") ||
                                error.message?.includes("not found") ||
                                error.message?.includes("no existe") ||
                                error.message?.includes("inaccesible")

                            if (esErrorArchivo) {
                                documentosInaccesibles++
                                return { ...doc, archivoInaccesible: true }
                            }
                            return { ...doc, archivoInaccesible: false }
                        }
                    }),
                )

                const documentosVerificados = resultados
                    .filter((resultado) => resultado.status === "fulfilled")
                    .map((resultado) => resultado.value)

                this.documentos = documentosVerificados

                if (documentosInaccesibles > 0) {
                    notificationStore.warning(
                        `Se encontraron ${documentosInaccesibles} documento(s) cuyos archivos no están accesibles.`,
                        "Verificación completada",
                    )
                } else {
                    notificationStore.success("Todos los documentos están accesibles.", "Verificación completada")
                }

                return this.documentos
            } catch (error) {
                console.error("Error al verificar archivos:", error)
                notificationStore.error("Error al verificar la existencia de archivos", "Error de verificación")
                return this.documentos
            } finally {
                this.loading = false
            }
        },

        async limpiarDocumentosInaccesibles() {
            if (!this.documentos.length) return this.documentos

            const notificationStore = useNotificationStore()
            const documentosInaccesibles = this.documentos.filter((doc) => doc.archivoInaccesible)

            if (documentosInaccesibles.length === 0) {
                notificationStore.info("No hay documentos inaccesibles para eliminar", "Información")
                return this.documentos
            }

            try {
                this.loading = true
                let eliminados = 0

                for (const doc of documentosInaccesibles) {
                    try {
                        await documentosApi.delete(doc.id_documento)
                        eliminados++
                        this.totalDocumentos--
                    } catch (error) {
                        console.error(`Error al eliminar documento ${doc.id_documento}:`, error)
                    }
                }

                this.documentos = this.documentos.filter((doc) => !doc.archivoInaccesible)

                notificationStore.success(
                    `Se han eliminado ${eliminados} documento(s) inaccesibles de la base de datos.`,
                    "Limpieza completada",
                )

                return this.documentos
            } catch (error) {
                console.error("Error al limpiar documentos inaccesibles:", error)
                notificationStore.error("Error al eliminar documentos inaccesibles", "Error de limpieza")
                return this.documentos
            } finally {
                this.loading = false
            }
        },

        async uploadDocumento(formData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                if (!formData.get("archivo")) {
                    throw new Error("Debe seleccionar un archivo")
                }

                if (!formData.get("nombre")) {
                    throw new Error("El nombre del documento es obligatorio")
                }


                if (!formData.get("id_empleado")) {
                    throw new Error("El ID del empleado es obligatorio")
                }

                const idEmpleado = formData.get("id_empleado")
                formData.set("id_empleado", String(idEmpleado))

                const response = await documentosApi.upload(formData)

                if (response.data.success) {
                    notificationStore.success("Documento subido correctamente")
                    this.totalDocumentos++
                    return response.data.data.documento
                } else {
                    throw new Error(response.data.message || "Error al subir documento")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al subir documento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateDocumento(id, data) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                if (!data.nombre) {
                    throw new Error("El nombre del documento es obligatorio")
                }



                const response = await documentosApi.updateMetadata(id, data)

                if (response.data.success) {
                    notificationStore.success("Documento actualizado correctamente")

                    if (this.currentDocumento && this.currentDocumento.id_documento === id) {
                        this.currentDocumento = response.data.data.documento
                    }

                    const index = this.documentos.findIndex((d) => d.id_documento === id)
                    if (index !== -1) {
                        const archivoInaccesible = this.documentos[index].archivoInaccesible
                        this.documentos[index] = {
                            ...response.data.data.documento,
                            archivoInaccesible: archivoInaccesible,
                        }
                    }

                    return response.data.data.documento
                } else {
                    throw new Error(response.data.message || "Error al actualizar documento")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al actualizar documento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateDocumentoWithFile(id, formData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                if (!formData.get("archivo")) {
                    throw new Error("Debe seleccionar un archivo")
                }

                if (!formData.get("nombre")) {
                    throw new Error("El nombre del documento es obligatorio")
                }


                if (!formData.get("id_empleado")) {
                    throw new Error("El ID del empleado es obligatorio")
                }

                const idEmpleado = formData.get("id_empleado")
                formData.set("id_empleado", String(idEmpleado))

                const response = await documentosApi.updateWithFile(id, formData)

                if (response.data.success) {
                    notificationStore.success("Documento actualizado correctamente")

                    if (this.currentDocumento && this.currentDocumento.id_documento === id) {
                        this.currentDocumento = response.data.data.documento
                    }

                    const index = this.documentos.findIndex((d) => d.id_documento === id)
                    if (index !== -1) {
                        this.documentos[index] = {
                            ...response.data.data.documento,
                            archivoInaccesible: false,
                        }
                    }

                    return response.data.data.documento
                } else {
                    throw new Error(response.data.message || "Error al actualizar documento")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al actualizar documento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteDocumento(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await documentosApi.delete(id)

                if (response.data.success) {
                    notificationStore.success("Documento eliminado correctamente")

                    this.documentos = this.documentos.filter((d) => d.id_documento !== id)
                    this.totalDocumentos--

                    if (this.currentDocumento && this.currentDocumento.id_documento === id) {
                        this.currentDocumento = null
                    }

                    return true
                } else {
                    throw new Error(response.data.message || "Error al eliminar documento")
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Error al eliminar documento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            } finally {
                this.loading = false
            }
        },

        async downloadDocumento(id) {
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const documento = await this._obtenerDocumento(id)

                const response = await documentosApi.download(id)

                if (!response.data || response.data.length === 0) {
                    throw new Error("El archivo no está disponible o está dañado")
                }

                const contentType = response.headers["content-type"] || "application/octet-stream"
                const filename = this._determinarNombreArchivo(documento, response.headers, contentType)

                await this._ejecutarDescarga(response.data, contentType, filename)

                const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                if (docIndex !== -1 && this.documentos[docIndex].archivoInaccesible) {
                    this.documentos[docIndex].archivoInaccesible = false
                }

                return true
            } catch (error) {
                let errorMsg = "Error al descargar documento"

                if (error.response?.status === 404) {
                    errorMsg = "El archivo físico no se encuentra en el servidor"

                    const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                    if (docIndex !== -1) {
                        this.documentos[docIndex].archivoInaccesible = true
                    }
                } else if (error.response?.status === 500) {
                    errorMsg = "Error del servidor al acceder al archivo"
                } else if (error.message?.includes("no está disponible")) {
                    errorMsg = error.message

                    const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                    if (docIndex !== -1) {
                        this.documentos[docIndex].archivoInaccesible = true
                    }
                } else {
                    errorMsg = error.response?.data?.message || error.message || errorMsg
                }

                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            }
        },

        async _obtenerDocumento(id) {
            const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
            if (docIndex !== -1) {
                return this.documentos[docIndex]
            }

            if (this.currentDocumento?.id_documento === id) {
                return this.currentDocumento
            }

            try {
                const docResponse = await documentosApi.getById(id)
                if (docResponse.data.success) {
                    return docResponse.data.data.documento
                }
            } catch (e) {
            }

            throw new Error("No se pudo obtener la información del documento")
        },

        _determinarNombreArchivo(documento, headers, contentType) {
            const contentDisposition = headers["content-disposition"]
            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
                const matches = filenameRegex.exec(contentDisposition)
                if (matches != null && matches[1]) {
                    return matches[1].replace(/['"]/g, "")
                }
            }

            const mimeToExt = {
                "image/jpeg": ".jpg",
                "image/jpg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/bmp": ".bmp",
                "image/webp": ".webp",
                "image/tiff": ".tiff",
                "image/svg+xml": ".svg",
                "application/pdf": ".pdf",
                "application/msword": ".doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
                "application/vnd.ms-excel": ".xls",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
                "application/vnd.ms-powerpoint": ".ppt",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
                "text/plain": ".txt",
                "text/html": ".html",
                "text/css": ".css",
                "text/javascript": ".js",
                "application/zip": ".zip",
                "application/x-rar-compressed": ".rar",
                "application/x-7z-compressed": ".7z",
                "application/gzip": ".gz",
                "application/json": ".json",
                "application/xml": ".xml",
            }

            let extension = ".pdf"

            if (contentType && mimeToExt[contentType]) {
                extension = mimeToExt[contentType]
            } else if (documento.nombre_original) {
                const lastDotIndex = documento.nombre_original.lastIndexOf(".")
                if (lastDotIndex > 0) {
                    extension = documento.nombre_original.substring(lastDotIndex)
                }
            }

            let filename = documento.nombre || "documento"

            if (filename.lastIndexOf(".") > 0) {
                filename = filename.substring(0, filename.lastIndexOf(".")) + extension
            } else {
                filename += extension
            }

            return filename || "documento.pdf"
        },

        _ejecutarDescarga(data, contentType, filename) {
            return new Promise((resolve) => {
                const blob = new Blob([data], { type: contentType })

                const url = window.URL.createObjectURL(blob)

                const link = document.createElement("a")
                link.href = url
                link.download = filename
                link.style.display = "none"

                document.body.appendChild(link)
                link.click()

                setTimeout(() => {
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    resolve()
                }, 150)
            })
        },

        async previewDocumento(id) {
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await documentosApi.preview(id)

                if (!response.data || response.data.length === 0) {
                    throw new Error("El archivo no está disponible o está dañado")
                }

                const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers["content-type"] }))

                const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                if (docIndex !== -1 && this.documentos[docIndex].archivoInaccesible) {
                    this.documentos[docIndex].archivoInaccesible = false
                }

                return url
            } catch (error) {
                let errorMsg = "Error al previsualizar documento"

                if (error.response?.status === 404) {
                    errorMsg = "El archivo físico no se encuentra en el servidor"

                    const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                    if (docIndex !== -1) {
                        this.documentos[docIndex].archivoInaccesible = true
                    }
                } else if (error.response?.status === 500) {
                    errorMsg = "Error del servidor al acceder al archivo"
                } else if (error.message?.includes("no está disponible")) {
                    errorMsg = error.message

                    const docIndex = this.documentos.findIndex((d) => d.id_documento === id)
                    if (docIndex !== -1) {
                        this.documentos[docIndex].archivoInaccesible = true
                    }
                } else {
                    errorMsg = error.response?.data?.message || error.message || errorMsg
                }

                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw error
            }
        },

        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters }
            this.pagination.page = 1
        },

        resetFilters() {
            this.filters = {
                search: "",
                tipo_documento: "",
                fecha_desde: null,
                fecha_hasta: null,
            }
            this.pagination.page = 1
        },

        setPage(page) {
            this.pagination.page = page
        },
    },
})
