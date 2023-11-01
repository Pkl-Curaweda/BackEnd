# Database

This folder contains the database structure, database migrations and model to create the database and its tables for hotel management system using Prisma (Javascript).

## Table of contents

- [Database](#database)
  - [Table of contents](#table-of-contents)
- [Requirements](#requirements)
- [Installation](#installation)
  - [XAMPP](#xampp)
    - [Windows](#windows)
  - [MySQL Client (MYSQL WORKBENCH)](#mysql-client-mysql-workbench)
    - [Windows](#windows-1)
- [Migrations `(not ready yet)`](#migrations-not-ready-yet)
- [How to contribute](#how-to-contribute)
  - [Requirements](#requirements-1)
  - [Installation](#installation-1)
  - [Step by step guide to create a new migration](#step-by-step-guide-to-create-a-new-migration)
  - [Step by step guide to revert a migration](#step-by-step-guide-to-revert-a-migration)
- [Existing Database structure](#existing-database-structure)
  - [Tables](#tables)
    - [`guest`](#guest)
      - [Description](#description)
      - [Columns](#columns)

# Requirements

- MySQL 5.7.31 / XAMPP 7.4.8
- MySQL Client / PHPMyAdmin 5.0.2

# Installation

## XAMPP

### Windows

1. Download XAMPP from [here](https://www.apachefriends.org/download.html).
2. Install XAMPP.
3. Start the MySQL service.
4. Open the MySQL Client or PHPMyAdmin.
5. Create a new database with the name `lingianhotel_db`.

## MySQL Client (MYSQL WORKBENCH)

### Windows

1. Download MySQL Client from [here](https://dev.mysql.com/downloads/workbench/).
2. Install MySQL Client.
3. Open MySQL Client.
4. Create a new connection see .env_example for the credentials.
5. Create a new database with the name `lingianhotel_db`.

# Migrations `(not ready yet)`

1. Open the terminal.
2. Navigate to the `database` folder.
3. Run the following command to install the dependencies:

```bash
npm install
```

1. Run the following command to create the database and its tables:

```bash
npx prisma migrate dev --name init
```

1. Run the following command to seed the database:

```bash
npx prisma db seed
```

<!-- How To start -->

# How to contribute

## Requirements

- NodeJS 12.18.3
- NPM 6.14.6
- Git 2.28.0
- MySQL 5.7.31 / XAMPP 7.4.8
- MySQL Client / PHPMyAdmin 5.0.2
- Code Editor (Visual Studio Code, Atom, Sublime Text, etc.)

## Installation

1. Clone the repository.
2. Open the terminal.
3. Navigate to the `database` folder.
4. Cat the `.env_example` file and copy its content.
5. Create a new file named `.env` and paste the content.
6. Replace the values of the variables with the correct values.
7. Run the following command to install the dependencies:

```bash
npm install
```

9. Run the following command to migrate existing database `(not ready yet)`:

```bash
npx prisma migrate dev --name init
```

10. Run the following command to seed the database `(not ready yet)`:

```bash
npx prisma db seed
```

## Step by step guide to create a new migration

1. Open the terminal.
2. Navigate to the `database` folder.
3. Create a new model in the `schema.prisma` file.
4. Run the following command to create a new migration `(not ready yet)`:

```bash
npx prisma migrate dev --name <migration_name>
```

1. Run the following command to apply the migration:

```bash
npx prisma db push
```

6. Create Seed data in the `seed.js` file (`not ready yet`).
7. Run the following command to seed the database (`not ready yet`):

```bash
npx prisma db seed
```

8. See the changes in the database.
9. Or See the changes in the `prisma studio` .
10. Run the following command to see the changes in the `prisma studio`:

```bash
npx prisma studio
```

11. Open the browser and go to `localhost:5555` to see the changes in the `prisma studio`.
12. Commit the changes.
13. Push the changes to the repository.

## Step by step guide to revert a migration

1. Open the terminal.
2. Navigate to the `database` folder.
3. Run the following command to revert the migration:

```bash
npx prisma migrate reset
```

4. See the changes in the database.
5. Or See the changes in the `prisma studio` .
6. Run the following command to see the changes in the `prisma studio`:

```bash
npx prisma studio
```

7. Open the browser and go to `localhost:5555` to see the changes in the `prisma studio`.
8. Create a [new migration](#step-by-step-guide-to-create-a-new-migration) to fix the issue.
9. Commit the changes.
10. Push the changes to the repository.

<!-- How to end -->

# Existing Database structure

## Tables

<!-- Table start -->

### `guest`

#### Description

This table contains the information of the guest and data for guest access hotel feature (eg. login).

#### Columns

| Column name | Type      | Description                     |
| ----------- | --------- | ------------------------------- |
| `id`        | `integer` | Unique identifier for the guest |
| `username`  | `string`  | Username of the guest           |
| `password`  | `string`  | Password of the guest           |

<!-- Table End -->
