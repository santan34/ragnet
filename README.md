# Ragnet

Ragnet is an API service designed to help developers with little experience in AI to develop document-aware intelligent bots. This service provides endpoints for user management, bot creation, chat functionalities, and file handling, making it easier to integrate AI-powered bots into your applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [User Routes](#user-routes)
  - [Bot Routes](#bot-routes)
  - [Chat Routes](#chat-routes)
  - [File Routes](#file-routes)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and management
- Bot creation and management
- Chat initiation and message handling
- File upload and download for bot training
- Token-based authentication and authorization
- Redis-based token blacklisting

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/santan34/ragnet.git
   cd ragnet
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   JWT_SECRET=your_jwt_secret
   JWT_SECRET_2=your_second_jwt_secret
   JWT_LIFESPAN=1h
   OPEN_API_KEY=your_openai_api_key
   HOST=localhost
   PORT=27017
   DB_NAME=test
   ```

4. Start the server:
   ```sh
   npm start
   ```

## Configuration

The project uses environment variables for configuration. Make sure to set the following variables in your `.env` file:

- `JWT_SECRET`: Secret key for JWT token generation.
- `JWT_SECRET_2`: Second secret key for JWT token generation.
- `JWT_LIFESPAN`: Lifespan of the JWT token.
- `OPEN_API_KEY`: API key for OpenAI.
- `HOST`: Database host.
- `PORT`: Database port.
- `DB_NAME`: Database name.

## Usage

Once the server is running, you can use the provided API endpoints to manage users, bots, chats, and files. Below are the available routes and their descriptions.

## API Endpoints

### User Routes

- **Create User**: `POST /user/create`
- **Login User**: `POST /user/login`
- **Get User Profile**: `GET /user/profile` (requires token)
- **Delete User**: `DELETE /user/profile/delete` (requires token)
- **Change Password**: `POST /user/profile/change-password` (requires token)

### Bot Routes

- **Create Bot**: `POST /user/bot/create` (requires token)
- **Get Bot**: `GET /user/bot/:botId` (requires token)
- **Delete Bot**: `DELETE /user/bot/:botId` (requires token)
- **Update Bot**: `PUT /user/bot/:botId` (requires token)
- **Generate Bot Access Token**: `POST /user/bot/:botId/create-token` (requires token)
- **Blacklist Token**: `POST /user/bot/:botId/blacklist-token` (requires token)

### Chat Routes

- **Initiate Chat**: `POST /api/chat/initiate` (requires API token)
- **Send Message**: `POST /api/chat/:chatId/send` (requires API token)
- **Get Chat History**: `GET /api/chat/:chatId/history` (requires API token)
- **End Chat**: `POST /api/chat/:chatId/end` (requires API token)
- **Get Chat Status**: `GET /api/chat/:chatId/status` (requires API token)

### File Routes

- **Upload Files**: `POST /user/bot/:botId/upload` (requires token)
- **Download File**: `GET /user/bot/:botId/download` (requires token)
- **Delete File**: `DELETE /user/bot/:botId/file` (requires token)
- **Get File Information**: `GET /user/bot/:botId/filedetails` (requires token)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
