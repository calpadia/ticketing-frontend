<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <transition name="fade" mode="out-in">
      <!-- List view -->
      <div v-if="!showForm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Tickets</h2>
          <p class="text-gray-500 text-sm mt-1">{{ filtered.length }} ticket(s) found</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button @click="handleExport" :disabled="loadingExport" class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all shadow-sm disabled:opacity-50 text-sm">
            <Loader2 v-if="loadingExport" class="w-4 h-4 animate-spin text-gray-400" />
            <FileDown v-else class="w-4 h-4 text-gray-400" /> <span class="hidden sm:inline">{{ loadingExport ? 'Exporting...' : 'Export CSV' }}</span>
          </button>
          <button v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'USER'" @click="showForm = true" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
            <Plus class="w-4 h-4" /> <span class="hidden sm:inline">Registrasi Tiket</span>
          </button>
        </div>
      </div>

      <!-- Control Panel: Search & Filter -->
      <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row gap-3 items-center w-full">
        <!-- Search Input -->
        <div class="relative flex-1 w-full">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" type="text" placeholder="Search tickets, subjects, or clients..." class="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        
        <!-- Filters -->
        <div class="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
          <div class="relative w-full md:w-36">
            <select v-model="filterStatus" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl pl-4 pr-10 py-2 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div class="relative w-full md:w-36">
            <select v-model="filterPriority" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl pl-4 pr-10 py-2 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
              <option value="">All Priority</option>
              <option value="L1">L1 (Critical)</option>
              <option value="L2">L2 (High)</option>
              <option value="L3">L3 (Medium)</option>
              <option value="L4">L4 (Low)</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div v-if="auth.isAdmin" class="relative w-full md:w-48">
            <select v-model="filterClient" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl pl-4 pr-10 py-2 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer truncate">
              <option value="">All Clients</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <!-- Desktop Table (Hidden on small screens) -->
        <div class="hidden md:block overflow-auto max-h-[65vh]">
          <table class="w-full text-sm min-w-[700px] relative">
            <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
              <tr class="text-left text-gray-600">
                <th class="px-6 py-3 font-medium">Ticket #</th>
                <th class="px-6 py-3 font-medium">Title</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Priority</th>
                <th class="px-6 py-3 font-medium">Type</th>
                <th class="px-6 py-3 font-medium">Client</th>
                <th class="px-6 py-3 font-medium">Assignee</th>
                <th class="px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading" v-for="i in 5" :key="'skel'+i" class="animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-48"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-20"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded w-10"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-8"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded-full w-16"></div></td>
                <td class="px-6 py-4"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
              </tr>
              <tr v-else-if="paginated.length === 0">
                <td colspan="8" class="text-center py-16">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-gray-300 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>
                    <p class="text-gray-500 font-medium">Belum ada tiket.</p>
                    <p class="text-gray-400 text-sm mt-1">Klik Registrasi Tiket untuk membuat tiket baru.</p>
                  </div>
                </td>
              </tr>
              <tr v-for="t in paginated" :key="t.id" :class="['cursor-pointer hover:bg-gray-50', t.priority === 'L1' ? 'border-l-4 border-l-red-500' : '']" @click="openTicketDetail(t)">
                <td class="px-6 py-3 font-mono text-xs text-blue-600 whitespace-nowrap">{{ t.ticketNumber }}</td>
                <td class="px-6 py-3 max-w-[250px] lg:max-w-[400px]">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 truncate" :title="t.title">{{ t.title }}</span>
                    <span v-if="t.unreadMessageCount > 0" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm shrink-0">
                      {{ t.unreadMessageCount }}
                    </span>
                    <span v-if="t.isRead === false" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse shrink-0">NEW</span>
                  </div>
                </td>
                <td class="px-6 py-3 whitespace-nowrap"><StatusBadge :status="t.status" /></td>
                <td class="px-6 py-3"><PriorityBadge :priority="t.priority" /></td>
                <td class="px-6 py-3"><span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', t.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ t.maintenanceType }}</span></td>
                <td class="px-6 py-3 text-gray-600 truncate max-w-[150px] lg:max-w-[200px]" :title="t.clientCompanyName">{{ t.clientCompanyName }}</td>
                <td class="px-6 py-3 min-w-[100px]">
                  <div class="flex items-center gap-1">
                    <span v-if="t.assignments && t.assignments.length > 0" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium whitespace-nowrap">
                      {{ t.assignments[0].assignedToName.split(' ')[0] }}
                    </span>
                    <span v-if="t.assignments && t.assignments.length > 1" class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium whitespace-nowrap" :title="t.assignments.slice(1).map(a => a.assignedToName).join(', ')">
                      +{{ t.assignments.length - 1 }}
                    </span>
                    <span v-if="!t.assignments || t.assignments.length === 0" class="text-[10px] text-gray-400 italic">Unassigned</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">{{ formatDate(t.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards (Hidden on md and larger) -->
        <div class="md:hidden flex flex-col divide-y divide-gray-100 overflow-auto max-h-[70vh]">
          <!-- Skeletons -->
          <div v-if="loading" v-for="i in 5" :key="'m-skel-'+i" class="p-4 animate-pulse">
            <div class="flex justify-between mb-3"><div class="h-4 bg-gray-200 rounded w-20"></div><div class="h-5 bg-gray-200 rounded-full w-16"></div></div>
            <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="flex justify-between items-center"><div class="flex gap-2"><div class="h-5 bg-gray-200 rounded w-10"></div><div class="h-5 bg-gray-200 rounded w-8"></div></div><div class="h-3 bg-gray-200 rounded w-16"></div></div>
          </div>
          <!-- Empty -->
          <div v-else-if="paginated.length === 0" class="p-8 text-center">
            <div class="flex flex-col items-center justify-center">
              <div class="text-gray-300 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>
              <p class="text-gray-500 font-medium text-sm">Belum ada tiket.</p>
            </div>
          </div>
          <!-- Cards -->
          <div v-for="t in paginated" :key="'m-'+t.id" class="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors" :class="[t.priority === 'L1' ? 'border-l-4 border-l-red-500' : '']" @click="openTicketDetail(t)">
            <div class="flex justify-between items-start mb-2">
              <span class="font-mono text-xs text-blue-600 font-medium">{{ t.ticketNumber }}</span>
              <StatusBadge :status="t.status" />
            </div>
            <h4 class="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <span class="truncate" :title="t.title">{{ t.title }}</span>
              <span v-if="t.unreadMessageCount > 0" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm shrink-0">{{ t.unreadMessageCount }}</span>
              <span v-if="t.isRead === false" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse shrink-0">NEW</span>
            </h4>
            <p class="text-sm text-gray-500 mb-3">{{ t.clientCompanyName }}</p>
            <div v-if="t.assignments && t.assignments.length > 0" class="flex items-center gap-1 mb-3">
              <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-medium border border-blue-100 whitespace-nowrap">
                {{ t.assignments[0].assignedToName.split(' ')[0] }}
              </span>
              <span v-if="t.assignments.length > 1" class="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[9px] font-medium border border-gray-200 whitespace-nowrap">
                +{{ t.assignments.length - 1 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex gap-2">
                <PriorityBadge :priority="t.priority" />
                <span :class="['px-2 py-0.5 rounded text-[10px] font-medium border', t.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ t.maintenanceType }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(t.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-500">Showing {{ (currentPage-1)*perPage+1 }} to {{ Math.min(currentPage*perPage, filtered.length) }} of {{ filtered.length }}</p>
          <div class="flex gap-1">
            <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']">{{ p }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration form -->
    <div v-else>
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Registrasi Tiket Dukungan Teknis</h3>
        <p class="text-sm text-gray-500 mb-6">Isi form berikut untuk mengajukan tiket dukungan teknis</p>

        <!-- Quota info bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden border border-gray-200 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-4 border-l-4 border-blue-600">
            <p class="text-xs text-blue-600 font-semibold uppercase tracking-wide">Sisa Kuota PM</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ quotaInfo.pmRemaining }} <span class="text-sm font-normal">Tiket</span></p>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 px-5 py-4 border-l border-gray-200">
            <p class="text-xs text-orange-600 font-semibold uppercase tracking-wide">Sisa Kuota CM</p>
            <p class="text-2xl font-bold text-orange-700 mt-1">{{ quotaInfo.cmRemaining }} <span class="text-sm font-normal">Tiket</span></p>
          </div>
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-4 border-l border-gray-200">
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">Client</p>
            <p class="text-sm font-bold text-gray-900 mt-2">{{ selectedClientName || 'Belum dipilih' }}</p>
          </div>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-6">
          <!-- Maintenance, Priority, Product Type -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Maintenance *</label>
              <div class="relative">
                <select v-model="form.maintenanceType" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                  <option value="">Pilih Jenis...</option>
                  <option value="PM">PM (Preventive Maintenance)</option>
                  <option value="CM">CM (Corrective Maintenance)</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Urgensi (Priority Level) *</label>
              <div class="relative">
                <select v-model="form.priority" @change="updateSLATargets" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                  <option value="L1">Level 1 - Critical (System Down)</option>
                  <option value="L2">Level 2 - High (Major Error)</option>
                  <option value="L3">Level 3 - Medium (Normal)</option>
                  <option value="L4">Level 4 - Low (Consultation)</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
              <div class="relative">
                <select v-model="form.productType" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="">Pilih Product...</option>
                  <option value="OPENTEXT_CONTENT_SERVER">Opentext Content Server</option>
                  <option value="BRAVA_ENTERPRISE">Brava Enterprise</option>
                  <option value="OPENTEXT_DIRECTORY_SERVICES">Opentext Directory Services</option>
                  <option value="ARCHIVE_SERVER">Archive Server</option>
                  <option value="APPWORKS">AppWorks</option>
                  <option value="CUSTOM_APPS">Custom Apps</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- SLA Target info -->
          <div class="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex gap-8 text-sm">
            <span class="text-blue-700">Target Respon: <strong class="text-blue-900">{{ slaTarget.response }}</strong></span>
            <span class="text-blue-700">Target Solusi: <strong class="text-blue-900">{{ slaTarget.resolution }}</strong></span>
          </div>

          <!-- Client & Requester -->
          <div v-if="auth.isAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <div class="relative">
                <select v-model="form.clientId" @change="loadProjects" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                  <option value="">Pilih Client...</option>
                  <option v-for="c in activeClients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <div class="relative">
                <select v-model="form.projectId" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="">Pilih Project...</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.projectName }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Requester *</label>
              <div class="relative">
                <select v-model="form.requesterId" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                  <option value="">Pilih Requester...</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div v-else class="space-y-6">
            <div class="bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4">
              <div class="grid grid-cols-2 gap-4">
                <div><p class="text-xs text-gray-500 mb-1">Client</p><p class="text-sm font-semibold text-gray-900">{{ auth.user?.clientName || '-' }}</p></div>
                <div><p class="text-xs text-gray-500 mb-1">Requester</p><p class="text-sm font-semibold text-gray-900">{{ auth.user?.name }}</p></div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <div class="relative">
                <select v-model="form.projectId" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="">Pilih Project...</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.projectName }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Subjek Masalah *</label>
            <input v-model="form.title" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Error Login pada Intelligent Capture" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi Detail *</label>
            <textarea v-model="form.description" rows="5" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Jelaskan kendala yang dialami secara mendetail..." required></textarea>
          </div>

          <!-- Lampiran -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Lampiran Pendukung</label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
              @click="$refs.fileInput.click()" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="handleDrop"
              :class="{ 'border-blue-400 bg-blue-50/30': dragOver }">
              <input ref="fileInput" type="file" class="hidden" multiple accept="image/*,.pdf,.log,.txt,.doc,.docx" @change="handleFileSelect" />
              <p v-if="attachments.length === 0" class="text-sm text-gray-500">Klik atau drag file untuk melampirkan screenshot atau log file (Max 5MB)</p>
              <div v-else class="space-y-2">
                <div v-for="(file, index) in attachments" :key="index" class="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <Paperclip class="w-4 h-4 text-gray-400 shrink-0" />
                    <span class="text-sm text-gray-700 truncate">{{ file.name }}</span>
                    <span class="text-xs text-gray-400 shrink-0">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button type="button" @click.stop="removeFile(index)" class="text-red-500 hover:text-red-700 shrink-0 ml-2"><X class="w-4 h-4" /></button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Klik untuk menambah file lain</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="showForm = false" class="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-colors">Batal</button>
            <button type="submit" :disabled="loadingCreate" class="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="loadingCreate" class="w-4 h-4 animate-spin" />
              {{ loadingCreate ? 'Mengirim...' : 'Kirim Tiket & Gunakan Kuota' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getTickets, createTicket, exportTicketsCsv } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { getClientQuotas, getMyQuotas } from '../api/quotas'
import { getProjectsByClientId } from '../api/projects'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useGlobalChat } from '../composables/useGlobalChat'
import { useToastStore } from '../stores/toast'
import { Search, Plus, X, Paperclip, FileDown, Loader2, ChevronDown } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const notifications = useNotificationStore()
const globalChat = useGlobalChat()
const toast = useToastStore()

