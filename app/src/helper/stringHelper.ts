export function cleanString(text: string) {
  // no ' !!
  return text
    .replace(/\W/gi, '_')
    .replace(/_+/gi, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .substr(0, 100);
}

// todo code organisation / architecture / need helper
