/**
 * Password policy validation
 * Requirements:
 * - Minimal 8 karakter
 * - Minimal 1 huruf besar
 * - Minimal 1 angka
 * - Minimal 1 special character
 */

export function validatePassword(password) {
  const rules = [
    { test: password.length >= 8, label: 'Minimal 8 karakter' },
    { test: /[A-Z]/.test(password), label: 'Minimal 1 huruf besar' },
    { test: /[0-9]/.test(password), label: 'Minimal 1 angka' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: 'Minimal 1 special character' },
  ]

  return {
    valid: rules.every(r => r.test),
    rules,
  }
}
