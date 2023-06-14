# Hack4Futo RESTful API

#### \_\_ helps thousands of individuals say students across various citadel of learning to ease you, and expose businesses around you.

## Get Started

Clone the repo:

```bash
git https://github.com/Team-Xperia/Xperial-serverSide-BE-.git
<<<<<<< HEAD
cd xperia
=======

>>>>>>> 662fe2f941fe29a0cdbfccea1cb8664023c6503c
```

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm start
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=5000

```

## Project Structure

```
src\
 |--controllers\    # Route controllers/Business logic (controller layer)
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app (express middlewares)
 |--server.js        # App entry point
```

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for more information.
