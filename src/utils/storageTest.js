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
const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  users.length = 0;
  users.push(...JSON.parse(storedUsers));
}
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