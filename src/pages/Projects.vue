<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Projects</h2><p class="text-gray-500 text-sm mt-1">Kelola project per client</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New Project' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Edit Project' : 'Create New Project' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Project *</label>
          <input v-model="form.projectName" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. ECM Implementation" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select v-model="form.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Pilih Client...</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Deskripsi project (opsional)"></textarea>
        </div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input v-model="search" type="text" placeholder="Search projects..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Project Name</th>
            <th class="px-6 py-3 font-medium">Client</th>
            <th class="px-6 py-3 font-medium">Description</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0"><td colspan="5" class="text-center py-8 text-gray-500">No projects found.</td></tr>
          <tr v-for="p in filtered" :key="p.id" class="hover:bg-gray-50 cursor-pointer" @click="openProjectDetail(p)">
            <td class="px-6 py-3 font-medium text-gray-900">{{ p.projectName }}</td>
            <td class="px-6 py-3 text-gray-600">{{ p.clientCompanyName }}</td>
            <td class="px-6 py-3 text-gray-600 text-xs">{{ p.description || '-' }}</td>
            <td class="px-6 py-3">
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ p.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-6 py-3">
              <div class="flex gap-2">
                <button @click.stop="startEdit(p)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click.stop="handleDelete(p.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Project Detail Modal -->
    <div v-if="selectedProject" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="selectedProject = null">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[80vh]" @click.stop>
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ selectedProject.projectName }}</h3>
          <button @click="selectedProject = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Client</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedProject.clientCompanyName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Status</p>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', selectedProject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ selectedProject.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500">Deskripsi</p>
            <p class="text-sm text-gray-700">{{ selectedProject.description || 'Tidak ada deskripsi' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Dibuat</p>
            <p class="text-sm text-gray-700">{{ selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }}</p>
          </div>

          <!-- Support Engineers -->
          <div class="border-t border-gray-200 pt-4">
            <p class="text-xs text-gray-500 mb-2">Support Engineers ({{ projectSupports.length }})</p>
            <div v-if="projectSupports.length === 0" class="text-xs text-gray-400">Belum ada support engineer untuk client ini.</div>
            <div v-else class="space-y-1">
              <div v-for="s in projectSupports" :key="s.id" class="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                <div class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">{{ s.supportUserName?.charAt(0) }}</div>
                <span class="text-sm text-gray-900">{{ s.supportUserName }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ s.supportUserEmail }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects'
import { getClients } from '../api/clients'
import { getClientSupports } from '../api/clientSupports'
import { mockProjects, mockClients } from '../utils/mockData'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)
const route = useRoute()
const projects = ref([])
const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ projectName: '', description: '', clientId: '' })
const search = ref('')
const selectedProject = ref(null)
const projectSupports = ref([])

const filtered = computed(() => projects.value.filter(p =>
  p.projectName.toLowerCase().includes(search.value.toLowerCase()) ||
  (p.clientCompanyName && p.clientCompanyName.toLowerCase().includes(search.value.toLowerCase()))
))

onMounted(async () => {
  try { projects.value = (await getProjects()).data } catch { projects.value = mockProjects }
  try { clients.value = (await getClients()).data } catch { clients.value = mockClients }
  // Auto-fill client from query param
  if (route.query.clientId) {
    form.clientId = route.query.clientId
    showForm.value = true
  }
})

async function openProjectDetail(project) {
  selectedProject.value = project
  projectSupports.value = []
  if (project.clientId) {
    try { projectSupports.value = (await getClientSupports(project.clientId)).data } catch {}
  }
}

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { projectName: '', description: '', clientId: '' })
}

function startEdit(p) {
  editingId.value = p.id
  Object.assign(form, { projectName: p.projectName, description: p.description || '', clientId: p.clientId })
  showForm.value = true
}

async function handleSubmit() {
  const payload = { projectName: form.projectName, description: form.description, clientId: Number(form.clientId) }
  try {
    if (editingId.value) await updateProject(editingId.value, payload)
    else await createProject(payload)
    projects.value = (await getProjects()).data
  } catch {}
  showForm.value = false
  editingId.value = null
  Object.assign(form, { projectName: '', description: '', clientId: '' })
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Project', message: 'Apakah kamu yakin ingin menghapus project ini?' })
  if (!confirmed) return
  try { await deleteProject(id); projects.value = (await getProjects()).data } catch {}
}
</script>
