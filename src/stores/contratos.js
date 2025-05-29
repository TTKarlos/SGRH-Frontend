import { defineStore } from 'pinia';
import ContratosAPI from '../api/contratos.api';
import { useNotificationStore } from './notification';

/**
 * Store para gestión de contratos
 */
export const useContratosStore = defineStore('contratos', {
    state: () => ({
        contratos: [],
        contratoActual: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        },
        empleadoInfo: null,
        estadisticas: null,
        contratosProximosAVencer: []
    }),

    getters: {
        /**
         * Obtiene los contratos vigentes
         * @returns {Array} - Contratos vigentes
         */
        contratosVigentes: (state) => {
            const today = new Date();
            return state.contratos.filter(contrato =>
                contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= today
            );
        },

        /**
         * Obtiene los contratos finalizados
         * @returns {Array} - Contratos finalizados
         */
        contratosFinalizados: (state) => {
            const today = new Date();
            return state.contratos.filter(contrato =>
                contrato.fecha_fin !== null && new Date(contrato.fecha_fin) < today
            );
        },

        /**
         * Obtiene un contrato por su ID
         * @returns {Function} - Función que busca un contrato por ID
         */
        getContratoById: (state) => (id) => {
            return state.contratos.find(contrato => contrato.id_contrato === parseInt(id));
        },

        /**
         * Verifica si hay un contrato vigente
         * @returns {Boolean} - True si hay un contrato vigente
         */
        hasContratoVigente: (state) => {
            return state.estadisticas?.vigente || false;
        },

        /**
         * Obtiene el contrato vigente
         * @returns {Object|null} - Contrato vigente o null
         */
        contratoVigente: (state) => {
            return state.estadisticas?.contratoVigente || null;
        }
    },

    actions: {
        /**
         * Obtiene todos los contratos con filtros opcionales
         * @param {Object} params - Parámetros de filtrado y paginación
         * @returns {Promise} - Promesa con los contratos
         */
        async fetchContratos(params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.getAll(params);

                if (response.data && response.data.success) {
                    const { contratos, pagination } = response.data.data;
                    this.contratos = contratos || [];
                    this.pagination = pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0
                    };
                    return this.contratos;
                } else {
                    throw new Error(response.data?.message || 'Error al cargar contratos');
                }
            } catch (error) {
                console.error('Error al cargar contratos:', error);
                this.error = error.response?.data?.message || error.message || 'Error al cargar contratos';
                notificationStore.error('Error al cargar los contratos', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Obtiene los contratos de un empleado
         * @param {number|string} idEmpleado - ID del empleado
         * @param {Object} params - Parámetros de filtrado y paginación
         * @returns {Promise} - Promesa con los contratos del empleado
         */
        async fetchContratosByEmpleado(idEmpleado, params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.getByEmpleado(idEmpleado, params);

                if (response.data && response.data.success) {
                    const { contratos, pagination, empleado, estadisticas } = response.data.data;
                    this.contratos = contratos || [];
                    this.pagination = pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0
                    };
                    this.empleadoInfo = empleado || null;
                    this.estadisticas = estadisticas || null;
                    return this.contratos;
                } else {
                    throw new Error(response.data?.message || 'Error al cargar contratos del empleado');
                }
            } catch (error) {
                console.error('Error al cargar contratos del empleado:', error);
                this.error = error.response?.data?.message || error.message || 'Error al cargar contratos del empleado';
                notificationStore.error('Error al cargar los contratos del empleado', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Obtiene los contratos próximos a vencer
         * @param {Object} params - Parámetros de filtrado (días, límite)
         * @returns {Promise} - Promesa con los contratos próximos a vencer
         */
        async fetchContratosProximosAVencer(params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.getProximosAVencer(params);

                if (response.data && response.data.success) {
                    const { contratos, pagination, estadisticas } = response.data.data;
                    this.contratosProximosAVencer = contratos || [];
                    this.pagination = pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0
                    };
                    return {
                        contratos: this.contratosProximosAVencer,
                        estadisticas
                    };
                } else {
                    throw new Error(response.data?.message || 'Error al cargar contratos próximos a vencer');
                }
            } catch (error) {
                console.error('Error al cargar contratos próximos a vencer:', error);
                this.error = error.response?.data?.message || error.message || 'Error al cargar contratos próximos a vencer';
                notificationStore.error('Error al cargar los contratos próximos a vencer', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Obtiene un contrato por su ID
         * @param {number|string} id - ID del contrato
         * @returns {Promise} - Promesa con el contrato
         */
        async fetchContrato(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.getById(id);

                if (response.data && response.data.success) {
                    this.contratoActual = response.data.data.contrato;
                    return this.contratoActual;
                } else {
                    throw new Error(response.data?.message || 'Error al cargar contrato');
                }
            } catch (error) {
                console.error('Error al cargar contrato:', error);
                this.error = error.response?.data?.message || error.message || 'Error al cargar contrato';
                notificationStore.error('Error al cargar el contrato', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Crea un nuevo contrato
         * @param {FormData} contratoData - Datos del contrato en formato FormData
         * @returns {Promise} - Promesa con el contrato creado
         */
        async createContrato(contratoData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.create(contratoData);

                if (response.data && response.data.success) {
                    const contrato = response.data.data.contrato;

                    this.contratos.unshift(contrato);

                    if (contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date()) {
                        if (this.estadisticas) {
                            this.estadisticas.vigente = true;
                            this.estadisticas.contratoVigente = contrato;
                        }
                    }

                    notificationStore.success('Contrato creado correctamente', 'Éxito');
                    return contrato;
                } else {
                    throw new Error(response.data?.message || 'Error al crear contrato');
                }
            } catch (error) {
                console.error('Error al crear contrato:', error);
                this.error = error.response?.data?.message || error.message || 'Error al crear contrato';
                notificationStore.error('Error al crear el contrato', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Actualiza un contrato existente
         * @param {number|string} id - ID del contrato
         * @param {FormData} contratoData - Datos del contrato en formato FormData
         * @returns {Promise} - Promesa con el contrato actualizado
         */
        async updateContrato(id, contratoData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.update(id, contratoData);

                if (response.data && response.data.success) {
                    const contrato = response.data.data.contrato;

                    const index = this.contratos.findIndex(c => c.id_contrato === parseInt(id));
                    if (index !== -1) {
                        this.contratos[index] = contrato;
                    }

                    if (this.contratoActual && this.contratoActual.id_contrato === parseInt(id)) {
                        this.contratoActual = contrato;
                    }

                    if (this.estadisticas && this.estadisticas.contratoVigente?.id_contrato === parseInt(id)) {
                        const esVigente = contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date();
                        this.estadisticas.vigente = esVigente;
                        this.estadisticas.contratoVigente = esVigente ? contrato : null;
                    }

                    notificationStore.success('Contrato actualizado correctamente', 'Éxito');
                    return contrato;
                } else {
                    throw new Error(response.data?.message || 'Error al actualizar contrato');
                }
            } catch (error) {
                console.error('Error al actualizar contrato:', error);
                this.error = error.response?.data?.message || error.message || 'Error al actualizar contrato';
                notificationStore.error('Error al actualizar el contrato', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Elimina un contrato
         * @param {number|string} id - ID del contrato
         * @returns {Promise} - Promesa con el resultado de la eliminación
         */
        async deleteContrato(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await ContratosAPI.delete(id);

                if (response.data && response.data.success) {
                    this.contratos = this.contratos.filter(c => c.id_contrato !== parseInt(id));

                    if (this.contratoActual && this.contratoActual.id_contrato === parseInt(id)) {
                        this.contratoActual = null;
                    }

                    if (this.estadisticas && this.estadisticas.contratoVigente?.id_contrato === parseInt(id)) {
                        this.estadisticas.vigente = false;
                        this.estadisticas.contratoVigente = null;
                    }

                    notificationStore.success('Contrato eliminado correctamente', 'Éxito');
                    return true;
                } else {
                    throw new Error(response.data?.message || 'Error al eliminar contrato');
                }
            } catch (error) {
                console.error('Error al eliminar contrato:', error);
                this.error = error.response?.data?.message || error.message || 'Error al eliminar contrato';
                notificationStore.error('Error al eliminar el contrato', 'Error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Descarga el archivo de un contrato
         * @param {number|string} id - ID del contrato
         * @returns {Promise} - Promesa con el resultado de la descarga
         */
        async downloadContrato(id) {
            const notificationStore = useNotificationStore();
            try {
                const response = await ContratosAPI.download(id);

                const blob = new Blob([response.data]);
                const url = window.URL.createObjectURL(blob);

                const contentDisposition = response.headers['content-disposition'];
                let filename = 'contrato.pdf';

                if (contentDisposition) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 100);

                return true;
            } catch (error) {
                console.error('Error al descargar contrato:', error);
                notificationStore.error('Error al descargar el archivo del contrato', 'Error');
                throw error;
            }
        },

        /**
         * Previsualiza el archivo de un contrato
         */
        async previewContrato(id) {
            const notificationStore = useNotificationStore();
            try {
                const response = await ContratosAPI.preview(id);

                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);

                const newWindow = window.open(url, '_blank');

                if (newWindow) {
                    newWindow.addEventListener('beforeunload', () => {
                        window.URL.revokeObjectURL(url);
                    });
                }

                return url;
            } catch (error) {
                console.error('Error al previsualizar contrato:', error);
                notificationStore.error('Error al previsualizar el archivo del contrato', 'Error');
                throw error;
            }
        },

        resetState() {
            this.contratos = [];
            this.contratoActual = null;
            this.loading = false;
            this.error = null;
            this.pagination = {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
            this.empleadoInfo = null;
            this.estadisticas = null;
            this.contratosProximosAVencer = [];
        }
    }
});