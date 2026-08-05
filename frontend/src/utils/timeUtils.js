/**
 * Convierte un timestamp ISO UTC a la hora local del usuario y genera un texto relativo.
 * @param {string} isoString - Ejemplo: "2026-08-04T18:00:00Z"
 * @returns {object} { localTimeLabel: "Actualizado a las 14:00 hrs", relativeTimeLabel: "Hace 15 minutos" }
 */
export function formatLocalTime(isoString) {
  if (!isoString) {
    return { localTimeLabel: "Actualizado recientemente", relativeTimeLabel: "Hace un momento" };
  }

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return { localTimeLabel: "Actualizado recientemente", relativeTimeLabel: "Hace un momento" };
    }

    // Formateador para hora local "14:00"
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const timeString = formatter.format(date);
    const localTimeLabel = `Actualizado a las ${timeString} hrs`;

    // Tiempo relativo
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    let relativeTimeLabel = "Hace un momento";
    if (diffMinutes >= 1440) {
      const days = Math.floor(diffMinutes / 1440);
      relativeTimeLabel = `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      relativeTimeLabel = `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      relativeTimeLabel = `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    }

    return { localTimeLabel, relativeTimeLabel };
  } catch (error) {
    return { localTimeLabel: "Actualizado recientemente", relativeTimeLabel: "Hace un momento" };
  }
}
