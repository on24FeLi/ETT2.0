const TimeStorage = {
  /**
   * Fügt einen Zeit-Eintrag für einen bestimmten Benutzer hinzu.
   */
  addTimeEntry(user, start, end) {
    const entries = TimeStorage.getUserTimes(user);
    entries.push({ start, end });
    localStorage.setItem(user, JSON.stringify(entries));
  },

  /**
   * Gibt alle Zeit-Einträge eines Benutzers zurück.
   */
  getUserTimes(user) {
    return JSON.parse(localStorage.getItem(user) || '[]');
  },

  /**
   * Setzt einen Benutzer komplett neu (z.B. für Überschreiben).
   */
  setUserTimes(user, entries) {
    localStorage.setItem(user, JSON.stringify(entries));
  },

  /**
   * Gibt alle Benutzernamen zurück, die im localStorage gespeichert sind.
   */
  getAllUsers() {
    return Object.keys(localStorage);
  },

  /**
   * Löscht alle Daten eines bestimmten Benutzers.
   */
  clearUser(user) {
    localStorage.removeItem(user);
  },

  /**
   * Löscht den gesamten localStorage.
   */
  clearAll() {
    localStorage.clear();
  },

  /**
   * Initialisiert Beispieldaten mit zwei Benutzern.
   */
  loadDemoData() {
    const demoData = {
      'Max Mustermann': [
        { start: '2025-04-22T08:00:00', end: '2025-04-22T12:00:00' },
        { start: '2025-04-22T13:00:00', end: '2025-04-22T17:00:00' }
      ],
      'Erika Beispiel': [
        { start: '2025-04-21T09:30:00', end: '2025-04-21T12:30:00' },
        { start: '2025-04-21T13:15:00', end: '2025-04-21T16:00:00' }
      ]
    };

    for (const [user, times] of Object.entries(demoData)) {
      TimeStorage.setUserTimes(user, times);
    }
  }
};

export default TimeStorage;
