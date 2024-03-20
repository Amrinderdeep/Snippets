# Snippets

Snippets is a Node.js Express project designed as a learning exercise to develop skills in backend web development using Express.js.

## Overview

Snippets is a social media website where users can share short, insightful pieces of information with others. The project aims to demonstrate proficiency in backend technologies such as Express.js and MongoDB, while also providing a platform for learning and experimentation.

## Features

- User authentication: Users can sign up, log in, and log out securely.
- Create snippets: Users can create short pieces of content to share with the community.
- View snippets: Users can browse and view snippets shared by others.
- MongoDB integration: Snippets utilizes MongoDB for storing user data and snippet content.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS (Embedded JavaScript) for templating
- Vanilla HTML/CSS for UI (placeholder)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/snippets.git
```

2. Navigate to the project directory:

```bash
cd snippets
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

Create a `.env` file in the root directory and define the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/snippets
SESSION_SECRET=your_session_secret
```

5. Start the server:

```bash
npm start
```

6. Visit `http://localhost:3000` in your web browser to access the application.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Snippets.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to the developers of Express.js, MongoDB, and other open-source projects that made this project possible.