const tickets = ref([])
const clients = ref([])
const users = ref([])
const activeClients = computed(() => clients.value.filter(c => c.isActive))
const quotas = ref([])
const showForm = ref(route.query.create === 'true')
const search = ref(route.query.search || '')
const filterStatus = ref(route.query.status || '')
const filterPriority = ref('')
const filterClient = ref(route.query.clientId ? Number(route.query.clientId) : '')
const currentPage = ref(1)
const perPage = 50
const loading = ref(true)
const loadingCreate = ref(false)
const loadingExport = ref(false)
const form = reactive({ title: '', description: '', priority: 'L3', maintenanceType: '', productType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
const attachments = ref([])
const dragOver = ref(false)
const projects = ref([])

const slaTargets = {
  L1: { response: '1 Jam', resolution: '4 Jam' },
  L2: { response: '2 Jam', resolution: '8 Jam' },
  L3: { response: '4 Jam', resolution: '24 Jam' },
  L4: { response: '8 Jam', resolution: '48 Jam' },
}
const slaTarget = ref(slaTargets['L3'])
function updateSLATargets() { slaTarget.value = slaTargets[form.priority] || slaTargets['L3'] }

const selectedClientName = computed(() => {
  if (!auth.isAdmin) return auth.user?.clientName || ''
  if (!form.clientId) return ''
  return clients.value.find(c => c.id === Number(form.clientId))?.companyName || ''
})

const quotaInfo = computed(() => {
  const clientId = auth.isAdmin ? Number(form.clientId) : auth.user?.clientId
  if (!clientId) return { pmRemaining: '-', cmRemaining: '-' }
  const q = quotas.value.find(q => q.clientId === clientId && q.year === new Date().getFullYear())
  if (!q) return { pmRemaining: '-', cmRemaining: '-' }
  return {
    pmRemaining: String(Math.max(q.pmQuota - q.pmUsed, 0)).padStart(2, '0'),
    cmRemaining: String(Math.max(q.cmQuota - q.cmUsed, 0)).padStart(2, '0'),
  }
})

const filtered = computed(() => {
  const result = tickets.value.filter(t => {
    const s = !search.value || t.title.toLowerCase().includes(search.value.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.value.toLowerCase())
    const st = !filterStatus.value || t.status === filterStatus.value
    const pr = !filterPriority.value || t.priority === filterPriority.value
    const cl = !filterClient.value || t.clientId === filterClient.value
    return s && st && pr && cl
  })
  
  // Sort: Unread (NEW) tickets first
  return result.sort((a, b) => {
    const aIsNew = a.isRead === false ? 1 : 0
    const bIsNew = b.isRead === false ? 1 : 0
    return bIsNew - aIsNew
  })
})
const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

watch([search, filterStatus, filterPriority, filterClient], () => { currentPage.value = 1 })
watch(() => route.query.search, (newVal) => {
  if (newVal !== undefined) search.value = newVal
})

watch(() => notifications.incomingTicket, (ticket) => {
  if (ticket && !tickets.value.find(t => t.id === ticket.id)) {
    tickets.value.unshift(ticket)
  }
})

onMounted(async () => {
  loading.value = true
  try { const res = await getTickets(); tickets.value = res.data; } catch { tickets.value = [] }
  if (auth.isAdmin) {
    try { clients.value = (await getClients()).data } catch { clients.value = [] }
    try { users.value = (await getUsers()).data } catch { users.value = [] }
  } else if (auth.user?.role === 'USER' && auth.user?.clientId) {
    try { projects.value = (await getProjectsByClientId(auth.user.clientId)).data } catch { projects.value = [] }
  }
  if (auth.user?.role === 'USER') {
    try { quotas.value = (await getMyQuotas()).data } catch { quotas.value = [] }
  } else if (auth.isAdmin) {
    try { quotas.value = (await getClientQuotas()).data } catch { quotas.value = [] }
  }
  loading.value = false
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown))

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && showForm.value) {
    showForm.value = false
  }
}

