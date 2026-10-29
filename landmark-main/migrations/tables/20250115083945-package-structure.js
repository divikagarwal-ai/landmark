'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('package_structure', {
      package_structure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      package_structure_unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      package_structure_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      batch: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      year: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      create_ts: {
        type: Sequelize.DATE,
      },
      insert_ts: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
