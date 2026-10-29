'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approval', {
      approval_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      approval_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      approval_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      record_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      record_column_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      approved_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      approved_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      requested_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      requested_by_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      previous_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      current_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      next_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      remark: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      created_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      created_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      modified_by_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      modified_by_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      create_ts: {
        type: Sequelize.DATE,
        allowNull: true,
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
