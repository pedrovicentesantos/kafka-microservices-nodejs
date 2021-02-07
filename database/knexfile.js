// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: '../database/db.sqlite',
    },
    migrations: '../database/migrations',
  },
};
