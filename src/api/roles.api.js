import api from './axios';

export default {
    getAllRoles(params = {}) {
        return api.get('/rol', { params });
    },

    getRoleById(id) {
        return api.get(`/rol/${id}`);
    },

    getMiRol() {
        return api.get('/rol/mi-rol');
    },

    createRole(roleData) {
        return api.post('/rol', roleData);
    },

    updateRole(id, roleData) {
        return api.put(`/rol/${id}`, roleData);
    },

    deleteRole(id) {
        return api.delete(`/rol/${id}`);
    },

    updateRolePermissions(id, permissions) {
        return api.put(`/rol/${id}/permisos`, { permisos: permissions });
    }
};