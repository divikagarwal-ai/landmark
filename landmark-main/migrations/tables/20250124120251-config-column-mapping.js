'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('config_column_mapping', {
      config_column_mapping_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary Key',
      },
      column_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reference_view: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reference_common_column: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reference_column: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      insert_ts: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('config_column_mapping');
  },
};
