'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review_analysis', {
      review_analysis_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary Key',
      },
      review_analysis_unique_id: {
        type: Sequelize.INTEGER,
      },
      review_analysis_uuid: {
        type: Sequelize.CHAR(36),
      },
      review_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'ID of the review being analyzed',
      },
      sentiment: {
        type: Sequelize.STRING(50),
        comment: 'Sentiment of the review',
      },
      confidence_score: {
        type: Sequelize.FLOAT,
        comment: 'Confidence score of the sentiment analysis',
      },
      suggested_action: {
        type: Sequelize.TEXT,
        comment: 'Suggested action based on the review',
      },
      keywords: {
        type: Sequelize.TEXT,
        comment: 'Keywords extracted from the review',
      },
      summary: {
        type: Sequelize.TEXT,
        comment: 'Summary of the review',
      },
      response: {
        type: Sequelize.TEXT,
        comment: 'Response to be sent to the user',
      },
      additional_insights: {
        type: Sequelize.TEXT,
        comment: 'Additional insights from the review',
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
    await queryInterface.dropTable('review_analysis');
  },
};
