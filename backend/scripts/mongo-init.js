
db = db.getSiblingDB('codeshare');

db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [{ role: 'readWrite', db: 'codeshare' }],
});
