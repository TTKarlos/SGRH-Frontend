<template>
  <DefaultLayout>
    <div class="convenios-view">
      <ConveniosHeader @nuevo-convenio="openModal()" />

      <div class="card">
        <ConveniosFiltros
            :search="search"
            :filters="filters"
            @update:search="updateSearch"
            @search="fetchConvenios"
        />

        <ConveniosTabla
            :loading="loading"
            :error="error"
            :convenios="convenios"
            :filters="filters"
            @retry="fetchConvenios"
            @reset-filters="resetFilters"
            @view-convenio="viewConvenio"
            @edit-convenio="editConvenio"
            @delete-convenio="confirmDeleteConvenio"
            @add-convenio="openModal()"
        />

        <div v-if="convenios.length > 0 && pagination.totalPages > 1" class="pagination-container">
          <ConveniosPaginacion
              :pagination="pagination"
              :loading="loading"
              @cambiar-pagina="changePage"
          />
        </div>
      </div>

      <ConvenioModal
          v-if="showModal"
          :convenio="selectedConvenio"
          :isEdit="isEdit"
          :viewMode="viewMode"
          :loading="processingForm"
          @close="closeModal"
          @save="saveConvenio"
          @edit="editMode"
      />

      <ConfirmDialog
          v-if="showConfirmDialog"
          :title="confirmTitle"
          :message="confirmMessage"
          :confirmText="confirmButtonText"
          :confirmButtonClass="confirmButtonClass"
          :processing="processing"
          @close="closeConfirmDialog"
          @confirm="confirmAction"
      />
    </div>
  </DefaultLayout>
</template>

<script>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import ConveniosHeader from '../../components/convenios/ConveniosHeader.vue';
import ConveniosFiltros from '../../components/convenios/ConveniosFiltros.vue';
import ConveniosTabla from '../../components/convenios/ConveniosTabla.vue';
import ConveniosPaginacion from '../../components/convenios/ConveniosPaginacion.vue';
import ConvenioModal from '../../components/convenios/modals/ConvenioModal.vue';
import ConfirmDialog from '../../components/convenios/modals/ConfirmDialog.vue';
import { useConveniosStore } from '../../stores/convenios';
import { useNotificationStore } from '../../stores/notification';

export default {
  name: 'ConveniosView',

  components: {
    DefaultLayout,
    ConveniosHeader,
    ConveniosFiltros,
    ConveniosTabla,
    ConveniosPaginacion,
    ConvenioModal,
    ConfirmDialog
  },

  data() {
    return {
      convenios: [],
      loading: false,
      processingForm: false,
      error: null,
      search: '',
      filters: {},
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      showModal: false,
      isEdit: false,
      viewMode: false,
      selectedConvenio: null,
      showConfirmDialog: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: '',
      confirmButtonClass: '',
      confirmCallback: null,
      processing: false,
      conveniosStore: null,
      notificationStore: null
    };
  },

  created() {
    this.conveniosStore = useConveniosStore();
    this.notificationStore = useNotificationStore();
  },

  mounted() {
    this.fetchConvenios();
  },

  methods: {
    updateSearch(value) {
      this.search = value;
    },

    async fetchConvenios() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.search,
          ...this.filters
        };

        await this.conveniosStore.fetchConvenios(params);

        this.convenios = this.conveniosStore.convenios;
        this.pagination = {
          total: this.convenios.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(this.convenios.length / 10)
        };

        if (this.pagination.page > this.pagination.totalPages && this.pagination.totalPages > 0) {
          this.pagination.page = 1;
          this.fetchConvenios();
        }
      } catch (err) {
        console.error('Error al cargar convenios:', err);
        this.error = 'Error al cargar los convenios. Por favor, inténtelo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.search = '';
      this.filters = {};
      this.pagination.page = 1;
      this.fetchConvenios();
    },

    changePage(page) {
      this.pagination.page = page;
      this.fetchConvenios();
    },

    openModal(convenio = null) {
      this.selectedConvenio = convenio ? { ...convenio } : {
        nombre: '',
        codigo: '',
        descripcion: ''
      };
      this.isEdit = !!convenio;
      this.viewMode = false;
      this.showModal = true;
    },

    viewConvenio(convenio) {
      this.selectedConvenio = { ...convenio };
      this.isEdit = true;
      this.viewMode = true;
      this.showModal = true;
    },

    editConvenio(convenio) {
      this.selectedConvenio = JSON.parse(JSON.stringify(convenio));
      this.isEdit = true;
      this.viewMode = false;
      this.showModal = true;
    },

    editMode() {
      this.viewMode = false;
    },

    closeModal() {
      this.showModal = false;
      this.selectedConvenio = null;
    },

    async saveConvenio(convenio) {
      this.processingForm = true;

      try {
        if (this.isEdit) {
          await this.conveniosStore.updateConvenio(convenio.id_convenio, convenio);
        } else {
          await this.conveniosStore.createConvenio(convenio);
        }

        this.closeModal();
        await this.fetchConvenios();
      } catch (err) {
        console.error('Error al guardar convenio:', err);
      } finally {
        this.processingForm = false;
      }
    },

    confirmDeleteConvenio(convenio) {
      this.selectedConvenio = convenio;
      this.confirmTitle = 'Eliminar convenio';
      this.confirmMessage = `¿Está seguro de que desea eliminar el convenio <strong>${convenio.nombre}</strong>? Esta acción no se puede deshacer.`;
      this.confirmButtonText = 'Eliminar';
      this.confirmButtonClass = 'btn-danger';

      this.confirmCallback = async () => {
        try {
          this.processing = true;
          await this.conveniosStore.deleteConvenio(convenio.id_convenio);
          await this.fetchConvenios();
        } catch (err) {
          console.error('Error al eliminar convenio:', err);
        } finally {
          this.processing = false;
          this.closeConfirmDialog();
        }
      };

      this.showConfirmDialog = true;
    },

    confirmAction() {
      if (this.confirmCallback) {
        this.confirmCallback();
      }
    },

    closeConfirmDialog() {
      this.showConfirmDialog = false;
      this.confirmCallback = null;
    }
  }
};
</script>

<style scoped>
.convenios-view {
  padding: 1.5rem;
  max-width: 100%;
  overflow-x: hidden;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
  width: 100%;
}

.pagination-container {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .convenios-view {
    padding: 1rem;
  }
}
</style>
