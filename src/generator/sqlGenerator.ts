/**
 * Dialect-aware SQL DDL schema generator for PostgreSQL, MySQL, and H2.
 * Supports typed columns, decimal precision/scale, primary keys, foreign keys,
 * unique constraints on 1:1 relationships, and Many-to-Many join tables.
 */

import { ProjectConfig, FieldConfig, DatabaseType, EntityConfig, IdType, RelationshipConfig } from './types';
import { toSnakeCase, toPluralSnakeCase } from './entityGenerator';

function mapFieldToSqlType(field: FieldConfig, db: DatabaseType): string {
  switch (field.type) {
    case 'String':
      return `VARCHAR(${field.length || 255})`;
    case 'Integer':
      return 'INTEGER';
    case 'Long':
      return 'BIGINT';
    case 'Double':
      return db === 'mysql' ? 'DOUBLE' : 'DOUBLE PRECISION';
    case 'BigDecimal': {
      const precision = field.precision || 19;
      const scale = field.scale !== undefined ? field.scale : 4;
      return `DECIMAL(${precision}, ${scale})`;
    }
    case 'Boolean':
      return 'BOOLEAN';
    case 'LocalDate':
      return 'DATE';
    case 'LocalDateTime':
      return db === 'mysql' ? 'DATETIME(6)' : 'TIMESTAMP';
    default:
      return 'VARCHAR(255)';
  }
}

function getForeignKeySqlType(idType: IdType, db: DatabaseType): string {
  switch (idType) {
    case 'Long':
      return 'BIGINT';
    case 'Integer':
      return db === 'mysql' ? 'INT' : 'INTEGER';
    case 'UUID':
      return db === 'mysql' ? 'VARCHAR(36)' : 'UUID';
    case 'String':
      return 'VARCHAR(64)';
    default:
      return 'BIGINT';
  }
}

