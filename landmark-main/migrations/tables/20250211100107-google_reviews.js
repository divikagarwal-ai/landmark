'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('google_reviews', {
      google_reviews_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary Key',
      },
      google_reviews_unique_id: {
        type: Sequelize.INTEGER,
      },
      google_reviews_uuid: {
        type: Sequelize.CHAR(36),
      },
      author_name: {
        type: Sequelize.CHAR(36),
      },
      rating: {
        type: Sequelize.INTEGER,
      },
      review_url: {
        type: Sequelize.STRING(255),
      },
      review_text: {
        type: Sequelize.STRING(1000),
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
