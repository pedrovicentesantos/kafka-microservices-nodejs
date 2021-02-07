
exports.up = (knex) => (
  knex.schema.createTable('pedidos', (table) => {
    table.string('id').primary();
    table.string('description').notNullable();
    table.decimal('value').notNullable();
    table.integer('quantity').unsigned().notNullable();
    table.string('status').notNullable();
    table.string('payment_id');
    table.string('nfe');
  })
);

exports.down = (knex) => (knex.schema.dropTable('pedidos'));

