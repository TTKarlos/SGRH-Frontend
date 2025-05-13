<template>
  <DefaultLayout>
    <div class="tipos-contrato-view">
      <TiposContratoHeader @nuevo-tipo="openModal()" />

      <div class="card">
        <TiposContratoFiltros
            :search="search"
            :filters="filters"
            @update:search="search = $event"
            @update:filters="filters = $event"
            @search="fetchTiposContrato"
            @apply-filters="fetchTiposContrato"
            @reset-filters="resetFilters"
        />

        <TiposContratoTabla
            :loading="loading"
            :error="error"
            :tiposContrato="tiposContrato"
            :filters="filters"
            @retry="fetchTiposContrato"
            @reset-filters="resetFilters"
            @view-tipo="viewTipo"
            @delete-tipo="confirmDeleteTipo"
        />

        <TiposContratoPaginacion
            :pagination="pagination"
            :loading="loading"
            @cambiar-pagina="changePage"
        />
      </div>

      <TipoContratoModal
          v-if="showModal"
          :tipo="selectedTipo"
          :isEdit="isEdit"
          :viewMode="viewMode"
          @close="closeModal"
          @save="saveTipo"
          @toggle-status="toggleTipoStatus"
      />

      <ConfirmDialog
          v-if="showConfirm"
          :title="confirmTitle"
          :message="confirmMessage"
          :confirmText="confirmButtonText"
          :confirmButtonClass="confirmButtonClass"
          :processing="processing"
          @close="closeConfirm"
          @confirm="confirmAction"
      />
    </div>
  </DefaultLayout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TiposContratoHeader from '../../components/contratos/TiposContratoHeader.vue';
import TiposContratoFiltros from '../../components/contratos/TiposContratoFiltros.vue';
import TiposContratoTabla from '../../components/contratos/TiposContratoTabla.vue';
import TiposContratoPaginacion from '../../components/contratos/TiposContratoPaginacion.vue';
import TipoContratoModal from '../../components/contratos/modals/TipoContratoModal.vue';
import ConfirmDialog from '../../components/contratos/modals/ConfirmDialog.vue';
import { useTiposContratoStore } from '../../stores/tiposContrato';

const tiposContratoDummy = [
  {
    id_tipo_contrato: 1,
    nombre: 'Contrato Indefinido',
    descripcion: 'Contrato sin fecha de finalización específica',
    duracion: 'Indefinido',
    activo: true
  },
  {
    id_tipo_contrato: 2,
    nombre: 'Contrato Temporal',
    descripcion: 'Contrato con duración determinada',
    duracion: 'Temporal',
    activo: true
  },
  {
    id_tipo_contrato: 3,
    nombre: 'Contrato de Prácticas',
    descripcion: 'Contrato para estudiantes o recién graduados',
    duracion: 'Prácticas',
    activo: false
  },
  {
    id_tipo_contrato: 4,
    nombre: 'Contrato por Obra o Servicio',
    descripcion: 'Contrato vinculado a la realización de una obra o servicio',
    duracion: 'Temporal',
    activo: true
  },
  {
    id_tipo_contrato: 5,
    nombre: 'Contrato de Formación',
    descripcion: 'Contrato para formación y aprendizaje',
    duracion: 'Temporal',
    activo: true
  }
];

