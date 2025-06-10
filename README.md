# free-speech: A Modern Anonymous Discussion Platform

Welcome to the official repository for **free-speech**, a dynamic and real-time anonymous discussion platform. Inspired by the classic imageboard format, this project brings a modern, clean, and feature-rich experience to anonymous communication. It's built from the ground up with modern web technologies, designed for simplicity, performance, and effortless deployment.

This is more than just an app; it's a demonstration of how powerful serverless architecture and modern front-end tools can be when combined to create fluid, real-time user experiences without the hassle of managing traditional back-end infrastructure.

## Table of Contents

-   [The Philosophy](#the-philosophy)
-   [Live Features](#live-features)
-   [Technology Deep Dive](#technology-deep-dive)
    -   [The Front-End](#the-front-end)
    -   [The Back-End (Serverless)](#the-back-end-serverless)
    -   [The Platform](#the-platform)
-   [User's Guide](#users-guide)
    -   [Getting Started](#getting-started)
    -   [Navigating the Interface](#navigating-the-interface)
    -   [Creating a Post](#creating-a-post)
    -   [Interacting with Posts](#interacting-with-posts)
-   [Developer's Corner](#developers-corner)
    -   [The Setup](#the-setup)
    -   [Deployment A to Z](#deployment-A-to-Z)

## The Philosophy

The core idea behind **free-speech** was to create a space for open dialogue with two key principles in mind:

1.  **True Anonymity:** Users don't need to create accounts. Upon visiting, you are assigned a unique, randomly generated identity (e.g., "Witty Wombat 458") which is stored locally on your device. This allows for persistent identity within a session without requiring any personal information. You can even customize this name when you post.

2.  **Modern Experience:** Classic imageboards can feel dated. This project reimagines the experience with a responsive design, real-time updates (no page refreshes needed to see new posts or comments), dark/light modes, customizable color themes, and a clean, intuitive layout that works beautifully on both desktop and mobile devices.

## Live Features

*   **Real-Time Post Feed:** See new posts and comments appear instantly without ever hitting refresh, powered by Firebase Firestore's real-time listeners.
*   **Anonymous Identity:** No sign-up required. A unique user profile is generated and stored locally in your browser.
*   **Rich Content Posts:** Create posts with text content, upload images, videos, or audio files.
*   **Themed Rooms (Categories):** Discussions are organized into a comprehensive list of rooms or categories, from technology and anime to sports and current events.
*   **Dynamic Filtering & Sorting:**
    *   Filter the feed by any category.
    *   Search all posts with a live search bar.
    *   Sort the feed by "Most Recent," "Most Upvoted," or "Most Commented."
*   **Nested Threaded Comments:** Engage in deep conversations with multi-level threaded replies.
*   **Voting System:** Upvote or downvote posts to influence their visibility. Your votes are remembered for your session.
*   **Customizable UI:**
    *   Seamlessly switch between **Light and Dark themes**.
    *   Choose from multiple **accent color themes** (Warm Amber, Cool Blue, etc.) to personalize your experience.
*   **Fully Responsive:** A beautiful, usable interface whether you're on a 4K monitor or your phone.

## Technology Deep Dive

This project intentionally avoids a traditional server setup. Instead, it leverages a powerful stack of modern, primarily client-side technologies and serverless services.

### The Front-End

*   **HTML5 & CSS3:** The structural foundation of the application, styled with modern techniques like CSS variables for theming.
*   **Tailwind CSS:** A utility-first CSS framework that allows for rapid development of a beautiful and responsive user interface directly within the HTML. This avoids the need for massive, hard-to-maintain CSS files.
*   **Vanilla JavaScript (ESM):** All application logic is written in clean, modern JavaScript using ES Modules. No heavy frameworks like React or Vue were used, demonstrating the power of "vanilla" JS when combined with the right libraries and architecture.
*   **Moment.js:** A simple but effective library for handling time. It's used here to display human-friendly timestamps like "a few seconds ago" or "2 days ago."

### The Back-End (Serverless)

*   **Firebase Firestore:** The heart of the application. Firestore acts as our real-time, NoSQL database. Its primary role is to store all post data and user comments. The real magic comes from its ability to "listen" for changes, allowing the app to update in real-time without any manual polling.
*   **Firebase rStoage:** When a user uploads a file (image, video, etc.), it isn't stored in the database. Instead, it's securely uploaded to a dedicated Firebase Storage bucket. The database entry for the post simply stores the URL to this file. This is a highly scalable and cost-effective way to handle user-generated media.
*   **Firebase Authentication:** To keep data secure and prevent abuse, the app uses Firebase's Anonymous Authentication. When you first visit, the app silently creates a temporary, anonymous user account in the background. This provides the necessary security credentials to interact with the database and storage services.

### The Platform

*   **Netlify:** Our all-in-one platform for continuous integration, deployment, and hosting.
    *   **Git-Integrated Workflow:** Every `git push` to the main branch automatically triggers a new build and deployment.
    *   **Server-Side Build Replacement:** The critical process of securely adding the Firebase API keys to the front-end code is handled at build time using Netlify's build commands (`sed`). This is a robust and secure method that prevents API keys from ever being exposed in the source code repository.

## User's Guide

### Getting Started

There is no "getting started"! Simply visit the site. Your anonymous identity is automatically created for you, and you can begin browsing immediately.

### Navigating the Interface

*   **The Header:** At the top, you'll find the site title, a "New Post" button, and icons for changing the color palette and switching between light/dark mode.
*   **The Main Feed:** This is the central column where all posts appear.
*   **The Sidebar (Desktop):** On the right, a list of all "Rooms" (categories) is displayed. Clicking any room will filter the main feed to show only posts from that category.
*   **Controls (Desktop):** Above the feed, you'll find a search bar and a dropdown to sort posts.
*   **Controls (Mobile):** On mobile, the room list becomes a dropdown menu, and the search bar is located just below it for easy access.

### Creating a Post

1.  Click the **"New Post"** button.
2.  A modal window will appear.
3.  **Choose a Room:** This is a required field.
4.  **Enter a Name:** Your randomly generated name is filled in by default, but you are free to change it for this specific post.
5.  **Write Your Message:** Add your thoughts in the main text area.
6.  **(Optional) Attach a File:** Click the paperclip icon to upload an image, video, or audio file.
7.  Click **"Post"**. Your post will appear at the top of the feed in real-time.

### Interacting with Posts

*   **Vote:** Use the up and down arrow icons to vote on a post's quality.
*   **Comment:** Click the speech bubble icon to reveal the comment section for that post. You can write a reply and submit it.
*   **Reply to Comments:** Within the comment section, each comment has its own "Reply" button, allowing for threaded conversations.
*   **View Full Image:** If a post has a truncated image, simply click the image to expand it to its full size.

## Developer's Corner

### The Setup

This project is designed to be incredibly simple to set up locally and deploy yourself.

**Prerequisites:**
1.  A [Firebase](https://firebase.google.com/) account (the free "Spark" plan is more than sufficient).
2.  A [Netlify](https://www.netlify.com/) account.
3.  A [GitHub](https://github.com/) account (or another Git provider supported by Netlify).

**Steps:**
1.  **Firebase Project:**
    *   Create a new project in the Firebase console.
    *   Create a **Web App** within the project.
    *   From the app's settings, find and copy the `firebaseConfig` object. This contains your API keys.
    *   Enable **Firestore**, **Storage**, and **Anonymous Authentication** in the Firebase console.

2.  **Local Files:**
    *   The project is "zero-install" — so `npm` or any package manager was not needed. 

### Deployment A to Z

Deployment of **free-speech** is handled almost entirely by Netlify.

1.  **Link Repository:**
    *   The repository is pushed to GitHub.
    *   On Netlify, a "New site from Git" was created and connected to the repository.

2.  **Configure Build Settings:**
    *   In your Netlify site's settings, go to **Build & deploy > Build settings**.
    *   Set the **Build command** to:
        ```bash
        sed -i "s|%%FIREBASE_CONFIG%%|$VITE_FIREBASE_CONFIG|g" index.html
        ```
    *   Set the **Publish directory** to `.` (a single period, meaning the root of the project).

3.  **Set Environment Variable:**
    *   Go to **Build & deploy > Environment variables**.
    *   Create a new variable.
    *   **Key:** `VITE_FIREBASE_CONFIG`
    *   **Value:** Paste your `firebaseConfig` object here. **Crucially, it must be a valid, single-line JSON string.**

4.  **Deploy!**
    *   Go to the "Deploys" tab and trigger a new deploy using **"Deploy with clear cache"**.

Netlify will now pull your code, run the `sed` command to replace the placeholder in `index.html` with your secret API keys from the environment variable, and deploy the resulting site to its global CDN. The site will now be live.