function openTicketDetail(ticket) {
  router.push(`/tickets/${ticket.id}`)
}

async function handleExport() {
  loadingExport.value = true
  try {
    await exportTicketsCsv()
    toast.success('Export CSV berhasil')
  } catch {
    toast.error('Gagal mengexport CSV')
  } finally {
    loadingExport.value = false
  }
}

async function loadProjects() {
  form.projectId = ''
  if (!form.clientId) { projects.value = []; return }
  try { projects.value = (await getProjectsByClientId(Number(form.clientId))).data }
  catch { projects.value = [] }
}

async function handleCreate() {
  const confirmed = await confirmDialog.value.open({ 
    title: 'Konfirmasi Pembuatan Tiket', 
    message: `Anda akan membuat tiket dukungan teknis (${form.maintenanceType}). Tindakan ini akan memotong sisa kuota tiket perusahaan Anda. Apakah Anda yakin ingin melanjutkan?`,
    confirmLabel: 'Ya, Buat Tiket & Potong Kuota',
    confirmColor: 'blue'
  })
  if (!confirmed) return

  const payload = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    maintenanceType: form.maintenanceType,
    productType: form.productType || null,
    clientId: auth.isAdmin ? Number(form.clientId) : (auth.user?.clientId || Number(form.clientId)),
    projectId: form.projectId ? Number(form.projectId) : null,
    requesterId: Number(form.requesterId) || auth.user?.id,
  }
  loadingCreate.value = true
  try {
    await createTicket(payload, attachments.value)
    showForm.value = false
    tickets.value = (await getTickets()).data
    if (globalChat.connected) {
      globalChat.subscribeAll()
    }
    Object.assign(form, { title: '', description: '', priority: 'L3', maintenanceType: '', productType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
    attachments.value = []
    projects.value = []
    toast.success('Tiket berhasil dibuat')
  } catch (err) {
    if (err?.response?.status === 422) {
      // Error kuota (422) sudah otomatis ditampilkan oleh global interceptor di axios.js (toast kuning)
      // Jadi kita tidak perlu memunculkan toast merah lagi di sini agar tidak dobel.
      return
    }
    
    const msg = err?.response?.data?.message || ''
    toast.error(msg || 'Gagal membuat tiket. Silakan coba lagi.')
  } finally {
    loadingCreate.value = false
  }
}

function handleFileSelect(e) { addFiles(Array.from(e.target.files)); e.target.value = '' }
function handleDrop(e) { dragOver.value = false; addFiles(Array.from(e.dataTransfer.files)) }
function addFiles(files) {
  const maxSize = 5 * 1024 * 1024
  for (const file of files) {
    if (file.size > maxSize) { alert(`File "${file.name}" melebihi batas 5MB`); continue }
    attachments.value.push(file)
  }
}
function removeFile(index) { attachments.value.splice(index, 1) }
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }

onBeforeRouteLeave(async (to, from, next) => {
  const hasUnsavedInput = form.title.trim() !== '' || form.description.trim() !== '' || attachments.value.length > 0
  if (showForm.value && hasUnsavedInput) {
    const confirmed = await confirmDialog.value.open({
      title: 'Batalkan Pembuatan Tiket?',
      message: 'Anda memiliki data tiket yang belum disimpan. Jika Anda keluar halaman, semua isian akan hilang. Yakin ingin keluar?',
      confirmLabel: 'Ya, Keluar & Buang',
      confirmColor: 'red'
    })
    
    if (confirmed) {
      next()
    } else {
      next(false) // Batalkan navigasi
    }
  } else {
    next()
  }
})
</script>
