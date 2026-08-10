'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Enhance Product table with new fields
    await queryInterface.addColumn('Products', 'unit', {
      type: Sequelize.STRING,
      defaultValue: 'ADET',
      comment: 'Unit of measurement (ADET, KG, LT, etc.)'
    });

    await queryInterface.addColumn('Products', 'imageUrl', {
      type: Sequelize.STRING,
      comment: 'Product image path'
    });

    await queryInterface.addColumn('Products', 'isFavorite', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Quick sale favorite flag'
    });

    await queryInterface.addColumn('Products', 'companyId', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // 2. Enhance ProductGroup table
    await queryInterface.addColumn('ProductGroups', 'companyId', {
      type: Sequelize.UUID,
      allowNull: true
    });

    await queryInterface.addColumn('ProductGroups', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    // 3. Create SalesTransactions table
    await queryInterface.createTable('SalesTransactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      transactionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'MEMBER, USER, or INSTRUCTOR'
      },
      entityId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      financialAccountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FinancialAccounts',
          key: 'id'
        }
      },
      isPaid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'True if fully paid, false if on credit'
      },
      paidAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'COMPLETED',
        comment: 'COMPLETED, CANCELLED, or REFUNDED'
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      companyId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'User who performed the sale'
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. Create SalesItems table
    await queryInterface.createTable('SalesItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      salesTransactionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SalesTransactions',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      lineTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'quantity * unitPrice'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. Create SalesPayments table
    await queryInterface.createTable('SalesPayments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      salesTransactionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SalesTransactions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'CASH, CREDIT_CARD, BANK_TRANSFER, COIN, or TICKET'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      financialTransactionId: {
        type: Sequelize.UUID,
        references: {
          model: 'FinancialTransactions',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 6. Add indexes for performance
    await queryInterface.addIndex('SalesTransactions', ['financialAccountId']);
    await queryInterface.addIndex('SalesTransactions', ['entityType', 'entityId']);
    await queryInterface.addIndex('SalesTransactions', ['transactionDate']);
    await queryInterface.addIndex('SalesTransactions', ['branchId']);
    await queryInterface.addIndex('SalesTransactions', ['status']);
    await queryInterface.addIndex('SalesTransactions', ['createdBy']);

    await queryInterface.addIndex('SalesItems', ['salesTransactionId']);
    await queryInterface.addIndex('SalesItems', ['productId']);

    await queryInterface.addIndex('SalesPayments', ['salesTransactionId']);
    await queryInterface.addIndex('SalesPayments', ['paymentMethod']);

    await queryInterface.addIndex('Products', ['groupId']);
    await queryInterface.addIndex('Products', ['isActive']);
    await queryInterface.addIndex('Products', ['isFavorite']);

    await queryInterface.addIndex('ProductGroups', ['branchId']);
    await queryInterface.addIndex('ProductGroups', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('SalesPayments');
    await queryInterface.dropTable('SalesItems');
    await queryInterface.dropTable('SalesTransactions');

    // Remove added columns from Product
    await queryInterface.removeColumn('Products', 'unit');
    await queryInterface.removeColumn('Products', 'imageUrl');
    await queryInterface.removeColumn('Products', 'isFavorite');
    await queryInterface.removeColumn('Products', 'companyId');

    // Remove added columns from ProductGroup
    await queryInterface.removeColumn('ProductGroups', 'companyId');
    await queryInterface.removeColumn('ProductGroups', 'isActive');
  }
};
