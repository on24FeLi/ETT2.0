const users = [
  {
    id: 1,
    nachname: 'Müller',
    vorname: 'Anna',
    email: 'anna.mueller@example.com',
    passwort: 'Passwort123',
    isHR: false,
    arbeitszeitTyp: 'Vollzeit'
  },
  {
    id: 2,
    nachname: 'Schmidt',
    vorname: 'Tom',
    email: 'tom.schmidt@example.com',
    passwort: 'Geheim456', 
    isHR: true,
    arbeitszeitTyp: 'Teilzeit'
  }
]
const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  users.length = 0;
  users.push(...JSON.parse(storedUsers));
}
let nextId = users.length + 1

function addUser(nachname, vorname, email, passwort, isHR  = false, arbeitszeitTyp = 'Vollzeit') {
  users.push({
    id: nextId++,
    nachname,
    vorname,
    email,
    passwort, 
    isHR,
    arbeitszeitTyp
  })
  localStorage.setItem('users', JSON.stringify(users))
}

function deleteUser(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
  }
}

function updateUser(id, updatedData) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData };
    localStorage.setItem('users', JSON.stringify(users));
  }
}

export { users, addUser, deleteUser,  updateUser }