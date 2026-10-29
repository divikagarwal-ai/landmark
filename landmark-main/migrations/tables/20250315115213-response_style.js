'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('response_style', {
      response_style_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      review_style_unique_id: {
        type: Sequelize.INTEGER,
      },
      review_style_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      review_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      stars: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      text: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      responseStyle: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      includeEmojis: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      responseLength: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      keywords: {
        type: Sequelize.STRING(255),
        allowNull: false,
      }, 
      avoidKeywords: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },  
      referToSelfAsIndividual: {
        type: Sequelize.STRING(255),
        allowNull: false,
      }, 
      mentionNames : {
        type: Sequelize.STRING(255),
        allowNull: false,
      }, 
       name: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
