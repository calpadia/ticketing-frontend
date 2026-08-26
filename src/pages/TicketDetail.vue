<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="text-gray-500 text-sm">Memuat ticket...</div>
  </div>
  <div v-else-if="!ticket" class="flex items-center justify-center py-20">
    <div class="text-center">
      <div class="text-4xl mb-4">🎫</div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Ticket tidak ditemukan</h3>
      <p class="text-sm text-gray-500 mb-4">Ticket yang kamu cari tidak ada atau kamu tidak memiliki akses.</p>
      <button @click="router.push('/tickets')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700" v-tooltip="'Kembali ke halaman daftar tiket'">
        Kembali ke Tickets
      </button>
    </div>
  </div>
  <div v-else>
    <ConfirmDialog ref="confirmDialog" />
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <button @click="router.push('/tickets')" class="flex items-center gap-1 hover:text-gray-900 transition-colors" v-tooltip="'Kembali ke halaman daftar tiket'">
        <ChevronLeft class="w-4 h-4" /> Tickets
      </button>
      <span class="text-gray-300">/</span>
      <span class="font-medium text-gray-800">{{ ticket.ticketNumber }}</span>
    </div>

    <!-- Closed banner -->
    <div v-if="ticket.status === 'CLOSED'" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl mb-4">
      <AlertCircle class="w-4 h-4 shrink-0" />
      Tiket ini telah <strong class="mx-1">ditutup (CLOSED)</strong>. Tidak ada aktivitas lebih lanjut yang diperlukan.
    </div>

    <!-- Main layout -->
    <div class="flex flex-col lg:flex-row gap-5">
      <!-- LEFT: Main content -->
      <div class="flex-1 space-y-5 min-w-0">

        <!-- HEADER CARD FOR USER -->
        <div v-if="auth.user?.role === 'USER'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <span class="text-sm font-bold text-gray-500">#{{ ticket.ticketNumber }}</span>
            <StatusBadge :status="ticket.status" />
            <span class="text-xs font-medium text-green-600 flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              Kuota {{ ticket.maintenanceType }} Terpotong
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ ticket.title }}</h1>
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p class="text-sm text-gray-700 whitespace-pre-wrap"><span class="font-bold text-gray-900">Deskripsi Awal:</span> {{ ticket.description }}</p>
          </div>
        </div>

        <template v-else>
          <!-- Header card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">CLIENT: {{ ticket.clientCompanyName }}</p>
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <button @click="copyTicketNumber" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors group" v-tooltip="'Copy Ticket Number'">
                  #{{ ticket.ticketNumber }}
                  <Copy class="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <span>: {{ ticket.title }}</span>
              </h1>
              <StatusBadge :status="ticket.status" />
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Project Name</p>
                <p class="text-sm font-medium text-gray-800">{{ ticket.projectName || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Product Type</p>
                <p class="text-sm font-medium text-gray-800">{{ productTypeLabel(ticket.productType) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Maintenance Type</p>
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold border', ticket.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">
                  {{ ticket.maintenanceType === 'PM' ? 'Preventive Maintenance (PM)' : 'Corrective Maintenance (CM)' }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Priority</p>
                <PriorityBadge :priority="ticket.priority" />
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Requester</p>
                <p class="text-sm font-medium text-gray-800">{{ ticket.requesterName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Created</p>
                <p class="text-sm font-medium text-gray-800">{{ formatDate(ticket.createdAt) }}</p>
              </div>
            </div>
          </div>
  
          <!-- Issue Description -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText class="w-4 h-4" /> Issue Description</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ ticket.description }}</p>
          </div>
  
          <!-- Attachments -->
          <div v-if="allAttachments.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Paperclip class="w-4 h-4" /> Attachments</h3>
            <div class="space-y-2">
              <button v-for="att in allAttachments" :key="att.id + '-' + att.source" @click="handleUnifiedDownload(att)"
                class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-xl px-3 py-2 w-full text-left"
                v-tooltip="'Unduh lampiran ini'">
                <Download class="w-4 h-4 shrink-0" /><span class="flex-1 truncate">{{ att.fileName }}</span>
                <span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium ml-2 shrink-0">{{ att.source === 'TICKET' ? 'Awal' : 'Chat' }}</span>
                <span v-if="att.fileType" class="text-xs text-gray-400">{{ att.fileType }}</span>
              </button>
            </div>
          </div>
        </template>
        
        <template v-if="auth.user?.role === 'USER'">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 class="text-sm font-semibold text-gray-700">Historical Activity Log</h3>
            </div>
            
            <div class="divide-y divide-gray-100 max-h-[500px] overflow-y-auto" ref="messagesContainer">
              <div v-for="item in historicalActivityLog" :key="item.id" :class="['p-5 flex flex-col md:flex-row gap-4 transition-colors', item.type === 'SYSTEM' ? 'bg-slate-50' : 'hover:bg-gray-50/50']">
                <!-- Date -->
                <div class="md:w-32 shrink-0">
                  <p :class="['text-[11px] font-medium', item.type === 'SYSTEM' ? 'text-slate-400' : 'text-gray-400']">{{ formatTime(item.date) }}</p>
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <h4 :class="['text-sm font-semibold flex items-center gap-2 mb-1', item.type === 'SYSTEM' ? 'text-slate-700' : 'text-gray-900']">
                    <Activity v-if="item.type === 'SYSTEM'" class="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                    {{ item.author }}
                    <span v-if="item.roleLabel" class="text-gray-500 font-normal">({{ item.roleLabel }})</span>
                    <span v-if="item.platform" class="text-[9px] px-1.5 py-0.5 border rounded uppercase text-gray-400 bg-white shadow-sm shrink-0">{{ item.platform }}</span>
                  </h4>
                  <p :class="['text-sm whitespace-pre-wrap leading-relaxed', item.type === 'SYSTEM' ? 'text-slate-500 italic' : 'text-gray-700']">{{ item.content }}</p>
                  
                  <!-- Attachments -->
                  <div v-if="item.attachments?.length > 0" class="mt-2 space-y-1">
                    <button v-for="att in item.attachments" :key="att.id" @click="handleDownloadChatFile(att.id, att.fileName)"
                      class="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded bg-gray-100 text-blue-600 hover:bg-gray-200 w-fit"
                      v-tooltip="'Unduh lampiran'">
                      <Paperclip class="w-3 h-3 shrink-0" /><span class="truncate max-w-[200px]">{{ att.fileName }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Box for Client -->
            <div class="p-4 border-t border-gray-200 bg-gray-50">
              <div v-if="pendingFiles.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                <div v-for="(file, i) in pendingFiles" :key="i" class="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 text-xs">
                  <Paperclip class="w-3 h-3 text-blue-500" /><span class="text-blue-700 truncate max-w-[100px]">{{ file.name }}</span>
                  <button @click="pendingFiles.splice(i,1)" class="text-red-400 ml-1"><X class="w-3 h-3" /></button>
                </div>
              </div>
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input ref="chatFileInput" type="file" class="hidden" multiple @change="handleFileAdd" />
                <button type="button" @click="$refs.chatFileInput.click()" :disabled="!chatConnected || ticket.status === 'CLOSED'" class="bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 shrink-0" v-tooltip="'Lampirkan file'">
                  <Paperclip class="w-4 h-4 text-gray-500" />
                </button>
                <input v-model="newMessage" type="text" placeholder="Tambahkan Update/Catatan..." class="flex-1 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-0" :disabled="!chatConnected || ticket.status === 'CLOSED'" />
                <button type="submit" :disabled="(!newMessage.trim() && pendingFiles.length === 0) || !chatConnected || uploading || ticket.status === 'CLOSED'"
                  class="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-40 font-medium text-sm shrink-0 flex items-center gap-2">
                  <Send v-if="!uploading" class="w-4 h-4" /><Loader2 v-else class="w-4 h-4 animate-spin" />
                  <span class="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </div>
          </div>

        </template>
        <template v-else>

        <!-- Internal Worklog -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock class="w-4 h-4" /> Internal Worklog</h3>
          <div class="overflow-auto max-h-64">
            <table class="w-full text-sm min-w-[500px] relative">
              <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr class="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th class="py-2 pr-4 font-medium">Resource</th>
                  <th class="py-2 pr-4 font-medium">Task / Activity</th>
                  <th class="py-2 pr-4 font-medium">Live Timer</th>
                  <th class="py-2 font-medium">Logged Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="worklogs.length === 0">
                  <td colspan="4" class="py-4 text-center text-gray-400 text-xs">Belum ada worklog.</td>
                </tr>
                <tr v-for="wl in worklogs" :key="wl.id" class="text-gray-700">
                  <td class="py-2.5 pr-4 font-semibold">
                    <template v-if="wl.taskNotes && wl.taskNotes.match(/^\\[(.*?)\\] /)">
                      <span>{{ wl.taskNotes.match(/^\\[(.*?)\\] /)[1] }}</span>
                      <span class="text-[10px] font-normal text-gray-400 block mt-0.5">Started by: {{ wl.userName }}</span>
                    </template>
                    <template v-else>
                      <span>{{ wl.userName }}</span>
                      <span class="font-normal text-gray-400 ml-1">({{ wl.userRoleLabel }})</span>
                    </template>
                  </td>
                  <td class="py-2.5 pr-4 text-gray-600">{{ wl.taskNotes ? wl.taskNotes.replace(/^\\[.*?\\] /, '') : '-' }}</td>
                  <td class="py-2.5 pr-4">
                    <span v-if="wl.isRunning || wl.running" class="text-green-600 font-mono font-bold">{{ getLiveTimer(wl.id) }}</span>
                    <span v-else class="text-gray-400 font-mono">--:--</span>
                  </td>
                  <td class="py-2.5">
                    <div v-if="(wl.isRunning || wl.running) && isSupport" class="relative inline-block">
                      <button @click="handleStopWorklog(wl); closeTimerHint()"
                        :disabled="loadingStop[wl.id]"
                        class="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1"
                        v-tooltip="'Hentikan pencatatan waktu'">
                        <Loader2 v-if="loadingStop[wl.id]" class="w-3 h-3 animate-spin" />
                        <span v-else>Stop</span>
                      </button>
                      <transition enter-active-class="transition ease-out duration-500" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
                        <div v-if="showTimerHint && wl.userId === currentUserId" class="absolute bottom-full right-0 mb-3 bg-red-600 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl z-50 w-48 text-center animate-bounce-slight pointer-events-none">
                          <div class="absolute -bottom-1.5 right-4 w-3 h-3 bg-red-600 transform rotate-45 rounded-sm"></div>
                          Jangan lupa hentikan timer jika pekerjaan Anda selesai!
                        </div>
                      </transition>
                    </div>
                    <span v-else-if="wl.isRunning || wl.running" class="text-green-500 font-mono font-bold text-xs">Running...</span>
                    <span v-else class="font-bold text-gray-800">{{ formatDuration(wl.loggedDurationSeconds) }} <span class="text-green-600 text-xs font-normal">(Logged)</span></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Progress Log -->
        <div v-if="progressLogs.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity class="w-4 h-4" /> Progress Log</h3>
          <div class="space-y-3 overflow-y-auto max-h-64 pr-2">
            <div v-for="log in progressLogs" :key="log.id" class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <StatusBadge :status="log.fromStatus" />
                  <span class="text-xs text-gray-400">→</span>
                  <StatusBadge :status="log.toStatus" />
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ log.changedByName }} • {{ formatDate(log.changedAt) }}</p>
                <p v-if="log.notes" class="text-xs text-gray-600 mt-0.5 bg-gray-50 rounded px-2 py-1">{{ log.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Communication with Client (Chat) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style="height: 480px;">
          <div class="px-5 py-4 border-b border-gray-200 shrink-0">
            <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><MessageCircle class="w-4 h-4" /> Communication with Client</h3>
          </div>
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
              <p class="text-sm text-gray-400">Belum ada pesan. Mulai percakapan.</p>
            </div>
            <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.senderId === currentUserId ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-[75%] rounded-xl px-3 py-2', msg.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900']">
                <div class="flex items-center gap-1.5 mb-1">
                  <span :class="['text-xs font-medium', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-500']">{{ msg.senderName }}</span>
                  <span :class="['text-[10px] px-1.5 py-0.5 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-500']">{{ getRoleLabel(msg.senderRole) }}</span>
                </div>
                <p v-if="msg.content" class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                <div v-if="msg.attachments?.length > 0" class="mt-1.5 space-y-1">
                  <button v-for="att in msg.attachments" :key="att.id" @click="handleDownloadChatFile(att.id, att.fileName)"
                    :class="['flex items-center gap-1.5 text-xs px-2 py-1 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-blue-600']"
                    v-tooltip="'Unduh lampiran chat'">
                    <Paperclip class="w-3 h-3" /><span class="truncate max-w-[140px]">{{ att.fileName }}</span>
                  </button>
                </div>
                <p :class="['text-xs mt-1', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400']">{{ formatTime(msg.sentAt) }}</p>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-gray-200 shrink-0">
            <div v-if="pendingFiles.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <div v-for="(file, i) in pendingFiles" :key="i" class="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 text-xs">
                <Paperclip class="w-3 h-3 text-blue-500" /><span class="text-blue-700 truncate max-w-[100px]">{{ file.name }}</span>
                <button @click="pendingFiles.splice(i,1)" class="text-red-400 ml-1"><X class="w-3 h-3" /></button>
              </div>
            </div>
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input ref="chatFileInput" type="file" class="hidden" multiple @change="handleFileAdd" />
              <button type="button" @click="$refs.chatFileInput.click()" :disabled="!chatConnected || ticket.status === 'CLOSED'" class="bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 shrink-0" v-tooltip="'Lampirkan file/dokumen ke chat'">
                <Paperclip class="w-4 h-4 text-gray-500" />
              </button>
              <input v-model="newMessage" type="text" placeholder="Type message to client..." class="flex-1 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-0 disabled:bg-gray-100 disabled:cursor-not-allowed" :disabled="!chatConnected || ticket.status === 'CLOSED'" />
              <button type="submit" :disabled="(!newMessage.trim() && pendingFiles.length === 0) || !chatConnected || uploading || ticket.status === 'CLOSED'"
                class="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-40 font-medium text-sm shrink-0"
                v-tooltip="'Kirim pesan ke client/support'">
                <Send v-if="!uploading" class="w-4 h-4" /><span v-else class="text-xs">...</span>
              </button>
            </form>
          </div>
        </div>
        </template>
      </div>

      <!-- RIGHT: Control panel / Metadata -->
      <div :class="['space-y-4 shrink-0', auth.user?.role === 'USER' ? 'lg:w-80' : 'lg:w-72']">
        
        <template v-if="auth.user?.role === 'USER'">
          <!-- DETAIL METADATA FOR USER -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Detail Metadata</h3>
            
            <div class="space-y-4">
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">JENIS MAINTENANCE</p>
                <p class="text-sm font-medium text-gray-800">{{ ticket.maintenanceType === 'PM' ? 'Preventive (PM)' : 'Corrective (CM)' }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">PRODUCT - PROJECT</p>
                <p class="text-sm font-medium text-gray-800">{{ productTypeLabel(ticket.productType) }} <span v-if="ticket.projectName">- {{ ticket.projectName }}</span></p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">PRIORITY LEVEL</p>
                <p :class="['text-sm font-medium', ticket.priority === 'L1' || ticket.priority === 'L2' ? 'text-red-600' : 'text-gray-800']">
                  {{ ticket.priority === 'L1' ? 'Level 1 - Critical' : ticket.priority === 'L2' ? 'Level 2 - High' : ticket.priority === 'L3' ? 'Level 3 - Medium' : 'Level 4 - Low' }}
                </p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">TARGET RESPON (SLA)</p>
                <p class="text-sm font-medium text-gray-800">{{ formatDate(ticket.createdAt) }}</p> 
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">LAMPIRAN</p>
                <div v-if="allAttachments.length > 0" class="space-y-1.5 mt-2">
                  <button v-for="att in allAttachments" :key="att.id + '-' + att.source" @click="handleUnifiedDownload(att)"
                    class="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 transition-colors w-full text-left"
                    v-tooltip="'Unduh lampiran'">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <Paperclip class="w-3 h-3 shrink-0" /><span class="truncate">{{ att.fileName }}</span>
                    </div>
                    <span class="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded ml-2 shrink-0">{{ att.source === 'TICKET' ? 'Awal' : 'Chat' }}</span>
                  </button>
                </div>
                <p v-else class="text-xs text-gray-400 italic">Tidak ada lampiran</p>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-100">
              <p class="text-[10px] text-gray-400 text-center">Tiket ini bersifat permanen setelah didaftarkan.</p>
            </div>
          </div>
            
          <!-- UNRESPONDED WARNING BANNER -->
          <div v-if="isUnrespondedWarning" class="flex items-start gap-3 p-4 rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertCircle class="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
            <div class="flex-1">
              <h4 class="text-sm font-bold text-yellow-900">Menunggu Respons Anda</h4>
              <p class="text-[11px] mt-1 text-yellow-800 leading-relaxed">Tiket ini belum ada aktivitas selama lebih dari 3 hari. Sistem akan menutupnya secara otomatis jika tidak ada respons lanjutan.</p>
            </div>
          </div>

          <!-- TUTUP TIKET BOX -->
          <div v-if="ticket.status !== 'CLOSED'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-3">Tutup Tiket</h3>
            <p class="text-[11px] text-gray-500 mb-4 mt-3 leading-relaxed">Jika kendala sudah teratasi, silakan konfirmasi penyelesaian untuk menutup tiket ini secara resmi.</p>
            <div class="mb-5">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">RATING LAYANAN</p>
              <div class="relative">
                <select v-model="rating" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="5">⭐⭐⭐⭐⭐ Sangat Baik</option>
                  <option value="4">⭐⭐⭐⭐ Baik</option>
                  <option value="3">⭐⭐⭐ Cukup</option>
                  <option value="2">⭐⭐ Kurang</option>
                  <option value="1">⭐ Sangat Kurang</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div class="relative">
              <button @click="handleClientCloseTicket(); closeClientHint()" :disabled="loadingClose" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Loader2 v-if="loadingClose" class="w-4 h-4 animate-spin" />
                <span v-else>Selesaikan Tiket</span>
              </button>
              <transition enter-active-class="transition ease-out duration-500" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
                <div v-if="showClientHint" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-blue-600 text-white text-[11px] font-medium px-4 py-2 rounded-xl shadow-xl z-50 w-[95%] text-center animate-bounce-slight pointer-events-none">
                  <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 transform rotate-45 rounded-sm"></div>
                  Kendala sudah teratasi? Silakan beri rating dan selesaikan tiket ini.
                </div>
              </transition>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- SLA Countdown -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SLA COUNTDOWN ({{ ticket.priority }} - {{ slaLabel }})</p>
            <div :class="['text-3xl font-bold font-mono text-center py-2', slaColor]">{{ slaCountdown }}</div>
            <p v-if="slaBreached" class="text-xs text-red-500 text-center mt-1">SLA telah terlampaui</p>
            <p v-else class="text-xs text-gray-400 text-center mt-1">Tersisa hingga resolusi</p>
          </div>

        <!-- Update Status (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">Update Status</h3>
          <div class="relative">
            <select v-model="statusForm.status" :disabled="ticket.status === 'CLOSED'" class="w-full appearance-none border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer">
              <option value="">Pilih status baru...</option>
              <option v-for="s in allowedTransitions" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <textarea v-model="statusForm.notes" :disabled="ticket.status === 'CLOSED'" rows="2" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" placeholder="Catatan perubahan (opsional)"></textarea>
          <button v-if="statusForm.status && ticket.status !== 'CLOSED'" @click="submitStatus" :disabled="loadingStatus"
            class="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            v-tooltip="'Simpan pembaruan status tiket'">
            <Loader2 v-if="loadingStatus" class="w-4 h-4 animate-spin" />
            <span>{{ loadingStatus ? 'Memperbarui...' : 'Update Status' }}</span>
          </button>
          <!-- Close Ticket -->
          <button v-if="ticket.status !== 'CLOSED'" @click="handleCloseTicket" :disabled="loadingClose"
            class="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors hover:shadow-md hover:shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            v-tooltip="'Tandai tiket ini selesai/ditutup'">
            <Loader2 v-if="loadingClose" class="w-4 h-4 animate-spin" />
            <XCircle v-else class="w-4 h-4" />
            {{ loadingClose ? 'Menutup...' : 'Close Ticket (Solved)' }}
          </button>
          <p v-if="ticket.status === 'CLOSED'" class="text-xs text-gray-400 text-center">Tiket ini sudah ditutup.</p>
        </div>

        <!-- Assignment Control (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Assignment Control</h3>
          <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">ASSIGNED RESOURCES</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="a in activeAssignments" :key="a.id" class="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-xl font-medium">{{ a.assignedToName }}</span>
            <span v-if="activeAssignments.length === 0" class="text-xs text-gray-400 italic">Belum ada</span>
          </div>
          <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">SELECT SHADOW RESOURCE</p>
          <div class="relative mb-3">
            <select v-model="assignForm.userId" :disabled="ticket.status === 'CLOSED'" class="w-full appearance-none border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer">
              <option value="">-- Choose Technician --</option>
              <option v-for="u in filteredAssignableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.role }})</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">SPECIFIC TASK INSTRUCTION</p>
          <input v-model="assignForm.notes" :disabled="ticket.status === 'CLOSED'" type="text" placeholder="e.g. Check firewall logs at branch" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm mb-4 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
          <button v-if="ticket.status !== 'CLOSED'" @click="handleAssign" :disabled="!assignForm.userId || loadingAssign"
            class="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors hover:shadow-md hover:shadow-gray-900/20 disabled:opacity-40 flex items-center justify-center gap-2"
            v-tooltip="'Tugaskan teknisi dan mulai timer worklog'">
            <Loader2 v-if="loadingAssign" class="w-4 h-4 animate-spin" />
            <UserCheck v-else class="w-4 h-4" />
            {{ loadingAssign ? 'Assigning...' : 'Assign & Start Timer' }}
          </button>
        </div>

        <!-- Update Ticket Level (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">UPDATE TICKET LEVEL</p>
          <div class="relative">
            <select v-model="newPriority" @change="handlePriorityChange" :disabled="ticket.status === 'CLOSED'" class="w-full appearance-none border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer">
              <option value="L1">L1 - Critical (4h)</option>
              <option value="L2">L2 - High (8h)</option>
              <option value="L3">L3 - Medium (24h)</option>
              <option value="L4">L4 - Low (48h)</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">Mengubah level akan mempengaruhi SLA countdown.</p>
        </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Client as StompClient } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { getTicketById, getTicketProgress, updateTicketStatus, updateTicketPriority } from '../api/tickets'
import { getAttachmentsByTicketId, downloadAttachment } from '../api/attachments'
import { getTicketAssignments, assignTicket } from '../api/assignments'
import { getChatHistory, uploadChatFile, downloadChatAttachment } from '../api/chat'
import { getAssignableEngineers } from '../api/users'
import { getClientSupports } from '../api/clientSupports'
import { getWorklogs, startWorklog, stopWorklog } from '../api/worklogs'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useToastStore } from '../stores/toast'
import { ChevronLeft, AlertCircle, FileText, Paperclip, Download, Clock, Activity, MessageCircle, Send, X, UserCheck, XCircle, CheckCircle, Loader2, Copy } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { triggerNotification } from '../utils/notify'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()
const toast = useToastStore()
const currentUserId = computed(() => auth.user?.id)
const confirmDialog = ref(null)

const isSupport = computed(() => auth.user?.role === 'SUPPORT' || auth.user?.role === 'ADMIN')

const ticket = ref(null)
const loading = ref(true)
const progressLogs = ref([])
const attachments = ref([])
const assignments = ref([])
const assignableUsers = ref([])
const worklogs = ref([])

// Live timer state: map worklogId -> elapsed seconds (counting up from startedAt)
const liveTimers = ref({})
let timerInterval = null

// Chat state
const messages = ref([])
const newMessage = ref('')
const pendingFiles = ref([])
const uploading = ref(false)
const chatConnected = ref(false)
const messagesContainer = ref(null)
let stompClient = null

// Forms
const statusForm = reactive({ status: '', notes: '' })
const assignForm = reactive({ userId: '', notes: '' })
const newPriority = ref('')
const rating = ref('5')

// Loading states
const loadingAssign = ref(false)
const loadingStatus = ref(false)
const loadingClose = ref(false)
const loadingStop = ref({})

// SLA
const slaCountdown = ref('--:--:--')
const slaBreached = ref(false)
const slaColor = ref('text-gray-800')
let slaTimer = null

const showTimerHint = ref(false)
let timerHintTimeout = null
watch(worklogs, (newLogs) => {
  const hasRunning = newLogs.some(wl => (wl.isRunning || wl.running) && wl.userId === currentUserId.value)
  if (hasRunning && !sessionStorage.getItem('timerHintShown')) {
    setTimeout(() => {
      showTimerHint.value = true
      sessionStorage.setItem('timerHintShown', 'true')
      timerHintTimeout = setTimeout(() => { showTimerHint.value = false }, 8000)
    }, 1000)
  }
}, { immediate: true, deep: true })
function closeTimerHint() {
  showTimerHint.value = false
  if (timerHintTimeout) clearTimeout(timerHintTimeout)
}

const showClientHint = ref(false)
let clientHintTimeout = null
watch(ticket, (newTicket) => {
  if (newTicket && newTicket.status === 'RESOLVED' && auth.user?.role === 'USER' && !sessionStorage.getItem('clientHintShown')) {
    setTimeout(() => {
      showClientHint.value = true
      sessionStorage.setItem('clientHintShown', 'true')
      clientHintTimeout = setTimeout(() => { showClientHint.value = false }, 10000)
    }, 1500)
  }
}, { immediate: true, deep: true })
function closeClientHint() {
  showClientHint.value = false
  if (clientHintTimeout) clearTimeout(clientHintTimeout)
}

const PRODUCT_LABELS = {
  OPENTEXT_CONTENT_SERVER: 'Opentext Content Server',
  BRAVA_ENTERPRISE: 'Brava Enterprise',
  OPENTEXT_DIRECTORY_SERVICES: 'Opentext Directory Services',
  ARCHIVE_SERVER: 'Archive Server',
  APPWORKS: 'AppWorks',
  CUSTOM_APPS: 'Custom Apps',
}
const SLA_RESOLUTION_HOURS = { L1: 4, L2: 8, L3: 24, L4: 48 }

const slaLabel = computed(() => {
  const h = SLA_RESOLUTION_HOURS[ticket.value?.priority] || 24
  return `${h}h`
})

const isUnrespondedWarning = computed(() => {
  if (!ticket.value || !ticket.value.updatedAt) return false
  if (ticket.value.status !== 'IN_PROGRESS' && ticket.value.status !== 'RESOLVED') return false
  
  const now = Date.now()
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000
  const diff = now - new Date(ticket.value.updatedAt).getTime()
  return diff >= threeDaysInMs
})

const activeAssignments = computed(() => assignments.value.filter(a => a.active))

const allAttachments = computed(() => {
  const result = attachments.value.map(a => ({ ...a, source: 'TICKET' }))
  messages.value.forEach(msg => {
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        if (!result.find(a => a.id === att.id && a.source === 'CHAT')) {
          result.push({ ...att, source: 'CHAT' })
        }
      })
    }
  })
  return result
})

async function handleUnifiedDownload(att) {
  if (att.source === 'TICKET') {
    await handleDownloadAttachment(att.id, att.fileName)
  } else {
    await handleDownloadChatFile(att.id, att.fileName)
  }
}

const historicalActivityLog = computed(() => {
  if (!ticket.value) return []
  let logs = []

  // 1. Initial creation
  logs.push({
    id: 'sys-start',
    type: 'SYSTEM',
    date: ticket.value.createdAt,
    author: 'System',
    content: `Tiket berhasil didaftarkan. Kuota ${ticket.value.maintenanceType === 'PM' ? 'Preventive Maintenance (PM)' : 'Corrective Maintenance (CM)'} telah dikurangi secara otomatis.`
  })

  // 2. Progress Logs
  progressLogs.value.forEach(p => {
    logs.push({
      id: `prog-${p.id}`,
      type: 'SYSTEM',
      date: p.changedAt,
      author: p.changedByName || 'System',
      content: `Status tiket diubah dari ${p.fromStatus} menjadi ${p.toStatus}.${p.notes ? ' Catatan: ' + p.notes : ''}`
    })
  })

  // 3. Chat Messages (Filter out internal messages)
  messages.value.forEach(msg => {
    if (!msg.isInternalOnly) {
      logs.push({
        id: `chat-${msg.id}`,
        type: 'CHAT',
        date: msg.sentAt || msg.createdAt,
        author: msg.senderName,
        roleLabel: getRoleLabel(msg.senderRole),
        platform: 'PORTAL',
        content: msg.content,
        attachments: msg.attachments
      })
    }
  })

  // Sort by date (oldest to newest)
  return logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Assignable users: client's support engineers + TECHNICAL_SUPPORT users
const filteredAssignableUsers = computed(() => {
  // assignableUsers already filtered by backend (SUPPORT + TECHNICAL_SUPPORT for caller role)
  return assignableUsers.value
})

const allowedTransitions = computed(() => {
  const current = ticket.value?.status
  const map = {
    OPEN: [{ value: 'IN_PROGRESS', label: 'In Progress' }],
    IN_PROGRESS: [{ value: 'RESOLVED', label: 'Resolved' }],
    RESOLVED: [{ value: 'CLOSED', label: 'Closed' }, { value: 'IN_PROGRESS', label: 'In Progress (Reopen)' }],
    CLOSED: [],
  }
  return map[current] || []
})

function productTypeLabel(val) { return PRODUCT_LABELS[val] || val || '-' }

function getRoleLabel(role) {
  if (role === 'USER') return 'Client'
  if (role === 'TECHNICAL_SUPPORT') return 'L2 Technical'
  if (role === 'ADMIN') return 'Admin'
  return 'Support'
}

// ========== SLA Timer ==========
function startSlaTimer() {
  if (!ticket.value?.createdAt) return
  const hours = SLA_RESOLUTION_HOURS[newPriority.value || ticket.value.priority] || 24
  const deadline = new Date(ticket.value.createdAt).getTime() + hours * 3600 * 1000

  if (slaTimer) { clearInterval(slaTimer); slaTimer = null; }

  function update() {
    let now = Date.now()
    if (ticket.value?.status === 'CLOSED' || ticket.value?.status === 'RESOLVED') {
      const log = progressLogs.value.find(p => p.toStatus === 'CLOSED' || p.toStatus === 'RESOLVED')
      now = log ? new Date(log.changedAt).getTime() : (ticket.value?.updatedAt ? new Date(ticket.value.updatedAt).getTime() : Date.now())
      if (slaTimer) { clearInterval(slaTimer); slaTimer = null; }
    }

    const diff = deadline - now
    if (diff <= 0) {
      slaBreached.value = true
      slaColor.value = 'text-red-600'
      const abs = Math.abs(diff)
      slaCountdown.value = `-${fmt(abs)}`
    } else {
      slaBreached.value = false
      const pct = diff / (hours * 3600 * 1000)
      slaColor.value = pct < 0.2 ? 'text-red-600' : pct < 0.5 ? 'text-yellow-600' : 'text-gray-800'
      slaCountdown.value = fmt(diff)
    }
  }
  function fmt(ms) {
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0')
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  update()
  if (ticket.value?.status !== 'CLOSED' && ticket.value?.status !== 'RESOLVED') {
    slaTimer = setInterval(update, 1000)
  }
}

// ========== Worklog Timers ==========
function initLiveTimers() {
  // Clear any existing interval
  if (timerInterval) clearInterval(timerInterval)
  liveTimers.value = {}

  // Initialize elapsed seconds for running worklogs
  worklogs.value.forEach(wl => {
    if ((wl.isRunning || wl.running) && wl.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(wl.startedAt).getTime()) / 1000)
      liveTimers.value[wl.id] = elapsed
    }
  })

  // Tick every second
  timerInterval = setInterval(() => {
    worklogs.value.forEach(wl => {
      if (wl.isRunning || wl.running) {
        liveTimers.value[wl.id] = (liveTimers.value[wl.id] || 0) + 1
      }
    })
  }, 1000)
}

function getLiveTimer(worklogId) {
  const secs = liveTimers.value[worklogId] || 0
  const h = Math.floor(secs / 3600).toString().padStart(2, '0')
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatDuration(seconds) {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ========== Chat ==========
function scrollToBottom() {
  nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight })
}

function connectChat(ticketId) {
  if (auth.token === 'demo-token') return
  const wsUrl = `${location.protocol === 'https:' ? 'https' : 'http'}://${location.host}/ws`
  stompClient = new StompClient({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: { Authorization: `Bearer ${auth.token}` },
    onConnect: () => {
      chatConnected.value = true
      stompClient.subscribe(`/topic/chat/${ticketId}`, (msg) => {
        const data = JSON.parse(msg.body)
        if (!messages.value.find(m => m.id === data.id)) {
          messages.value.push(data)
          scrollToBottom()
          
          // Perbaikan: Update last_read_at di Backend agar pesan ini tidak dianggap unread
          if (data.senderId !== currentUserId.value) {
            if (document.visibilityState === 'visible') {
              notifications.markTicketSeen(ticketId)
            } else {
              // Jika tab sedang background, tampilkan notifikasi push
              notifications.addUnread()
              triggerNotification(`Pesan baru di Tiket #${ticket.value?.ticketNumber || ticketId}`, data.content || 'Lampiran baru diterima')
            }
          }
        }
      })
    },
    onDisconnect: () => { chatConnected.value = false },
    reconnectDelay: 5000,
  })
  stompClient.activate()
}

// ========== Lifecycle ==========
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    const id = route.params.id
    if (id) notifications.markTicketSeen(id)
  }
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Request permission untuk browser notification
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }

  const id = route.params.id
  notifications.markTicketSeen(id)
  try {
    const res = await getTicketById(id)
    ticket.value = res.data
    newPriority.value = res.data.priority
    startSlaTimer()
  } catch { loading.value = false; return }
  loading.value = false

  const promises = [
    getTicketProgress(id).then(r => { progressLogs.value = r.data }),
    getAttachmentsByTicketId(id).then(r => { attachments.value = r.data }),
    getChatHistory(id).then(r => { messages.value = r.data; scrollToBottom() }),
  ]
  if (isSupport.value) {
    promises.push(getTicketAssignments(id).then(r => { assignments.value = r.data }))
    promises.push(getWorklogs(id).then(r => { worklogs.value = r.data; initLiveTimers() }))
  }
  await Promise.allSettled(promises)

  if (isSupport.value) {
    // Load assignable users: backend returns TECHNICAL_SUPPORT for SUPPORT callers
    try {
      const engineers = await getAssignableEngineers()
      assignableUsers.value = engineers.data
    } catch {}
  }

  connectChat(id)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (stompClient) stompClient.deactivate()
  if (slaTimer) clearInterval(slaTimer)
  if (timerInterval) clearInterval(timerInterval)
  
  // Pastikan waktu keluar juga tercatat sebagai last_read_at
  const id = route.params.id
  if (id) notifications.markTicketSeen(id)
})

// ========== Actions ==========
async function submitStatus() {
  if (!statusForm.status || !ticket.value) return
  
  const confirmed = await confirmDialog.value.open({
    title: 'Konfirmasi Perubahan Status',
    message: `Apakah Anda yakin ingin mengubah status tiket menjadi ${statusForm.status}?`,
    confirmLabel: 'Ya, Ubah Status',
    confirmColor: 'blue',
  })
  if (!confirmed) {
    statusForm.status = ''
    return
  }

  loadingStatus.value = true
  try {
    if (statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') {
      await stopAllRunningTimers()
    }
    
    await updateTicketStatus(ticket.value.id, { status: statusForm.status, changedBy: auth.user?.id, notes: statusForm.notes })
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    statusForm.status = ''
    statusForm.notes = ''
    toast.success('Status ticket berhasil diperbarui')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal memperbarui status ticket')
  } finally {
    loadingStatus.value = false
  }
}

async function handleCloseTicket() {
  const confirmed = await confirmDialog.value.open({
    title: 'Close Ticket',
    message: 'Apakah kamu yakin ingin menutup ticket ini? Aksi ini tidak dapat dibatalkan.',
    confirmLabel: 'Close Ticket',
    confirmColor: 'red',
  })
  if (!confirmed) return

  loadingClose.value = true
  try {
    await stopAllRunningTimers()

    await updateTicketStatus(ticket.value.id, { status: 'CLOSED', changedBy: auth.user?.id, notes: statusForm.notes || 'Ticket closed.' })
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    statusForm.status = ''
    statusForm.notes = ''
    toast.success('Ticket berhasil ditutup')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menutup ticket')
  } finally {
    loadingClose.value = false
  }
}

async function handleClientCloseTicket() {
  const confirmed = await confirmDialog.value.open({
    title: 'Selesaikan Tiket',
    message: 'Apakah Anda yakin ingin menyelesaikan tiket ini? Tiket yang sudah ditutup tidak dapat dibuka kembali.',
    confirmLabel: 'Ya, Selesaikan',
    confirmColor: 'green',
  })
  if (!confirmed) return

  loadingClose.value = true
  try {
    await updateTicketStatus(ticket.value.id, { 
      status: 'CLOSED', 
      changedBy: auth.user?.id, 
      notes: `Tiket diselesaikan oleh Klien dengan rating: ${rating.value} Bintang.` 
    })
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    toast.success('Terima kasih! Tiket berhasil diselesaikan.')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menutup tiket')
  } finally {
    loadingClose.value = false
  }
}

async function handleAssign() {
  if (!assignForm.userId || !ticket.value) return

  const user = assignableUsers.value.find(u => u.id === Number(assignForm.userId))
  const userName = user ? user.name : 'Engineer ini'

  const confirmed = await confirmDialog.value.open({
    title: 'Konfirmasi Assignment',
    message: `Apakah Anda yakin ingin menugaskan tiket ini kepada ${userName}? Timer akan otomatis dimulai.`,
    confirmLabel: 'Ya, Tugaskan',
    confirmColor: 'blue',
  })
  if (!confirmed) return

  loadingAssign.value = true
  try {
    await assignTicket(ticket.value.id, { supportUserIds: [Number(assignForm.userId)], notes: assignForm.notes })
    assignments.value = (await getTicketAssignments(ticket.value.id)).data
    
    await startWorklog(ticket.value.id, { 
      taskNotes: assignForm.notes || null,
      targetUserId: Number(assignForm.userId)
    })
    
    const wlRes = await getWorklogs(ticket.value.id)
    worklogs.value = wlRes.data
    initLiveTimers()
    assignForm.userId = ''
    assignForm.notes = ''
    toast.success('Assignment berhasil, timer dimulai')
  } catch (err) {
    const msg = err?.response?.data?.message || ''
    if (msg.includes('timer aktif')) {
      toast.warning('User ini masih memiliki timer aktif. Hentikan timer terlebih dahulu.')
      // Try worklog only
      try {
        await startWorklog(ticket.value.id, { 
          taskNotes: assignForm.notes || null,
          targetUserId: Number(assignForm.userId)
        })
        
        const wlRes = await getWorklogs(ticket.value.id)
        worklogs.value = wlRes.data
        initLiveTimers()
        assignForm.userId = ''
        assignForm.notes = ''
        toast.success('Timer baru dimulai')
      } catch (wlErr) {
        toast.error(wlErr?.response?.data?.message || 'Gagal memulai timer')
      }
    } else {
      toast.error(msg || 'Gagal melakukan assignment')
    }
  } finally {
    loadingAssign.value = false
  }
}

async function handlePriorityChange() {
  if (!newPriority.value || newPriority.value === ticket.value.priority) return

  const confirmed = await confirmDialog.value.open({
    title: 'Konfirmasi Ubah Level',
    message: `Apakah Anda yakin ingin mengubah level tiket menjadi ${newPriority.value}? Perubahan ini akan mempengaruhi perhitungan SLA.`,
    confirmLabel: 'Ya, Ubah Level',
    confirmColor: 'red',
  })

  if (!confirmed) {
    newPriority.value = ticket.value.priority
    return
  }

  try {
    // Panggil API Backend
    await updateTicketPriority(ticket.value.id, {
      priority: newPriority.value,
      changedBy: auth.user?.id,
      notes: 'Updated via frontend UI'
    })
    
    // Refresh data tiket agar mendapatkan progres log terbaru (jika ada)
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    
    toast.success('Level tiket berhasil diperbarui ke database')
    startSlaTimer()
  } catch (err) {
    newPriority.value = ticket.value.priority // revert on error
    toast.error(err?.response?.data?.message || 'Gagal mengubah level tiket')
  }
}

async function handleStopWorklog(wl) {
  const elapsed = liveTimers.value[wl.id] || 0
  const stoppedAt = new Date().toISOString().slice(0, 19)
  loadingStop.value = { ...loadingStop.value, [wl.id]: true }
  try {
    await stopWorklog(ticket.value.id, wl.id, {
      stoppedAt: stoppedAt,
      loggedDurationSeconds: elapsed,
      taskNotes: wl.taskNotes,
    })
    const wlRes = await getWorklogs(ticket.value.id)
    worklogs.value = wlRes.data
    initLiveTimers()
    toast.success(`Timer dihentikan. Durasi: ${formatDuration(elapsed)}`)
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghentikan timer')
  } finally {
    loadingStop.value = { ...loadingStop.value, [wl.id]: false }
  }
}

async function stopAllRunningTimers() {
  const runningLogs = worklogs.value.filter(wl => wl.isRunning || wl.running)
  if (runningLogs.length > 0) {
    const stoppedAt = new Date().toISOString().slice(0, 19)
    await Promise.allSettled(runningLogs.map(wl => {
      const elapsed = liveTimers.value[wl.id] || 0
      return stopWorklog(ticket.value.id, wl.id, {
        stoppedAt: stoppedAt,
        loggedDurationSeconds: elapsed,
        taskNotes: wl.taskNotes,
      })
    }))
    const wlRes = await getWorklogs(ticket.value.id)
    worklogs.value = wlRes.data
    initLiveTimers()
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && pendingFiles.value.length === 0) || !ticket.value || !chatConnected.value) return
  uploading.value = true
  let attachmentIds = []
  if (pendingFiles.value.length > 0) {
    try {
      for (const file of pendingFiles.value) {
        const res = await uploadChatFile(ticket.value.id, file)
        attachmentIds.push(res.data.id)
      }
    } catch { uploading.value = false; return }
  }
  stompClient.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({ ticketId: ticket.value.id, content: newMessage.value.trim() || null, attachmentIds: attachmentIds.length ? attachmentIds : null }),
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  newMessage.value = ''
  pendingFiles.value = []
  uploading.value = false
}

function handleFileAdd(e) { pendingFiles.value.push(...Array.from(e.target.files)); e.target.value = '' }
async function handleDownloadAttachment(id, name) { try { await downloadAttachment(id, name) } catch {} }
async function handleDownloadChatFile(id, name) { try { await downloadChatAttachment(id, name) } catch {} }

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
function formatTime(d) { return d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '' }

async function copyTicketNumber() {
  if (!ticket.value) return
  try {
    await navigator.clipboard.writeText(ticket.value.ticketNumber)
    toast.success('Ticket number disalin ke clipboard')
  } catch (err) {
    toast.error('Gagal menyalin ticket number')
  }
}
</script>
