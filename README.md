# Highlight Summarizer Extension 🖍️✨

A powerful Chrome Extension that allows you to highlight text on any webpage, save it to your personal knowledge base, and generate concise AI summaries using the **Cerebras API** (Llama 3.1).

Built with **React**, **Vite**, and **Tailwind CSS**.

## 🚀 Features

- **Instant Highlighting**: Select text on any website and click the "Save highlight?" bubble.
- **Personal Knowledge Base**: All highlights are saved locally in your browser.
- **AI Summarization**: Generate instant, bullet-point summaries for any specific highlight using the ultra-fast Cerebras API.
- **Modern Dark UI**: A sleek, edge-to-edge dark mode interface with green accents.
- **Privacy First**: Your data is stored locally (`chrome.storage.local`) and only sent to the AI when you explicitly click "Summarize".

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS v4
- **AI Model**: Llama 3.1-8b (via Cerebras API)
- **Platform**: Chrome Extension (Manifest V3)

## 📋 Prerequisites

You will need a **Cerebras API Key** to enable the summarization feature.
1.  Sign up at [Cerebras Cloud](https://cloud.cerebras.ai/).
2.  Generate a new API Key.

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/awinashnarute10/Highlight-Summarizer-Extension.git
    cd Highlight-Summarizer-Extension
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_CEREBRAS_API_KEY="your-cerebras-api-key-here"
    ```

4.  **Build the Extension**
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the production-ready extension.

5.  **Load into Chrome**
    1.  Open Chrome and navigate to `chrome://extensions`.
    2.  Enable **Developer mode** (top right toggle).
    3.  Click **Load unpacked**.
    4.  Select the `dist` folder from your project directory.

## 📖 Usage

1.  **Save a Highlight**:
    - Go to any website (e.g., a news article or blog).
    - Select a paragraph of text.
    - A small "Save highlight?" popup will appear near your cursor. Click it!

2.  **View & Manage**:
    - Click the extension icon in your browser toolbar.
    - You will see a list of all your saved highlights.

3.  **Summarize**:
    - Click the **Summarize** button on any highlight card.
    - The AI will generate a concise summary at the top of the popup.

4.  **Delete**:
    - Hover over a card and click the **Delete** button to remove it.

## 💻 Development

To run the project in development mode (with mock data):

```bash
npm run dev
```
*Note: The content script and chrome APIs won't work in `npm run dev` mode, but you can iterate on the Popup UI.*

## 📄 License

MIT
