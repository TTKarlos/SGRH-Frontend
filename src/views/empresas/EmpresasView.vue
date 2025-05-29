<template>
  <DefaultLayout>
    <div class="empresas-view">
      <EmpresasHeader @nueva-empresa="openModal()" />

      <div class="card">
        <EmpresasFiltros
            :search="search"
            :filters="filters"
            @update:search="updateSearch"
            @update:filters="updateFilters"
            @search="fetchEmpresas"
            @apply-filters="fetchEmpresas"
            @reset-filters="resetFilters"
        />

        <EmpresasTabla
            :loading="loading"
            :error="error"
            :empresas="empresas"
            :filters="filters"
            @retry="fetchEmpresas"
            @reset-filters="resetFilters"
            @view-empresa="viewEmpresa"
            @edit-empresa="editEmpresa"
            @delete-empresa="confirmDeleteEmpresa"
            @add-empresa="openModal()"
        />

        <div v-if="empresas.length > 0 && pagination.totalPages > 1" class="pagination-container">
          <EmpresasPaginacion
              :pagination="pagination"
              :loading="loading"
              @cambiar-pagina="changePage"
          />
        </div>
      </div>

      <EmpresaModal
          v-if="showModal"
          :empresa="selectedEmpresa"
          :isEdit="isEdit"
          :viewMode="viewMode"
          :loading="processingForm"
          @close="closeModal"
          @save="saveEmpresa"
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
import EmpresasHeader from '../../components/empresas/EmpresasHeader.vue';
import EmpresasFiltros from '../../components/empresas/EmpresasFiltros.vue';
import EmpresasTabla from '../../components/empresas/EmpresasTabla.vue';
import EmpresasPaginacion from '../../components/empresas/EmpresasPaginacion.vue';
import EmpresaModal from '../../components/empresas/modals/EmpresaModal.vue';
import ConfirmDialog from '../../components/empresas/modals/ConfirmDialog.vue';
import { useEmpresasStore } from '../../stores/empresas';
import { useNotificationStore } from '../../stores/notification';

export default {
  name: 'EmpresasView',

  components: {
    DefaultLayout,
    EmpresasHeader,
    EmpresasFiltros,
    EmpresasTabla,
    EmpresaModal,
    ConfirmDialog
  },

  data() {
    return {
      empresas: [],
      loading: false,
      processingForm: false,
      error: null,
      search: '',
      filters: {},
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
      selectedEmpresa: null,
      showConfirm: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: '',
      confirmButtonClass: '',
      confirmCallback: null,
      processing: false,
      empresasStore: null,
      notificationStore: null
    };
  },

  created() {
    this.empresasStore = useEmpresasStore();
    this.notificationStore = useNotificationStore();
  },

  mounted() {
    this.fetchEmpresas();
  },

  methods: {
    updateSearch(value) {
      this.search = value;
    },

    updateFilters(value) {
      this.filters = value;
    },

    async fetchEmpresas() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.search,
          ...this.filters
        };

        await this.empresasStore.fetchEmpresas(params);

        this.empresas = this.empresasStore.empresas;
        this.pagination = this.empresasStore.pagination;

        if (this.pagination.page > this.pagination.totalPages && this.pagination.totalPages > 0) {
          this.pagination.page = 1;
          this.fetchEmpresas();
        }
      } catch (err) {
        console.error('Error al cargar empresas:', err);
        this.error = 'Error al cargar las empresas. Por favor, inténtelo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.search = '';
      this.filters = {};
      this.pagination.page = 1;
      this.fetchEmpresas();
    },

    changePage(page) {
      this.pagination.page = page;
      this.fetchEmpresas();
    },

    openModal(empresa = null) {
      this.selectedEmpresa = empresa ? { ...empresa } : {
        nombre: '',
        cif: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true
      };
      this.isEdit = !!empresa;
      this.viewMode = false;
      this.showModal = true;

    },

    viewEmpresa(empresa) {
      this.selectedEmpresa = { ...empresa };
      this.isEdit = true;
      this.viewMode = true;
      this.showModal = true;

    },

    editEmpresa(empresa) {
      this.selectedEmpresa = JSON.parse(JSON.stringify(empresa));
      this.isEdit = true;
      this.viewMode = false;
      this.showModal = true;

      console.log('Editando empresa:', this.selectedEmpresa);
    },

    editMode() {
      this.viewMode = false;
    },

    closeModal() {
      this.showModal = false;
      this.selectedEmpresa = null;
    },

    async saveEmpresa(empresa) {
      this.processingForm = true;

      try {
        console.log('Guardando empresa:', empresa);

        if (this.isEdit) {
          await this.empresasStore.updateEmpresa(empresa.id_empresa, empresa);
        } else {
          await this.empresasStore.createEmpresa(empresa);
        }

        this.closeModal();

        await this.fetchEmpresas();
      } catch (err) {
        console.error('Error al guardar empresa:', err);
      } finally {
        this.processingForm = false;
      }
    },

    confirmDeleteEmpresa(empresa) {
      console.log('Confirmando eliminación de empresa:', empresa);

      this.confirmTitle = 'Eliminar empresa';
      this.confirmMessage = `¿Está seguro de que desea eliminar la empresa <strong>${empresa.nombre}</strong>? Esta acción no se puede deshacer.`;
      this.confirmButtonText = 'Eliminar';
      this.confirmButtonClass = 'btn-danger';

      this.confirmCallback = async () => {
        try {
          this.processing = true;

          console.log(`Eliminando empresa con ID ${empresa.id_empresa}`);

          await this.empresasStore.deleteEmpresa(empresa.id_empresa);

          console.log('Empresa eliminada correctamente');

          await this.fetchEmpresas();
        } catch (err) {
          console.error('Error al eliminar empresa:', err);

          if (err.response?.data?.message?.includes("tiene empleados asociados") ||
              err.message?.includes("tiene empleados asociados")) {
            console.error('La empresa tiene empleados asociados y no puede ser eliminada');
          }
        } finally {
          this.processing = false;
          this.closeConfirm();
        }
      };

      this.showConfirm = true;
    },

    confirmAction() {
      console.log('Confirmando acción');

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
.empresas-view {
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
