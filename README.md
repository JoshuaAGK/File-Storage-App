<h1 align="center">File Storage App</h1>

![](https://i.imgur.com/3ysIuuA.png)

File Storage App is an open‑source file storage platform. It allows you to upload files for storage, share or download them, delete them, and set access permissions.

This application's tech stack is Node.js & Express for the back-end, Handlebars.js for the front-end, and MongoDB for the database.

# Installation

Follow these simple instructions to set up File Storage App locally.
1. Clone the repository and install its dependencies.
    ```
    git clone https://github.com/JoshuaAGK/File-Storage-App.git
    cd File-Storage-App
    npm i
    ```

2. Run the build script, which builds the TypeScript from `/src` into `/dist`, and copies over all non-TypeScript files (Handlebars, images, etc).
    ```
    npm run build
    ```

3. Create an environment file `.env` in the root folder. Add your MongoDB details to it:
    ```
    MONGODB_USERNAME=<Your username>
    MONGODB_PASSWORD=<Your password>
    MONGODB_BASE_URL=<Your database's base URL>
    MONGODB_OPTIONS=<Any database options>
    ```

4. Create a secret string in `.env`. This will be used to sign and verify JWTs.
    ```
    TOKEN_SECRET=<Your secret string>
    ```

5. Run the application from `/dist`.
    ```
    nodemon /dist/app.js
    ```