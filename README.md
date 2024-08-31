# Techinnover ecommerce app

## Overview

This is the backend for a basic ecommerce app in nest.js with the following featurea

- User management: Users can do the following:
  - View approved products without having to sign up
  - Sign up with their email and password and be able to create products of their own, view, update, and delete their products.
  - Logout of their accounts
- Admin management
  - A superadmin user initially seeded into the database
  - The superadmin (alone) is able to create other admins
  - Created admins or the user admin are able to login to the system and do the following:
    - View users and ban users to prevent them from logging in or performing any other actions available to authenticated users
    - Unban users and restore their access to the systm
    - View user created products and approve them for visibility to the public or reject the products, making them visible only to the creator.
    - Logout of the system

## Installation and local setup

- Clone this repo
- Install packages `npm install`
- Create a .env file in the root directory and add the following values (check .env.example for a sample)
  - MONGO_URI : The mongodb connection string
  - ACCESS_TOKEN_EXPIRY: The short-lived access token lifespan
  - REFRESH_TOKEN_EXPIRY: Longer lasting refresh token lifespan
  - ACCESS_TOKEN_SECRET: Secret string used to sign the access token
  - REFRESH_TOKEN_SECRET: Secret string used to sign the refresh token
  - JWT_SECRET: Secret string passed to the nest.js jwt library for initiation
- Start the app in local development mode `npm run start:dev`

## API documentation

- After starting the app, visit http://localhost:6969/api to view the docs and endpoint specifications
  <img width="1424" alt="Screenshot 2024-08-31 at 9 38 47 PM" src="https://github.com/user-attachments/assets/86bb477d-2b0d-4d98-8296-28c2096eea01">
  <img width="1430" alt="Screenshot 2024-08-31 at 9 39 00 PM" src="https://github.com/user-attachments/assets/6eeecf09-9aa9-4a34-9e3a-2c74f4bd5f48">

## App functionalities

### Authentication

- This app uses a custom auth approach, encoding user details into access and refresh tokens which are set as cookies on the client's browser via the response object
- The `AuthGuard` checks every request for the existence of an access token or refresh token, decodes the user or admin details, and injects them into the request object (request["info"]) for the various endpoints to identify the entity making the request
- A Public() decorator is used to indicate endpoints that do not require authentication to access (login, register, and view approved products)

### Role based access control

Three guards use the injected info from the previous authentication step to restrict endpoint access to the appropriate request entity

- `UnbannedUserGuard` verifies that only an unbanned user can access the product CRUD endpoints
- `SuperAdminGuard` ensures that only a super admin can create other admins
- `AdminGuard` restricts admin endpoints (user banning/unbanning, project approval/rejection) only to admins and superadmins

### Request validation

All endpoint request payloads are validated with the appropriate Zod schema

### Error management

- All endpoints are wrapped in a try/catch block and appropriate errors are thrown with useful error messages
- Any unhandled errors without custom messages are logged and a generic error message is displayed to the user

### Rate limiting

- The nestjs ThrottlerModule is used to rate limit requests to a maximum of 100 requests per minute. Anything above that returns a throttling error.

## Project structure

### Directories

- users
  - User Db schema: contains both regular users and admins, distinguishing them by a role field with values `user` | `admin` | `superadmin`
  - Services: Implements CRUD operations on the user db
  - Controller: User endpoints
    - product creation
    - product fetch (only those created by self)
    - product update (only those created by self)
    - product deletion (only those created by self)
  - Guard: handles unbanned user access
  - Module: Exposes the DB and services to the apps app.module file to make them usable across other directories
- products
  - Product Db schema: holds product details and a reference to the user who created them
  - Services: Implements CRUD operations on the products db
  - Controller:
    - Approved products endpoint accessible to non authenticated users
    - Module: Exposes the DB and services to the apps app.module file to make them usable across other directories
- auth
  - Handles authentication for users and admin
  - Controller: has all the login, register, and logout endpoints
  - Guard: Handles auth guard enforcing valid login tokens
- admin
  - Contains logic for admin activities
  - Controller: contains the admin creation, user fetch, user banning/unbanning, product approval/rejection
  - Guard: Ensures only admins can access admin endpoints
- database
  - Database initialization and connection
- utils
  - functions and types that are useful across the various directories
- app.module, main: App initialization

## Performance improvements

- Paginated all endpoints fetching an array of objects to reduce latency as more products get created
- Indexed the email field on the user db to ensure that login and other endpoints that do user db looks up by email do not respond slower as the system gets more users.

## Notes

- Users are logged in automatically after registration due to the basic nature of the app. This will be disabled for an actual production ecommerce app where the email or phone number needs to be verified before proceeding.
- Console.logs() are used to indicate parts of the system where logs will be sent to a log monitoring system in production to properly track reasons for failures.
- Assumption: It is not permitted for a registered admin to also sign up as a user and vice-versa.

## Challenge

- Request parameters not showing up in swagger docs even after specifying them with the @ApiOperation() decorator
