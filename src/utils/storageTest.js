const users = [
  {
    id: 1,
    nachname: 'Müller',
    vorname: 'Anna',
    email: 'anna.mueller@example.com',
    passwort: 'Passwort123',
    isHR: false
  },
  {
    id: 2,
    nachname: 'Schmidt',
    vorname: 'Tom',
    email: 'tom.schmidt@example.com',
    passwort: 'Geheim456', 
    isHR: true
  }
]

let nextId = users.length + 1

function addUser(nachname, vorname, email, passwort, isHR  = false) {
  users.push({
    id: nextId++,
    nachname,
    vorname,
    email,
    passwort, 
    isHR
  })
  localStorage.setItem('users', JSON.stringify(users))
}

export { users, addUser }