export const occasionThemes = [
  { value: 'default', label: 'Default (current look)' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'new-year', label: 'New Year' },
  { value: 'holi', label: 'Holi' },
  { value: 'diwali', label: 'Diwali' },
]

export function occasionThemeClass(theme) {
  const supportedTheme = occasionThemes.some((item) => item.value === theme) ? theme : 'default'
  return supportedTheme === 'default' ? '' : `occasion-theme--${supportedTheme}`
}

export function siteOccasionClass(theme) {
  const supportedTheme = occasionThemes.some((item) => item.value === theme) ? theme : 'default'
  return supportedTheme === 'default' ? '' : `site-occasion--${supportedTheme}`
}
