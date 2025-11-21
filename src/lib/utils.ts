export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string | { seconds: number; nanoseconds: number } | { toDate: () => Date }): string {
  let d: Date;
  
  // Handle Firestore Timestamp objects
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (date && typeof date === 'object' && 'seconds' in date) {
    // Handle serialized Timestamp { seconds, nanoseconds }
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date as Date | string);
  }
  
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
