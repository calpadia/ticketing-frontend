<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <router-link to="/client-management" class="hover:text-blue-600 transition-colors">Client Management</router-link>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-800">Client Onboarding</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Client Onboarding</h2>
      <p class="text-gray-500 text-sm mt-1">Daftarkan client baru dalam {{ steps.length }} langkah</p>
    </div>

    <!-- Stepper -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex items-center justify-between">
        <div v-for="(s, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
              currentStep > i ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' :
              currentStep === i ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
              'bg-gray-100 text-gray-400'
            ]">
              <Check v-if="currentStep > i" class="w-5 h-5" />
              <component v-else :is="s.icon" class="w-5 h-5" />
            </div>
            <div class="hidden lg:block">
              <p :class="['text-sm font-semibold transition-colors duration-300', currentStep >= i ? 'text-gray-900' : 'text-gray-400']">{{ s.title }}</p>
            </div>
          </div>
          <div v-if="i < steps.length - 1" :class="['flex-1 h-1 mx-4 rounded-full transition-colors duration-500', currentStep > i ? 'bg-blue-600' : 'bg-gray-100']"></div>
        </div>
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <!-- Step 1: Data Perusahaan -->
      <div v-if="currentStep === 0" key="step1" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 1: Data Perusahaan</h3>
        <p class="text-sm text-gray-500 mb-6">Masukkan informasi perusahaan client</p>
        <form @submit.prevent="handleCreateClient" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Perusahaan *</label><input v-model="clientForm.companyName" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="PT Example Indonesia" required /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Kontak *</label><input v-model="clientForm.contactPersonName" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="John Doe" required /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Email Kontak *</label><input v-model="clientForm.contactPersonEmail" type="email" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="contact@company.com" required /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Telepon Kontak *</label><input v-model="clientForm.contactPersonPhone" type="tel" inputmode="numeric" pattern="[0-9]*" @input="clientForm.contactPersonPhone = clientForm.contactPersonPhone.replace(/\D/g, '')" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="08123456789" required /></div>
          </div>
          <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mt-4">{{ error }}</div>
          <div class="flex justify-end pt-6">
            <button type="submit" :disabled="submitting" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium disabled:opacity-50 transition-all text-sm">
              <span>{{ submitting ? 'Menyimpan...' : 'Simpan & Lanjut' }}</span>
              <ArrowRight v-if="!submitting" class="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Buat User -->
      <div v-else-if="currentStep === 1" key="step2" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 2: Buat Akun User</h3>
        <p class="text-sm text-gray-500 mb-6">Buat akun login untuk client <strong>{{ createdClient?.companyName }}</strong></p>
        <div v-if="createdUsers.length > 0" class="mb-6 space-y-2">
          <p class="text-sm font-medium text-gray-700">User yang akan dibuat:</p>
          <div v-for="(u, i) in createdUsers" :key="i" class="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">{{ u.name.charAt(0) }}</div>
            <div class="flex-1"><p class="text-sm font-medium text-gray-900">{{ u.name }}</p><p class="text-xs text-gray-500">{{ u.email }}</p></div>
            <button type="button" @click="removeUser(i)" class="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Hapus</button>
          </div>
        </div>
        <form @submit.prevent="handleAddUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Nama *</label><input v-model="userForm.name" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Email *</label><input v-model="userForm.email" type="email" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
            <div class="md:col-span-2"><PasswordInput v-model="userForm.password" label="Password" :required="true" placeholder="Min 8 karakter, huruf besar, angka, special char" /></div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password *</label>
              <input v-model="userForm.confirmPassword" type="password" class="w-full bg-gray-50/50 border rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" :class="userForm.confirmPassword && userForm.confirmPassword !== userForm.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500'" placeholder="Ulangi password" required />
              <p v-if="userForm.confirmPassword && userForm.confirmPassword !== userForm.password" class="text-xs text-red-600 mt-1.5">Password tidak cocok</p>
            </div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Telepon *</label><input v-model="userForm.phone" type="tel" inputmode="numeric" pattern="[0-9]*" @input="userForm.phone = userForm.phone.replace(/\D/g, '')" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          </div>
          <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mt-4">{{ error }}</div>
          <div class="flex justify-between pt-6">
            <button type="button" @click="currentStep = 0" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
              <ArrowLeft class="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <div class="flex gap-3">
              <button type="submit" :disabled="submitting" class="flex items-center justify-center gap-2 border border-blue-200 bg-blue-50/50 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-100 hover:border-blue-300 font-medium disabled:opacity-50 transition-all text-sm">
                <UserPlus class="w-4 h-4" />
                <span>Tambah User</span>
              </button>
              <button type="button" @click="currentStep = 2" :disabled="createdUsers.length === 0" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium disabled:opacity-50 transition-all text-sm">
                <span>Lanjut</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Step 3: Service & Kuota -->
      <div v-else-if="currentStep === 2" key="step3" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 3: Service & Kuota</h3>
        <p class="text-sm text-gray-500 mb-6">Tentukan layanan dan kuota maintenance untuk <strong>{{ createdClient?.companyName }}</strong></p>
        <form @submit.prevent="currentStep = 3" class="space-y-6">
          <!-- Service selection -->
          <div class="bg-gray-50/50 border border-gray-100 rounded-xl p-5">
            <label class="block text-sm font-medium text-gray-700 mb-3">Jenis Layanan yang Dibeli *</label>
            <div class="flex flex-col sm:flex-row gap-6">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="clientForm.hasPM" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                <span class="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Preventive Maintenance (PM)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="clientForm.hasCM" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                <span class="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Corrective Maintenance (CM)</span>
              </label>
            </div>
          </div>
          <!-- Quota -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Tahun *</label><input v-model.number="quotaForm.year" type="number" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
            <div v-if="clientForm.hasPM"><label class="block text-sm font-medium text-gray-700 mb-1.5">Kuota PM *</label><input v-model.number="quotaForm.pmQuota" type="number" min="0" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
            <div v-if="clientForm.hasCM"><label class="block text-sm font-medium text-gray-700 mb-1.5">Kuota CM *</label><input v-model.number="quotaForm.cmQuota" type="number" min="0" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          </div>
          <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mt-4">{{ error }}</div>
          <div class="flex justify-between pt-6">
            <button type="button" @click="currentStep = 1" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
              <ArrowLeft class="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button type="submit" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
              <span>Lanjut</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <!-- Step 4: Buat Project -->
      <div v-else-if="currentStep === 3" key="step4" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 4: Buat Project</h3>
        <p class="text-sm text-gray-500 mb-6">Tambahkan project untuk <strong>{{ createdClient?.companyName }}</strong> (opsional)</p>
        <div v-if="createdProjects.length > 0" class="mb-6 space-y-2">
          <div v-for="(p, i) in createdProjects" :key="i" class="flex items-center gap-3 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
            <FolderOpen class="w-5 h-5 text-indigo-500" />
            <span class="text-sm font-medium text-gray-900">{{ p.projectName }}</span>
            <span class="text-xs text-gray-500 ml-auto hidden sm:block">{{ p.description || '' }}</span>
            <button type="button" @click="removeProject(i)" class="text-red-400 hover:text-red-600 text-xs font-medium ml-2 sm:ml-4 transition-colors">Hapus</button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Project</label><input v-model="projectForm.projectName" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. ECM Implementation" /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label><input v-model="projectForm.description" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Opsional" /></div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mb-4">{{ error }}</div>
        <div class="flex justify-between pt-6">
          <button type="button" @click="currentStep = 2" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div class="flex gap-3">
            <button type="button" @click="handleAddProject" :disabled="!projectForm.projectName" class="flex items-center justify-center gap-2 border border-blue-200 bg-blue-50/50 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-100 hover:border-blue-300 font-medium disabled:opacity-50 transition-all text-sm">
              <FolderOpen class="w-4 h-4" />
              <span>Tambah Project</span>
            </button>
            <button type="button" @click="currentStep = 4" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
              <span>Lanjut</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Step 5: Assign Support -->
      <div v-else-if="currentStep === 4" key="step5" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 5: Assign Support Engineer</h3>
        <p class="text-sm text-gray-500 mb-6">Pilih support engineer untuk <strong>{{ createdClient?.companyName }}</strong> (opsional)</p>
        <div class="border border-gray-200 rounded-xl max-h-64 overflow-y-auto mb-4 bg-gray-50/30">
          <label v-for="u in supportUsers" :key="u.id" class="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
            <input type="checkbox" :value="u.id" v-model="selectedSupportIds" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
            <div class="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shadow-sm">{{ u.name.charAt(0) }}</div>
            <div><p class="text-sm font-semibold text-gray-900">{{ u.name }}</p><p class="text-xs text-gray-500">{{ u.email }}</p></div>
          </label>
          <div v-if="supportUsers.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-500">
            <HeadphonesIcon class="w-10 h-10 mb-2 text-gray-300" />
            <p class="text-sm">Belum ada user dengan role SUPPORT.</p>
          </div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mb-4">{{ error }}</div>
        <div class="flex justify-between pt-6">
          <button type="button" @click="currentStep = 3" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <button type="button" @click="currentStep = 5" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
            <span>Review & Selesai</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 6: Review & Submit -->
      <div v-else-if="currentStep === 5" key="step6" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Review & Konfirmasi</h3>
        <p class="text-sm text-gray-500 mb-6">Periksa semua data sebelum menyimpan secara permanen.</p>
        <div class="space-y-4">
          <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <Building2 class="w-4 h-4 text-gray-500" />
              <h4 class="text-sm font-bold text-gray-800">Perusahaan</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div><span class="text-gray-500 block text-xs">Nama</span> <span class="font-semibold text-gray-900">{{ clientForm.companyName }}</span></div>
              <div><span class="text-gray-500 block text-xs">Kontak</span> <span class="font-semibold text-gray-900">{{ clientForm.contactPersonName }}</span></div>
              <div><span class="text-gray-500 block text-xs">Email</span> <span class="font-semibold text-gray-900">{{ clientForm.contactPersonEmail }}</span></div>
              <div><span class="text-gray-500 block text-xs">Telepon</span> <span class="font-semibold text-gray-900">{{ clientForm.contactPersonPhone }}</span></div>
              <div class="sm:col-span-2"><span class="text-gray-500 block text-xs">Layanan</span> <span class="font-semibold text-gray-900">{{ [clientForm.hasPM ? 'PM' : '', clientForm.hasCM ? 'CM' : ''].filter(Boolean).join(', ') || '-' }}</span></div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <UserPlus class="w-4 h-4 text-gray-500" />
                <h4 class="text-sm font-bold text-gray-800">Users ({{ createdUsers.length }})</h4>
              </div>
              <div v-if="createdUsers.length === 0" class="text-xs text-gray-400">Tidak ada user</div>
              <div v-for="u in createdUsers" :key="u.email" class="text-sm mb-1 last:mb-0"><span class="font-medium text-gray-800">{{ u.name }}</span> <span class="text-gray-500 ml-1">({{ u.email }})</span></div>
            </div>
            <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <Settings class="w-4 h-4 text-gray-500" />
                <h4 class="text-sm font-bold text-gray-800">Kuota ({{ quotaForm.year }})</h4>
              </div>
              <div class="text-sm font-medium text-gray-800">PM: {{ quotaForm.pmQuota || 0 }} <span class="text-gray-300 mx-2">|</span> CM: {{ quotaForm.cmQuota || 0 }}</div>
            </div>
            <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <FolderOpen class="w-4 h-4 text-gray-500" />
                <h4 class="text-sm font-bold text-gray-800">Projects ({{ createdProjects.length }})</h4>
              </div>
              <div v-if="createdProjects.length === 0" class="text-xs text-gray-400">Tidak ada project</div>
              <div v-for="(p, i) in createdProjects" :key="i" class="text-sm font-medium text-gray-800 mb-1 last:mb-0">{{ p.projectName }}</div>
            </div>
            <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <HeadphonesIcon class="w-4 h-4 text-gray-500" />
                <h4 class="text-sm font-bold text-gray-800">Support Engineers ({{ selectedSupportIds.length }})</h4>
              </div>
              <div v-if="selectedSupportIds.length === 0" class="text-xs text-gray-400">Tidak ada support terpilih</div>
              <div v-for="id in selectedSupportIds" :key="id" class="text-sm font-medium text-gray-800 mb-1 last:mb-0">{{ supportUsers.find(u => u.id === id)?.name }}</div>
            </div>
          </div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50/50 border border-red-100 p-3 rounded-xl mt-4">{{ error }}</div>
        <div class="flex justify-between pt-8">
          <button type="button" @click="currentStep = 4" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <button type="button" @click="confirmAndSubmit" :disabled="submitting" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium disabled:opacity-50 transition-all text-sm">
            <FileCheck class="w-4 h-4" />
            <span>{{ submitting ? 'Menyimpan...' : 'Simpan Semua' }}</span>
          </button>
        </div>
      </div>

      <!-- Step 7: Done -->
      <div v-else-if="currentStep === 6" key="step7" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Check class="w-10 h-10 text-green-600" /></div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Client Berhasil Didaftarkan!</h3>
        <p class="text-gray-500 mb-8 max-w-md mx-auto">Semua data perusahaan, user, kuota, project, dan support engineer telah tersimpan di sistem.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="resetAll" class="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm">
            Daftarkan Client Lain
          </button>
          <router-link to="/clients" class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
            Lihat Daftar Client
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { createClient, getClients, deleteClient } from '../api/clients'
import { createUser, getUsers } from '../api/users'
import { createClientQuota } from '../api/quotas'
import { createProject } from '../api/projects'
import { addClientSupports } from '../api/clientSupports'
import { createServiceCatalog } from '../api/serviceCatalog'
import { validatePassword } from '../utils/passwordPolicy'
import { Check, Building2, UserPlus, Settings, FolderOpen, HeadphonesIcon, FileCheck, ArrowRight, ArrowLeft } from 'lucide-vue-next'
import PasswordInput from '../components/PasswordInput.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const steps = [
  { title: 'Data Perusahaan', icon: Building2 },
  { title: 'Buat User', icon: UserPlus },
  { title: 'Service & Kuota', icon: Settings },
  { title: 'Project', icon: FolderOpen },
  { title: 'Support', icon: HeadphonesIcon },
  { title: 'Review', icon: FileCheck },
]

