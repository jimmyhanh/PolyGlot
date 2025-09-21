# PolyGlot - Live AI-Powered Translator

A modern, responsive web application for real-time translation using OpenAI's GPT models. Features voice recognition, text-to-speech, and a clean modular architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## ✨ Features

- 🌍 **Multi-language Support** - Auto-detect source language or choose from supported languages
- 🎤 **Voice Recognition** - Speech-to-text input with browser API
- 🔊 **Text-to-Speech** - Listen to translations with natural voices
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 💾 **History Management** - Keep track of recent translations
- ⚡ **Live Translation** - Real-time translation as you type
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations  
- 🔧 **Modular Architecture** - Well-organized, maintainable codebase
- 🚀 **Performance Optimized** - Fast loading with lazy loading and caching

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **API**: OpenAI GPT-3.5-turbo
- **Build Tools**: ESLint, Prettier, http-server
- **Browser APIs**: Web Speech API, Speech Synthesis API, localStorage

## 📁 Project Structure

```
PolyGlot/
├── index.html              # Main HTML file
├── main.js                 # Application entry point
├── package.json           # Dependencies and scripts
├── css/                   # Modular CSS files
│   ├── variables.css      # CSS custom properties
│   ├── base.css          # Reset & fundamental styles
│   ├── header.css        # Header & branding
│   ├── translation-container.css  # Main interface
│   ├── controls.css      # Control panel & interactive elements
│   ├── history.css       # Translation history
│   ├── notifications.css # Toast notifications
│   └── responsive.css    # Mobile optimizations
├── js/                   # JavaScript modules
│   ├── ApiManager.js     # OpenAI API integration
│   ├── VoiceController.js # Speech recognition & synthesis
│   ├── TranslationEngine.js # Core translation logic
│   ├── HistoryManager.js # Translation history
│   ├── UIController.js   # UI interactions & notifications
│   ├── EventManager.js   # Event handling & shortcuts
│   └── PerformanceUtils.js # Performance optimizations
└── original/             # Backup of original files

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- OpenAI API key
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jimmyhanh/PolyGlot.git
   cd PolyGlot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

5. **Configure your API key**
   - Enter your OpenAI API key in the settings panel
   - The key is stored securely in localStorage

### Available Scripts

- `npm start` - Start development server
- `npm run dev` - Start with auto-reload (no cache)
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run validate` - Run linting and format checks
- `npm run build` - Validate and build for production

## 🌟 Usage

### Basic Translation
1. Enter your OpenAI API key in the settings panel
2. Type or paste text in the source language box
3. Select source and target languages
4. Click "Translate" or enable live translation

### Voice Features
- 🎤 **Voice Input**: Click the microphone to speak your text
- 🔊 **Text-to-Speech**: Click the play button to hear translations
- 🔄 **Language Swap**: Click the swap arrow to reverse languages

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Translate text
- `Ctrl/Cmd + K` - Clear all text
- `Ctrl/Cmd + M` - Toggle voice input

## 🏗 Architecture

### Modular JavaScript Design

The application uses a modular architecture with clear separation of concerns:

- **ApiManager** - Handles all OpenAI API communication with retry logic
- **VoiceController** - Manages speech recognition and text-to-speech
- **TranslationEngine** - Core translation logic and language management
- **HistoryManager** - Persistent storage and retrieval of translations
- **UIController** - UI state management and user interactions
- **EventManager** - Centralized event handling and keyboard shortcuts
- **PerformanceUtils** - Performance optimizations and utilities

### CSS Architecture

Organized with CSS custom properties and component-based styling:

- **variables.css** - Design tokens and CSS custom properties
- **base.css** - Reset, typography, and common components
- **Component-specific CSS** - Focused styling for each UI component
- **responsive.css** - Mobile-first responsive design

## 🔧 Configuration

### Environment Variables
The app uses localStorage for configuration. No server-side environment variables needed.

