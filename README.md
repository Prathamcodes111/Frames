# 🎬 Frames

**AI Chat Assistant with Video Generation**

Frames transforms AI text responses into engaging, narrated video explanations. Ask any question, get an AI response, and instantly generate a short tutorial video explaining the answer.

Built with Next.js, Google Gemini, and Veo 3.1.

---

## ✨ Features

- 🤖 **AI Chat Interface** - ChatGPT-like conversational UI powered by Gemini
- 🎥 **Video Generation** - Generate narrated video explanations from any AI response
- 📝 **Script Generation** - Automatically creates structured video scripts with scenes
- 🎨 **Dark Mode** - Beautiful black, grey, and white aesthetic (like ChatGPT)
- ⚡ **Real-time Generation** - Watch your videos come to life

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

**AI & APIs:**
- Google Gemini API (Chat)
- Google Veo 3.1 (Video Generation)
- LangChain (AI Orchestration)

**Development:**
- Prisma (ORM - ready for database)
- ESLint

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Frames.git
   cd Frames
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

1. **Ask a question** in the chat interface
2. **Get an AI response** from Gemini
3. **Click "Generate Video Solution"** on any assistant message
4. **Wait ~60-90 seconds** for video generation
5. **Watch your video** appear inline in the chat!

---

## 🎯 How It Works

1. **Chat Phase**: User asks a question → Gemini generates text response
2. **Script Generation**: AI creates structured video script with scenes and narration
3. **Video Generation**: Veo 3.1 generates video with built-in audio/narration
4. **Playback**: Video displays inline in chat interface

---

## 📁 Project Structure

```
Frames/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── video/
│   │       └── generate/  # Video generation endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── chatInterface.tsx  # Main chat UI component
├── lib/
│   ├── gemini.ts         # Gemini chat integration
│   ├── scriptGenerator.ts # Script generation logic
│   └── videoGenerator.ts # Veo video generation
├── types/
│   ├── chat.ts           # Message types
│   └── script.ts         # Script types
└── hooks/
    └── useDarkMode.ts    # Dark mode hook
```

---

## 🔐 Environment Variables

Required:
- `GEMINI_API_KEY` - Your Google Gemini API key

---

## 🎨 Features in Detail

### Chat Interface
- Clean, modern UI similar to ChatGPT
- Dark mode support
- Responsive design
- Auto-scrolling messages

### Video Generation
- Generates 2-3 minute educational videos
- Includes narration and visual descriptions
- Uses Google Veo 3.1 for high-quality video output
- Automatic script structuring

---

## 🚧 Current Status

✅ **Working:**
- Chat interface with Gemini
- Video generation with Veo 3.1
- Script generation
- Video playback in UI
- Dark mode

🔄 **Planned:**
- S3 upload for video storage
- Database integration for chat history
- User authentication
- Improved error handling
- Multi-llm model integrations
---

## 🤝 Contributing

This is a hackathon project! Feel free to fork, experiment, and build upon it.

---

## 📝 License

MIT License - feel free to use this project for learning or building your own ideas!

---

## 🙏 Acknowledgments

- Google Gemini API for chat capabilities
- Google Veo 3.1 for video generation
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling

---

## 📧 Contact

Built for [village hacks ] - [Pratham Nanekar]

---

**Made with ❤️ using Next.js, Gemini, and Veo 3.1**
