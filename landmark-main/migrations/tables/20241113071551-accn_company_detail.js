'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accn_company_detail', {
      accn_company_detail_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accn_company_detail_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accn_company_detail_uuid: {
        type: Sequelize.CHAR(36),
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      company_name: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      marketcap: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      hq_location: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      continent: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      linkedin_page: {
        type: Sequelize.STRING(5000),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(5000),
        allowNull: true,
      },
      employees_count: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'ACTIVE',
        allowNull: false,
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