### API Configuration
- **OpenAI API Key**: Required for translation functionality  
- **Model**: Uses GPT-3.5-turbo for optimal performance and cost
- **Rate Limiting**: Built-in retry logic with exponential backoff

## 🎨 Customization

### Theming
Modify CSS custom properties in `css/variables.css`:

```css
:root {
  --primary-color: #667eea;
  --accent-color: #ffd700;
  --text-primary: #333;
  /* ... more variables */
}
```

### Adding Languages
Update the language maps in `TranslationEngine.js`:

```javascript
this.languageNames = {
  'auto': 'Auto Detect',
  'en': 'English',
  'es': 'Spanish', // Add new language
  // ... more languages
};
```

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with ES6+ support

### Required Browser APIs
- Fetch API
- ES6 Modules
- CSS Custom Properties
- Web Speech API (optional, for voice features)

## 🚀 Performance Features

- **Lazy Loading** - Resources loaded on demand
- **Debounced Translation** - Prevents excessive API calls
- **Memory Management** - Efficient event listener cleanup
- **Optimized Animations** - Respects user motion preferences
- **Caching** - Service worker for offline functionality

## 🔒 Security & Privacy

- API keys stored locally in browser
- No server-side data storage
- HTTPS required for voice features
- Input validation and sanitization
- Rate limiting and retry logic

## 🧪 Development

### Code Quality
- **ESLint** - Code linting with recommended rules
- **Prettier** - Consistent code formatting
- **JSDoc** - Comprehensive code documentation
- **Error Boundaries** - Robust error handling

### Testing the Application
1. Test with different languages and text lengths
2. Verify voice recognition works in supported browsers
3. Test responsive design on various screen sizes
4. Validate offline functionality with service worker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add JSDoc comments for new functions
- Update tests for new features
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the GPT API
- Font Awesome for icons
- Google Fonts for typography
- Web Speech API for voice features

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ by the PolyGlot Team**
```

A modern, real-time translation application powered by OpenAI's GPT models, supporting both text and voice input with speech synthesis capabilities.

<img width="1349" height="918" alt="image" src="https://github.com/user-attachments/assets/aa65abec-f28a-491a-8005-8e5b955c374b" />


## 🌟 Features

### Core Translation Features
- **Real-time Translation**: Translate text instantly as you type
- **Voice Input**: Speak in any supported language using Web Speech API
- **Text-to-Speech**: Listen to translations with natural voice synthesis
- **Multi-language Support**: Vietnamese, English, Japanese, German, Chinese
- **Auto Language Detection**: Automatically detect source language
- **Bidirectional Translation**: Easy language swapping with one click

### Advanced Features
- **Live Translation Mode**: Toggle real-time translation as you type
- **Translation History**: Keep track of recent translations
- **Offline Storage**: API key and history stored locally
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Quick actions with keyboard shortcuts
- **Copy to Clipboard**: Easy sharing of translations
- **Modern UI**: Beautiful gradient design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Internet connection for API calls

### Setup Instructions

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/polyglot-translator.git
   cd polyglot-translator
   ```

2. **Open the Application**
   - Open `index.html` in your web browser
   - Or serve it using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Configure API Key**
   - Enter your OpenAI API key in the settings panel
   - Click "Save" to store it locally
   - Your key is stored securely in your browser's local storage

4. **Start Translating!**
   - Type text in the source language box
   - Select source and target languages
   - Click "Translate" or enable live translation
   - Use voice input by clicking the microphone button

## 🎮 How to Use

### Basic Translation
1. Enter text in the left text area
2. Select source and target languages
3. Click the "Translate" button
4. View the translation in the right text area

### Voice Input
1. Click the microphone button (🎤)
2. Speak clearly in your chosen language
3. The speech will be converted to text automatically
4. Translation happens instantly if live mode is enabled

### Live Translation
1. Toggle the "Live Translation" switch
2. Start typing in the source text area
3. Translation updates automatically after 1 second pause
4. Perfect for real-time conversations

