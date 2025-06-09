const db = require("../../../configs/database-simulator");
//sõnastik objekt
const idToUuidMap = {
  1: "UUID1",
  2: "UUID2",
  3: "UUID3",
}; //aitab tõlkida andmeid ID -> UUID kujul

class UsersService {
  getAll() { 
    return db.users;
  }//taagastab kõik kasutajad

  getById(id) {
    return db.users.find((u) => u.id === id);
  } //leiab ühe kasutaja ID järgi

  update(id, data) {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    return user; //uuendab kasutaja andmeid
  }

  setActive(id, active) {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    user.is_active = active;
    return user; //aktiveerib või deaktiveerib kasutaja
  }

  assignScopes(userId, scopeIds) {
    // Удаляем старые записи по userId
    db.user_scopes = db.user_scopes.filter((us) => us.userId !== userId);
    // Добавляем новые
    for (const sid of scopeIds) {
      db.user_scopes.push({ userId, scopeId: sid });
    }
    return db.user_scopes.filter((us) => us.userId === userId);
  } //Kustutab vanad õigused ja lisab uued

  getIdeasByUser(userId) {
    
    return db.suggestions.filter((s) => idToUuidMap[s.user_id] === userId);
  } //Tagastab kasutaja ideed (UUID de kaudu).
}

module.exports = UsersService;