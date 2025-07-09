# Mentorship Booking Platform

## Description

A platform where individuals can book mentorship sessions with experts in various fields. It facilitates professional development and career growth through guidance.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [Contributors](#contributors)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/SriraghavanK/Workcohol_project.git
    cd Workcohol_project
    ```

2.  **Install backend dependencies (Python):**

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows
    pip install -r requirements.txt
    cd ..
    ```

3.  **Install frontend dependencies (Node.js):**

    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Usage

### Running the application

1.  **Start the backend server (Python):**

    ```bash
    cd backend
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows
    python manage.py runserver
    cd ..
    ```

2.  **Start the frontend development server (Node.js):**

    ```bash
    cd frontend
    npm start # or npm run dev
    cd ..
    ```

## Features

*   Mentor Booking System: Users can browse mentors and book sessions directly through the platform.
*   User Authentication: Secure login and registration for both mentors and mentees.
*   Profile Management: Users and mentors can manage their profiles, including uploading profile pictures.
*   Stripe Integration: Implements payment processing using Stripe for secure and reliable transactions.
*   Review System: Users can leave reviews for mentors after sessions.
*   Admin Dashboard: Admins can manage users, bookings, and reviews.

## Contributing

We welcome contributions to the Mentorship Booking Platform!

To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, concise messages.
4.  Submit a pull request to the `main` branch.

Please follow our [Code of Conduct] when contributing.

For bug reports or feature requests, please open an issue describing the problem or suggestion.

For major changes, please open an issue first to discuss what you would like to change.

## Contributors

*   [SriraghavanK](https://github.com/SriraghavanK) - SRIRAGHAVAN K
*   [Srimanjunath23](https://github.com/Srimanjunath23) - SRIMANJUNATH R
