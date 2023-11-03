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
- [Getting Started](#getting-started)
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
    - [`role`](#role)
      - [Description](#description-1)
      - [Columns](#columns-1)
    - [`user`](#user)
      - [Description](#description-2)
      - [Columns](#columns-2)
    - [`servicetype`](#servicetype)
      - [Description](#description-3)
      - [Columns](#columns-3)
    - [`subtype`](#subtype)
      - [Description](#description-4)
      - [Columns](#columns-4)
    - [`service`](#service)
      - [Description](#description-5)
      - [Columns](#columns-5)
    - [`paymentmethod`](#paymentmethod)
      - [Description](#description-6)
      - [Columns](#columns-6)
    - [`payment`](#payment)
      - [Description](#description-7)
      - [Columns](#columns-7)
    - [`transaction`](#transaction)
      - [Description](#description-8)
      - [Columns](#columns-8)
    - [`order`](#order)
      - [Description](#description-9)
      - [Columns](#columns-9)
    - [`orderdetail`](#orderdetail)
      - [Description](#description-10)
      - [Columns](#columns-10)

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

# Getting Started

1. Open the terminal.
2. Navigate to the `database` folder.
3. open the `.env_example` file and copy its content.
4. Create a new file named `.env` and paste the content.

5. Run the following command to install the dependencies:

```bash
npm install
```

6. Run the following command to push existing database migrations and its tables:

```bash
npx prisma db push
```

7. Run the following command to seed the database:

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
4. open the `.env_example` file and copy its content.
5. Create a new file named `.env` and paste the content.
6. Replace the values of the variables with the correct values.
7. Run the following command to install the dependencies:

```bash
npm install
```

8.. Run the following command to migrate existing database and its tables:

```bash
npx prisma db push
```

9.  Run the following command to seed the database `(not ready yet)`:

```bash
npx prisma db seed
```

## Step by step guide to create a new migration

1. Open the terminal.
2. Navigate to the `database` folder.
3. Create a new model in the `schema.prisma` file.
4. Run the following command to create a new migration:

```bash
npx prisma migrate dev --name <migration_name>
```

5. Run the following command to apply the migration:

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

### `role`

#### Description

This table contains the information of the role of the user.

#### Columns

| Column name  | Type       | Description                            |
| ------------ | ---------- | -------------------------------------- |
| `id`         | `integer`  | Unique identifier for the role         |
| `name`       | `string`   | Name of the role                       |
| `created_at` | `datetime` | Date and time when the role is created |
| `updated_at` | `datetime` | Date and time when the role is updated |

### `user`

#### Description

This table contains the information of the admin / mitra.

#### Columns

| Column name  | Type                    | Description                            |
| ------------ | ----------------------- | -------------------------------------- |
| `id`         | `integer`               | Unique identifier for the user         |
| `name`       | `string`                | Name of the user                       |
| `gender`     | `enum('MALE', 'FEMAL')` | Gender og the user                     |
| `phone`      | `string`                | Phone number of the user               |
| `picture`    | `string`                | Picture of the user                    |
| `birthday`   | `datetime`              | Birthday of the user                   |
| `nik`        | `string`                | National Identity Card of the user     |
| `email`      | `string`                | Email of the user                      |
| `username`   | `string`                | Username of the user                   |
| `password`   | `string`                | Password of the user                   |
| `role`       | `integer`               | Role of the user                       |
| `created_at` | `datetime`              | Date and time when the user is created |
| `updated_at` | `datetime`              | Date and time when the user is updated |

### `servicetype`

#### Description

This table contains the information of the service type.

#### Columns

| Column name  | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `id`         | `integer`  | Unique identifier for the service type         |
| `name`       | `string`   | Name of the service type                       |
| `created_at` | `datetime` | Date and time when the service type is created |
| `updated_at` | `datetime` | Date and time when the service type is updated |

### `subtype`

#### Description

This table contains the information of the subtype (eg. the service type is minimarket then the subtype is cleaningtool, drink, snack etc ).

#### Columns

| Column name     | Type       | Description                               |
| --------------- | ---------- | ----------------------------------------- |
| `id`            | `integer`  | Unique identifier for the subtype         |
| `name`          | `string`   | Name of the subtype                       |
| `serviceTypeId` | `integer`  | ServiceTypeId of the subtype              |
| `created_at`    | `datetime` | Date and time when the subtype is created |
| `updated_at`    | `datetime` | Date and time when the subtype is updated |

### `service`

#### Description

This table contains the information of the service.

#### Columns

| Column name     | Type       | Description                               |
| --------------- | ---------- | ----------------------------------------- |
| `id`            | `integer`  | Unique identifier for the service         |
| `name`          | `string`   | Name of the service                       |
| `price`         | `integer`  | Price of the service                      |
| `desc`          | `string`   | Description of the service                |
| `picture`       | `string`   | Picture of the service                    |
| `serviceTypeId` | `integer`  | ServiceTypeId of the service              |
| `created_at`    | `datetime` | Date and time when the service is created |
| `updated_at`    | `datetime` | Date and time when the service is updated |

### `paymentmethod`

#### Description

This table contains the information of the payment method (eg. cash, qris, transfer, etc.).

#### Columns

| Column name  | Type       | Description                                      |
| ------------ | ---------- | ------------------------------------------------ |
| `id`         | `integer`  | Unique identifier for the payment method         |
| `name`       | `string`   | Name of the payment method                       |
| `created_at` | `datetime` | Date and time when the payment method is created |
| `updated_at` | `datetime` | Date and time when the payment method is updated |

### `payment`

#### Description

This table contains the information of the payment.

#### Columns

| Column name       | Type                | Description                               |
| ----------------- | ------------------- | ----------------------------------------- |
| `id`              | `integer`           | Unique identifier for the payment         |
| `name`            | `string`            | Name of the payment                       |
| `code`            | `string`            | Code of the payment                       |
| `params`          | `string` `nullable` | Params of the payment if exist            |
| `paymentMethodId` | `integer`           | PaymentMethodId of the payment            |
| `created_at`      | `datetime`          | Date and time when the payment is created |
| `updated_at`      | `datetime`          | Date and time when the payment is updated |

### `transaction`

#### Description

This table contains the information of the transaction.

#### Columns

| Column name  | Type                                     | Description                                   |
| ------------ | ---------------------------------------- | --------------------------------------------- |
| `id`         | `integer`                                | Unique identifier for the transaction         |
| `name`       | `string`                                 | Name of the transaction                       |
| `status`     | `enum('PENDING', 'SUCCEEDED', 'FAILED')` | Status of the transaction                     |
| `paymentId`  | `integer`                                | PaymentId of the transaction                  |
| `orderId`    | `integer`                                | OrderId of the transaction                    |
| `created_at` | `datetime`                               | Date and time when the transaction is created |
| `expired_at` | `datetime`                               | Date and time when the transaction is expired |
| `updated_at` | `datetime`                               | Date and time when the transaction is updated |

### `order`

#### Description

This table contains the information of the order.

#### Columns

| Column name     | Type                                                       | Description                             |
| --------------- | ---------------------------------------------------------- | --------------------------------------- |
| `id`            | `integer`                                                  | Unique identifier for the order         |
| `guestId`       | `integer`                                                  | GuestId of the order                    |
| `room_number`   | `integer`                                                  | Room number of the order                |
| `subtotal`      | `float`                                                    | Subtotal of the order                   |
| `total`         | `float`                                                    | Total of the order                      |
| `ppn`           | `float`                                                    | PPN of the order                        |
| `fees`          | `float`                                                    | Fees of the order                       |
| `status`        | `enum('PENDING', 'PROCES', 'DELIVERED', 'DONE', 'CANCEL')` | Status of the order                     |
| `transactionId` | `integer`                                                  | TransactionId of the order              |
| `created_at`    | `datetime`                                                 | Date and time when the order is created |
| `updated_at`    | `datetime`                                                 | Date and time when the order is updated |

### `orderdetail`

#### Description

This table contains the information of the order detail.

#### Columns

| Column name  | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `id`         | `integer`  | Unique identifier for the order detail         |
| `orderId`    | `integer`  | OrderId of the order detail                    |
| `serviceId`  | `integer`  | ServiceId of the order detail                  |
| `price`      | `float`    | Price of the order detail                      |
| `qty`        | `integer`  | Qty of the order detail                        |
| `created_at` | `datetime` | Date and time when the order detail is created |
| `updated_at` | `datetime` | Date and time when the order detail is updated |

<!-- Table End -->
