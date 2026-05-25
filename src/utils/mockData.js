export const mockUsers = [
  { id: 1, name: 'Ahmad Fauzi', email: 'ahmad@company.com', role: 'ADMIN' },
  { id: 2, name: 'Siti Nurhaliza', email: 'siti@company.com', role: 'USER' },
  { id: 3, name: 'Budi Santoso', email: 'budi@company.com', role: 'USER' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@company.com', role: 'ADMIN' },
  { id: 5, name: 'Rudi Hartono', email: 'rudi@company.com', role: 'USER' },
]

export const mockClients = [
  { id: 1, companyName: 'PT Telkom Indonesia', isActive: true },
  { id: 2, companyName: 'PT Bank Mandiri', isActive: true },
  { id: 3, companyName: 'PT Pertamina', isActive: true },
  { id: 4, companyName: 'PT PLN', isActive: false },
  { id: 5, companyName: 'PT Garuda Indonesia', isActive: true },
]

export const mockTickets = [
  { id: 1, ticketNumber: 'TKT-20260501-001', title: 'Server tidak bisa diakses', description: 'Server production down sejak pukul 08:00', status: 'OPEN', priority: 'L1', maintenanceType: 'CM', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', requesterId: 2, requesterName: 'Siti Nurhaliza', createdAt: '2026-05-01T08:30:00' },
  { id: 2, ticketNumber: 'TKT-20260502-001', title: 'Update patch keamanan', description: 'Perlu update patch keamanan untuk semua server', status: 'IN_PROGRESS', priority: 'L2', maintenanceType: 'PM', clientId: 2, clientCompanyName: 'PT Bank Mandiri', requesterId: 3, requesterName: 'Budi Santoso', createdAt: '2026-05-02T10:15:00' },
  { id: 3, ticketNumber: 'TKT-20260505-001', title: 'Backup database gagal', description: 'Backup otomatis gagal 3 hari berturut-turut', status: 'RESOLVED', priority: 'L2', maintenanceType: 'CM', clientId: 3, clientCompanyName: 'PT Pertamina', requesterId: 5, requesterName: 'Rudi Hartono', createdAt: '2026-05-05T14:00:00' },
  { id: 4, ticketNumber: 'TKT-20260510-001', title: 'Maintenance jaringan rutin', description: 'Pengecekan rutin perangkat jaringan lantai 3', status: 'CLOSED', priority: 'L4', maintenanceType: 'PM', clientId: 1, clientCompanyName: 'PT Telkom Indonesia', requesterId: 2, requesterName: 'Siti Nurhaliza', createdAt: '2026-05-10T09:00:00' },
  { id: 5, ticketNumber: 'TKT-20260515-001', title: 'Email server lambat', description: 'Response time email server sangat lambat', status: 'OPEN', priority: 'L3', maintenanceType: 'CM', clientId: 5, clientCompanyName: 'PT Garuda Indonesia', requesterId: 3, requesterName: 'Budi Santoso', createdAt: '2026-05-15T11:30:00' },
  { id: 6, ticketNumber: 'TKT-20260518-001', title: 'Instalasi firewall baru', description: 'Instalasi dan konfigurasi firewall baru di data center', status: 'IN_PROGRESS', priority: 'L2', maintenanceType: 'PM', clientId: 2, clientCompanyName: 'PT Bank Mandiri', requesterId: 5, requesterName: 'Rudi Hartono', createdAt: '2026-05-18T13:45:00' },
  { id: 7, ticketNumber: 'TKT-20260520-001', title: 'Printer tidak berfungsi', description: 'Printer lantai 2 error paper jam terus menerus', status: 'OPEN', priority: 'L4', maintenanceType: 'CM', clientId: 3, clientCompanyName: 'PT Pertamina', requesterId: 2, requesterName: 'Siti Nurhaliza', createdAt: '2026-05-20T16:00:00' },
]

export const mockQuotas = [
  { id: 1, clientId: 1, clientCompanyName: 'PT Telkom Indonesia', year: 2026, pmQuota: 12, cmQuota: 24, pmUsed: 5, cmUsed: 8 },
  { id: 2, clientId: 2, clientCompanyName: 'PT Bank Mandiri', year: 2026, pmQuota: 10, cmQuota: 20, pmUsed: 4, cmUsed: 12 },
  { id: 3, clientId: 3, clientCompanyName: 'PT Pertamina', year: 2026, pmQuota: 8, cmQuota: 16, pmUsed: 3, cmUsed: 7 },
  { id: 4, clientId: 5, clientCompanyName: 'PT Garuda Indonesia', year: 2026, pmQuota: 6, cmQuota: 12, pmUsed: 2, cmUsed: 5 },
]

export const mockSLAReport = [
  { clientId: 1, clientCompanyName: 'PT Telkom Indonesia', totalTickets: 12, resolvedOnTime: 10, resolvedLate: 1, pending: 1, slaPercentage: 90.9, avgResolutionHours: 4.2 },
  { clientId: 2, clientCompanyName: 'PT Bank Mandiri', totalTickets: 8, resolvedOnTime: 7, resolvedLate: 0, pending: 1, slaPercentage: 100, avgResolutionHours: 3.1 },
  { clientId: 3, clientCompanyName: 'PT Pertamina', totalTickets: 10, resolvedOnTime: 8, resolvedLate: 1, pending: 1, slaPercentage: 88.9, avgResolutionHours: 5.8 },
  { clientId: 5, clientCompanyName: 'PT Garuda Indonesia', totalTickets: 5, resolvedOnTime: 3, resolvedLate: 1, pending: 1, slaPercentage: 75.0, avgResolutionHours: 7.5 },
]

export const slaTargets = {
  L1: { responseHours: 1, resolutionHours: 4 },
  L2: { responseHours: 2, resolutionHours: 8 },
  L3: { responseHours: 4, resolutionHours: 24 },
  L4: { responseHours: 8, resolutionHours: 48 },
}