export function generateSqlSchema(config: ProjectConfig): string {
  const { database, entities, projectName } = config;

  const entityMap = new Map<string, EntityConfig>();
  entities.forEach(e => entityMap.set(e.name, e));

  // Determine table ordering (dependency sort: referenced tables before referencing tables)
  const orderedEntities: EntityConfig[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const cyclicFks: { sourceTable: string; constraintName: string; colName: string; targetTable: string; targetCol: string }[] = [];

  function visit(entity: EntityConfig) {
    if (visited.has(entity.name)) return;
    if (visiting.has(entity.name)) {
      // Cycle detected: will be resolved via ALTER TABLE
      return;
    }

    visiting.add(entity.name);

    const rels = entity.relationships || [];
    for (const rel of rels) {
      if ((rel.type === 'MANY_TO_ONE' || (rel.type === 'ONE_TO_ONE' && rel.isOwningSide !== false && !rel.mappedBy))) {
        const target = entityMap.get(rel.targetEntity);
        if (target && target.name !== entity.name) {
          if (visiting.has(target.name)) {
            // Cycle: mark for ALTER TABLE
            const sourceTable = entity.tableName || toPluralSnakeCase(entity.name);
            const targetTable = target.tableName || toPluralSnakeCase(target.name);
            const targetIdCol = toSnakeCase(target.idFieldName || 'id');
            const joinCol = rel.joinColumnName || `${toSnakeCase(rel.name)}_${targetIdCol}`;
            const constraintName = `fk_${sourceTable}_${toSnakeCase(rel.name)}`;
            cyclicFks.push({ sourceTable, constraintName, colName: joinCol, targetTable, targetCol: targetIdCol });
          } else {
            visit(target);
          }
        }
      }
    }

    visiting.delete(entity.name);
    visited.add(entity.name);
    orderedEntities.push(entity);
  }

  entities.forEach(e => visit(e));

  // Generate table DDLs
  const tableStatements: string[] = [];
  const joinTableStatements: string[] = [];
  const processedJoinTables = new Set<string>();

  orderedEntities.forEach(entity => {
    const tableName = entity.tableName || toPluralSnakeCase(entity.name);
    const idFieldName = toSnakeCase(entity.idFieldName || 'id');
    const idType = entity.idType || 'Long';

    const columns: string[] = [];
    const tableConstraints: string[] = [];

    // Primary key column
    if (database === 'postgresql') {
      if (idType === 'Long') {
        columns.push(`    ${idFieldName} BIGSERIAL PRIMARY KEY`);
      } else if (idType === 'Integer') {
        columns.push(`    ${idFieldName} SERIAL PRIMARY KEY`);
      } else if (idType === 'UUID') {
        columns.push(`    ${idFieldName} UUID PRIMARY KEY`);
      } else {
        columns.push(`    ${idFieldName} VARCHAR(64) PRIMARY KEY`);
      }
    } else if (database === 'mysql') {
      if (idType === 'Long') {
        columns.push(`    ${idFieldName} BIGINT AUTO_INCREMENT PRIMARY KEY`);
      } else if (idType === 'Integer') {
        columns.push(`    ${idFieldName} INT AUTO_INCREMENT PRIMARY KEY`);
      } else if (idType === 'UUID') {
        columns.push(`    ${idFieldName} VARCHAR(36) PRIMARY KEY`);
      } else {
        columns.push(`    ${idFieldName} VARCHAR(64) PRIMARY KEY`);
      }
    } else {
      // H2
      if (idType === 'Long' || idType === 'Integer') {
        columns.push(`    ${idFieldName} ${idType === 'Long' ? 'BIGINT' : 'INT'} GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`);
      } else if (idType === 'UUID') {
        columns.push(`    ${idFieldName} UUID PRIMARY KEY`);
      } else {
        columns.push(`    ${idFieldName} VARCHAR(64) PRIMARY KEY`);
      }
    }

    // Regular fields
    entity.fields.forEach(field => {
      const colName = field.columnName || toSnakeCase(field.name);
      const sqlType = mapFieldToSqlType(field, database);
      let colDef = `    ${colName} ${sqlType}`;

      if (field.required) colDef += ' NOT NULL';
      if (field.unique) colDef += ' UNIQUE';

      columns.push(colDef);
    });

    // Foreign keys for Many-to-One and One-to-One (owning side)
    const rels = entity.relationships || [];
    rels.forEach(rel => {
      const target = entityMap.get(rel.targetEntity);
      if (!target) return;

      const targetTable = target.tableName || toPluralSnakeCase(target.name);
      const targetIdCol = toSnakeCase(target.idFieldName || 'id');
      const targetPkType = target.idType || 'Long';
      const foreignColType = getForeignKeySqlType(targetPkType, database);
      const joinCol = rel.joinColumnName || `${toSnakeCase(rel.name)}_${targetIdCol}`;
      const constraintName = `fk_${tableName}_${toSnakeCase(rel.name)}`;

      const isCyclic = cyclicFks.some(c => c.sourceTable === tableName && c.constraintName === constraintName);

      if (rel.type === 'MANY_TO_ONE') {
        let colDef = `    ${joinCol} ${foreignColType}`;
        if (rel.required) colDef += ' NOT NULL';
        columns.push(colDef);

        if (!isCyclic) {
          tableConstraints.push(
            `    CONSTRAINT ${constraintName} FOREIGN KEY (${joinCol}) REFERENCES ${targetTable}(${targetIdCol})`
          );
        }
      } else if (rel.type === 'ONE_TO_ONE' && rel.isOwningSide !== false && !rel.mappedBy) {
        let colDef = `    ${joinCol} ${foreignColType} UNIQUE`;
        if (rel.required) colDef += ' NOT NULL';
        columns.push(colDef);

        if (!isCyclic) {
          tableConstraints.push(
            `    CONSTRAINT ${constraintName} FOREIGN KEY (${joinCol}) REFERENCES ${targetTable}(${targetIdCol})`
          );
        }
      } else if (rel.type === 'MANY_TO_MANY' && rel.isOwningSide !== false && !rel.mappedBy) {
        // Collect join table definition
        const joinTableName = rel.joinTableName || `${tableName}_${toPluralSnakeCase(target.name)}`;
        if (!processedJoinTables.has(joinTableName)) {
          processedJoinTables.add(joinTableName);

          const sourceCol = rel.joinColumnName || `${toSnakeCase(entity.name)}_${idFieldName}`;
          const invCol = rel.joinTableInverseColumnName || `${toSnakeCase(target.name)}_${targetIdCol}`;
          const sourceColType = getForeignKeySqlType(idType, database);

          const joinTableSql = `-- Join Table: ${joinTableName}\n` +
            `CREATE TABLE IF NOT EXISTS ${joinTableName} (\n` +
            `    ${sourceCol} ${sourceColType} NOT NULL,\n` +
            `    ${invCol} ${foreignColType} NOT NULL,\n` +
            `    PRIMARY KEY (${sourceCol}, ${invCol}),\n` +
            `    CONSTRAINT fk_${joinTableName}_${toSnakeCase(entity.name)} FOREIGN KEY (${sourceCol}) REFERENCES ${tableName}(${idFieldName}) ON DELETE CASCADE,\n` +
            `    CONSTRAINT fk_${joinTableName}_${toSnakeCase(target.name)} FOREIGN KEY (${invCol}) REFERENCES ${targetTable}(${targetIdCol}) ON DELETE CASCADE\n` +
            `);`;

          joinTableStatements.push(joinTableSql);
        }
      }
    });

    // Audit timestamp column
    columns.push(`    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    const allLines = [...columns, ...tableConstraints];
    tableStatements.push(
      `-- Table: ${tableName}\nCREATE TABLE IF NOT EXISTS ${tableName} (\n${allLines.join(',\n')}\n);`
    );
  });

  // Cyclic FK alter statements if any
  const alterStatements = cyclicFks.map(c =>
    `ALTER TABLE ${c.sourceTable} ADD CONSTRAINT ${c.constraintName} FOREIGN KEY (${c.colName}) REFERENCES ${c.targetTable}(${c.targetCol});`
  );

  const securityEnabled = Boolean(config.security?.enabled || config.options?.security?.enabled);
  let securityTableDdl = '';
  if (securityEnabled) {
    if (database === 'postgresql') {
      securityTableDdl = `-- ==================================================================\n` +
        `-- Spring Security Authentication Table\n` +
        `-- ==================================================================\n` +
        `CREATE TABLE IF NOT EXISTS app_users (\n` +
        `    id BIGSERIAL PRIMARY KEY,\n` +
        `    username VARCHAR(50) NOT NULL UNIQUE,\n` +
        `    email VARCHAR(100) NOT NULL UNIQUE,\n` +
        `    password_hash VARCHAR(255) NOT NULL,\n` +
        `    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',\n` +
        `    enabled BOOLEAN NOT NULL DEFAULT TRUE,\n` +
        `    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP\n` +
        `);`;
    } else if (database === 'mysql') {
      securityTableDdl = `-- ==================================================================\n` +
        `-- Spring Security Authentication Table\n` +
        `-- ==================================================================\n` +
        `CREATE TABLE IF NOT EXISTS app_users (\n` +
        `    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n` +
        `    username VARCHAR(50) NOT NULL UNIQUE,\n` +
        `    email VARCHAR(100) NOT NULL UNIQUE,\n` +
        `    password_hash VARCHAR(255) NOT NULL,\n` +
        `    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',\n` +
        `    enabled BOOLEAN NOT NULL DEFAULT TRUE,\n` +
        `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n` +
        `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
    } else {
      securityTableDdl = `-- ==================================================================\n` +
        `-- Spring Security Authentication Table\n` +
        `-- ==================================================================\n` +
        `CREATE TABLE IF NOT EXISTS app_users (\n` +
        `    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n` +
        `    username VARCHAR(50) NOT NULL UNIQUE,\n` +
        `    email VARCHAR(100) NOT NULL UNIQUE,\n` +
        `    password_hash VARCHAR(255) NOT NULL,\n` +
        `    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',\n` +
        `    enabled BOOLEAN NOT NULL DEFAULT TRUE,\n` +
        `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n` +
        `);`;
    }
  }

  const sections: string[] = [
    `-- ==================================================================\n` +
    `-- Database Schema for ${projectName}\n` +
    `-- Target Database: ${database.toUpperCase()}\n` +
    `-- Generated on: ${new Date().toISOString()}\n` +
    `-- ==================================================================`
  ];

  if (securityTableDdl) {
    sections.push(securityTableDdl);
  }

  sections.push(tableStatements.join('\n\n'));

  if (joinTableStatements.length > 0) {
    sections.push(
      `-- ==================================================================\n` +
      `-- Many-to-Many Join Tables\n` +
      `-- ==================================================================\n\n` +
      joinTableStatements.join('\n\n')
    );
  }

  if (alterStatements.length > 0) {
    sections.push(
      `-- ==================================================================\n` +
      `-- Cyclic Foreign Key Constraints\n` +
      `-- ==================================================================\n\n` +
      alterStatements.join('\n')
    );
  }

  return sections.join('\n\n') + '\n';
}
