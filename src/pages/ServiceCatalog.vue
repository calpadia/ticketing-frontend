<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Service & Quota</h2>
        <p class="text-gray-500 text-sm mt-1">Kelola layanan maintenance dan kuota setiap client</p>
      </div>
      <button @click="toggleServiceForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showServiceForm ? X : Plus" class="w-4 h-4" /> {{ showServiceForm ? 'Cancel' : 'Add Service' }}
      </button>
    </div>

    <!-- Service Form -->
    <form v-if="showServiceForm" @submit.prevent="handleServiceSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingServiceId !== null ? 'Edit Service' : 'Add New Service' }}</h3>
      <div v-if="serviceError" class="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{{ serviceError }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select v-model="serviceForm.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" :disabled="editingServiceId !== null" required>
            <option value="">Select client</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Services *</label>
          <div class="flex flex-col gap-2 mt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" value="PM" v-model="serviceForm.services" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm text-gray-700">Preventive Maintenance (PM)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" value="CM" v-model="serviceForm.services" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm text-gray-700">Corrective Maintenance (CM)</span>
            </label>
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea v-model="serviceForm.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes about the service agreement"></textarea>
        </div>
      </div>
      <!-- Offer to create quota after adding service -->
      <div v-if="!editingServiceId" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="createQuotaAfter" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700">Sekaligus buat quota untuk tahun {{ currentYear }}</span>
        </label>
        <div v-if="createQuotaAfter" class="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">PM Quota</label>
            <input v-model.number="autoQuotaForm.pmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :disabled="!serviceForm.services.includes('PM')" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">CM Quota</label>
            <input v-model.number="autoQuotaForm.cmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :disabled="!serviceForm.services.includes('CM')" />
          </div>
        </div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        {{ editingServiceId !== null ? 'Update' : 'Add Service' }}
      </button>
    </form>

    <!-- Quota Form -->
    <form v-if="showQuotaForm" @submit.prevent="handleQuotaSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingQuotaId ? 'Edit Quota' : 'Add Quota' }} — {{ quotaFormClientName }}</h3>
      <div v-if="quotaError" class="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{{ quotaError }}</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input v-model.number="quotaForm.year" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">PM Quota *</label>
          <input v-model.number="quotaForm.pmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required :disabled="!clientHasService(quotaFormClientId, 'PM')" />
          <p v-if="!clientHasService(quotaFormClientId, 'PM')" class="text-xs text-gray-400 mt-1">Client tidak memiliki layanan PM</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CM Quota *</label>
          <input v-model.number="quotaForm.cmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required :disabled="!clientHasService(quotaFormClientId, 'CM')" />
          <p v-if="!clientHasService(quotaFormClientId, 'CM')" class="text-xs text-gray-400 mt-1">Client tidak memiliki layanan CM</p>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button type="submit" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingQuotaId ? 'Update' : 'Create' }}</button>
        <button type="button" @click="closeQuotaForm()" class="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-medium">Cancel</button>
      </div>
    </form>

    <!-- Search -->
    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input v-model="search" type="text" placeholder="Search by client name..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
      <table class="w-full text-sm min-w-[600px]">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-4 py-3 font-medium w-8"></th>
            <th class="px-4 py-3 font-medium">Client</th>
            <th class="px-4 py-3 font-medium">Services</th>
            <th class="px-4 py-3 font-medium">Quota ({{ currentYear }})</th>
            <th class="px-4 py-3 font-medium w-20">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="text-center py-8 text-gray-500">No service catalog entries found.</td>
          </tr>
          <template v-for="item in filtered" :key="item.id">
            <!-- Main row -->
            <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleExpand(item.clientId)">
              <td class="px-4 py-4">
                <ChevronRight :class="['w-4 h-4 text-gray-400 transition-transform', expandedClientId === item.clientId ? 'rotate-90' : '']" />
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{{ item.clientCompanyName }}</span>
                  <span v-if="item.notes" class="relative group">
                    <Info class="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{{ item.notes }}</span>
                  </span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex gap-2">
                  <span v-if="item.services?.includes('PM')" class="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">PM</span>
                  <span v-if="item.services?.includes('CM')" class="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-teal-100 text-teal-800 border-teal-200">CM</span>
                </div>
              </td>
              <!-- Quota summary for current year -->
              <td class="px-4 py-4">
                <div v-if="getCurrentYearQuota(item.clientId)" class="flex flex-col gap-1.5">
                  <div v-if="item.services?.includes('PM')" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-7">PM</span>
                    <div class="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden max-w-[100px]">
                      <div class="h-full rounded-full transition-all" :class="getQuotaBarClass(getCurrentYearQuota(item.clientId), 'pm')" :style="{ width: getQuotaPercent(getCurrentYearQuota(item.clientId), 'pm') + '%' }"></div>
                    </div>
                    <span :class="['text-xs font-medium whitespace-nowrap', getQuotaTextClass(getCurrentYearQuota(item.clientId), 'pm')]">{{ getCurrentYearQuota(item.clientId).pmUsed }}/{{ getCurrentYearQuota(item.clientId).pmQuota }}</span>
                    <AlertTriangle v-if="isQuotaWarning(getCurrentYearQuota(item.clientId), 'pm')" class="w-3.5 h-3.5 text-yellow-500" />
                    <AlertCircle v-if="isQuotaFull(getCurrentYearQuota(item.clientId), 'pm')" class="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div v-if="item.services?.includes('CM')" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-7">CM</span>
                    <div class="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden max-w-[100px]">
                      <div class="h-full rounded-full transition-all" :class="getQuotaBarClass(getCurrentYearQuota(item.clientId), 'cm')" :style="{ width: getQuotaPercent(getCurrentYearQuota(item.clientId), 'cm') + '%' }"></div>
                    </div>
                    <span :class="['text-xs font-medium whitespace-nowrap', getQuotaTextClass(getCurrentYearQuota(item.clientId), 'cm')]">{{ getCurrentYearQuota(item.clientId).cmUsed }}/{{ getCurrentYearQuota(item.clientId).cmQuota }}</span>
                    <AlertTriangle v-if="isQuotaWarning(getCurrentYearQuota(item.clientId), 'cm')" class="w-3.5 h-3.5 text-yellow-500" />
                    <AlertCircle v-if="isQuotaFull(getCurrentYearQuota(item.clientId), 'cm')" class="w-3.5 h-3.5 text-red-500" />
                  </div>
                </div>
                <span v-else class="text-xs text-gray-400 italic">No quota</span>
              </td>
              <td class="px-4 py-4" @click.stop>
                <div class="flex gap-1">
                  <button @click="startEditService(item)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit service"><Pencil class="w-4 h-4" /></button>
                  <button @click="handleDeleteService(item.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete service"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
            <!-- Expanded quota detail -->
            <tr v-if="expandedClientId === item.clientId">
              <td colspan="5" class="px-6 py-4 bg-gray-50/70">
                <div class="ml-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-gray-700">Quota Detail — {{ item.clientCompanyName }}</h4>
                    <button @click="openQuotaForm(item.clientId, item.clientCompanyName)" class="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium">
                      <Plus class="w-3 h-3" /> Add Quota
                    </button>
                  </div>
                  <!-- Notes display -->
                  <p v-if="item.notes" class="text-xs text-gray-500 mb-3 italic">📝 {{ item.notes }}</p>
                  <div v-if="getClientQuotaList(item.clientId).length === 0" class="text-sm text-gray-500 italic py-2">
                    Belum ada quota untuk client ini.
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="q in getClientQuotaList(item.clientId)" :key="q.id" class="bg-white border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-800">Tahun {{ q.year }}</span>
                        <div class="flex gap-1">
                          <button @click="startEditQuota(q, item.clientCompanyName)" class="p-1 rounded hover:bg-blue-50 text-blue-600" title="Edit quota"><Pencil class="w-3.5 h-3.5" /></button>
                          <button @click="handleDeleteQuota(q.id)" class="p-1 rounded hover:bg-red-50 text-red-600" title="Delete quota"><Trash2 class="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <!-- PM Progress -->
                        <div v-if="item.services?.includes('PM')">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-gray-500">PM</span>
                            <span :class="['text-xs font-medium', getQuotaTextClass(q, 'pm')]">{{ q.pmUsed }}/{{ q.pmQuota }}</span>
                          </div>
                          <div class="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" :class="getQuotaBarClass(q, 'pm')" :style="{ width: getQuotaPercent(q, 'pm') + '%' }"></div>
                          </div>
                          <p class="text-xs text-gray-400 mt-1">Sisa: {{ Math.max(q.pmQuota - q.pmUsed, 0) }}</p>
                        </div>
                        <!-- CM Progress -->
                        <div v-if="item.services?.includes('CM')">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-gray-500">CM</span>
                            <span :class="['text-xs font-medium', getQuotaTextClass(q, 'cm')]">{{ q.cmUsed }}/{{ q.cmQuota }}</span>
                          </div>
                          <div class="h-2.5 bg-orange-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" :class="getQuotaBarClass(q, 'cm')" :style="{ width: getQuotaPercent(q, 'cm') + '%' }"></div>
                          </div>
                          <p class="text-xs text-gray-400 mt-1">Sisa: {{ Math.max(q.cmQuota - q.cmUsed, 0) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getServiceCatalogs, createServiceCatalog, updateServiceCatalog, deleteServiceCatalog } from '../api/serviceCatalog'
import { getClientQuotas, createClientQuota, updateClientQuota, deleteClientQuota } from '../api/quotas'
import { getClients } from '../api/clients'
import { mockClients } from '../utils/mockData'
import { Search, Plus, X, Pencil, Trash2, ChevronRight, Info, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)
const clients = ref([])
const catalog = ref([])
const quotas = ref([])
const search = ref('')
const currentYear = new Date().getFullYear()

// Expand state
const expandedClientId = ref(null)

// Service form state
const showServiceForm = ref(false)
const editingServiceId = ref(null)
const serviceError = ref('')
const serviceForm = reactive({ clientId: '', services: [], notes: '' })
const createQuotaAfter = ref(false)
const autoQuotaForm = reactive({ pmQuota: 0, cmQuota: 0 })

// Quota form state
const showQuotaForm = ref(false)
const editingQuotaId = ref(null)
const quotaError = ref('')
const quotaFormClientId = ref(null)
const quotaFormClientName = ref('')
const quotaForm = reactive({ year: currentYear, pmQuota: 0, cmQuota: 0 })

const filtered = computed(() =>
  catalog.value.filter(item => item.clientCompanyName?.toLowerCase().includes(search.value.toLowerCase()))
)

// ========== Helpers ==========
function getClientQuotaList(clientId) {
  return quotas.value
    .filter(q => q.clientId === clientId)
    .sort((a, b) => b.year - a.year)
}

function getCurrentYearQuota(clientId) {
  return quotas.value.find(q => q.clientId === clientId && q.year === currentYear) || null
}

function clientHasService(clientId, serviceType) {
  const entry = catalog.value.find(c => c.clientId === clientId)
  return entry?.services?.includes(serviceType) || false
}

function getQuotaPercent(q, type) {
  if (type === 'pm') return Math.min((q.pmUsed / (q.pmQuota || 1)) * 100, 100)
  return Math.min((q.cmUsed / (q.cmQuota || 1)) * 100, 100)
}

function isQuotaWarning(q, type) {
  if (type === 'pm') return q.pmQuota > 0 && q.pmUsed >= q.pmQuota * 0.8 && q.pmUsed < q.pmQuota
  return q.cmQuota > 0 && q.cmUsed >= q.cmQuota * 0.8 && q.cmUsed < q.cmQuota
}

function isQuotaFull(q, type) {
  if (type === 'pm') return q.pmQuota > 0 && q.pmUsed >= q.pmQuota
  return q.cmQuota > 0 && q.cmUsed >= q.cmQuota
}

function getQuotaBarClass(q, type) {
  if (isQuotaFull(q, type)) return 'bg-red-500'
  if (isQuotaWarning(q, type)) return 'bg-yellow-500'
  return type === 'pm' ? 'bg-blue-500' : 'bg-orange-500'
}

function getQuotaTextClass(q, type) {
  if (isQuotaFull(q, type)) return 'text-red-600'
  if (isQuotaWarning(q, type)) return 'text-yellow-600'
  return 'text-gray-600'
}

onMounted(async () => {
  try { clients.value = (await getClients()).data } catch { clients.value = mockClients }
  try { catalog.value = (await getServiceCatalogs()).data } catch { catalog.value = [] }
  try { quotas.value = (await getClientQuotas()).data } catch { quotas.value = [] }
})

// ========== Expand ==========
function toggleExpand(clientId) {
  expandedClientId.value = expandedClientId.value === clientId ? null : clientId
}

// ========== Service CRUD ==========
function toggleServiceForm() {
  showServiceForm.value = !showServiceForm.value
  showQuotaForm.value = false
  editingServiceId.value = null
  Object.assign(serviceForm, { clientId: '', services: [], notes: '' })
  serviceError.value = ''
  createQuotaAfter.value = false
  Object.assign(autoQuotaForm, { pmQuota: 0, cmQuota: 0 })
}

function startEditService(item) {
  editingServiceId.value = item.id
  Object.assign(serviceForm, { clientId: item.clientId, services: [...(item.services || [])], notes: item.notes || '' })
  showServiceForm.value = true
  showQuotaForm.value = false
  serviceError.value = ''
  createQuotaAfter.value = false
}

async function handleServiceSubmit() {
  if (!serviceForm.clientId && !editingServiceId.value) { serviceError.value = 'Please select a client'; return }
  if (serviceForm.services.length === 0) { serviceError.value = 'Please select at least one service'; return }
  serviceError.value = ''

  try {
    if (editingServiceId.value) {
      await updateServiceCatalog(editingServiceId.value, { services: serviceForm.services, notes: serviceForm.notes })
    } else {
      await createServiceCatalog({ clientId: Number(serviceForm.clientId), services: serviceForm.services, notes: serviceForm.notes })

      // Auto-create quota if checked
      if (createQuotaAfter.value) {
        const quotaPayload = {
          clientId: Number(serviceForm.clientId),
          year: currentYear,
          pmQuota: serviceForm.services.includes('PM') ? autoQuotaForm.pmQuota : 0,
          cmQuota: serviceForm.services.includes('CM') ? autoQuotaForm.cmQuota : 0
        }
        try { await createClientQuota(quotaPayload) } catch {}
        quotas.value = (await getClientQuotas()).data
      }
    }
    catalog.value = (await getServiceCatalogs()).data
    showServiceForm.value = false
    editingServiceId.value = null
    createQuotaAfter.value = false
    Object.assign(serviceForm, { clientId: '', services: [], notes: '' })
    Object.assign(autoQuotaForm, { pmQuota: 0, cmQuota: 0 })
  } catch (err) {
    serviceError.value = err.response?.data?.message || 'Failed to save service catalog.'
  }
}

async function handleDeleteService(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Service', message: 'Apakah kamu yakin ingin menghapus service entry ini?' })
  if (!confirmed) return
  try {
    await deleteServiceCatalog(id)
    catalog.value = (await getServiceCatalogs()).data
  } catch {}
}

// ========== Quota CRUD ==========
function openQuotaForm(clientId, clientName) {
  quotaFormClientId.value = clientId
  quotaFormClientName.value = clientName
  editingQuotaId.value = null
  Object.assign(quotaForm, { year: currentYear, pmQuota: 0, cmQuota: 0 })
  showQuotaForm.value = true
  showServiceForm.value = false
  quotaError.value = ''
}

function startEditQuota(q, clientName) {
  quotaFormClientId.value = q.clientId
  quotaFormClientName.value = clientName
  editingQuotaId.value = q.id
  Object.assign(quotaForm, { year: q.year, pmQuota: q.pmQuota, cmQuota: q.cmQuota })
  showQuotaForm.value = true
  showServiceForm.value = false
  quotaError.value = ''
}

function closeQuotaForm() {
  showQuotaForm.value = false
  editingQuotaId.value = null
  quotaError.value = ''
}

async function handleQuotaSubmit() {
  quotaError.value = ''
  const payload = {
    clientId: quotaFormClientId.value,
    year: quotaForm.year,
    pmQuota: clientHasService(quotaFormClientId.value, 'PM') ? quotaForm.pmQuota : 0,
    cmQuota: clientHasService(quotaFormClientId.value, 'CM') ? quotaForm.cmQuota : 0
  }
  try {
    if (editingQuotaId.value) {
      await updateClientQuota(editingQuotaId.value, payload)
    } else {
      await createClientQuota(payload)
    }
    quotas.value = (await getClientQuotas()).data
    showQuotaForm.value = false
    editingQuotaId.value = null
  } catch (err) {
    quotaError.value = err.response?.data?.message || 'Failed to save quota.'
  }
}

async function handleDeleteQuota(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Quota', message: 'Apakah kamu yakin ingin menghapus quota ini?' })
  if (!confirmed) return
  try {
    await deleteClientQuota(id)
    quotas.value = (await getClientQuotas()).data
  } catch {}
}
</script>
