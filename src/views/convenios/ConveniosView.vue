<template>
  <DefaultLayout>
    <div class="convenios-view">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <h1>Convenios Colectivos</h1>
          <p class="description">Gestión de convenios colectivos y sus categorías profesionales</p>
        </div>
        <div class="header-actions">
          <button @click="openModal()" class="btn btn-primary" :disabled="loading">
            <i class="lucide-plus"></i>
            Nuevo Convenio
          </button>
          <button @click="refreshData" class="btn btn-outline" :disabled="loading">
            <i class="lucide-refresh-cw"></i>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="card-body filter-section">
          <div class="filter-grid">
            <div class="form-group">
              <label>Buscar</label>
              <div class="search-input">
                <input
                    type="text"
                    v-model="filtros.search"
                    placeholder="Buscar por nombre o código..."
                    class="form-control"
                />
                <i class="lucide-search search-icon"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="filtros.activo" class="form-control">
                <option :value="null">Todos</option>
                <option :value="true">Vigentes</option>
                <option :value="false">No vigentes</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button @click="aplicarFiltros" class="btn btn-primary" :disabled="loading">
              <i class="lucide-search icon-sm"></i>
              Filtrar
            </button>
            <button @click="limpiarFiltros" class="btn btn-outline" :disabled="loading">
              <i class="lucide-x icon-sm"></i>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de datos -->
      <div class="card">
        <div class="card-body">
          <div class="table-container">
            <table class="data-table">
              <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Categorías</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
              </thead>
              <tbody v-if="!loading && convenios.length > 0">
              <tr v-for="convenio in convenios" :key="convenio.id_convenio">
                <td>{{ convenio.nombre }}</td>
                <td>{{ convenio.codigo || 'N/A' }}</td>
                <td>{{ formatDate(convenio.fecha_inicio) }}</td>
                <td>{{ convenio.fecha_fin ? formatDate(convenio.fecha_fin) : 'Indefinido' }}</td>
                <td>{{ convenio.categorias_count || 0 }}</td>
                <td>
                    <span
                        :class="[
                        'status-badge',
                        isConvenioVigente(convenio) ? 'status-active' : 'status-inactive'
                      ]"
                    >
                      {{ isConvenioVigente(convenio) ? 'Vigente' : 'No vigente' }}
                    </span>
                </td>
                <td class="text-center">
                  <div class="action-buttons-inline">
                    <button @click="viewConvenio(convenio)" class="btn-icon btn-info">
                      <i class="lucide-eye icon-sm"></i>
                    </button>
                    <button @click="editConvenio(convenio)" class="btn-icon btn-warning">
                      <i class="lucide-edit icon-sm"></i>
                    </button>
                    <button @click="openCategoriasModal(convenio)" class="btn-icon btn-secondary">
                      <i class="lucide-list icon-sm"></i>
                    </button>
                    <button @click="confirmDelete(convenio)" class="btn-icon btn-danger">
                      <i class="lucide-trash icon-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
              <tbody v-else-if="loading">
              <tr>
                <td colspan="7" class="loading-state">
                  <div class="loading-indicator">
                    <i class="lucide-loader loading-spinner"></i>
                  </div>
                  <p class="loading-text">Cargando convenios...</p>
                </td>
              </tr>
              </tbody>
              <tbody v-else>
              <tr>
                <td colspan="7" class="empty-state">
                  <i class="lucide-clipboard empty-icon"></i>
                  <p class="empty-text">No se encontraron convenios</p>
                  <button @click="openModal()" class="btn btn-primary mt-4">
                    <i class="lucide-plus icon-sm"></i>
                    Crear Convenio
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <div class="pagination-info">
          Mostrando {{ pagination.page }} de {{ pagination.totalPages }} páginas
          ({{ pagination.totalItems }} registros)
        </div>
        <div class="pagination-controls">
          <button
              @click="cambiarPagina(1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page <= 1 || loading"
          >
            <i class="lucide-chevrons-left icon-sm"></i>
          </button>
          <button
              @click="cambiarPagina(pagination.page - 1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page <= 1 || loading"
          >
            <i class="lucide-chevron-left icon-sm"></i>
          </button>
          <span class="pagination-current">{{ pagination.page }}</span>
          <button
              @click="cambiarPagina(pagination.page + 1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page >= pagination.totalPages || loading"
          >
            <i class="lucide-chevron-right icon-sm"></i>
          </button>
          <button
              @click="cambiarPagina(pagination.totalPages)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page >= pagination.totalPages || loading"
          >
            <i class="lucide-chevrons-right icon-sm"></i>
          </button>
        </div>
      </div>

      <!-- Modal de Convenio -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar convenio' : 'Nuevo convenio' }}</h3>
            <button @click="closeModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveConvenio">
              <!-- Nombre -->
              <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    id="nombre"
                    v-model="convenioForm.nombre"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.nombre }"
                    required
                />
                <div v-if="validationErrors.nombre" class="invalid-feedback">
                  {{ validationErrors.nombre }}
                </div>
              </div>

              <!-- Código -->
              <div class="form-group">
                <label for="codigo">Código</label>
                <input
                    id="codigo"
                    v-model="convenioForm.codigo"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.codigo }"
                />
                <div v-if="validationErrors.codigo" class="invalid-feedback">
                  {{ validationErrors.codigo }}
                </div>
              </div>

              <!-- Fecha de inicio -->
              <div class="form-group">
                <label for="fecha_inicio">Fecha de inicio</label>
                <input
                    id="fecha_inicio"
                    v-model="convenioForm.fecha_inicio"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.fecha_inicio }"
                />
                <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
                  {{ validationErrors.fecha_inicio }}
                </div>
              </div>

              <!-- Fecha de fin -->
              <div class="form-group">
                <label for="fecha_fin">Fecha de fin</label>
                <div class="campo-con-nota">
                  <input
                      id="fecha_fin"
                      v-model="convenioForm.fecha_fin"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.fecha_fin }"
                  />
                  <div class="form-text">
                    Dejar en blanco si el convenio no tiene fecha de finalización
                  </div>
                </div>
                <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
                  {{ validationErrors.fecha_fin }}
                </div>
              </div>

              <!-- Error general -->
              <div v-if="validationErrors.general" class="alert alert-danger">
                {{ validationErrors.general }}
              </div>

              <div class="modal-footer">
                <button
                    type="button"
                    @click="closeModal"
                    class="btn btn-secondary"
                    :disabled="saving"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving || !isFormValid">
                  <span v-if="saving">
                    <i class="lucide-loader icon-sm spinner"></i>
                    Guardando...
                  </span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Visualización de Convenio -->
      <div v-if="showViewModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalles del Convenio</h3>
            <button @click="closeViewModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="convenioSeleccionado" class="detail-content">
              <div class="detail-section">
                <h4 class="section-subtitle">Información General</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <h5 class="detail-label">Nombre</h5>
                    <p class="detail-value">{{ convenioSeleccionado.nombre }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Código</h5>
                    <p class="detail-value">{{ convenioSeleccionado.codigo || 'N/A' }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Estado</h5>
                    <p class="detail-value">
                      <span
                          :class="[
                          'status-badge',
                          isConvenioVigente(convenioSeleccionado) ? 'status-active' : 'status-inactive'
                        ]"
                      >
                        {{ isConvenioVigente(convenioSeleccionado) ? 'Vigente' : 'No vigente' }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-subtitle">Vigencia</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <h5 class="detail-label">Fecha de inicio</h5>
                    <p class="detail-value">{{ formatDate(convenioSeleccionado.fecha_inicio) || 'N/A' }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Fecha de fin</h5>
                    <p class="detail-value">{{ convenioSeleccionado.fecha_fin ? formatDate(convenioSeleccionado.fecha_fin) : 'Indefinido' }}</p>
                  </div>
                </div>
              </div>

              <div v-if="convenioStats" class="detail-section">
                <h4 class="section-subtitle">Estadísticas</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ convenioStats.totalCategorias || 0 }}</div>
                    <div class="stat-label">Categorías</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ convenioStats.totalEmpleados || 0 }}</div>
                    <div class="stat-label">Empleados</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ convenioStats.totalContratos || 0 }}</div>
                    <div class="stat-label">Contratos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="openCategoriasModal(convenioSeleccionado)" class="btn btn-secondary">
              <i class="lucide-list icon-sm"></i>
              Categorías
            </button>
            <button @click="editConvenio(convenioSeleccionado)" class="btn btn-warning">
              <i class="lucide-edit icon-sm"></i>
              Editar
            </button>
            <button @click="closeViewModal" class="btn btn-outline">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Categorías -->
      <div v-if="showCategoriasModal" class="modal-overlay">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Categorías de {{ convenioSeleccionado?.nombre }}</h3>
            <button @click="closeCategoriasModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="categorias-header">
              <div class="search-input">
                <input
                    type="text"
                    v-model="categoriasFiltro"
                    placeholder="Buscar categoría..."
                    class="form-control"
                />
                <i class="lucide-search search-icon"></i>
              </div>
              <button @click="openCategoriaModal()" class="btn btn-primary">
                <i class="lucide-plus icon-sm"></i>
                Nueva Categoría
              </button>
            </div>

            <div v-if="loadingCategorias" class="loading-state">
              <div class="loading-indicator">
                <i class="lucide-loader loading-spinner"></i>
              </div>
              <p class="loading-text">Cargando categorías...</p>
            </div>
            <div v-else-if="categorias.length === 0" class="empty-state">
              <i class="lucide-list-x empty-icon"></i>
              <p class="empty-text">No hay categorías para este convenio</p>
              <button @click="openCategoriaModal()" class="btn btn-primary mt-4">
                <i class="lucide-plus icon-sm"></i>
                Crear Categoría
              </button>
            </div>
            <div v-else class="categorias-list">
              <div
                  v-for="categoria in categoriasFiltradas"
                  :key="categoria.id_categoria"
                  class="categoria-card"
              >
                <div class="categoria-header">
                  <h5 class="categoria-title">{{ categoria.nombre }}</h5>
                  <div class="categoria-actions">
                    <button @click="editCategoria(categoria)" class="btn-icon btn-sm btn-warning">
                      <i class="lucide-edit icon-xs"></i>
                    </button>
                    <button @click="confirmDeleteCategoria(categoria)" class="btn-icon btn-sm btn-danger">
                      <i class="lucide-trash icon-xs"></i>
                    </button>
                  </div>
                </div>
                <div class="categoria-body">
                  <div v-if="categoria.codigo" class="categoria-codigo">
                    Código: {{ categoria.codigo }}
                  </div>
                  <div class="categoria-descripcion">
                    {{ categoria.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeCategoriasModal" class="btn btn-outline">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Categoría -->
      <div v-if="showCategoriaModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditingCategoria ? 'Editar categoría' : 'Nueva categoría' }}</h3>
            <button @click="closeCategoriaModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveCategoria">
              <!-- Nombre -->
              <div class="form-group">
                <label for="nombre_categoria">Nombre *</label>
                <input
                    id="nombre_categoria"
                    v-model="categoriaForm.nombre"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': categoriaValidationErrors.nombre }"
                    required
                />
                <div v-if="categoriaValidationErrors.nombre" class="invalid-feedback">
                  {{ categoriaValidationErrors.nombre }}
                </div>
              </div>

              <!-- Código -->
              <div class="form-group">
                <label for="codigo_categoria">Código</label>
                <input
                    id="codigo_categoria"
                    v-model="categoriaForm.codigo"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': categoriaValidationErrors.codigo }"
                />
                <div v-if="categoriaValidationErrors.codigo" class="invalid-feedback">
                  {{ categoriaValidationErrors.codigo }}
                </div>
              </div>

              <!-- Descripción -->
              <div class="form-group">
                <label for="descripcion_categoria">Descripción</label>
                <textarea
                    id="descripcion_categoria"
                    v-model="categoriaForm.descripcion"
                    class="form-control"
                    :class="{ 'is-invalid': categoriaValidationErrors.descripcion }"
                    rows="3"
                ></textarea>
                <div v-if="categoriaValidationErrors.descripcion" class="invalid-feedback">
                  {{ categoriaValidationErrors.descripcion }}
                </div>
              </div>

              <!-- Error general -->
              <div v-if="categoriaValidationErrors.general" class="alert alert-danger">
                {{ categoriaValidationErrors.general }}
              </div>

              <div class="modal-footer">
                <button
                    type="button"
                    @click="closeCategoriaModal"
                    class="btn btn-secondary"
                    :disabled="savingCategoria"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="savingCategoria || !isCategoriaFormValid">
                  <span v-if="savingCategoria">
                    <i class="lucide-loader icon-sm spinner"></i>
                    Guardando...
                  </span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div v-if="showConfirmDialog" class="modal-overlay">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h3>{{ confirmAction === 'delete' ? 'Eliminar convenio' : 'Eliminar categoría' }}</h3>
            <button @click="closeConfirmDialog" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p v-if="confirmAction === 'delete'">
              ¿Está seguro de que desea eliminar el convenio <strong>{{ convenioSeleccionado?.nombre }}</strong>?
              <br>
              Esta acción no se puede deshacer.
            </p>
            <p v-else-if="confirmAction === 'delete-categoria'">
              ¿Está seguro de que desea eliminar la categoría <strong>{{ categoriaSeleccionada?.nombre }}</strong>?
              <br>
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="closeConfirmDialog" class="btn btn-secondary">
              Cancelar
            </button>
            <button
                v-if="confirmAction === 'delete'"
                @click="deleteConvenio"
                class="btn btn-danger"
                :disabled="processing"
            >
              <span v-if="processing">
                <i class="lucide-loader icon-sm spinner"></i>
                Eliminando...
              </span>
              <span v-else>Eliminar</span>
            </button>
            <button
                v-else-if="confirmAction === 'delete-categoria'"
                @click="deleteCategoria"
                class="btn btn-danger"
                :disabled="processing"
            >
              <span v-if="processing">
                <i class="lucide-loader icon-sm spinner"></i>
                Eliminando...
              </span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import DefaultLayout from '@/layouts/DefaultLayout.vue';

export default {
  name: 'ConveniosView',

  components: {
    DefaultLayout
  },

  data() {
    return {
      convenios: [],
      loading: false,
      showModal: false,
      showViewModal: false,
      showCategoriasModal: false,
      showCategoriaModal: false,
      showConfirmDialog: false,
      convenioSeleccionado: null,
      categoriaSeleccionada: null,
      convenioForm: {
        id_convenio: null,
        nombre: '',
        codigo: '',
        fecha_inicio: '',
        fecha_fin: ''
      },
      categoriaForm: {
        id_categoria: null,
        id_convenio: null,
        nombre: '',
        codigo: '',
        descripcion: ''
      },
      validationErrors: {},
      categoriaValidationErrors: {},
      saving: false,
      savingCategoria: false,
      processing: false,
      confirmAction: '',
      convenioStats: null,
      categorias: [],
      loadingCategorias: false,
      categoriasFiltro: '',

      filtros: {
        search: '',
        activo: null,
        page: 1,
        limit: 10
      },

      pagination: {
        page: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 10
      }
    };
  },

  computed: {
    isEditing() {
      return !!this.convenioForm.id_convenio;
    },

    isEditingCategoria() {
      return !!this.categoriaForm.id_categoria;
    },

    isFormValid() {
      return this.convenioForm.nombre.trim() !== '';
    },

    isCategoriaFormValid() {
      return this.categoriaForm.nombre.trim() !== '';
    },

    categoriasFiltradas() {
      if (!this.categoriasFiltro) return this.categorias;

      const filtro = this.categoriasFiltro.toLowerCase();
      return this.categorias.filter(categoria =>
          categoria.nombre.toLowerCase().includes(filtro) ||
          (categoria.codigo && categoria.codigo.toLowerCase().includes(filtro)) ||
          (categoria.descripcion && categoria.descripcion.toLowerCase().includes(filtro))
      );
    }
  },

  methods: {
    async loadConvenios() {
      this.loading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = {
          data: [
            {
              id_convenio: 1,
              nombre: 'Convenio Colectivo de Oficinas y Despachos',
              codigo: 'CCOD-2023',
              fecha_inicio: '2023-01-01',
              fecha_fin: '2025-12-31',
              categorias_count: 8
            },
            {
              id_convenio: 2,
              nombre: 'Convenio Colectivo de Hostelería',
              codigo: 'CCH-2022',
              fecha_inicio: '2022-06-01',
              fecha_fin: null,
              categorias_count: 12
            },
            {
              id_convenio: 3,
              nombre: 'Convenio Colectivo de Construcción',
              codigo: 'CCC-2021',
              fecha_inicio: '2021-03-15',
              fecha_fin: '2022-03-14',
              categorias_count: 15
            }
          ],
          page: 1,
          totalPages: 1,
          totalItems: 3,
          limit: 10
        };

        this.convenios = response.data;

        this.pagination = {
          page: response.page,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          limit: response.limit
        };
      } catch (error) {
        console.error('Error al cargar convenios:', error);
        this.$store.dispatch('notification/error', 'Error al cargar los convenios');
      } finally {
        this.loading = false;
      }
    },

    refreshData() {
      this.loadConvenios();
    },

    aplicarFiltros() {
      this.filtros.page = 1;
      this.loadConvenios();
    },

    limpiarFiltros() {
      this.filtros = {
        search: '',
        activo: null,
        page: 1,
        limit: 10
      };
      this.loadConvenios();
    },

    cambiarPagina(page) {
      this.filtros.page = page;
      this.loadConvenios();
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
      }
    },

    isConvenioVigente(convenio) {
      if (!convenio) return false;

      const today = new Date();

      if (!convenio.fecha_inicio) return false;

      const fechaInicio = new Date(convenio.fecha_inicio);

      if (!convenio.fecha_fin) return fechaInicio <= today;

      const fechaFin = new Date(convenio.fecha_fin);

      return fechaInicio <= today && today <= fechaFin;
    },

    openModal(convenio = null) {
      this.validationErrors = {};

      if (convenio) {
        this.convenioForm = { ...convenio };
      } else {
        this.convenioForm = {
          id_convenio: null,
          nombre: '',
          codigo: '',
          fecha_inicio: '',
          fecha_fin: ''
        };
      }

      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.convenioForm = {
        id_convenio: null,
        nombre: '',
        codigo: '',
        fecha_inicio: '',
        fecha_fin: ''
      };
      this.validationErrors = {};
    },

    async saveConvenio() {
      if (!this.isFormValid) return;

      this.saving = true;
      this.validationErrors = {};

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (this.isEditing) {
          const index = this.convenios.findIndex(c => c.id_convenio === this.convenioForm.id_convenio);
          if (index !== -1) {
            this.convenios.splice(index, 1, { ...this.convenioForm });
          }
          this.$store.dispatch('notification/success', 'Convenio actualizado correctamente');
        } else {
          const newId = Math.max(0, ...this.convenios.map(c => c.id_convenio)) + 1;
          this.convenios.push({
            ...this.convenioForm,
            id_convenio: newId,
            categorias_count: 0
          });
          this.$store.dispatch('notification/success', 'Convenio creado correctamente');
        }

        this.closeModal();
        this.loadConvenios();
      } catch (error) {
        console.error('Error al guardar convenio:', error);

        this.validationErrors = {
          general: 'Error al guardar el convenio'
        };

        this.$store.dispatch('notification/error', 'Error al guardar el convenio');
      } finally {
        this.saving = false;
      }
    },

    async viewConvenio(convenio) {
      this.convenioSeleccionado = convenio;
      this.showViewModal = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        this.convenioStats = {
          totalCategorias: convenio.categorias_count || 0,
          totalEmpleados: Math.floor(Math.random() * 100),
          totalContratos: Math.floor(Math.random() * 150)
        };
      } catch (error) {
        console.error('Error al cargar estadísticas del convenio:', error);
        this.convenioStats = null;
      }
    },

    closeViewModal() {
      this.showViewModal = false;
      this.convenioSeleccionado = null;
      this.convenioStats = null;
    },

    editConvenio(convenio) {
      this.closeViewModal();
      this.openModal(convenio);
    },

    confirmDelete(convenio) {
      this.convenioSeleccionado = convenio;
      this.confirmAction = 'delete';
      this.showConfirmDialog = true;
    },

    async deleteConvenio() {
      if (!this.convenioSeleccionado) return;

      this.processing = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.convenios = this.convenios.filter(
            c => c.id_convenio !== this.convenioSeleccionado.id_convenio
        );

        this.$store.dispatch('notification/success', 'Convenio eliminado correctamente');
        this.closeConfirmDialog();
        this.loadConvenios();
      } catch (error) {
        console.error('Error al eliminar convenio:', error);
        this.$store.dispatch('notification/error', 'Error al eliminar el convenio');
      } finally {
        this.processing = false;
      }
    },

    async openCategoriasModal(convenio) {
      this.convenioSeleccionado = convenio;
      this.showCategoriasModal = true;
      this.categoriasFiltro = '';

      await this.loadCategorias(convenio.id_convenio);
    },

    closeCategoriasModal() {
      this.showCategoriasModal = false;
      this.convenioSeleccionado = null;
      this.categorias = [];
    },

    async loadCategorias(idConvenio) {
      if (!idConvenio) return;

      this.loadingCategorias = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        this.categorias = [
          {
            id_categoria: 1,
            id_convenio: idConvenio,
            nombre: 'Auxiliar Administrativo',
            codigo: 'AUX-ADM',
            descripcion: 'Personal de apoyo administrativo'
          },
          {
            id_categoria: 2,
            id_convenio: idConvenio,
            nombre: 'Técnico Especialista',
            codigo: 'TEC-ESP',
            descripcion: 'Personal técnico con especialización'
          },
          {
            id_categoria: 3,
            id_convenio: idConvenio,
            nombre: 'Jefe de Departamento',
            codigo: 'JEF-DEP',
            descripcion: 'Responsable de departamento'
          }
        ];
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.$store.dispatch('notification/error', 'Error al cargar las categorías');
        this.categorias = [];
      } finally {
        this.loadingCategorias = false;
      }
    },

    openCategoriaModal(categoria = null) {
      this.categoriaValidationErrors = {};

      if (categoria) {
        this.categoriaForm = { ...categoria };
      } else {
        this.categoriaForm = {
          id_categoria: null,
          id_convenio: this.convenioSeleccionado.id_convenio,
          nombre: '',
          codigo: '',
          descripcion: ''
        };
      }

      this.showCategoriaModal = true;
    },

    closeCategoriaModal() {
      this.showCategoriaModal = false;
      this.categoriaForm = {
        id_categoria: null,
        id_convenio: null,
        nombre: '',
        codigo: '',
        descripcion: ''
      };
      this.categoriaValidationErrors = {};
    },

    async saveCategoria() {
      if (!this.isCategoriaFormValid) return;

      this.savingCategoria = true;
      this.categoriaValidationErrors = {};

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (this.isEditingCategoria) {
          const index = this.categorias.findIndex(c => c.id_categoria === this.categoriaForm.id_categoria);
          if (index !== -1) {
            this.categorias.splice(index, 1, { ...this.categoriaForm });
          }
          this.$store.dispatch('notification/success', 'Categoría actualizada correctamente');
        } else {
          const newId = Math.max(0, ...this.categorias.map(c => c.id_categoria)) + 1;
          this.categorias.push({
            ...this.categoriaForm,
            id_categoria: newId
          });

          const convenioIndex = this.convenios.findIndex(c => c.id_convenio === this.convenioSeleccionado.id_convenio);
          if (convenioIndex !== -1) {
            this.convenios[convenioIndex].categorias_count = (this.convenios[convenioIndex].categorias_count || 0) + 1;
          }

          this.$store.dispatch('notification/success', 'Categoría creada correctamente');
        }

        this.closeCategoriaModal();
        await this.loadCategorias(this.convenioSeleccionado.id_convenio);
      } catch (error) {
        console.error('Error al guardar categoría:', error);

        this.categoriaValidationErrors = {
          general: 'Error al guardar la categoría'
        };

        this.$store.dispatch('notification/error', 'Error al guardar la categoría');
      } finally {
        this.savingCategoria = false;
      }
    },

    editCategoria(categoria) {
      this.openCategoriaModal(categoria);
    },

    confirmDeleteCategoria(categoria) {
      this.categoriaSeleccionada = categoria;
      this.confirmAction = 'delete-categoria';
      this.showConfirmDialog = true;
    },

    async deleteCategoria() {
      if (!this.categoriaSeleccionada) return;

      this.processing = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.categorias = this.categorias.filter(
            c => c.id_categoria !== this.categoriaSeleccionada.id_categoria
        );

        const convenioIndex = this.convenios.findIndex(c => c.id_convenio === this.convenioSeleccionado.id_convenio);
        if (convenioIndex !== -1 && this.convenios[convenioIndex].categorias_count > 0) {
          this.convenios[convenioIndex].categorias_count--;
        }

        this.$store.dispatch('notification/success', 'Categoría eliminada correctamente');
        this.closeConfirmDialog();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        this.$store.dispatch('notification/error', 'Error al eliminar la categoría');
      } finally {
        this.processing = false;
      }
    },

    closeConfirmDialog() {
      this.showConfirmDialog = false;
      this.convenioSeleccionado = null;
      this.categoriaSeleccionada = null;
      this.confirmAction = '';
    }
  },

  mounted() {
    this.loadConvenios();
  }
};
</script>

<style scoped>
.convenios-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.description {
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-body {
  padding: 1.5rem;
}

.filter-section {
  background-color: #f9fafb;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #4b5563;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-table tr:hover {
  background-color: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.status-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-buttons-inline {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  color: #dc2626;
}

.loading-text {
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-weight: 500;
  color: #111827;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  max-width: 400px;
}

.modal-lg {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.campo-con-nota {
  display: flex;
  flex-direction: column;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.categorias-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.categorias-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.categoria-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s ease;
}

.categoria-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.categoria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.categoria-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.categoria-actions {
  display: flex;
  gap: 0.25rem;
}

.categoria-body {
  padding: 0.75rem 1rem;
}

.categoria-codigo {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.categoria-descripcion {
  font-size: 0.875rem;
  color: #4b5563;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-outline {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-icon {
  padding: 0.375rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-xs {
  width: 0.75rem;
  height: 0.75rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

.text-center {
  text-align: center;
}

.mt-4 {
  margin-top: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .categorias-header {
    flex-direction: column;
    gap: 1rem;
  }

  .categorias-header .search-input {
    width: 100%;
  }

  .categorias-list {
    grid-template-columns: 1fr;
  }
}
</style>