const currentStep = ref(0)
const error = ref('')
const submitting = ref(false)
const createdClient = ref(null)
const createdUsers = ref([])
const createdProjects = ref([])
const supportUsers = ref([])
const selectedSupportIds = ref([])
const confirmDialog = ref(null)

const clientForm = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', hasPM: true, hasCM: true })
const userForm = reactive({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
const quotaForm = reactive({ year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
const projectForm = reactive({ projectName: '', description: '' })

onMounted(async () => {
  try { const res = await getUsers(); supportUsers.value = res.data.filter(u => u.role === 'SUPPORT') } catch {}
})

async function handleCreateClient() {
  error.value = ''
  submitting.value = true
  try {
    const res = await createClient({ companyName: clientForm.companyName, contactPersonName: clientForm.contactPersonName, contactPersonEmail: clientForm.contactPersonEmail, contactPersonPhone: clientForm.contactPersonPhone })
    createdClient.value = res.data
    currentStep.value = 1
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal membuat client. Pastikan nama perusahaan belum terdaftar.'
  } finally { submitting.value = false }
}

function handleAddUser() {
  error.value = ''
  if (!userForm.name || !userForm.email || !userForm.password || !userForm.phone) { error.value = 'Semua field harus diisi'; return }
  if (!validatePassword(userForm.password).valid) { error.value = 'Password belum memenuhi ketentuan'; return }
  if (userForm.password !== userForm.confirmPassword) { error.value = 'Password dan konfirmasi tidak cocok'; return }
  // Save to memory only
  createdUsers.value.push({ name: userForm.name, email: userForm.email, password: userForm.password, phone: userForm.phone })
  Object.assign(userForm, { name: '', email: '', password: '', confirmPassword: '', phone: '' })
}

function handleAddProject() {
  error.value = ''
  if (!projectForm.projectName) return
  // Save to memory only
  createdProjects.value.push({ projectName: projectForm.projectName, description: projectForm.description })
  Object.assign(projectForm, { projectName: '', description: '' })
}

function removeUser(index) { createdUsers.value.splice(index, 1) }
function removeProject(index) { createdProjects.value.splice(index, 1) }

async function confirmAndSubmit() {
  const confirmed = await confirmDialog.value.open({
    title: 'Konfirmasi Simpan',
    message: 'Apakah kamu yakin ingin menyimpan semua data client ini? Data yang sudah disimpan tidak bisa dibatalkan.',
    confirmLabel: 'Ya, Simpan',
    confirmColor: 'blue'
  })
  if (!confirmed) return
  handleFinalSubmit()
}

async function handleFinalSubmit() {
  error.value = ''
  submitting.value = true
  try {
    // 1. Create users
    for (const u of createdUsers.value) {
      await createUser({ name: u.name, email: u.email, password: u.password, phone: u.phone, role: 'USER', clientId: createdClient.value.id })
    }
    // 2. Create quota
    await createClientQuota({ clientId: createdClient.value.id, year: quotaForm.year, pmQuota: quotaForm.pmQuota || 0, cmQuota: quotaForm.cmQuota || 0 })
    // 3. Create projects
    for (const p of createdProjects.value) {
      await createProject({ projectName: p.projectName, description: p.description, clientId: createdClient.value.id })
    }
    // 4. Assign supports
    if (selectedSupportIds.value.length > 0) {
      await addClientSupports(createdClient.value.id, selectedSupportIds.value)
    }
    // 5. Create service catalog
    const services = []
    if (clientForm.hasPM) services.push('PM')
    if (clientForm.hasCM) services.push('CM')
    if (services.length > 0) {
      await createServiceCatalog({ clientId: createdClient.value.id, services, notes: '' })
    }
    currentStep.value = 6
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal menyimpan data. Periksa kembali input Anda.'
  } finally { submitting.value = false }
}

function resetAll() {
  currentStep.value = 0
  createdClient.value = null
  createdUsers.value = []
  createdProjects.value = []
  selectedSupportIds.value = []
  Object.assign(clientForm, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', hasPM: true, hasCM: true })
  Object.assign(userForm, { name: '', email: '', password: '', confirmPassword: '', phone: '' })
  Object.assign(quotaForm, { year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
  Object.assign(projectForm, { projectName: '', description: '' })
  error.value = ''
}

onBeforeRouteLeave(async (to, from, next) => {
  if (currentStep.value > 0 && currentStep.value < 6 && createdClient.value) {
    const confirmed = await confirmDialog.value.open({
      title: 'Batalkan Onboarding?',
      message: 'Anda belum menyelesaikan proses onboarding. Jika Anda keluar halaman, data klien yang baru saja dibuat akan dihapus secara otomatis. Yakin ingin keluar?',
      confirmLabel: 'Ya, Keluar & Hapus',
      confirmColor: 'red'
    })
    
    if (confirmed) {
      try {
        await deleteClient(createdClient.value.id)
      } catch (err) {
        console.error('Gagal menghapus data klien:', err)
      }
      next()
    } else {
      next(false) // Batalkan navigasi
    }
  } else {
    next()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>


