export const mockUsers = [
  { id: 1, name: 'Ahmad Fauzi', email: 'ahmad@company.com', role: 'ADMIN', phone: '081234567890', clientId: null },
  { id: 2, name: 'Siti Nurhaliza', email: 'siti@telkom.com', role: 'USER', phone: '081234567891', clientId: 1 },
  { id: 3, name: 'Budi Santoso', email: 'budi@mandiri.com', role: 'USER', phone: '081234567892', clientId: 2 },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@company.com', role: 'ADMIN', phone: '081234567893', clientId: null },
  { id: 5, name: 'Rudi Hartono', email: 'rudi@pertamina.com', role: 'USER', phone: '081234567894', clientId: 3 },
]

export const mockClients = [
  { id: 1, companyName: 'PT Telkom Indonesia', contactPersonName: 'Siti Nurhaliza', contactPersonEmail: 'siti@telkom.com', contactPersonPhone: '021-1234567', isActive: true },
  { id: 2, companyName: 'PT Bank Mandiri', contactPersonName: 'Budi Santoso', contactPersonEmail: 'budi@mandiri.com', contactPersonPhone: '021-7654321', isActive: true },
  { id: 3, companyName: 'PT Pertamina', contactPersonName: 'Rudi Hartono', contactPersonEmail: 'rudi@pertamina.com', contactPersonPhone: '021-9876543', isActive: true },
  { id: 4, companyName: 'PT PLN', contactPersonName: 'Andi Wijaya', contactPersonEmail: 'andi@pln.com', contactPersonPhone: '021-1112233', isActive: false },
  { id: 5, companyName: 'PT Garuda Indonesia', contactPersonName: 'Maya Sari', contactPersonEmail: 'maya@garuda.com', contactPersonPhone: '021-4445566', isActive: true },
]

export const mockTickets = [
  { id: 1, ticketNumber: 'TKT-20260501-001', title: 'Server tidak bisa diakses', description: 'Server production down sejak pukul 08:00', status: 'OPEN', priority: 'L1', maintenanceType: 'CM', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', requesterId: 2, requesterName: 'Siti Nurhaliza', projectId: 1, projectName: 'ECM Implementation', createdAt: '2026-05-01T08:30:00' },
  { id: 2, ticketNumber: 'TKT-20260502-001', title: 'Update patch keamanan', description: 'Perlu update patch keamanan untuk semua server', status: 'IN_PROGRESS', priority: 'L2', maintenanceType: 'PM', clientId: 2, clientCompanyName: 'PT Bank Mandiri', requesterId: 3, requesterName: 'Budi Santoso', projectId: 3, projectName: 'Core Banking System', createdAt: '2026-05-02T10:15:00' },
  { id: 3, ticketNumber: 'TKT-20260505-001', title: 'Backup database gagal', description: 'Backup otomatis gagal 3 hari berturut-turut', status: 'RESOLVED', priority: 'L2', maintenanceType: 'CM', clientId: 3, clientCompanyName: 'PT Pertamina', requesterId: 5, requesterName: 'Rudi Hartono', projectId: 5, projectName: 'ERP Migration', createdAt: '2026-05-05T14:00:00' },
  { id: 4, ticketNumber: 'TKT-20260510-001', title: 'Maintenance jaringan rutin', description: 'Pengecekan rutin perangkat jaringan lantai 3', status: 'CLOSED', priority: 'L4', maintenanceType: 'PM', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', requesterId: 2, requesterName: 'Siti Nurhaliza', projectId: 2, projectName: 'Network Upgrade', createdAt: '2026-05-10T09:00:00' },
  { id: 5, ticketNumber: 'TKT-20260515-001', title: 'Email server lambat', description: 'Response time email server sangat lambat', status: 'OPEN', priority: 'L3', maintenanceType: 'CM', clientId: 5, clientCompanyName: 'PT Garuda Indonesia', requesterId: 2, requesterName: 'Siti Nurhaliza', projectId: null, projectName: null, createdAt: '2026-05-15T11:30:00' },
  { id: 6, ticketNumber: 'TKT-20260518-001', title: 'Instalasi firewall baru', description: 'Instalasi dan konfigurasi firewall baru di data center', status: 'IN_PROGRESS', priority: 'L2', maintenanceType: 'PM', clientId: 2, clientCompanyName: 'PT Bank Mandiri', requesterId: 3, requesterName: 'Budi Santoso', projectId: 4, projectName: 'Security Enhancement', createdAt: '2026-05-18T13:45:00' },
  { id: 7, ticketNumber: 'TKT-20260520-001', title: 'Printer tidak berfungsi', description: 'Printer lantai 2 error paper jam terus menerus', status: 'OPEN', priority: 'L4', maintenanceType: 'CM', clientId: 3, clientCompanyName: 'PT Pertamina', requesterId: 5, requesterName: 'Rudi Hartono', projectId: null, projectName: null, createdAt: '2026-05-20T16:00:00' },
]

export const mockQuotas = [
  { id: 1, clientId: 1, clientCompanyName: 'PT Telkom Indonesia', year: 2026, pmQuota: 12, cmQuota: 24, pmUsed: 5, cmUsed: 8 },
  { id: 2, clientId: 2, clientCompanyName: 'PT Bank Mandiri', year: 2026, pmQuota: 10, cmQuota: 20, pmUsed: 4, cmUsed: 12 },
  { id: 3, clientId: 3, clientCompanyName: 'PT Pertamina', year: 2026, pmQuota: 8, cmQuota: 16, pmUsed: 3, cmUsed: 7 },
  { id: 4, clientId: 5, clientCompanyName: 'PT Garuda Indonesia', year: 2026, pmQuota: 6, cmQuota: 12, pmUsed: 2, cmUsed: 5 },
]

export const mockProjects = [
  { id: 1, projectName: 'ECM Implementation', description: 'Enterprise Content Management', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', isActive: true, createdAt: '2026-01-15T00:00:00' },
  { id: 2, projectName: 'Network Upgrade', description: 'Upgrade jaringan kantor pusat', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', isActive: true, createdAt: '2026-02-01T00:00:00' },
  { id: 3, projectName: 'Core Banking System', description: 'Maintenance sistem core banking', clientId: 2, clientCompanyName: 'PT Bank Mandiri', isActive: true, createdAt: '2026-01-20T00:00:00' },
  { id: 4, projectName: 'Security Enhancement', description: 'Peningkatan keamanan infrastruktur', clientId: 2, clientCompanyName: 'PT Bank Mandiri', isActive: true, createdAt: '2026-03-10T00:00:00' },
  { id: 5, projectName: 'ERP Migration', description: 'Migrasi sistem ERP ke cloud', clientId: 3, clientCompanyName: 'PT Pertamina', isActive: true, createdAt: '2026-02-15T00:00:00' },
]