### Text-to-Speech
1. Click the play button (▶️) next to any text area
2. Listen to the pronunciation in the selected language
3. Supports all target languages with native voice synthesis

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Translate text
- `Ctrl/Cmd + K`: Clear all text
- `Ctrl/Cmd + M`: Toggle voice input
- `Tab`: Navigate between elements
- `Enter`: Save API key (when focused on key input)

## 🌐 Supported Languages

| Language | Code | Voice Input | Text-to-Speech |
|----------|------|-------------|----------------|
| English | `en` | ✅ | ✅ |
| Vietnamese | `vi` | ✅ | ✅ |
| Japanese | `ja` | ✅ | ✅ |
| German | `de` | ✅ | ✅ |
| Chinese | `zh` | ✅ | ✅ |

## 🔧 Configuration

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key and paste it in PolyGlot's settings
5. Ensure you have sufficient API credits

### Browser Permissions
- **Microphone Access**: Required for voice input
- **Local Storage**: Used to save API key and history
- **Clipboard Access**: For copy translation feature

## 📱 Mobile Support

PolyGlot is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Adaptive layout for different screen sizes
- Mobile-optimized voice input
- Gesture support for common actions

## 🔒 Privacy & Security

- **API Key**: Stored locally in your browser, never sent to third parties
- **Translation Data**: Sent only to OpenAI for processing
- **No Server**: Runs entirely in your browser
- **No Analytics**: No tracking or data collection
- **Open Source**: Full transparency of code

## 🛠️ Customization

### Adding New Languages
To add support for new languages, modify the `languageNames` object in `script.js`:

```javascript
this.languageNames = {
    'auto': 'Auto Detect',
    'en': 'English',
    'vi': 'Vietnamese',
    'ja': 'Japanese',
    'de': 'German',
    'zh': 'Chinese',
    'fr': 'French', // Add new language
    'es': 'Spanish'  // Add new language
};
```

Also update the HTML select options in `index.html`.

### Styling Customization
Modify `styles.css` to customize:
- Color scheme (change CSS custom properties)
- Layout and spacing
- Animations and transitions
- Mobile breakpoints

## 🐛 Troubleshooting

### Common Issues

**Translation not working:**
- Check your OpenAI API key
- Verify internet connection
- Check browser console for errors
- Ensure you have API credits

**Voice input not working:**
- Allow microphone permissions
- Check if using HTTPS (required for speech API)
- Try different browsers (Chrome/Edge recommended)

**Text-to-speech not working:**
- Check browser compatibility
- Ensure audio is not muted
- Try different languages

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Basic Translation | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ❌ | ✅ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Live Translation | ✅ | ✅ | ✅ | ✅ |

## 📝 API Usage

### OpenAI Model Used
- **Model**: GPT-3.5-turbo
- **Max Tokens**: 1000 per translation
- **Temperature**: 0.3 (for consistent translations)

### Cost Estimation
- Average cost: ~$0.002 per translation
- 1000 translations ≈ $2.00
- Voice input adds no extra cost

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup
1. Clone the repository
2. Make changes to HTML, CSS, or JavaScript files
3. Test in multiple browsers
4. Ensure mobile compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the powerful GPT models
- **Web Speech API** for voice recognition capabilities
- **Font Awesome** for beautiful icons
- **Google Fonts** for typography
- **Contributors** who help improve PolyGlot

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/polyglot-translator/issues)
- **Documentation**: This README file
- **Email**: support@polyglot-translator.com

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with full translation features
- Voice input and text-to-speech support
- Live translation mode
- Multi-language support
- Responsive design
- Translation history

### Planned Features
- [ ] Offline translation support
- [ ] Document translation
- [ ] Image text translation
- [ ] Conversation mode
- [ ] Translation quality rating
- [ ] Custom voice selection
- [ ] Dark/light theme toggle
- [ ] Export translation history

---

Made with ❤️ using OpenAI's GPT technology

**Happy Translating!** 🌍