export default {
  name: 'TiposContratoView',
  components: {
    DefaultLayout,
    TiposContratoHeader,
    TiposContratoFiltros,
    TiposContratoTabla,
    TiposContratoPaginacion,
    TipoContratoModal,
    ConfirmDialog
  },
  setup() {
    const tiposContratoStore = useTiposContratoStore();

    const showToast = (message, type) => {
      if (window.$notify) {
        window.$notify({
          type: type,
          text: message
        });
      } else {
        console.log(`[${type}] ${message}`);
      }
    };

    const tiposContrato = ref([...tiposContratoDummy]);
    const loading = ref(false);
    const error = ref(null);
    const search = ref('');
    const filters = reactive({
      activo: null,
      duracion: ''
    });

    const pagination = reactive({
      page: 1,
      limit: 10,
      totalItems: tiposContratoDummy.length,
      totalPages: Math.ceil(tiposContratoDummy.length / 10)
    });

    const showModal = ref(false);
    const isEdit = ref(false);
    const viewMode = ref(true);
    const selectedTipo = ref(null);

    const showConfirm = ref(false);
    const confirmTitle = ref('');
    const confirmMessage = ref('');
    const confirmButtonText = ref('');
    const confirmButtonClass = ref('');
    const confirmCallback = ref(null);
    const processing = ref(false);

    const fetchTiposContrato = async () => {
      loading.value = true;
      error.value = null;

      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search.value,
          ...filters
        };

        try {
          const response = await tiposContratoStore.fetchTiposContrato(params);

          if (response && (response.data || Array.isArray(response))) {
            if (response.data) {
              tiposContrato.value = response.data;
              pagination.totalItems = response.totalItems || 0;
              pagination.totalPages = response.totalPages || 1;
            } else if (Array.isArray(response)) {
              tiposContrato.value = response;
              pagination.totalItems = response.length;
              pagination.totalPages = Math.ceil(response.length / pagination.limit);
            }
          } else {
            let filteredData = [...tiposContratoDummy];

            if (search.value) {
              const searchLower = search.value.toLowerCase();
              filteredData = filteredData.filter(tipo =>
                  tipo.nombre.toLowerCase().includes(searchLower) ||
                  (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower))
              );
            }

            if (filters.activo !== null) {
              filteredData = filteredData.filter(tipo => tipo.activo === filters.activo);
            }

            if (filters.duracion) {
              filteredData = filteredData.filter(tipo => tipo.duracion === filters.duracion);
            }

            const startIndex = (pagination.page - 1) * pagination.limit;
            const endIndex = startIndex + pagination.limit;

            tiposContrato.value = filteredData.slice(startIndex, endIndex);
            pagination.totalItems = filteredData.length;
            pagination.totalPages = Math.ceil(filteredData.length / pagination.limit);
          }
        } catch (err) {
          console.error('Error fetching from store, using dummy data:', err);

          let filteredData = [...tiposContratoDummy];

          if (search.value) {
            const searchLower = search.value.toLowerCase();
            filteredData = filteredData.filter(tipo =>
                tipo.nombre.toLowerCase().includes(searchLower) ||
                (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower))
            );
          }

          if (filters.activo !== null) {
            filteredData = filteredData.filter(tipo => tipo.activo === filters.activo);
          }

          if (filters.duracion) {
            filteredData = filteredData.filter(tipo => tipo.duracion === filters.duracion);
          }

          const startIndex = (pagination.page - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;

          tiposContrato.value = filteredData.slice(startIndex, endIndex);
          pagination.totalItems = filteredData.length;
          pagination.totalPages = Math.ceil(filteredData.length / pagination.limit);
        }

        if (pagination.page > pagination.totalPages && pagination.totalPages > 0) {
          pagination.page = 1;
          fetchTiposContrato();
        }
      } catch (err) {
        console.error('Error general en fetchTiposContrato:', err);
        error.value = 'Error al cargar los tipos de contrato. Por favor, inténtelo de nuevo.';
      } finally {
        loading.value = false;
      }
    };

    const resetFilters = () => {
      search.value = '';
      Object.keys(filters).forEach(key => {
        filters[key] = key === 'activo' ? null : '';
      });
      pagination.page = 1;
      fetchTiposContrato();
    };

    const changePage = (page) => {
      pagination.page = page;
      fetchTiposContrato();
    };

    const openModal = (tipo = null) => {
      selectedTipo.value = tipo ? { ...tipo } : {
        nombre: '',
        descripcion: '',
        duracion: '',
        activo: true
      };
      isEdit.value = !!tipo;
      viewMode.value = !!tipo;
      showModal.value = true;
    };

    const viewTipo = (tipo) => {
      selectedTipo.value = { ...tipo };
      isEdit.value = true;
      viewMode.value = true;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      selectedTipo.value = null;
    };

    const saveTipo = async (tipo) => {
      loading.value = true;

      try {
        if (isEdit.value) {
          try {
            if (typeof tiposContratoStore.updateTipoContrato === 'function') {
              await tiposContratoStore.updateTipoContrato(tipo.id_tipo_contrato, tipo);
            } else {
              throw new Error('updateTipoContrato no es una función');
            }
          } catch (err) {
            console.error('Error updating in store, updating dummy data:', err);
            const index = tiposContratoDummy.findIndex(t => t.id_tipo_contrato === tipo.id_tipo_contrato);
            if (index !== -1) {
              tiposContratoDummy[index] = { ...tipo };
            }
          }
          showToast('Tipo de contrato actualizado correctamente', 'success');
        } else {
          try {
            if (typeof tiposContratoStore.createTipoContrato === 'function') {
              await tiposContratoStore.createTipoContrato(tipo);
            } else {
              throw new Error('createTipoContrato no es una función');
            }
          } catch (err) {
            console.error('Error creating in store, adding to dummy data:', err);
            const newId = Math.max(...tiposContratoDummy.map(t => t.id_tipo_contrato)) + 1;
            tiposContratoDummy.push({
              ...tipo,
              id_tipo_contrato: newId
            });
          }
          showToast('Tipo de contrato creado correctamente', 'success');
        }

        closeModal();
        fetchTiposContrato();
      } catch (err) {
        console.error('Error saving tipo contrato:', err);
        showToast('Error al guardar el tipo de contrato', 'error');
      } finally {
        loading.value = false;
      }
    };

    const toggleTipoStatus = async (tipo) => {
      loading.value = true;

      try {
        try {
          if (typeof tiposContratoStore.toggleTipoContratoStatus === 'function') {
            await tiposContratoStore.toggleTipoContratoStatus(tipo.id_tipo_contrato);
          } else {
            throw new Error('toggleTipoContratoStatus no es una función');
          }
        } catch (err) {
          console.error(`Error toggling status in store, updating dummy data:`, err);
          const index = tiposContratoDummy.findIndex(t => t.id_tipo_contrato === tipo.id_tipo_contrato);
          if (index !== -1) {
            tiposContratoDummy[index].activo = !tiposContratoDummy[index].activo;
          }
        }

        const action = tipo.activo ? 'desactivado' : 'activado';
        showToast(`Tipo de contrato ${action} correctamente`, 'success');
        closeModal();
        fetchTiposContrato();
      } catch (err) {
        console.error('Error toggling tipo contrato status:', err);
        showToast('Error al cambiar el estado del tipo de contrato', 'error');
      } finally {
        loading.value = false;
      }
    };

    const confirmDeleteTipo = (tipo) => {
      confirmTitle.value = 'Eliminar tipo de contrato';
      confirmMessage.value = `¿Está seguro de que desea eliminar el tipo de contrato <strong>${tipo.nombre}</strong>? Esta acción no se puede deshacer.`;
      confirmButtonText.value = 'Eliminar';
      confirmButtonClass.value = 'btn-danger';

      confirmCallback.value = async () => {
        try {
          processing.value = true;

          try {
            if (typeof tiposContratoStore.deleteTipoContrato === 'function') {
              await tiposContratoStore.deleteTipoContrato(tipo.id_tipo_contrato);
            } else {
              throw new Error('deleteTipoContrato no es una función');
            }
          } catch (err) {
            console.error('Error deleting in store, removing from dummy data:', err);
            const index = tiposContratoDummy.findIndex(t => t.id_tipo_contrato === tipo.id_tipo_contrato);
            if (index !== -1) {
              tiposContratoDummy.splice(index, 1);
            }
          }

          showToast('Tipo de contrato eliminado correctamente', 'success');
          fetchTiposContrato();
        } catch (err) {
          console.error('Error deleting tipo contrato:', err);
          showToast('Error al eliminar el tipo de contrato', 'error');
        } finally {
          processing.value = false;
          closeConfirm();
        }
      };

      showConfirm.value = true;
    };

    const confirmAction = () => {
      if (confirmCallback.value) {
        confirmCallback.value();
      }
    };

    const closeConfirm = () => {
      showConfirm.value = false;
      confirmCallback.value = null;
    };

    onMounted(() => {
      fetchTiposContrato();
    });

    return {
      tiposContrato,
      loading,
      error,
      search,
      filters,
      pagination,
      showModal,
      isEdit,
      viewMode,
      selectedTipo,
      showConfirm,
      confirmTitle,
      confirmMessage,
      confirmButtonText,
      confirmButtonClass,
      processing,
      fetchTiposContrato,
      resetFilters,
      changePage,
      openModal,
      viewTipo,
      closeModal,
      saveTipo,
      toggleTipoStatus,
      confirmDeleteTipo,
      confirmAction,
      closeConfirm
    };
  }
}
</script>

<style scoped>
.tipos-contrato-view {
  padding: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}
</style>