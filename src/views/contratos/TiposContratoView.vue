<template>
  <DefaultLayout>
    <div class="tipos-contrato-view">
      <TiposContratoHeader @nuevo-tipo="openModal()" />

      <div class="card">
        <TiposContratoFiltros
            :search="search"
            :filters="filters"
            @update:search="updateSearch"
            @update:filters="updateFilters"
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
            @edit-tipo="editTipo"
            @copy-tipo="copyTipo"
            @delete-tipo="confirmDeleteTipo"
            @add-tipo="openModal()"
        />

        <div v-if="tiposContrato.length > 0 && pagination.totalPages > 1" class="pagination-container">
          <TiposContratoPaginacion
              :pagination="pagination"
              :loading="loading"
              @cambiar-pagina="changePage"
          />
        </div>
      </div>

      <TipoContratoModal
          v-if="showModal"
          :tipo="selectedTipo"
          :isEdit="isEdit"
          :viewMode="viewMode"
          :loading="processingForm"
          @close="closeModal"
          @save="saveTipo"
          @edit="editMode"
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
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TiposContratoHeader from '../../components/contratos/TiposContratoHeader.vue';
import TiposContratoFiltros from '../../components/contratos/TiposContratoFiltros.vue';
import TiposContratoTabla from '../../components/contratos/TiposContratoTabla.vue';
import TiposContratoPaginacion from '../../components/contratos/TiposContratoPaginacion.vue';
import TipoContratoModal from '../../components/contratos/modals/TipoContratoModal.vue';
import ConfirmDialog from '../../components/contratos/modals/ConfirmDialog.vue';
import { useTiposContratoStore } from '../../stores/tiposContrato';
import { useNotificationStore } from '../../stores/notification';

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

  data() {
    return {
      tiposContrato: [],
      loading: false,
      processingForm: false,
      error: null,
      search: '',
      filters: {
        codigo: ''
      },
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false
      },
      showModal: false,
      isEdit: false,
      viewMode: false,
      selectedTipo: null,
      showConfirm: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: '',
      confirmButtonClass: '',
      confirmCallback: null,
      processing: false,
      tiposContratoStore: null,
      notificationStore: null
    };
  },

  created() {
    this.tiposContratoStore = useTiposContratoStore();
    this.notificationStore = useNotificationStore();
  },

  mounted() {
    this.fetchTiposContrato();
  },

  methods: {
    updateSearch(value) {
      this.search = value;
    },

    updateFilters(value) {
      this.filters = value;
    },

    async fetchTiposContrato() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.search,
          ...this.filters
        };

        await this.tiposContratoStore.fetchTiposContrato(params);

        this.tiposContrato = this.tiposContratoStore.tiposContrato;
        this.pagination = this.tiposContratoStore.pagination;

        if (this.pagination.page > this.pagination.totalPages && this.pagination.totalPages > 0) {
          this.pagination.page = 1;
          this.fetchTiposContrato();
        }
      } catch (err) {
        console.error('Error al cargar tipos de contrato:', err);
        this.error = 'Error al cargar los tipos de contrato. Por favor, inténtelo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.search = '';
      this.filters = {
        codigo: ''
      };
      this.pagination.page = 1;
      this.fetchTiposContrato();
    },

    changePage(page) {
      this.pagination.page = page;
      this.fetchTiposContrato();
    },

    openModal(tipo = null) {
      this.selectedTipo = tipo ? { ...tipo } : {
        nombre: '',
        codigo: '',
        descripcion: ''
      };
      this.isEdit = !!tipo;
      this.viewMode = false;
      this.showModal = true;

      console.log('Abriendo modal con tipo:', this.selectedTipo);
    },

    viewTipo(tipo) {
      this.selectedTipo = { ...tipo };
      this.isEdit = true;
      this.viewMode = true;
      this.showModal = true;

      console.log('Viendo tipo:', this.selectedTipo);
    },

    editTipo(tipo) {
      this.selectedTipo = JSON.parse(JSON.stringify(tipo));
      this.isEdit = true;
      this.viewMode = false;
      this.showModal = true;

      console.log('Editando tipo:', this.selectedTipo);
    },

    copyTipo(tipo) {
      const tipoCopiado = JSON.parse(JSON.stringify(tipo));
      delete tipoCopiado.id_tipo_contrato;
      tipoCopiado.codigo = `${tipoCopiado.codigo}_copia`;
      tipoCopiado.nombre = `${tipoCopiado.nombre} (Copia)`;

      this.selectedTipo = tipoCopiado;
      this.isEdit = false;
      this.viewMode = false;
      this.showModal = true;

      console.log('Copiando tipo:', this.selectedTipo);
    },

    editMode() {
      this.viewMode = false;
    },

    closeModal() {
      this.showModal = false;
      this.selectedTipo = null;
    },

    async saveTipo(tipo) {
      this.processingForm = true;

      try {
        console.log('Guardando tipo:', tipo);

        if (this.isEdit) {
          await this.tiposContratoStore.updateTipoContrato(tipo.id_tipo_contrato, tipo);
        } else {
          await this.tiposContratoStore.createTipoContrato(tipo);
        }

        this.closeModal();

        await this.fetchTiposContrato();
      } catch (err) {
        console.error('Error al guardar tipo de contrato:', err);
      } finally {
        this.processingForm = false;
      }
    },

    confirmDeleteTipo(tipo) {
      console.log('Confirmando eliminación de tipo:', tipo);

      this.confirmTitle = 'Eliminar tipo de contrato';
      this.confirmMessage = `¿Está seguro de que desea eliminar el tipo de contrato <strong>${tipo.nombre}</strong> (${tipo.codigo})? Esta acción no se puede deshacer.`;
      this.confirmButtonText = 'Eliminar';
      this.confirmButtonClass = 'btn-danger';

      this.confirmCallback = async () => {
        try {
          this.processing = true;

          console.log(`Eliminando tipo de contrato con ID ${tipo.id_tipo_contrato}`);

          await this.tiposContratoStore.deleteTipoContrato(tipo.id_tipo_contrato);

          await this.fetchTiposContrato();
        } catch (err) {

          if (err.response?.data?.message?.includes("tiene contratos asociados") ||
              err.message?.includes("tiene contratos asociados")) {
            console.error('El tipo de contrato tiene contratos asociados y no puede ser eliminado');
          }
        } finally {
          this.processing = false;
          this.closeConfirm();
        }
      };

      this.showConfirm = true;
    },

    confirmAction() {

      if (this.confirmCallback) {
        this.confirmCallback();
      } else {
        console.error('No hay callback de confirmación definido');
      }
    },

    closeConfirm() {
      this.showConfirm = false;
      this.confirmCallback = null;
    }
  }
};
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

.pagination-container {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
