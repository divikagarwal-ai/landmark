'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review', {
      review_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      review_unique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      review_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      user_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      user_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      leads_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      property_details_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      venue_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      venue_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      reviews: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ratings: {
        type: Sequelize.FLOAT(2, 1),
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'ACTIVE',
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
