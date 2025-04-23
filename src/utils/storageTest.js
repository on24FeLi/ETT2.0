const users = [
  {
    id: 1,
    nachname: 'Müller',
    vorname: 'Anna',
    email: 'anna.mueller@example.com',
    passwort: 'Passwort123',
    isAdmin: false
  },
  {
    id: 2,
    nachname: 'Schmidt',
    vorname: 'Tom',
    email: 'tom.schmidt@example.com',
    passwort: 'Geheim456', 
    isAdmin: true
  }
]

let nextId = users.length + 1

function addUser(nachname, vorname, email, passwort) {
  users.push({
    id: nextId++,
    nachname,
    vorname,
    email,
    passwort, 
    isAdmin
  })
  localStorage.setItem('users', JSON.stringify(users))
}

export { users, addUser }